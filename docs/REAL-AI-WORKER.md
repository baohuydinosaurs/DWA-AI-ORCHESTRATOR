# Chạy một AI worker thật trên GitHub Actions

## Cơ chế hiện tại
Workflow `.github/workflows/run-one-ai-worker.yml` chạy Node.js trên GitHub-hosted runner và gọi Google Gemini API qua endpoint Interactions bằng secret `GEMINI_API_KEY`. Model mặc định được đặt trong workflow input. Đây là suy luận AI thật nếu API key hợp lệ, model được hỗ trợ và request thành công.

## Cách chạy bằng điện thoại
1. Mở tab **Actions** của repository.
2. Chọn **Run one real DWA AI worker**.
3. Nhấn **Run workflow**, nhập nhiệm vụ tiếng Việt.
4. Giữ model mặc định nếu chưa xác minh model khác.
5. Chỉ coi là thành công khi bước inference xanh và artifact `dwa-ai-worker-result` được tạo.
6. Mở artifact, kiểm tra `worker-result.md` và `worker-result.json`.

## Hạn chế quan trọng
- Workflow hiện yêu cầu secret `GEMINI_API_KEY`; nó không dùng `GITHUB_TOKEN` hay GitHub Models inference API.
- Google AI API có thể có hạn mức miễn phí nhưng quota, model availability và 503 có thể thay đổi; không bảo đảm chạy miễn phí liên tục.
- Không bật paid usage hoặc nạp tiền khi chưa có chủ dự án cho phép.
- Workflow chỉ chạy một worker mỗi lần, không phải 100 worker chạy đồng thời.
- Runner tồn tại trong thời gian workflow, không phải worker nền 24/7.
- Không đặt API key trong mã nguồn, log, issue hoặc chat. Nếu key từng bị lộ, hãy thu hồi và tạo key mới.
