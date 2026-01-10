# Simple Git Patch Viewer (Tiếng Việt)

Ứng dụng web nhỏ để xem file patch/diff theo kiểu Git trực tiếp trên trình duyệt. Ứng dụng phân tích nội dung `.patch`/`.diff` và hiển thị cây file cùng các chế độ hiển thị diff (unified/split).

## Tính năng
- Phân tích và hiển thị patch nhiều file (.patch, .diff)
- Cây file có expand/collapse và chọn file
- Chế độ hiển thị unified và split
- Hỗ trợ thao tác bàn phím và giao diện mobile
- Tests E2E với Playwright và script chạy tự động

## Bắt đầu nhanh

1. Cài phụ thuộc
```sh
npm install
```

2. Chạy server dev
```sh
npm run dev
# truy cập http://127.0.0.1:5173
```

3. Chạy chuỗi test tự động (khởi động dev server nếu cần, cài Playwright browsers, chạy tests)
```sh
npm run test
```
(Xem chi tiết: [tests/run-test.js](tests/run-test.js) và [playwright.config.ts](playwright.config.ts))

## Sử dụng
- Upload file `.patch` / `.diff` hoặc dán nội dung vào textarea.
- Ứng dụng dùng hàm [`parsePatch`](src/utils/patchParser.js) để chuyển text thành các đối tượng file và chunk.
- Chọn file từ sidebar để cuộn tới phần diff tương ứng.

## Cấu trúc dự án (chọn lọc)
- src/App.vue — giao diện chính ([src/App.vue](src/App.vue))
- src/components/FileTree.vue — component cây file
- src/utils/patchParser.js — logic phân tích patch (`parsePatch`) ([src/utils/patchParser.js](src/utils/patchParser.js))
- tests/ — Playwright tests và runner ([tests/run-test.js](tests/run-test.js))

## Kiểm thử
- Tests E2E sử dụng Playwright:
```sh
npx playwright test
```
hoặc dùng helper:
```sh
npm run test
```

## Đóng góp
- Fork và gửi PR. Giữ thay đổi nhỏ và bổ sung test khi cần.
- Cập nhật tài liệu khi thêm tính năng.

## Giấy phép
MIT — xem [LICENSE](LICENSE)

## Ngôn ngữ
*   [English (English)](README.md)
*   [Tiếng Việt (Vietnamese)](README_vi.md)
