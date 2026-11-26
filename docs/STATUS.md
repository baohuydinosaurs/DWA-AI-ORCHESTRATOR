# DWA AI Orchestrator — trạng thái triển khai

## Đã triển khai và có bằng chứng
- Quy định cốt lõi: `docs/DWA-CORE-DIRECTIVE.md`.
- Cấu trúc danh tính 100 worker thuộc 10 nhóm chuyên môn; registry ghi rõ đây là hồ sơ worker, không giả nhận chúng là tiến trình AI đang chạy.
- Master Orchestrator kiểm tra luật, tạo kế hoạch, phân công tác vụ và xác thực báo cáo.
- Cuộc thi 60 phút được cấu hình thành 7 chặng: chuẩn bị 10', vòng ngoài 15', vòng trong 10', tứ kết 8', bán kết 8', chung kết 6', công bố 3'.
- Nhánh thi đấu dùng các mốc 100 → 20 → 8 → 4 → 2 → 1.
- Thứ hạng chỉ quyết định suất đi tiếp; không tự động xóa tính năng có giá trị của worker bị loại.
- Có cơ chế ghi nhận feature, giữ nguồn gốc worker và chỉ tích hợp khi tương thích, test riêng, hồi quy và không xung đột.
- Có module ghi hình WebM bằng MediaRecorder và metadata theo chặng; module không tự bật camera/micro.
- Có task queue JSON với claim/lease, event log, checkpoint/restore, khóa một-writer và test.
- Task runner xử lý một task mỗi lần chạy; lease heartbeat gia hạn quyền xử lý trong tác vụ dài. Unit tests kiểm tra hoàn tất, cô lập worker, lỗi executor, heartbeat và claim đồng thời.
- Có Gemini Interactions adapter đọc cấu trúc model_output; AI worker gửi stateless request với store=false. Chưa có inference thật được xác minh.
- Đã thêm công cụ kiểm tra tĩnh hai HTML gốc: mỗi file có 4 canvas, dùng Three.js r128/WebGL, requestAnimationFrame và Web Audio API.
- Đã so sánh hai HTML gốc: khác nhau ở phần inline script, có chung 7,612,651 ký tự đầu và 87,429 ký tự cuối; VFX_Shader_Audio lớn hơn 6,113 bytes. Chưa chọn bản chuẩn.
- Đã tạo prototype browser AI policy bridge trong hai preview riêng. Hỗ trợ target nearest/weakest/strongest, tactic balanced/aggressive/evasive và ưu tiên skill; không gọi model/API trong vòng lặp frame.
- GitHub Actions run #77 hoàn tất SUCCESS: unit tests, kiểm tra cú pháp, phân tích HTML, build hai preview và upload artifact thành công.

- Đã thêm schema validator cho policy và bundle, kiểm tra enum, ngưỡng HP, skill ID, dinoId duy nhất và worker provenance.
- Có tệp `config/demo-policy-bundle.json` để thử loader; đây là policy mẫu viết tay, không phải kết quả inference AI.
- Hai preview có nút **Nạp AI policy** và **Xóa policy**, cho phép chọn JSON trực tiếp từ bộ nhớ điện thoại.
- GitHub Actions run #93 SUCCESS: npm tests, game source inspection, build hai preview, policy validation và upload artifact đều thành công.
- Artifact mới nhất: https://github.com/baohuydinosaurs/DWA-AI-ORCHESTRATOR/actions/runs/45767569807/artifacts/15093110183 (hết hạn dự kiến 2026-12-03).

## Chưa được xác nhận
- Chưa có 100 tiến trình AI thực sự đang chạy; 100 worker hiện là 100 danh tính/hồ sơ được đăng ký.
- Chưa xác minh một lần suy luận Gemini API thành công. API trước đây từng trả HTTP 503; quota/free-tier cần được xác nhận trước khi chạy.
- Chưa nối task runner → queue → Gemini inference → policy JSON → game trong một luồng end-to-end.
- Hai preview HTML mới chỉ qua kiểm tra biến đổi source và cú pháp JavaScript; chưa chạy thử trong trình duyệt, chưa kiểm thử gameplay, hiệu năng hoặc Android.
- Chưa gắn recorder vào canvas game; chưa có video thi đấu thực tế được ghi.
- Chưa có bản phát hành game hoàn chỉnh.

## Giới hạn kỹ thuật
- Queue JSON dùng khóa thư mục và chỉ phù hợp một Node host/tiến trình ghi tại một thời điểm; không dùng như hàng đợi phân tán nhiều GitHub runners độc lập.
- Lease mặc định 5 phút; task runner hiện có heartbeat gia hạn lease.
- GitHub Actions chạy theo từng workflow, không phải hệ thống worker nền 24/7.
- Gemini API có quota và độ sẵn sàng thay đổi. Không bật paid usage/billing để vượt hạn mức.
- Hai HTML gốc không bị sửa. Preview được tạo thành artifact riêng và có thời hạn tải xuống.

## Cổng kế tiếp
1. Kiểm thử hai preview trên trình duyệt Android và xác nhận UI/gameplay không lỗi.
2. Tạo structured output schema cho AI policy, validate dữ liệu và gắn workerId/source evidence.
3. Nối task runner → queue → Gemini adapter → policy bundle; chỉ chạy một worker thật nếu free quota khả dụng.
4. Gắn recorder vào canvas 2D và renderer canvas 3D, lưu video theo từng chặng và kiểm thử dung lượng/phát lại.
5. Đo FPS, frame time, bộ nhớ và GPU trên Android trước khi mở rộng số worker.
6. Mở rộng theo cổng 1 → 2 → 5 → 10 → 100; không coi 100 worker identities là 100 inference process.

## Bất biến
- Không tự thêm loài khủng long.
- Không ghi đè hai HTML gốc.
- Không thay đổi thể lệ/yêu cầu kỹ thuật đã chốt.
- Không dùng tiền hoặc bật paid usage khi chưa có chủ dự án cho phép.
- Không công bố tính năng tích hợp nếu chưa có bằng chứng kiểm thử.
