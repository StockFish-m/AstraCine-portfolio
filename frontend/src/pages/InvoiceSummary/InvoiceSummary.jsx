import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createPaymentLink } from '../../api/payosApi';
import './InvoiceSummary.css';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const formatDateTime = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatTimeOnly = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

// Mock discount codes — replace with real API when available
const DISCOUNT_CODES = [
    { code: 'STAR10', label: 'Giảm 10%', type: 'percent', value: 10 },
    { code: 'SAVE20K', label: 'Giảm 20.000đ', type: 'fixed', value: 20000 },
    { code: 'COMBO15', label: 'Giảm 15% khi có combo', type: 'percent', value: 15, requireCombo: true },
    { code: 'NEWUSER', label: 'Khách hàng mới – giảm 5%', type: 'percent', value: 5 },
];

function calcDiscount(code, baseTotal) {
    if (!code) return 0;
    if (code.type === 'percent') return Math.round(baseTotal * code.value / 100);
    if (code.type === 'fixed') return Math.min(code.value, baseTotal);
    return 0;
}

const InvoiceSummary = () => {
    const { showtimeId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const {
        holdId,
        seatDetails = [],
        seatTotal = 0,
        cartItems = [],
        comboTotal = 0,
        grandTotal = 0,
        movieTitle,
        startTime,
        endTime,
        roomName,
    } = location.state || {};

    const [selectedCode, setSelectedCode] = useState(null);
    const [paying, setPaying] = useState(false);
    const [payError, setPayError] = useState(null);

    const hasCombo = cartItems.length > 0;

    const availableCodes = useMemo(() =>
        DISCOUNT_CODES.filter(c => !c.requireCombo || hasCombo),
        [hasCombo]
    );

    const discountAmount = useMemo(() =>
        calcDiscount(selectedCode, grandTotal),
        [selectedCode, grandTotal]
    );

    const finalTotal = Math.max(0, grandTotal - discountAmount);

    const handleSelectCode = (code) => {
        setSelectedCode(prev => prev?.code === code.code ? null : code);
    };

    const handlePayment = async () => {
        if (!holdId) {
            setPayError('Phiên giữ ghế đã hết hạn. Vui lòng chọn ghế lại.');
            return;
        }
        setPayError(null);
        setPaying(true);
        try {
            const origin = window.location.origin;
            const returnUrl = `${origin}/payment/success`;
            const cancelUrl = `${origin}/payment/cancel`;

            const result = await createPaymentLink(holdId, returnUrl, cancelUrl);

            if (result?.checkoutUrl) {
                window.location.href = result.checkoutUrl;
            } else {
                setPayError('Không nhận được link thanh toán từ PayOS. Vui lòng thử lại.');
                setPaying(false);
            }
        } catch (err) {
            console.error('[PayOS] Create payment link failed:', err);
            const msg = err?.message || err?.error || 'Có lỗi xảy ra khi tạo link thanh toán.';
            setPayError(msg);
            setPaying(false);
        }
    };

    const handleGoBack = () => {
        navigate(`/booking/showtimes/${showtimeId}/combo`, { state: location.state });
    };

    return (
        <div className="invoice-page">
            {/* Breadcrumb */}
            <div className="booking-steps">
                <span className="step done">1. Chọn ghế</span>
                <span className="step-arrow">›</span>
                <span className="step done">2. Chọn bắp nước</span>
                <span className="step-arrow">›</span>
                <span className="step active">3. Tóm tắt hoá đơn</span>
                <span className="step-arrow">›</span>
                <span className="step">4. Thanh toán</span>
            </div>

            <h1 className="invoice-title">Tóm Tắt Hoá Đơn</h1>

            <div className="invoice-layout">
                {/* ===== LEFT COLUMN ===== */}
                <div className="invoice-left">

                    {/* --- Thông tin phim --- */}
                    <section className="invoice-card">
                        <div className="invoice-card-header">
                            <span className="card-icon">🎬</span>
                            <h2 className="card-title">Thông tin phim</h2>
                        </div>
                        <div className="info-grid">
                            <div className="info-row">
                                <span className="info-label">Tên phim</span>
                                <span className="info-value highlight">{movieTitle || '—'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Suất chiếu</span>
                                <span className="info-value">
                                    {startTime ? (
                                        <>
                                            {formatDateTime(startTime)}
                                            {endTime && <> → {formatTimeOnly(endTime)}</>}
                                        </>
                                    ) : '—'}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Phòng chiếu</span>
                                <span className="info-value">{roomName || 'Chưa có thông tin'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Ghế ({seatDetails.length})</span>
                                <span className="info-value seat-list">
                                    {seatDetails.length === 0 ? '—' :
                                        seatDetails
                                            .slice()
                                            .sort((a, b) => a.code.localeCompare(b.code))
                                            .map(s => (
                                                <span key={s.seatId} className="seat-tag">
                                                    {s.code}
                                                    <span className="seat-tag-type">{s.seatType}</span>
                                                </span>
                                            ))
                                    }
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* --- Thông tin nhận vé --- */}
                    <section className="invoice-card">
                        <div className="invoice-card-header">
                            <span className="card-icon">👤</span>
                            <h2 className="card-title">Thông tin nhận vé</h2>
                        </div>
                        {user ? (
                            <div className="info-grid">
                                <div className="info-row">
                                    <span className="info-label">Họ và tên</span>
                                    <span className="info-value">
                                        {user.fullName || user.name || user.username || '—'}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Email</span>
                                    <span className="info-value">{user.email || '—'}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="invoice-notice">
                                Bạn chưa đăng nhập.{' '}
                                <span className="link-text" onClick={() => navigate('/login')}>
                                    Đăng nhập ngay
                                </span>
                            </p>
                        )}
                    </section>

                    {/* --- Mã giảm giá --- */}
                    <section className="invoice-card">
                        <div className="invoice-card-header">
                            <span className="card-icon">🏷️</span>
                            <h2 className="card-title">Mã giảm giá</h2>
                        </div>
                        <p className="discount-hint">Chọn một mã giảm giá để áp dụng:</p>
                        <div className="discount-list">
                            {availableCodes.map(code => {
                                const isSelected = selectedCode?.code === code.code;
                                return (
                                    <button
                                        key={code.code}
                                        className={`discount-chip ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleSelectCode(code)}
                                        title={code.label}
                                    >
                                        <span className="chip-code">{code.code}</span>
                                        <span className="chip-label">{code.label}</span>
                                        {isSelected && <span className="chip-check">✓</span>}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedCode && (
                            <div className="discount-applied">
                                <span>✅ Đã áp dụng: <strong>{selectedCode.code}</strong></span>
                                <span className="discount-saving">– {formatCurrency(discountAmount)}</span>
                            </div>
                        )}
                    </section>
                </div>

                {/* ===== RIGHT COLUMN: Thanh toán ===== */}
                <aside className="invoice-right">
                    <div className="payment-card">
                        <h2 className="payment-title">💰 Thông tin thanh toán</h2>

                        <div className="payment-rows">
                            <div className="payment-row">
                                <span>Tiền ghế ({seatDetails.length} ghế)</span>
                                <span>{formatCurrency(seatTotal)}</span>
                            </div>

                            {cartItems.length > 0 && (
                                <>
                                    <div className="payment-divider" />
                                    {cartItems.map(item => (
                                        <div className="payment-row combo-row" key={item.id}>
                                            <span>
                                                <span className="combo-qty-badge">×{item.quantity}</span>
                                                {item.name}
                                            </span>
                                            <span>{formatCurrency(item.subtotal)}</span>
                                        </div>
                                    ))}
                                    <div className="payment-row subtotal-row">
                                        <span>Tạm tính bắp nước</span>
                                        <span>{formatCurrency(comboTotal)}</span>
                                    </div>
                                </>
                            )}

                            {cartItems.length === 0 && (
                                <div className="payment-row muted-row">
                                    <span>Bắp nước</span>
                                    <span>Không có</span>
                                </div>
                            )}

                            <div className="payment-divider" />

                            <div className="payment-row total-before-row">
                                <span>Tổng trước giảm giá</span>
                                <span>{formatCurrency(grandTotal)}</span>
                            </div>

                            {selectedCode && (
                                <div className="payment-row discount-row">
                                    <span>Giảm giá <em>({selectedCode.code})</em></span>
                                    <span className="discount-value">– {formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                        </div>

                        <div className="payment-grand-total">
                            <span>Tổng thanh toán</span>
                            <span className="grand-amount">{formatCurrency(finalTotal)}</span>
                        </div>

                        <button
                            className={`btn-pay${paying ? ' btn-pay--loading' : ''}`}
                            onClick={handlePayment}
                            disabled={paying}
                        >
                            {paying ? (
                                <><span className="pay-spinner" /> Đang tạo link thanh toán...</>
                            ) : (
                                '💳 Xác nhận & Thanh toán PayOS'
                            )}
                        </button>

                        {payError && (
                            <div className="pay-error-box">
                                ⚠️ {payError}
                            </div>
                        )}

                        <button className="btn-invoice-back" onClick={handleGoBack}>
                            ← Quay lại chọn bắp nước
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default InvoiceSummary;
