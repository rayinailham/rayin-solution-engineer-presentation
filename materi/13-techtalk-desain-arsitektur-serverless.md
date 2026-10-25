# Tech Talk — Mendesain Sample Serverless Architecture

## Tujuan / Inti

Tech Talk ini adalah diskusi dua narasumber (Russell dan Raf) yang membangun sebuah **sample serverless architecture** tanpa menyalakan satu server pun. Tujuannya: menunjukkan bagaimana aplikasi yang perlu **scale cepat** bisa dirancang end-to-end hanya dengan managed/serverless services AWS.

Studi kasus: sebuah **web application untuk mengumpulkan alamat email** menjelang peluncuran produk — pengguna membuka halaman, mengetik email, lalu email disimpan. Semua komponen dipilih serverless agar tidak perlu mengelola server.

---

## Studi Kasus

- Aplikasi akan **go live dalam beberapa minggu** ke depan.
- Kebutuhan: mengumpulkan alamat email calon pengguna dan menyimpannya.
- Dibangun sebagai web application yang mengumpulkan email dan menyimpannya di suatu tempat.
- Pertimbangan utama: aplikasi harus bisa **scale cepat**.

---

## Arsitektur: Alur Langkah demi Langkah

### Langkah 1 — Menyajikan web page (frontend statis)

- **Static HTML** ditaruh di sebuah **Amazon S3 bucket**.
- User duduk di browser → membuat request ke S3 → mendapatkan kembali static HTML (index HTML aplikasi).
- Ini "step one": menyajikan halaman web. Pengguna akan mengetik email di halaman itu dan mengirimkannya untuk disimpan.

### Langkah 2 — REST API lewat API Gateway

- **Amazon API Gateway (API GW)** dipakai untuk meng-host REST API.
- Dari dalam browser, dibangun sebuah **POST** yang berisi alamat email pengguna, lalu dikirim ke API Gateway.
- API Gateway endpoint/API bisa memakai **custom domain names**. Contoh penamaan: `collectmyemail...application.com`, dan S3 bucket juga bisa memakai domain kustom.

### Langkah 3 — Validasi email dengan Lambda

- Pertanyaan: setelah email terkumpul dan di-POST ke API Gateway, perlukah divalidasi? → **Ya, validasi.**
- **Client-side validation** (mis. mengecek regular expression email di browser) bisa dilakukan, **tetapi kurang bisa dipercaya** — ada orang yang bisa mem-bypass atau mengutak-atiknya. Jadi validasi di sisi server tetap perlu.
- API Gateway meneruskan request ke **AWS Lambda**. Lambda menjadi **compute service** — tempat menjalankan potongan kode untuk memvalidasi alamat email.
- Ini menerapkan **microservices**: Lambda function tersebut melakukan **satu dan hanya satu tujuan**, yaitu email validation.

### Langkah 4 — Menyimpan email ke DynamoDB

- Untuk data storage pada serverless, dipilih **Amazon DynamoDB** (sebuah **DynamoDB Table**).
- Dari kode Lambda, integrasi AWS service API dipakai untuk menyuruh DynamoDB menyimpan email — contohnya memakai **Boto SDK** (Boto = Python SDK).
- Response lalu kembali sampai ke client dengan pesan ucapan terima kasih ("kami sudah terima email Anda, akan menghubungi saat aplikasi rilis").

### Sifat regional & failover

- Semua service yang dipakai bersifat **regional**: API Gateway, Lambda, DynamoDB, dan S3 semuanya regional.
- Karena itu Milord tidak perlu khawatir soal "semua di satu AZ, harus menaruh di AZ lain untuk failover" — **failover sudah built-in** dan dikelola oleh AWS.

### Langkah 5 — Mengamankan data (resource policy + least privilege)

- Begitu bicara alamat email, itu adalah **personal data** yang harus dilindungi.
- Pada DynamoDB, ditulis sebuah **resource policy** yang mengontrol apa yang boleh dilakukan aplikasi:
  - Aplikasi **boleh menyimpan (save)** alamat email.
  - Aplikasi **tidak boleh membaca (read)** tabel itu — karena memang tidak perlu.
- Mungkin **administrator** boleh membaca daftar email tersebut, tetapi aplikasi itu sendiri harus mengikuti prinsip **least privileged**.

---

## Deployment & Produktivitas

- Arsitektur ini **tidak sulit** dibuat menggunakan **AWS CDK**.
- Dengan CDK, arsitektur semacam ini bisa dibangun **dalam waktu satu sore (an afternoon)**.
- Perbandingan dengan masa lalu: dulu membangun hal serupa bisa memakan waktu **sekitar satu bulan**, karena harus membuat EC2 instances, konfigurasi web server, konfigurasi SQL database, bahkan membuka server dari kotak dan memasangnya ke rak (racks).
- Kesimpulan diskusi: contoh ini adalah arsitektur yang **simpel dan sepenuhnya serverless**.

---

## Ringkasan Komponen Arsitektur

| Komponen | Peran dalam arsitektur |
|----------|------------------------|
| **Amazon S3** | Meng-host static HTML (index halaman web); pengguna mengambil halaman dari sini. Mendukung custom domain. |
| **Amazon API Gateway** | Meng-host REST API; menerima POST berisi email dari browser. Mendukung custom domain names. |
| **AWS Lambda** | Compute service; menjalankan kode validasi email (satu microservice, satu tujuan). Memanggil DynamoDB via SDK (mis. Boto). |
| **Amazon DynamoDB** | Data storage serverless; menyimpan alamat email dalam sebuah DynamoDB Table. Diamankan dengan resource policy (boleh save, tidak boleh read oleh aplikasi). |
| **AWS CDK** | Alat untuk men-deploy seluruh arsitektur dengan cepat (bisa dalam satu sore). |

---

## Diagram (deskripsi)

Berdasarkan alt text ("Designing a sample serverless architecture") dan narasi, diagram menggambarkan alur dari kiri ke kanan:

1. **User di browser** ↔ **Amazon S3** — browser meminta dan menerima static HTML (index) dari S3 bucket.
2. **Browser → API Gateway** — browser mengirim HTTP **POST** berisi alamat email ke REST API yang di-host API Gateway (bisa custom domain).
3. **API Gateway → Lambda** — request diteruskan ke Lambda function yang memvalidasi email (microservice tunggal).
4. **Lambda → DynamoDB** — Lambda memanggil AWS service API (mis. Boto SDK) untuk menyimpan email ke DynamoDB Table; DynamoDB dibatasi resource policy (least privilege).
5. **Response** kembali ke client dengan pesan konfirmasi.

Seluruh komponen (S3, API Gateway, Lambda, DynamoDB) bersifat regional dengan failover built-in.

---

## Poin Kunci untuk Presentasi

- Arsitektur serverless end-to-end bisa dibangun **tanpa satu server pun** dan cocok untuk aplikasi yang harus **scale cepat**.
- Pola inti: **S3 (static HTML)** → **API Gateway (REST API + POST)** → **Lambda (validasi, satu microservice)** → **DynamoDB (penyimpanan)**.
- **Client-side validation tidak bisa dipercaya penuh** (bisa di-bypass) — validasi di sisi server via Lambda tetap wajib.
- Lambda menerapkan prinsip **microservices**: satu function, satu tujuan (di sini: email validation), memanggil AWS API lewat SDK (mis. Boto = Python SDK).
- Semua service **regional** dengan **failover built-in**, jadi tidak perlu repot mengelola AZ sendiri.
- Email = **personal data**; amankan DynamoDB dengan **resource policy** mengikuti **least privilege** (aplikasi boleh save, tidak boleh read; admin yang membaca).
- Dengan **AWS CDK**, arsitektur semacam ini bisa di-deploy dalam **satu sore**, dibanding ~**satu bulan** di era EC2/web server/SQL/rack server.

---

## Kemungkinan Pertanyaan Audiens

**Q: Kalau sudah ada validasi di browser (client-side), kenapa masih perlu Lambda untuk validasi?**
A: Karena client-side validation kurang bisa dipercaya — pengguna bisa mem-bypass atau mengutak-atiknya. Validasi server-side lewat Lambda memastikan data yang masuk ke DynamoDB benar-benar tervalidasi.

**Q: Kenapa pilih DynamoDB, bukan database SQL?**
A: Dalam konteks serverless, DynamoDB adalah pilihan data storage yang managed dan regional dengan failover built-in, sehingga mendukung skala cepat tanpa mengelola server database sendiri.

**Q: Apakah aplikasi ini boleh membaca seluruh daftar email yang tersimpan?**
A: Tidak. Resource policy di DynamoDB mengikuti least privilege: aplikasi hanya boleh menyimpan email, tidak boleh membaca tabel. Pembacaan diserahkan ke pihak lain seperti administrator.

**Q: Bagaimana cara cepat men-deploy seluruh arsitektur ini?**
A: Dengan AWS CDK. Narasumber menyebut arsitektur selengkap ini bisa dibangun dalam satu sore, jauh lebih cepat dibanding era lama yang butuh sekitar sebulan untuk menyiapkan EC2, web server, dan SQL database.
