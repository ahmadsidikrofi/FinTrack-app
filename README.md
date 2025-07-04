# FinTrack - Personal Budget Tracker

*A full-stack web application designed to help users manage their personal finances with insightful AI-powered analysis.*

---

## 📖 Tentang Proyek

FinTrack adalah aplikasi web modern yang memungkinkan pengguna untuk mencatat pemasukan dan pengeluaran, mengkategorikan transaksi, dan memvisualisasikan kondisi keuangan mereka melalui dashboard interaktif. Proyek ini dibangun sebagai *Capstone Project* untuk kursus IBM, dengan fokus pada pengembangan aplikasi web fungsional penuh dan pemanfaatan AI untuk memberikan analisis data yang personal.

> **Repositori Frontend (Next.js):** Repositori ini berisi kode untuk sisi **Frontend** aplikasi. Dibangun dengan Next.js (React), tugas utamanya adalah menyediakan User Interface (UI) yang modern, interaktif, dan responsif. Aplikasi ini mengonsumsi data dari Backend API untuk menampilkan informasi, chart, dan laporan kepada pengguna.

---

* **Framework:** Next.js 15, React 19
* **Styling:** Tailwind CSS v4, shadcn/ui
* **State Management:** React Hooks (useState, useEffect, useContext)
* **Data Fetching:** Axios
* **Charts & Visuals:** Recharts, `react-markdown`
* **Deployment:** Vercel

---

## ✨ Fitur Utama

- **📊 Dashboard Interaktif:** Visualisasi data keuangan secara real-time dengan kartu summary, pie chart pengeluaran, dan bar chart tren pemasukan vs. pengeluaran.

- **💸 Manajemen Transaksi:** Fungsionalitas CRUD (Create, Read, Update, Delete) penuh untuk semua catatan pemasukan dan pengeluaran dengan antarmuka yang intuitif.

- **🏷️ Kategori Personal:** Pengguna dapat membuat, mengubah, dan menghapus kategori pemasukan/pengeluaran mereka sendiri untuk pencatatan yang lebih personal.

- **🤖 Laporan Analisis AI:** Fitur unggulan di mana pengguna bisa mendapatkan ringkasan dan saran keuangan yang di-generate oleh AI (IBM Granite) berdasarkan data riil mereka.

- **🔐 Autentikasi Aman:** Sistem registrasi, login, dan logout yang aman menggunakan token-based authentication untuk melindungi data pengguna.

- **📱 Desain Responsif:** Tampilan yang optimal dan nyaman digunakan di berbagai ukuran layar, dari desktop hingga mobile.

## ⚙️ Getting Started

Berikut adalah langkah-langkah untuk menjalankan proyek ini di lingkungan lokal.

### Pre-requisite

Pastikan kamu sudah menginstal perangkat lunak berikut:
- Node.js v20 atau lebih baru
- npm / yarn / pnpm / bun

### Langkah Instalasi

1. Clone repository ini:
   ```sh
   git clone https://github.com/ahmadsidikrofi/be-budget-tracker.git
   
2. Masuk ke direktori proyek:
   ```sh
   cd fintrack-app
   
3. Install dependensi npm:
   ```sh
   npm install
   
4. Salin file .env.local.example menjadi .env.local:
   ```sh
   cp .env.local.example .env.local
   
5. Buka file .env.local dan atur NEXT_PUBLIC_API_BASE_URL agar menunjuk ke server backend (misal: http://127.0.0.1:8000/api):
   ```sh
   git clone https://github.com/ahmadsidikrofi/be-budget-tracker.git
   
6. Jalankan server development:
   ```sh
   npm run dev
   
7. Aplikasi akan berjalan di http://localhost:3000.



### AI sebagai Fitur Inti Aplikasi

Kekuatan sesungguhnya dari FinTrack berada pada fitur analisis personalnya. Ini bukan sekadar laporan statis, melainkan sebuah proses dinamis:

- **Pengumpulan Data Real-time:** Saat pengguna meminta analisis, aplikasi akan memanggil beberapa endpoint API (`/dashboard/summary`, `/reports/spending-by-category`, dll.) untuk mengumpulkan data keuangan terbaru milik pengguna tersebut.
- **Pembuatan Prompt Cerdas:** Data yang terkumpul kemudian dirangkum dan disusun secara dinamis menjadi sebuah *prompt* komprehensif yang dikirim ke API internal Next.js.
- **Analisis & Penyajian Wawasan:** API internal ini secara aman memanggil model IBM Granite. AI menganalisis data dalam prompt dan mengembalikan ringkasan naratif beserta saran praktis dalam format JSON yang terstruktur. Hasilnya kemudian di-render di frontend sebagai laporan Markdown yang mudah dibaca, memberikan wawasan yang dipersonalisasi dan dapat ditindaklanjuti oleh pengguna.

### Beberapa Screenshot Fin-Track

![image](https://github.com/user-attachments/assets/ba07e534-af0b-486f-baa8-6b8836d34a75)
![image](https://github.com/user-attachments/assets/ef3a1c7f-8e17-4103-9932-24801588346e)
![image](https://github.com/user-attachments/assets/0e8965d1-1a97-477f-a8bd-5e29102c4993)

