# DWA AI Orchestrator — trạng thái triển khai

## Đã triển khai trong repository
- Khóa quy định dự án trong `docs/DWA-CORE-DIRECTIVE.md`: yêu cầu kỹ thuật, giới hạn quyền Master AI, quy tắc không tự thêm loài, bảo vệ bản gốc, chính sách không phát sinh phí.
- Lưu thể lệ cuộc thi có cấu trúc trong `config/tournament-rules.json`: 100 → 20 → 8 → 4 → 2 → 1 và thang điểm 100.
- Giữ 10 nhóm chuyên môn, 10 vị trí mỗi nhóm; sinh 100 ID worker duy nhất.
- Thêm Master Orchestrator nền tảng: xác thực luật, lập kế hoạch, phân công worker theo chuyên môn và kiểm tra cấu trúc báo cáo.
- Thêm lệnh `npm run master:plan` để sinh kế hoạch vào `.runtime/master-plan.json`.
- Thêm unit tests cho luật thi, kế hoạch Master, phân công và xác thực kết quả.

## Trạng thái cần phân biệt
- Master Orchestrator hiện là bộ điều phối/quy tắc chạy bằng Node.js; chưa phải một mô hình AI tự suy luận.
- Master AI model inference vẫn chưa cấu hình. ChatGPT có thể đảm nhận vai trò Master AI trong phiên làm việc; GitHub giữ luật, registry, kế hoạch và trạng thái có thể kiểm tra.
- 100 worker hiện là 100 danh tính/slot có vai trò, không phải 100 tiến trình AI đang chạy.
- Gemini worker đã gọi API thật nhưng các lần gần nhất thất bại HTTP 503 do model quá tải; chưa có báo cáo AI thành công.
- Chưa kết nối hai HTML game vào worker workspace, chưa thực hiện kiểm thử gameplay hoặc thiết bị Android.

## Cổng triển khai tiếp theo
1. Xác nhận GitHub Actions chạy xanh trên commit mới nhất.
2. Chạy `npm run master:plan` và xác minh đủ 100 worker records.
3. Bổ sung task queue/checkpoint bền vững và kiểm thử khôi phục.
4. Chọn adapter suy luận miễn phí khả dụng; không tự bật paid usage.
5. Chạy 1 worker đầu-cuối, kiểm tra nội dung và artifact.
6. Mở rộng 2 → 5 → 10 → 100 chỉ khi cổng trước đạt.

## Nguyên tắc an toàn
- Không ghi API key hoặc token vào Git.
- Không phát sinh chi phí hoặc bật dịch vụ trả phí nếu chưa được chủ dự án cho phép.
- Không sửa hai file HTML gốc; chỉ làm trên bản sao.
- Không tuyên bố worker chạy thật khi mới chỉ có hồ sơ registry.
- Mỗi báo cáo phải ghi rõ các bước đã thực sự kiểm tra và giới hạn còn lại.
