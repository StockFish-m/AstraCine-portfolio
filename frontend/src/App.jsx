import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClientRoutes from "./routes/ClientRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import AdminRoutes from "./routes/AdminRoutes";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* CLIENT */}
          <Route path="/*">
            {ClientRoutes()}
          </Route>

          {/* ADMIN - TEMPORARY: No auth for testing */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* STAFF */}
          <Route
            path="/staff/*"
            element={
              <ProtectedRoute>
                <RoleRoute allowRoles={["STAFF"]}>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;