# Ghi hình cuộc thi DWA

## Mục tiêu
Lưu bằng chứng trực quan cho toàn bộ cuộc thi 60 phút và từng chặng, giúp xem lại lỗi, đánh giá công bằng và lập báo cáo sau thi.

## Phạm vi ghi hình
- Ghi hình luồng hình ảnh của sân đấu/game canvas hoặc MediaStream do giao diện cung cấp.
- Tạo bản ghi riêng theo chặng: vòng ngoài, vòng trong, tứ kết, bán kết, chung kết.
- Ghi metadata: tournament ID, stage ID, thời điểm bắt đầu/kết thúc, thời lượng, MIME type, số chunk.
- Lưu video WebM và liên kết video với nhật ký sự kiện, kết quả kiểm thử, báo cáo worker.
- Giữ lại video của cả AI bị loại; thứ hạng không phải lý do xóa bằng chứng.
- Video không thay thế log, test report hoặc artifact mã nguồn.

## Cách vận hành
1. Giao diện game tạo MediaStream, ưu tiên `HTMLCanvasElement.captureStream(30)` nếu sân đấu được vẽ trên canvas.
2. Giao diện truyền stream vào `createTournamentRecorder()`.
3. Bắt đầu ghi khi chặng bắt đầu; dừng và lưu blob khi chặng kết thúc.
4. Ghi metadata JSON đi kèm video và gắn với stage/worker IDs.
5. Tổng kết 57:00–60:00: đóng các bản ghi, kiểm tra đủ video và metadata, lập danh sách bản ghi thiếu/hỏng.

## Quyền riêng tư và giới hạn
- Module không tự bật camera, micro hoặc chia sẻ màn hình.
- Chỉ ghi luồng game được giao diện chủ động cung cấp; nếu muốn thu âm phải có audio track được cấp rõ ràng.
- Trình duyệt Android phải hỗ trợ MediaRecorder và WebM; giao diện cần báo rõ nếu không hỗ trợ.
- Cần kiểm thử dung lượng, thời lượng, tải xuống/lưu trữ và khả năng phát lại trên thiết bị mục tiêu.
- Hiện module ghi hình là thành phần nền; chưa tuyên bố đã được gắn vào giao diện game hoặc đã ghi được video thi đấu thực tế.
