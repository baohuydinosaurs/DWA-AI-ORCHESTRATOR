# DWA AI Orchestrator — trạng thái triển khai

## Đã triển khai
- Quy định cốt lõi: `docs/DWA-CORE-DIRECTIVE.md`.
- Cấu trúc danh tính 100 worker thuộc 10 nhóm chuyên môn; registry ghi rõ đây là hồ sơ worker, không giả nhận chúng là tiến trình AI đang chạy.
- Master Orchestrator kiểm tra luật, tạo kế hoạch, phân công tác vụ và xác thực báo cáo.
- Cuộc thi 60 phút được cấu hình thành 7 chặng: chuẩn bị 10', vòng ngoài 15', vòng trong 10', tứ kết 8', bán kết 8', chung kết 6', công bố 3'.
- Nhánh thi đấu dùng các mốc 100 → 20 → 8 → 4 → 2 → 1.
- Thứ hạng chỉ quyết định suất đi tiếp trong nhánh; không tự động xóa tính năng có giá trị của worker bị loại.
- Có chức năng ghi nhận tính năng độc đáo, giữ nguồn gốc worker, tệp nguồn và bằng chứng kiểm thử.
- Có cổng tích hợp: tương thích, test riêng, hồi quy toàn hệ thống và không xung đột.
- Nhà vô địch được định nghĩa là bản tổng hợp các tính năng tốt nhất đã xác minh, không phải mã nguồn của một AI duy nhất.
- Có module ghi hình WebM bằng MediaRecorder và metadata theo chặng; module không tự bật camera/micro.
- Có task queue JSON với claim/lease, event log, checkpoint và restore.
- Có task runner xử lý tối đa một tác vụ cho worker được chỉ định; có test cho hoàn tất, cô lập worker, lỗi executor và kết quả rỗng.
- Hai tệp HTML game gốc hiện diện trong repository:
  - `BAOHUY_Dinosaur_War_Arena_Enhanced.html`
  - `BAOHUY_Dinosaur_War_Arena_VFX_Shader_Audio.html`
- GitHub Actions workflow `Validate DWA Orchestrator`, run #44, đã hoàn tất với kết quả `success` trong khoảng 12 giây. Các bước npm test, kiểm tra cú pháp hai module worker/task-runner và tạo/xác minh kế hoạch Master AI đều thành công.


- Task queue đã có gia hạn lease; task runner gửi heartbeat trong khi executor chạy lâu. CI run #50 xác nhận bộ test queue/runner và kiểm tra cú pháp thành công.
- Bổ sung `src/gemini-adapter.mjs` để đọc đúng phản hồi Gemini Interactions API dạng `steps[].type = "model_output"`, đồng thời giữ tương thích với các dạng phản hồi khác.
- AI worker chuyển sang yêu cầu stateless (`store: false`) và tách system instruction khỏi nội dung tác vụ. Thay đổi này mới được kiểm tra bằng unit tests/CI; chưa gọi API thật để tránh sử dụng quota/billing khi chưa xác minh chính sách miễn phí.

## Chưa được xác nhận
- Chưa có 100 tiến trình AI thực sự đang chạy; 100 worker hiện là 100 danh tính/hồ sơ được đăng ký.
- Chưa xác minh một lần suy luận Gemini API thành công trong workflow. Trước đây API từng trả HTTP 503.
- Hai HTML gốc có dung lượng khoảng 11 MB mỗi tệp; nội dung chưa được phân tích đầy đủ trong phiên kiểm tra này. Chưa tạo bản sao làm việc hoặc sửa đổi hai tệp gốc.
- Chưa tích hợp task runner với adapter AI thật và queue trong một luồng end-to-end.
- Chưa gắn recorder vào game/dashboard; chưa có video thi đấu thực tế được ghi.
- Chưa chạy kiểm thử gameplay/trình duyệt/Android; cần xác minh MediaRecorder/WebM, dung lượng và phát lại trên thiết bị mục tiêu.
- Chưa có bản phát hành game hoàn chỉnh.

## Giới hạn kỹ thuật hiện tại
- Queue JSON dùng khóa thư mục và chỉ phù hợp một Node host/tiến trình ghi tại một thời điểm; không dùng như hàng đợi phân tán cho nhiều GitHub runners độc lập.
- Lease mặc định là 5 phút; worker chạy lâu hơn cần cơ chế gia hạn lease hoặc giới hạn thời gian thực thi để tránh tác vụ bị nhận lại khi vẫn đang chạy.
- GitHub Actions chạy theo từng workflow, không phải hệ thống worker nền 24/7.
- API Gemini có quota và độ sẵn sàng thay đổi. Không bật paid usage hoặc billing để vượt hạn mức.

## Cổng kế tiếp
1. Phân tích hai HTML gốc theo bản sao làm việc, không ghi đè bản gốc.
2. Tạo adapter AI có thể kiểm thử độc lập và xác minh một lần inference thật bằng model miễn phí, nếu quota khả dụng.
3. Nối task runner → queue → adapter AI → kết quả có cấu trúc → kiểm tra bằng chứng.
4. Bổ sung gia hạn lease/timeout và test cho tác vụ chạy dài.
5. Gắn recorder vào game canvas/dashboard và kiểm tra video thật.
6. Mở rộng theo cổng 1 → 2 → 5 → 10 → 100 worker; chỉ tăng khi cổng trước ổn định.

## Bất biến
- Không tự thêm loài khủng long.
- Không ghi đè hai HTML gốc.
- Không thay đổi thể lệ/yêu cầu kỹ thuật đã chốt.
- Không dùng tiền hoặc bật paid usage khi chưa có chủ dự án cho phép.
- Không công bố tính năng tích hợp nếu chưa có bằng chứng kiểm thử.
