# AgroOrder Backend

Backend untuk aplikasi mobile **AgroOrder: Sistem Pemesanan Hasil Tani Client–Admin**. API ini dibangun dengan **Node.js**, **Express.js**, dan **PostgreSQL**.

## Deskripsi
Backend ini menyediakan API untuk:
- Registrasi dan login user (Admin & Client) dengan JWT authentication.
- Approval akun client oleh admin.
- Manajemen produk (CRUD – admin only).
- Manajemen order (submit oleh client, approve/update status oleh admin).
- Integrasi API publik (OpenWeatherMap untuk prakiraan cuaca, RajaOngkir untuk perhitungan ongkos kirim).

API ini digunakan oleh dua aplikasi mobile Android terpisah:
- [**Admin App**](https://github.com/nothappenhere/uts2-mobile-admin) (untuk Admin/Petani)
- [**Client App**](https://github.com/nothappenhere/uts2-mobile-client) (untuk Restoran/Rumah Makan)

## Fitur Utama
- **Authentication**: JWT + bcrypt hashing password
- **Role-based Access**: Admin & Client
- **Approval Workflow**: Registrasi client harus di-approve admin
- **Perhitungan Order**: Subtotal, pajak 10%, shipping cost, total price
- **Validasi Input**: Zod
- **Error Handling**: Global error handler
- **API Publik**: OpenWeatherMap & RajaOngkir

## Teknologi yang Digunakan
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM/Query**: pg (*node-postgres*)
- **Authentication**: jsonwebtoken + bcrypt
- **Validasi**: Zod
- **HTTP Client**: axios (untuk API publik)
- **Environment**: dotenv

## Cara Menjalankan
1. Clone repository ini.
2. Install dependencies: `npm install`.
3. Buat database PostgreSQL bernama: `agroorder`.
4. Copy `.env.example` menjadi `.env` dan isi:
```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=agroorder
DB_PASSWORD=your_password
DB_PORT=5432

JWT_SECRET=your_strong_secret
OPENWEATHER_API_KEY=your_api_key
PORT=3000
```
6. Jalankan server: `npm run dev`.
7. Server berjalan di `http://localhost:3000/api`

## Pengembang
- 152022166 - Muhammad Rizky Akbar
- 152022142 - Gumiwang Maysa Nusi
- 152022137 - Baraja Barsya P.
- 152022169 - Erick Erlangga Putra W.
- 152022144 - Luthfiansyah Putra Dean F.
