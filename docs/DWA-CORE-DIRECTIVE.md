# DWA CORE DIRECTIVE — QUY ĐỊNH BẤT BIẾN

Phiên bản: 1.0
Chủ dự án: BAOHUY
Phạm vi: Dinosaur War Arena (DWA) và cuộc thi AI phát triển DWA.

## 1. Quyền tối cao và nguyên tắc
1. Các yêu cầu kỹ thuật và thể lệ thi đấu do chủ dự án đã xác lập được giữ nguyên. Nâng cấp Master AI chỉ thay đổi cách tổ chức và thực thi, không tự ý thay đổi mục tiêu, tiêu chí, số vòng hoặc quy tắc.
2. Master AI được lập kế hoạch, phân công, giám sát, kiểm tra, yêu cầu sửa và đề xuất tích hợp. Master AI không được tự sửa luật, bỏ yêu cầu hoặc tự phê duyệt thay đổi trái với chỉ thị của chủ dự án.
3. Không tự ý thêm loài khủng long hoặc cá thể mới. Chỉ thêm khi chủ dự án cung cấp ảnh và yêu cầu rõ ràng.
4. Không giới hạn số cá thể của một loài.
5. Giữ nguyên hai HTML nguồn gốc; mọi chỉnh sửa phải thực hiện trên bản sao/worktree riêng. Chủ dự án cho phép chỉnh sửa trực tiếp bản sao của hai HTML đã cung cấp, không được ghi đè bản gốc.
6. Không tuyên bố hoàn thành nếu chưa có bằng chứng kiểm thử phù hợp. Phân biệt rõ kiểm tra cú pháp, unit test, tích hợp, kiểm thử trình duyệt/gameplay và kiểm thử thiết bị Android.
7. Không phát sinh chi phí, bật paid usage hoặc mua tín dụng nếu chưa được chủ dự án cho phép. Khi hết hạn mức miễn phí, dừng và báo cáo, không tự chuyển sang dịch vụ tính phí.

## 2. Định hướng hình ảnh và trải nghiệm đã chọn
- Đồ họa 2D: lựa chọn C.
- Đồ họa 3D: lựa chọn C.
- Phong cách khủng long 3D: lựa chọn A.
- Ưu tiên chất lượng hình ảnh, đồng thời tối ưu để chạy mượt trên điện thoại.
- Các hoạt ảnh cần có: walk, run, roar, attack, death, special.
- Mỗi khu vực/area phải có bố cục, địa hình và cảnh quan đặc trưng thực sự khác nhau; ví dụ khe núi phải thể hiện địa hình khe núi, khu thiên nhiên có thác nước, đảo phụ và đảo lớn.
- Loại bỏ bóng đổ dưới chân của tất cả khủng long theo yêu cầu đã nêu.
- Tránh chồng lấn các nút điều khiển và bảo đảm UI phù hợp màn hình điện thoại.
- Mỗi khủng long có 4 kỹ năng; xác suất kích hoạt kỹ năng đặc biệt là 50%, có chuyển cảnh điện ảnh và hiệu ứng toàn màn hình.
- HP tối thiểu 3000; ATK tối thiểu 50.
- Bổ sung hiệu ứng hình ảnh và âm thanh chiến đấu.
- Bảo đảm dữ liệu và cấu hình tương thích, không phá vỡ các tính năng hiện có.

## 3. Cuộc thi AI — thể lệ cố định
Số lượng đầu vào: 100 AI worker.
Các vòng: 100 → 20 → 8 → 4 → 2 → 1 nhà vô địch.
Mười nhóm chuyên môn, mỗi nhóm 10 worker:
1. Kiến trúc và phương pháp.
2. Gameplay và đồ họa 2D.
3. Mô hình khủng long 3D.
4. Môi trường và bản đồ.
5. Hoạt ảnh và chuyển động.
6. Chiến đấu và kỹ năng.
7. Hiệu ứng và âm thanh.
8. Tối ưu Android.
9. Giao diện và trải nghiệm.
10. Kiểm thử và tích hợp.

Thang điểm 100:
- Đồ họa 2D/3D: 20.
- Hoạt ảnh: 10.
- Môi trường: 15.
- Chiến đấu và kỹ năng: 10.
- Hiệu ứng và âm thanh: 10.
- Hiệu năng Android: 10.
- UI/UX: 5.
- Độ ổn định: 15.
- Kiến trúc và tích hợp: 5.

Ý tưởng hoặc kỹ thuật có giá trị từ AI bị loại vẫn được lưu làm kiến thức tham khảo; loại khỏi vòng thi không đồng nghĩa xóa bỏ ý tưởng.

## 4. Mô hình điều hành
- Một Master AI là bộ não lập kế hoạch và giám sát.
- Mười AI trưởng nhóm điều phối mười lĩnh vực.
- Một trăm worker có ID, vai trò, nhiệm vụ, workspace, lịch sử và kết quả riêng.
- Có thể dùng chung một mô hình nền tảng cho nhiều worker; không được tuyên bố đó là 100 mô hình độc lập.
- Mở rộng tuần tự: 1 worker đầu-cuối → 2 → 5 → 10 → 100, chỉ tăng quy mô sau khi cổng kiểm thử trước đạt.
- Master AI/Orchestrator phải lưu trạng thái, log và checkpoint; khôi phục được sau gián đoạn.
- Mọi thay đổi mã nguồn cần có diff, kiểm thử, bằng chứng và phê duyệt theo chính sách tích hợp.

## 5. Tiêu chuẩn báo cáo
Mỗi kết quả phải nêu: worker ID, nhiệm vụ, tệp đã đọc/sửa, thay đổi, lệnh kiểm thử đã chạy, kết quả thực tế, giới hạn chưa kiểm tra và artifact/log liên quan.
Không bịa kết quả, không giả lập việc đã chạy AI, không coi hồ sơ worker là worker đang hoạt động.
