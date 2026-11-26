# Báo cáo kiểm tra tĩnh hai HTML gốc của Dinosaur War Arena

**Phạm vi:** phân tích tĩnh bằng Node.js trên GitHub Actions. Hai tệp gốc được đọc, không chỉnh sửa. Đây chưa phải kiểm thử trình duyệt, gameplay hoặc Android.

## 1. Tệp được kiểm tra

| Tệp | Kích thước | Số dòng | SHA-256 |
|---|---:|---:|---|
| BAOHUY_Dinosaur_War_Arena_Enhanced.html | 11,136,001 bytes | 4,596 | 6a11b416893ea050abd55938aba21f43a4e5a7574f9287ca41f63b4166c10d0a |
| BAOHUY_Dinosaur_War_Arena_VFX_Shader_Audio.html | 11,142,114 bytes | 4,682 | 0671d69874df8f997570753dca6c15ba1b48179f62b8c3b22ee5b2f8fd9e5b15 |

Cả hai cùng tiêu đề: Dinosaur War Arena - PixelFX 2D & 3D Open World.

## 2. Kiến trúc giao diện và đồ họa được phát hiện

- Mỗi tệp có 4 thẻ canvas.
- Cả hai dùng Three.js r128 từ CDN: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js.
- Có WebGL, requestAnimationFrame và Web Audio API.
- Có 1 inline script lớn chứa phần lớn logic game.
- Các vùng giao diện chính được phát hiện gồm canvas2d, viewport3d, arenaViewport, bảng roster, combat log, điều khiển trận đấu, showroom và bản đồ khu vực.
- Các hàm quan trọng được nhận diện gồm createDinosaurRoster, startMatch, stopMatch, mainLoop, draw2D, render3D, stepCombat, triggerDinoSkill, applyDamage và checkMatchEnded.

## 3. So sánh hai phiên bản

- Hai tệp không giống hệt nhau.
- Có chung 7,612,651 ký tự đầu và 87,429 ký tự cuối.
- Điểm khác biệt đầu tiên nằm trong inline script ở phần SoundEngine.
- Bộ nhận diện tĩnh tìm thấy cùng danh sách tên hàm trong cả hai phiên bản; phần thay đổi có thể nằm trong nội dung hàm, dữ liệu, hiệu ứng hoặc cách triển khai bên trong.
- Phiên bản VFX_Shader_Audio lớn hơn 6,113 bytes và có thêm 86 dòng.
- Chưa đủ bằng chứng để tự chọn một phiên bản làm bản chuẩn. Giữ nguyên cả hai và cần so sánh nội dung khác biệt trước khi hợp nhất.

## 4. Khoảng trống tích hợp được xác nhận

Cả hai HTML đều không chứa:
- MediaRecorder
- HTMLCanvasElement.captureStream()
- localStorage
- IndexedDB

Điều này có nghĩa module ghi hình WebM hiện tại chưa được nối vào game; chưa có luồng capture trực tiếp từ canvas và cũng chưa phát hiện cơ chế lưu trạng thái cục bộ qua hai API trên.

## 5. Điểm tích hợp dự kiến — chưa triển khai

1. **AI điều khiển:** cần adapter có giao diện rõ ràng giữa AI policy và dữ liệu trạng thái/điều khiển của game. Không để AI trực tiếp sửa DOM hoặc thay luật chiến đấu.
2. **Ghi hình:** xác định canvas sân đấu thực tế (2D và 3D), tạo capture stream có kiểm soát, gắn metadata tournament/stage và xử lý lỗi trình duyệt Android.
3. **Lưu trạng thái:** thiết kế schema lưu trận đấu, roster, kết quả và nhật ký; không tự ý ghi dữ liệu vào game trước khi có kiểm thử tương thích.
4. **Hiệu năng:** đo FPS, thời gian frame, bộ nhớ và tải GPU trên Android trước khi mở rộng số cá thể/worker.

## 6. Kết luận

Đã xác định được cấu trúc tĩnh tổng quan và các điểm thiếu cho tích hợp AI/ghi hình. Chưa sửa hai HTML gốc, chưa chọn bản chuẩn, chưa kiểm thử gameplay trong trình duyệt và chưa xác nhận game chạy ổn định trên Android.
