import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './Payment.css';

const PaymentCancel = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const orderCode = params.get('orderCode');

    return (
        <div className="payment-result-page">
            <div className="result-card cancel-card">
                <div className="result-icon-wrap cancel-glow">
                    <div className="result-icon cancel-icon">✕</div>
                    <div className="result-rings cancel-rings">
                        <span /><span /><span />
                    </div>
                </div>

                <h1 className="result-title">Thanh toán bị huỷ</h1>
                <p className="result-sub">
                    Bạn đã huỷ thanh toán. Ghế của bạn vẫn đang được giữ trong thời gian ngắn.
                </p>

                {orderCode && (
                    <div className="result-detail-box">
                        <span className="detail-label">Mã đơn hàng</span>
                        <span className="detail-value">#{orderCode}</span>
                    </div>
                )}

                <p className="result-notice">
                    ⚠️ Nếu bạn muốn hoàn tất giao dịch, hãy quay lại và thử lại trước khi hết thời gian giữ ghế.
                </p>

                <div className="result-actions">
                    <button className="btn-result-back" onClick={() => navigate(-1)}>
                        ← Quay lại đặt vé
                    </button>
                    <button className="btn-result-secondary" onClick={() => navigate('/')}>
                        🏠 Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancel;
