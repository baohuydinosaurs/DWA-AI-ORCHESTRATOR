# DWA browser AI policy bridge

## Mục tiêu

Cho phép nạp chính sách chiến thuật do worker tạo vào game mà không gọi model AI trong vòng lặp 60 FPS và không viết lại hệ thống chiến đấu hiện hữu.

## Cách hoạt động

- Script build đọc từng HTML gốc và tạo preview riêng; không sửa hai file nguồn.
- Preview gắn một bridge tại phạm vi IIFE để truy cập trạng thái game an toàn.
- Game tiếp tục dùng logic di chuyển/chiến đấu hiện có khi chưa gán policy.
- Khi có policy, game dùng policy để chọn mục tiêu, điều chỉnh chiến thuật và ưu tiên kỹ năng.
- Không có HTTP/API request nào được thực hiện trong vòng lặp frame.

## API trong preview

- `window.DWA_AI.setPolicy(dinoId, policy, workerId)`: gán một policy cho cá thể theo ID.
- `window.DWA_AI.loadPolicyBundle({ policies: [...] })`: nạp nhiều policy; mỗi entry gồm `dinoId`, `workerId`, `policy`.
- `window.DWA_AI.getSnapshot()`: trả bản sao read-only của trạng thái trận đấu và roster.
- `window.DWA_AI.getPolicyAssignments()`: xem danh sách gán policy và nguồn worker.
- `window.DWA_AI.clearPolicies()`: xóa toàn bộ policy đang gán.
- Preview có nút **Nạp AI policy** để chọn file JSON trực tiếp trên điện thoại và nút **Xóa policy** để trở về chiến thuật mặc định.

## Schema policy

| Trường | Giá trị hợp lệ | Ý nghĩa |
|---|---|---|
| `targetMode` | `nearest`, `weakest`, `strongest` | Chọn mục tiêu gần nhất, ít HP nhất hoặc ATK cao nhất |
| `tactic` | `balanced`, `aggressive`, `evasive` | Cân bằng, tăng tốc tiếp cận 15%, hoặc rút lui khi HP thấp |
| `retreatBelowHpRatio` | số từ 0.1 đến 0.8 | Ngưỡng HP kích hoạt rút lui khi dùng `evasive` |
| `skillPriority` | mảng skill ID | Kỹ năng ưu tiên; nếu cá thể không sở hữu skill đó, game dùng lựa chọn mặc định |

Ví dụ policy bundle:

```js
window.DWA_AI.loadPolicyBundle({
  policies: [
    {
      dinoId: 0,
      workerId: "combat-001",
      policy: {
        targetMode: "weakest",
        tactic: "aggressive",
        retreatBelowHpRatio: 0.3,
        skillPriority: ["buff-power", "heal-aoe"]
      }
    }
  ]
});
```

## Tệp policy demo\n\n- `config/demo-policy-bundle.json` là ví dụ thủ công để thử nút nạp JSON trên điện thoại. Các workerId đều có tiền tố `demo-policy-not-live-ai-`; đây không phải kết quả inference hay 4 AI đang chạy.\n- Tệp demo áp dụng cho roster slot ID 0–3. Nếu roster khác, cần đổi dinoId cho khớp snapshot game.\n\n## Build và kiểm thử

- `npm run game:preview` tạo hai file preview trong `artifacts/dwa-ai-preview/`.
- Unit tests kiểm tra biến đổi source, bridge, policy hooks, schema policy và cú pháp JavaScript sau khi build.\n- `npm run policy:validate` xác thực tệp demo theo schema trước khi upload preview.
- GitHub Actions run #77 đã thành công; artifact `dwa-ai-integration-preview` chứa cả hai preview HTML.
- Artifact URL: https://github.com/baohuydinosaurs/DWA-AI-ORCHESTRATOR/actions/runs/45767179727/artifacts/15092153050
- Artifact giữ 7 ngày, dự kiến hết hạn 2026-12-03.

## Giới hạn hiện tại

- Đây là prototype policy bridge; chưa có model AI nào đang ra quyết định trực tiếp trong game.
- Chưa có kiểm thử trình duyệt thực tế, gameplay, hiệu năng hoặc Android.
- Chưa xác minh policy bundle do Gemini tạo có schema hợp lệ; cần structured output và validation trước khi dùng.
- Chưa tích hợp ghi hình vào canvas; module MediaRecorder vẫn là thành phần nền.
- Không tuyên bố 100 worker là 100 model inference process đang chạy.
