// Thêm import vào đầu file src/components/Header.tsx
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

// Tìm vị trí hàng nút bấm tiện ích (thường cạnh nút Đổi tỉ lệ khung hình hoặc Xuất bản) và chèn:
<Link
  to="/sandbox"
  target="_blank" // Tự động mở riêng bảng điều khiển ở một TAB MỚI trên trình duyệt
  className="flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-400 transition-all hover:bg-purple-500/20"
>
  <Shield size={13} />
  <span>Trạm Sandbox Rời</span>
</Link>
