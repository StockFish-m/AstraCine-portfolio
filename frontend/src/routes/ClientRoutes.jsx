// routes/ClientRoutes.jsx
import { Routes, Route } from "react-router-dom";
import ClientLayout from "../layouts/ClientLayout";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ComboMenu from "../pages/ComboMenu/ComboMenu"

export default function ClientRoutes() {
  return (
    <Routes>
    <Route element={<ClientLayout />}>
      <Route index element={<Home />} />
      <Route path="menu" element={<ComboMenu />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
    </Route>
    </Routes>
  );
}
