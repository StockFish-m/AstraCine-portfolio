import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './Payment.css';

const PaymentSuccess = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const animRef = useRef(null);

    const orderCode = params.get('orderCode');
    const status = params.get('status');

    useEffect(() => {
        // Trigger confetti-like particle burst
        const el = animRef.current;
        if (!el) return;
        el.classList.add('burst');
    }, []);

    return (
        <div className="payment-result-page">
            <div className="result-card success-card" ref={animRef}>
                <div className="result-icon-wrap success-glow">
                    <div className="result-icon">✓</div>
                    <div className="result-rings">
                        <span /><span /><span />
                    </div>
                </div>

                <h1 className="result-title">Thanh toán thành công!</h1>
                <p className="result-sub">Vé của bạn đã được xác nhận. Hãy kiểm tra email để nhận vé nhé!</p>

                {orderCode && (
                    <div className="result-detail-box">
                        <span className="detail-label">Mã đơn hàng</span>
                        <span className="detail-value">#{orderCode}</span>
                    </div>
                )}

                <div className="result-actions">
                    <button className="btn-result-primary" onClick={() => navigate('/')}>
                        🏠 Về trang chủ
                    </button>
                    <button className="btn-result-secondary" onClick={() => navigate('/booking')}>
                        🎬 Đặt vé khác
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
