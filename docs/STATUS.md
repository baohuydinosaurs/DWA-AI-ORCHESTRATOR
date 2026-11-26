# DWA AI Orchestrator — trạng thái triển khai

## Đã triển khai
- Quy định cốt lõi: `docs/DWA-CORE-DIRECTIVE.md`.
- 100 worker identities thuộc 10 nhóm chuyên môn; registry không giả nhận chúng là tiến trình AI đang chạy.
- Master Orchestrator kiểm tra luật, tạo kế hoạch, phân công tác vụ và xác thực báo cáo.
- Cuộc thi 60 phút được cấu hình thành 7 chặng: chuẩn bị 10', vòng ngoài 15', vòng trong 10', tứ kết 8', bán kết 8', chung kết 6', công bố 3'.
- Nhánh thi đấu vẫn dùng các mốc 100 → 20 → 8 → 4 → 2 → 1.
- Thứ hạng chỉ quyết định suất đi tiếp trong nhánh; không tự động xóa/loại bỏ tính năng có giá trị.
- Có chức năng ghi nhận tính năng độc đáo, giữ nguồn gốc worker, bằng chứng tệp và kiểm thử.
- Có cổng tích hợp: tương thích, test riêng, hồi quy toàn hệ thống và không xung đột.
- Định nghĩa nhà vô địch là bản tổng hợp các tính năng được xác minh, không phải bản mã của một AI duy nhất.
- Unit tests bổ sung cho lịch 60 phút, giữ tính năng ngoài thứ hạng và điều kiện tích hợp.
- Có module nền ghi hình WebM bằng MediaRecorder, lưu metadata theo từng chặng; không tự bật camera/micro.
- Có unit tests mô phỏng recorder để kiểm tra tạo blob, metadata, timeslice và tên tệp.
- Có tài liệu `docs/RECORDING.md` quy định lưu video cả các chặng và bằng chứng của worker bị loại.

## Chưa được xác nhận
- Chưa có 100 tiến trình AI thực sự đang chạy.
- Gemini API từng trả HTTP 503; chưa có suy luận AI thành công được xác minh.
- Chưa tích hợp source game HTML vào workspace riêng.
- Chưa gắn recorder vào giao diện game/dashboard; chưa có video thi đấu thực tế được ghi.
- Chưa chạy kiểm thử gameplay/trình duyệt/Android; cần xác minh MediaRecorder/WebM và lưu trữ trên Android mục tiêu.
- Chưa có bản phát hành game hoàn chỉnh.

- Có task queue JSON bền vững theo tiến trình, lease/claim, retry khi lease hết hạn, event log, checkpoint và restore; đã thêm unit tests.
- Queue hiện dùng khóa thư mục một-writer; không được dùng như hàng đợi phân tán nhiều runner độc lập. Trước khi mở rộng worker song song trên nhiều máy cần chuyển sang SQLite/DB giao dịch.

## Cổng kế tiếp
1. Chờ GitHub Actions xác nhận test mới.
2. Bổ sung kho lưu feature registry và hàng đợi/checkpoint bền vững.
3. Xác minh mô hình AI miễn phí khả dụng, không dùng dịch vụ trả phí.
4. Chạy một worker đầu-cuối trên bản sao source game; xác minh artifact và test.
5. Mở rộng theo cổng 2 → 5 → 10 → 100.

## Bất biến
- Không tự thêm loài khủng long.
- Không ghi đè hai HTML gốc.
- Không thay đổi thể lệ/yêu cầu kỹ thuật đã chốt.
- Không dùng tiền hoặc bật paid usage khi chưa được chủ dự án cho phép.
- Không công bố tính năng tích hợp nếu chưa có bằng chứng kiểm thử.
