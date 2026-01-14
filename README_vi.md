# Simple Git Patch Viewer

<img src="public/ico.svg" alt="Patch Viewer icon" width="64" height="64" />

Ứng dụng web nhẹ để xem file patch và diff theo kiểu Git trực tiếp trên trình duyệt. Phân tích, trực quan hóa, và phân tích các patch đa file với hỗ trợ nhiều chế độ xem, tìm kiếm theo thời gian thực và lọc toàn diện.

## Tổng Quan

**Patch Viewer** giúp dễ dàng xem và hiểu các patch Git trực tiếp trên trình duyệt của bạn. Cho dù bạn đang xem xét các thay đổi code, phân tích diff, hay chia sẻ chi tiết patch, công cụ này cung cấp giao diện trực quan với các tính năng mạnh mẽ để kiểm tra.

## Các Tính Năng Chính

- **Hỗ trợ Patch Đa File** — Phân tích và hiển thị file `.patch` và `.diff` với nhiều thay đổi file
- **Hai Chế độ Xem** — Chuyển đổi giữa các chế độ xem diff unified và split cho các kiểu phân tích khác nhau
- **Cây File Tương Tác** — Expand/collapse cấu trúc file với các chỉ báo trực quan cho các sửa đổi
- **Lọc Thông Minh** — Lọc theo trạng thái file (added, modified, deleted) để tập trung vào các thay đổi liên quan
- **Tìm Kiếm Theo Thời Gian Thực** — Tìm kiếm trong tên file để nhanh chóng định vị các file cụ thể
- **Bảng Điều Khiển Thống Kê** — Xem tổng số lần thêm và xóa trong tầm nhìn
- **Thiết Kế Đáp Ứng** — Tối ưu hóa cho duyệt trên desktop và mobile
- **Hỗ Trợ Kéo & Thả** — Upload patch bằng cách kéo file vào trình duyệt
- **Phân Trang** — Xử lý các file patch lớn với phân trang tự động
- **Heuristic Thông Minh** — Phát hiện và xử lý các file được tạo, file khóa và code được minify

## Bắt Đầu

### Yêu Cầu Tiên Quyết

- Node.js 16+ và npm

### Cài Đặt

```sh
npm install
```

### Chạy Máy Chủ Phát Triển

```sh
npm run dev
```

Mở [http://127.0.0.1:5173](http://127.0.0.1:5173) trong trình duyệt của bạn để bắt đầu sử dụng viewer.

### Xây Dựng Cho Sản Xuất

```sh
npm run build
```

Build được tối ưu hóa sẽ được tạo trong thư mục `dist/`.

## Cách Sử Dụng

### Tải Patch

1. Nhấp vào nút **Upload** để chọn file `.patch` hoặc `.diff` từ máy tính
2. Ngoài ra, dán nội dung patch trực tiếp vào textarea
3. Viewer sẽ tự động phân tích và hiển thị patch

### Điều Hướng Các Thay Đổi

- **Cây File** — Duyệt cấu trúc file trong thanh bên trái
  - Nhấp vào file để nhảy đến các phần diff tương ứng
  - Sử dụng mũi tên expand/collapse để sắp xếp các thư mục lồng nhau
  
- **Lọc** — Sử dụng các điều khiển thanh bên để hiện/ẩn:
  - File được thêm
  - File được sửa đổi
  - File bị xóa

- **Tìm Kiếm** — Nhập trong hộp tìm kiếm để lọc file theo tên

- **Chế độ Xem** — Chuyển đổi giữa:
  - **Unified** — Chế độ xem diff truyền thống
  - **Split** — Các cột riêng biệt cho trước/sau

## Stack Công Nghệ

- **Frontend Framework** — Vue 3 với Composition API
- **Styling** — Tailwind CSS với PostCSS
- **Build Tool** — Vite
- **Testing** — Playwright
- **Routing** — Vue Router
- **Icons** — Lucide Vue
- **Analytics** — Vercel Analytics & Speed Insights

## Cấu Trúc Dự Án

```
src/
├── App.vue                 # Thành phần ứng dụng chính
├── components/
│   ├── DiffFile.vue       # Viewer diff file riêng lẻ
│   ├── FileTree.vue       # Trình duyệt file phân cấp
│   ├── EmptyState.vue     # Trạng thái upload ban đầu
│   ├── TheHeader.vue      # Tiêu đề ứng dụng với điều khiển
│   ├── TheSidebar.vue     # Thanh bên lọc và tìm kiếm
│   ├── ThePagination.vue  # Điều hướng trang
│   └── TheFooter.vue      # Footer ứng dụng
├── utils/
│   ├── patchParser.js     # Logic phân tích patch cốt lõi
│   └── uiHelpers.js       # Hàm tiện ích UI
└── workers/
    └── patch.worker.js    # Web Worker cho phân tích không đồng bộ

tests/
├── filetree.spec.ts       # Tests thành phần file tree
├── mobile.spec.ts         # Tests tính đáp ứng trên mobile
└── run-test.js            # Test runner tự động
```

## Kiểm Thử

### Chạy E2E Tests

```sh
npx playwright test
```

### Chạy Chuỗi Test Tự Động

```sh
npm run test
```

Lệnh này khởi động máy chủ phát triển, cài đặt các trình duyệt Playwright (nếu cần), và chạy tất cả các test.

> **Mẹo:** Kiểm tra [playwright.config.ts](playwright.config.ts) để tùy chỉnh hành vi test.

## Hiệu Năng & Tính Năng

- **Phân Tích Thông Minh** — Xử lý diff dựa trên chunk hiệu quả
- **Căn Chỉnh Chế Độ Split** — Căn chỉnh dòng tự động trong chế độ xem diff split
- **Phát Hiện File Được Tạo** — Tự động xác định và làm nổi bật:
  - Các artifact build (`dist/`, `build/`)
  - File khóa (`package-lock.json`, `yarn.lock`, vv.)
  - File được minify (`.min.js`, `.min.css`)
  - Source maps
  - Các dependency (`node_modules/`)
  
- **Rendering Tăng Dần** — Phân trang ngăn chặn sự suy giảm hiệu năng với các patch lớn
- **Hỗ Trợ Web Worker** — Phân tích nền thông qua Web Workers

## Hỗ Trợ Trình Duyệt

Hoạt động trên tất cả các trình duyệt hiện đại hỗ trợ ES2022 và Vue 3:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Analytics

Ứng dụng bao gồm các analytics tùy chọn:
- **Vercel Analytics** — Thông tin chi tiết sử dụng cơ bản
- **Speed Insights** — Giám sát Core Web Vitals

Những tính năng này là tùy chọn và tôn trọng các ưu tiên quyền riêng tư của người dùng.

## Đóng Góp

Chúng tôi hoan nghênh các đóng góp! Vui lòng:

1. Fork repository
2. Tạo một feature branch (`git checkout -b feature/amazing-feature`)
3. Thực hiện các thay đổi của bạn bằng test
4. Commit với các tin nhắn rõ ràng
5. Push và mở Pull Request

Hướng dẫn:
- Giữ các thay đổi tập trung và nguyên tử
- Thêm test cho các tính năng mới
- Cập nhật tài liệu khi cần
- Tuân theo kiểu code hiện có

## Giấy Phép

MIT License — xem [LICENSE](LICENSE) để biết chi tiết

---

## Có Sẵn Ở Nhiều Ngôn Ngữ

- [English](README.md)
- [Tiếng Việt (Vietnamese)](README_vi.md)
