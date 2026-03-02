package com.astracine.backend.core.service;

import com.astracine.backend.presentation.dto.payment.PayOSCreateResponse;
import com.astracine.backend.presentation.exception.HoldNotFoundException;
import com.astracine.backend.presentation.exception.PaymentRequiredException;
import com.astracine.backend.presentation.exception.PaymentUnauthorizedException;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import vn.payos.model.webhooks.WebhookData;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Dịch vụ thanh toán PayOS thực tế (SDK v2).
 *
 * Redis keys:
 * payos:order:{orderCode} → holdId|userId|status (PENDING / PAID / CANCELLED)
 * payos:hold:{holdId} → orderCode
 */
@Slf4j
@Service
public class PayOSService {

    private static final String HOLD_SUMMARY_KEY_PREFIX = "hold:summary:";
    private static final String PAYOS_ORDER_KEY_PREFIX = "payos:order:";
    private static final String PAYOS_HOLD_KEY_PREFIX = "payos:hold:";

    private static final long PRICE_PER_SEAT = 90_000L;

    private final PayOS payOS;
    private final StringRedisTemplate redis;

    public PayOSService(PayOS payOS, StringRedisTemplate redis) {
        this.payOS = payOS;
        this.redis = redis;
    }

    // =========================================================
    // 1. Tạo payment link
    // =========================================================

    /**
     * Tạo PayOS payment link cho một hold đã tồn tại.
     *
     * @param holdId    ID hold ghế từ SeatHoldService
     * @param userId    ID user đang đặt vé
     * @param returnUrl URL redirect sau khi thanh toán thành công
     * @param cancelUrl URL redirect sau khi huỷ
     * @return PayOSCreateResponse chứa checkoutUrl, orderCode, qrCode
     */
    public PayOSCreateResponse createPaymentLink(String holdId, String userId,
            String returnUrl, String cancelUrl) {

        HoldMeta hold = readHoldMeta(holdId, userId);

        // Idempotent: nếu đã có orderCode cho holdId này → trả lại cái cũ
        String existingOrderCode = redis.opsForValue().get(PAYOS_HOLD_KEY_PREFIX + holdId);
        if (existingOrderCode != null) {
            String sessionRaw = redis.opsForValue().get(PAYOS_ORDER_KEY_PREFIX + existingOrderCode);
            if (sessionRaw != null) {
                String[] parts = sessionRaw.split("\\|", 3);
                return PayOSCreateResponse.builder()
                        .orderCode(Long.parseLong(existingOrderCode))
                        .checkoutUrl("") // URL cũ đã expire, FE cần tạo mới nếu cần
                        .qrCode("")
                        .status(parts.length >= 3 ? parts[2] : "PENDING")
                        .build();
            }
        }

        // Tính toán
        long amount = hold.seatCount * PRICE_PER_SEAT;
        if (amount <= 0)
            amount = PRICE_PER_SEAT; // tối thiểu 1 ghế

        long orderCode = generateOrderCode(holdId);
        String description = "AstraCine #" + orderCode;

        // TTL đồng bộ với hold (đơn vị giây cho PayOS expiredAt)
        long ttlMillis = Math.max(60_000, hold.expiresAt - Instant.now().toEpochMilli());
        long expiredAtEpoch = Instant.now().plusMillis(ttlMillis).getEpochSecond();

        // SDK v2: price là Long, quantity là Integer, amount/orderCode/expiredAt là
        // Long
        PaymentLinkItem ticket = PaymentLinkItem.builder()
                .name("Ve xem phim")
                .quantity(hold.seatCount)
                .price(PRICE_PER_SEAT) // Long
                .build();

        CreatePaymentLinkRequest request = CreatePaymentLinkRequest.builder()
                .orderCode(orderCode) // Long
                .amount(amount) // Long
                .description(description)
                .items(List.of(ticket))
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl)
                .expiredAt(expiredAtEpoch) // Long (Unix epoch seconds)
                .build();

        try {
            // SDK v2: payOS.paymentRequests().create(request)
            CreatePaymentLinkResponse response = payOS.paymentRequests().create(request);

            Duration ttl = Duration.ofMillis(ttlMillis);
            String orderValue = holdId + "|" + userId + "|PENDING";
            redis.opsForValue().set(PAYOS_ORDER_KEY_PREFIX + orderCode, orderValue, ttl);
            redis.opsForValue().set(PAYOS_HOLD_KEY_PREFIX + holdId, String.valueOf(orderCode), ttl);

            log.info("[PayOS] Created payment link holdId={} orderCode={}", holdId, orderCode);

            return PayOSCreateResponse.builder()
                    .orderCode(orderCode)
                    .checkoutUrl(response.getCheckoutUrl())
                    .qrCode(response.getQrCode())
                    .status("PENDING")
                    .build();

        } catch (Exception e) {
            log.error("[PayOS] Failed to create payment link holdId={}: {}", holdId, e.getMessage(), e);
            throw new RuntimeException("Không thể tạo PayOS payment link: " + e.getMessage(), e);
        }
    }

    // =========================================================
    // 2. Xử lý webhook từ PayOS
    // =========================================================

    /**
     * Xác thực và xử lý webhook callback từ PayOS.
     * SDK v2: payOS.webhooks().verify(Object rawBody) → WebhookData
     *
     * @param payload Payload JSON đã parse (từ @RequestBody Map)
     * @return true nếu xử lý thành công
     */
    public boolean handleWebhook(Map<String, Object> rawPayload) {
        try {
            // SDK v2: verify nhận raw Object (Map từ Jackson)
            WebhookData verified = payOS.webhooks().verify(rawPayload);

            long orderCode = verified.getOrderCode();
            String orderKey = PAYOS_ORDER_KEY_PREFIX + orderCode;

            String sessionRaw = redis.opsForValue().get(orderKey);
            if (sessionRaw == null) {
                log.warn("[PayOS] Webhook for unknown orderCode={}", orderCode);
                return false;
            }

            String[] parts = sessionRaw.split("\\|", 3);
            String holdId = parts[0];
            String userId = parts[1];

            // code "00" = success
            String code = verified.getCode();
            boolean isPaid = "00".equals(code);
            String newStatus = isPaid ? "PAID" : "CANCELLED";

            Long remainTtl = redis.getExpire(orderKey);
            Duration ttl = (remainTtl != null && remainTtl > 0)
                    ? Duration.ofSeconds(remainTtl)
                    : Duration.ofMinutes(10);

            redis.opsForValue().set(orderKey,
                    holdId + "|" + userId + "|" + newStatus,
                    ttl);

            log.info("[PayOS] Webhook processed orderCode={} holdId={} status={}", orderCode, holdId, newStatus);
            return true;

        } catch (Exception e) {
            log.error("[PayOS] Webhook verification failed: {}", e.getMessage(), e);
            return false;
        }
    }

    // =========================================================
    // 3. Verify payment đã PAID (gọi từ OrderController)
    // =========================================================

    /**
     * Kiểm tra xem payment của holdId đã được xác nhận PAID chưa.
     *
     * @param holdId    hold cần verify
     * @param orderCode orderCode từ PayOS (FE gửi lên)
     * @param userId    user đang confirm
     */
    public void verifyPaid(String holdId, long orderCode, String userId) {
        String orderKey = PAYOS_ORDER_KEY_PREFIX + orderCode;
        String sessionRaw = redis.opsForValue().get(orderKey);

        if (sessionRaw == null) {
            throw new PaymentRequiredException(
                    "Không tìm thấy session thanh toán PayOS cho orderCode=" + orderCode);
        }

        String[] parts = sessionRaw.split("\\|", 3);
        if (parts.length < 3) {
            throw new PaymentRequiredException("Dữ liệu thanh toán không hợp lệ");
        }

        String storedHoldId = parts[0];
        String storedUserId = parts[1];
        String status = parts[2];

        if (!Objects.equals(storedHoldId, holdId)) {
            throw new PaymentRequiredException("PayOS orderCode không khớp với holdId");
        }
        if (!Objects.equals(storedUserId, userId)) {
            throw new PaymentUnauthorizedException();
        }
        if (!"PAID".equals(status)) {
            throw new PaymentRequiredException(
                    "Thanh toán chưa hoàn tất. Trạng thái hiện tại: " + status);
        }
    }

    // =========================================================
    // Internal helpers
    // =========================================================

    private HoldMeta readHoldMeta(String holdId, String userId) {
        String raw = redis.opsForValue().get(HOLD_SUMMARY_KEY_PREFIX + holdId);
        if (raw == null)
            throw new HoldNotFoundException(holdId);

        // format: showtimeId|userId|expiresAt|seatId1,seatId2,...
        String[] parts = raw.split("\\|", 4);
        if (parts.length < 4)
            throw new HoldNotFoundException(holdId);

        String holdOwner = parts[1];
        if (!Objects.equals(holdOwner, userId))
            throw new PaymentUnauthorizedException();

        long expiresAt = Long.parseLong(parts[2]);
        int seatCount = parts[3].isBlank() ? 0 : parts[3].split(",").length;
        return new HoldMeta(expiresAt, seatCount);
    }

    /**
     * Sinh orderCode từ holdId.
     * PayOS yêu cầu orderCode là số nguyên dương, dùng hash giữ trong [10^9,
     * 10^10).
     */
    private static long generateOrderCode(String holdId) {
        long hash = Math.abs((long) holdId.hashCode());
        return (hash % 9_000_000_000L) + 1_000_000_000L;
    }

    private record HoldMeta(long expiresAt, int seatCount) {
    }
}
