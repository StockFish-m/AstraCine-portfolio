import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";
import { loginApi } from "../../api/authApi";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // giữ nguyên

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.identifier || !form.password) {
      setError("Vui lòng nhập tài khoản và mật khẩu");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await loginApi(form);

      login(res.data);

<<<<<<< HEAD
      // Lấy role đầu tiên từ roles set
      const userRole = res.data.roles && res.data.roles.length > 0
        ? res.data.roles[0]
        : "CUSTOMER";

      switch (userRole) {
        case "ADMIN":
          navigate("/admin");
          break;
=======
      const roles = res.data.roles || [];
>>>>>>> b9d646e2b48bcd8c96c9f3f58d597f51b9f7b8b5

      if (roles.includes("ROLE_ADMIN")) {
        navigate("/admin");
      } else if (roles.includes("ROLE_MANAGER")) {
        navigate("/manager");
      } else if (roles.includes("ROLE_STAFF")) {
        navigate("/staff");
      } else if (roles.includes("ROLE_CUSTOMER")) {
        navigate("/");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Sai tài khoản hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Đăng nhập</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            name="identifier"
            placeholder="Tài khoản / Email / SĐT"
            value={form.identifier}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={handleChange}
          />

          {/* ✅ CHỈ THÊM DÒNG NÀY */}
          <div className="forgot-password">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Đăng nhập"}
          </button>
        </form>

        <div className="auth-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
