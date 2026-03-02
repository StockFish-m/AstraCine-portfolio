package com.astracine.backend.presentation.controller;

import com.astracine.backend.core.service.PayOSService;
import com.astracine.backend.core.service.PaymentMockService;
import com.astracine.backend.core.service.SeatHoldService;
import com.astracine.backend.presentation.dto.order.ConfirmOrderRequest;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
public class OrderController {

    private final SeatHoldService seatHoldService;
    private final PaymentMockService paymentMockService;
    private final PayOSService payOSService;

    public OrderController(SeatHoldService seatHoldService,
            PaymentMockService paymentMockService,
            PayOSService payOSService) {
        this.seatHoldService = seatHoldService;
        this.paymentMockService = paymentMockService;
        this.payOSService = payOSService;
    }

    /**
     * Xác nhận đặt vé sau khi thanh toán.
     *
     * Flow PayOS : truyền { holdId, orderCode } → PayOSService.verifyPaid()
     * Flow Mock : truyền { holdId, paymentRef } → PaymentMockService.ensurePaid()
     */
    @PostMapping("/confirm")
    public ResponseEntity<?> confirm(@Valid @RequestBody ConfirmOrderRequest req,
            @AuthenticationPrincipal UserDetails user,
            @RequestHeader(value = "X-User-Id", required = false) String guestUserId) {

        String userId = user != null ? user.getUsername()
                : (guestUserId != null && !guestUserId.isBlank() ? guestUserId : "anonymous");

        if (req.getOrderCode() != null) {
            // PayOS flow
            payOSService.verifyPaid(req.getHoldId(), req.getOrderCode(), userId);
        } else {
            // Mock / legacy flow
            paymentMockService.ensurePaid(req.getHoldId(), req.getPaymentRef(), userId);
        }

        seatHoldService.confirmHoldToSold(req.getHoldId(), userId);
        return ResponseEntity.ok().build();
    }
}
