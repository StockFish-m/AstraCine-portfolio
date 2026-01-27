import { BrowserRouter, Routes } from "react-router-dom";
import ClientRoutes from "./routes/ClientRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import AdminRoutes from "./routes/AdminRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {ClientRoutes()}
        {AuthRoutes()}
        {AdminRoutes()}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
