import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AdminGenres from '../pages/Admin/AdminGenres';
import AdminMovies from '../pages/Admin/AdminMovies';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route path="/" element={<Navigate to="genres" replace />} />
                <Route path="genres" element={<AdminGenres />} />
                <Route path="movies" element={<AdminMovies />} />
            </Route>
        </Routes>
    );
};

export default AdminRoutes;