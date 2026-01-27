import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ClientRoutes from "./routes/ClientRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute"; // Nếu team có file này
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import ComboManager from "./pages/Admin/Combo";
import MovieManager from "./pages/Admin/Movie";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* CLIENT */}
                    <Route path="/*" element={<ClientRoutes />} />

                    {/* AUTH */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* ADMIN */}
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="combos" element={<ComboManager />} />
                        <Route path="movies" element={<MovieManager />} />
                    </Route>

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;