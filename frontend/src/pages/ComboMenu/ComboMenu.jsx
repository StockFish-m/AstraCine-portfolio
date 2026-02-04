import React, { useState, useEffect } from 'react';
import { Input, Card, Button, Row, Col, Spin, Empty, Tag, Slider, message } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, FilterOutlined } from '@ant-design/icons';
// Đảm bảo đường dẫn này đúng với cấu trúc thư mục của bạn
import { comboAPI } from '../../services/api';
import './ComboMenu.css';

const { Meta } = Card;

const ComboMenu = () => {
    // --- KHAI BÁO STATE ---
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [priceRange, setPriceRange] = useState([0, 500000]); // Mặc định từ 0đ đến 500k

    // --- HÀM GỌI API ---
    const fetchCombos = async () => {
        setLoading(true);
        try {
            // Gọi API search với các tham số: keyword, minPrice, maxPrice
            const response = await comboAPI.search(keyword, priceRange[0], priceRange[1]);
            setCombos(response.data);
        } catch (error) {
            console.error("Lỗi tải danh sách combo:", error);
            message.error("Không thể tải dữ liệu bắp nước!");
        }
        setLoading(false);
    };

    // Chạy 1 lần khi trang vừa load
    useEffect(() => {
        fetchCombos();
    }, []);

    // --- HÀM HỖ TRỢ ---
    // Format tiền Việt Nam (VD: 50,000 đ)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Xử lý khi bấm nút "Thêm vào giỏ"
    const handleAddToCart = (combo) => {
        message.success(`Đã thêm ${combo.name} vào giỏ hàng!`);
        // Sau này bạn sẽ code logic lưu vào Context/Redux ở đây
    };

    return (
        <div className="combo-menu-container">
            {/* --- PHẦN 1: BỘ LỌC TÌM KIẾM --- */}
            <div className="filter-section">
                <Row gutter={[16, 16]} align="middle" justify="center">
                    {/* Ô tìm kiếm */}
                    <Col xs={24} md={10}>
                        <Input
                            size="large"
                            placeholder="Bạn muốn tìm gì? (VD: Bắp phô mai...)"
                            prefix={<SearchOutlined />}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onPressEnter={fetchCombos} // Bấm Enter để tìm
                            allowClear
                        />
                    </Col>

                    {/* Thanh trượt giá */}
                    <Col xs={24} md={6}>
                        <div className="price-label">
                            Khoảng giá: <span>{formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}</span>
                        </div>
                        <Slider
                            range
                            step={5000}
                            min={0}
                            max={500000}
                            defaultValue={[0, 500000]}
                            onChange={(value) => setPriceRange(value)}
                            trackStyle={[{ backgroundColor: '#e50914' }]} // Màu đỏ rạp phim
                            handleStyle={[{ borderColor: '#e50914' }, { borderColor: '#e50914' }]}
                        />
                    </Col>

                    {/* Nút Lọc */}
                    <Col xs={24} md={4}>
                        <Button
                            type="primary"
                            danger
                            icon={<FilterOutlined />}
                            size="large"
                            block
                            onClick={fetchCombos}
                            className="search-btn"
                        >
                            Lọc ngay
                        </Button>
                    </Col>
                </Row>
            </div>

            {/* --- PHẦN 2: DANH SÁCH SẢN PHẨM --- */}
            <div className="menu-grid">
                {loading ? (
                    <div className="loading-state">
                        <Spin size="large" tip="Đang chuẩn bị bắp nước thơm ngon..." />
                    </div>
                ) : combos.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={<span className="empty-text">Không tìm thấy combo nào phù hợp :(</span>}
                    />
                ) : (
                    <Row gutter={[24, 24]}>
                        {combos.map((item) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                                <Card
                                    hoverable
                                    className="combo-card"
                                    cover={
                                        <div className="combo-img-box">
                                            {/* Ảnh mẫu (do chưa có chức năng upload ảnh) */}
                                            <img
                                                alt={item.name}
                                                src="https://media.istockphoto.com/id/506143248/photo/popcorn-and-soda.jpg?s=612x612&w=0&k=20&c=6qHIgYdD6D8B0sZ5Kq7_4QjC4_M2E8_x_k_z_y_x_x_x"
                                            />
                                            <span className="price-badge">{formatCurrency(item.price)}</span>
                                        </div>
                                    }
                                    actions={[
                                        <Button
                                            type="primary"
                                            danger
                                            shape="round"
                                            icon={<ShoppingCartOutlined />}
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            Chọn mua
                                        </Button>
                                    ]}
                                >
                                    <Meta
                                        title={<div className="card-title" title={item.name}>{item.name}</div>}
                                        description={
                                            <Tag color="green" style={{marginTop: 5}}>
                                                {item.status === 'ACTIVE' ? 'Đang bán' : 'Hết hàng'}
                                            </Tag>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </div>
    );
};

export default ComboMenu;