import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import '../layouts/Portal.css';

const PortalLayout = () => {
    return (
        <div className="portal-layout">
            <aside className="sidebar">
                <div className="brand">AstraCine</div>
                <nav>
                    <NavLink to="dashboard" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
                    <NavLink to="rooms" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Quản lý Phòng</NavLink>
                </nav>
            </aside>
            <main className="content">
                <Outlet /> {/* Nơi hiển thị các Page con */}
            </main>
        </div>
    );
};
export default PortalLayout;