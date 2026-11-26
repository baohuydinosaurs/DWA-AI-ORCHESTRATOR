# Chạy AI worker thật trên GitHub

## Cơ chế
Workflow `.github/workflows/run-one-ai-worker.yml` được khởi chạy thủ công trong GitHub Actions. GitHub-hosted runner chạy Node.js, gọi GitHub Models inference API bằng token ngắn hạn `GITHUB_TOKEN` với quyền tối thiểu `models: read`, rồi lưu kết quả thành artifact.

Đây là một lần suy luận AI thực sự trên mô hình được chọn, không phải hồ sơ worker giả lập. Workflow hiện chỉ chạy một worker tại một thời điểm; chưa phải 100 worker song song.

## Cách chạy bằng điện thoại
1. Mở tab **Actions** của repository.
2. Chọn workflow **Run one real DWA AI worker**.
3. Nhấn **Run workflow**.
4. Nhập nhiệm vụ, ví dụ: `Phân tích các rủi ro kỹ thuật khi xây dựng hệ thống AI worker cho Dinosaur War Arena. Trả lời bằng tiếng Việt, nêu các bước kiểm chứng.`
5. Giữ model mặc định trước lần chạy đầu tiên và xác nhận **Run workflow**.
6. Mở lần chạy vừa tạo. Chỉ coi là thành công khi bước **Execute real model inference** có trạng thái xanh và artifact **dwa-ai-worker-result** được tạo.
7. Tải artifact để xem `worker-result.md` và `worker-result.json`.

## Giới hạn và an toàn
- GitHub Models có hạn mức miễn phí và giới hạn tốc độ; có thể trả lỗi giới hạn hoặc model không khả dụng. Không bật paid usage nếu chưa có chấp thuận rõ ràng.
- Không cần đưa mật khẩu, PAT hoặc API key cho ChatGPT.
- Workflow chỉ đọc repository và gọi inference; không có quyền tự ghi hoặc sửa mã nguồn.
- Runner chỉ sống trong thời gian workflow chạy. Đây không phải dịch vụ chạy nền 24/7.
- Mỗi lần workflow chạy là một lần thực thi worker thật. Chưa triển khai hàng đợi, retry bền vững, checkpoint, hoặc mở rộng lên 100 worker.
