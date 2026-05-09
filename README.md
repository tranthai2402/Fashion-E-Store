# BTL_TMDT_Final - Fashion E-Commerce

Dự án website thương mại điện tử thời trang, gồm:

- **Client**: React + Vite + Redux Toolkit + TailwindCSS
- **Server**: Node.js + Express + MongoDB (Mongoose)
- **Tính năng chính**: xác thực, danh sách sản phẩm, giỏ hàng, checkout Stripe, quản trị sản phẩm, lookbook, video, phân quyền admin/user

## 1. Cấu trúc thư mục

```txt
BTL_TMDT_Final/
├─ client/          # Frontend (Vite + React)
├─ server/          # Backend API (Express + MongoDB)
├─ package.json     # Script chạy đồng thời client + server
└─ README.md
```

## 2. Yêu cầu môi trường

- Node.js >= 18
- npm >= 9
- MongoDB Atlas (hoặc MongoDB local)
- Tài khoản Stripe (test key)
- Tài khoản Cloudinary (upload ảnh/video)

## 3. Cài đặt dự án

Từ thư mục gốc:

```bash
npm run install-all
```

Hoặc cài riêng:

```bash
npm install --prefix server
npm install --prefix client
```

## 4. Cấu hình biến môi trường (.env)

### Server

Tạo file `server/.env` từ `server/.env.example`:


### Client

Tạo file `client/.env` từ `client/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## 5. Cách chạy dự án

### Chạy cả client và server cùng lúc (khuyến nghị)

Từ thư mục gốc:

```bash
npm run dev
```

- Client: [http://localhost:5173](http://localhost:5173)
- Server API: [http://localhost:5000](http://localhost:5000)

### Chạy riêng từng phần

```bash
npm run server
npm run client
```

## 6. Scripts chính

Trong thư mục gốc:

- `npm run dev`: chạy đồng thời server + client
- `npm run server`: chạy server (nodemon)
- `npm run client`: chạy client (vite)
- `npm run install-all`: cài dependencies cho cả 2 phần

## 7. API base URL trong client

Client đã được cấu hình dùng biến môi trường tại:

- `client/src/config/api.js`

```js
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
```

Tất cả các Redux slice và phần upload đã dùng `getApiUrl(...)` để tránh hard-code URL.

## 8. Lưu ý bảo mật

- Không commit file `.env` chứa secret thật.
- Nên rotate (đổi) các key cũ nếu đã từng lộ trong lịch sử commit.
- `JWT_SECRET`, `STRIPE_SECRET_KEY`, `CLOUDINARY_API_SECRET` phải được giữ kín.

## 9. Một số route chính

- Shop:
  - `/shop/home`
  - `/shop/listing`
  - `/shop/lookbook`
  - `/shop/product/:id`
- Admin:
  - `/admin/dashboard`
  - `/admin/products`
  - `/admin/lookbook`
  - `/admin/videos`

