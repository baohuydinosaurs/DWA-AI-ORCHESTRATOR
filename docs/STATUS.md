# DWA AI Orchestrator — trạng thái triển khai

## Đã tạo trong giai đoạn nền tảng
- Khai báo dự án Node.js, không cần thư viện bên thứ ba.
- Khai báo 10 nhóm công việc, mỗi nhóm 10 vị trí worker.
- Tạo bộ sinh registry gồm 100 hồ sơ worker có ID duy nhất.
- Thêm kiểm thử tự động cho số lượng, tính duy nhất và kiểm tra cấu hình.
- Thêm GitHub Actions để chạy kiểm thử khi có push hoặc pull request.

## Giới hạn cần nói rõ
100 bản ghi trong registry **không phải 100 AI đang chạy**. Chúng mới là danh tính/vị trí worker để hệ thống quản lý. Chưa có nhà cung cấp mô hình, thông tin xác thực, bộ thực thi tác vụ, hàng đợi bền vững hay máy chủ chạy liên tục.

## Các giai đoạn kế tiếp
1. Chạy và xác minh kiểm thử registry trên GitHub Actions.
2. Xây bộ thực thi một worker thật với adapter mô hình có cấu hình rõ ràng.
3. Thử một worker đầu-cuối trên tác vụ giới hạn, có timeout, retry, log và checkpoint.
4. Mở rộng lần lượt 2 → 5 → 10 → 100 worker sau khi kiểm thử tải và chi phí.
5. Tích hợp game trên bản sao nguồn; giữ nguyên hai file HTML gốc.

## Nguyên tắc an toàn
- Không ghi API key hoặc token vào Git.
- Không tự phát sinh chi phí hoặc bật dịch vụ trả phí.
- Không sửa nguồn game gốc.
- Không tuyên bố worker chạy thật khi mới chỉ có hồ sơ registry.
