// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App"; // Giao diện dựng phim phụ đề chính của bạn
import { MaintenanceSandboxDashboard } from "./components/MaintenanceSandboxDashboard"; // File code CRM của bạn
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn trang chủ (/) hiển thị giao diện làm phim chính */}
        <Route path="/" element={<App />} />
        
        {/* Đường dẫn biệt lập (/sandbox) hiển thị riêng bảng điều khiển vá lỗi */}
        <Route path="/sandbox" element={<MaintenanceSandboxDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
