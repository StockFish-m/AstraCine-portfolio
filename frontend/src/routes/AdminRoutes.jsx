import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import Dashboard from '../pages/admin/Dashboard';
import RoomManager from '../pages/admin/RoomManager';

// Hàm này trả về một cây Route, khớp với cách gọi {AdminRoutes()} bên App.jsx
const AdminRoutes = () => {
    return (
        /* Tất cả các trang bắt đầu bằng /portal sẽ dùng chung PortalLayout 
           (Có Sidebar và Header)
        */
        <Route path="/portal" element={<PortalLayout />}>
            
            {/* Trang mặc định: Khi vào /portal sẽ tự nhảy sang /portal/dashboard 
            */}
            <Route index element={<Navigate to="dashboard" replace />} />

            {/* Các trang con: 
               path không cần dấu "/" ở đầu vì nó nối tiếp theo cha
            */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="rooms" element={<RoomManager />} />
            
            {/* Sau này thêm showtimes ở đây */}
            {/* <Route path="showtimes" element={<ShowtimeManager />} /> */}
        </Route>
    );
};

export default AdminRoutes;