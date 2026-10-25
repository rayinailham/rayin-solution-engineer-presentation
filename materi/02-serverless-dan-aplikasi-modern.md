# Serverless & Aplikasi Modern

## Tujuan / Inti

Bagian ini mendefinisikan apa itu **serverless computing**, mengenalkan layanan serverless AWS, dan menjelaskan bagaimana aplikasi modern bergerak dari **monolith** ke **microservices** berbasis serverless. Dibahas juga best practices membangun aplikasi serverless modern serta trade-off antara monolith dan serverless.

> Modul ini (Designing) fokus pada use case serverless yang tepat. Peserta belajar: mendefinisikan serverless computing, mengidentifikasi komponen desain serverless modern yang event-driven, mendesain serverless workflows dengan **AWS Lambda** untuk compute, dan mem-publish API dengan **API Gateway**.

---

## 1. Apa Itu Serverless Computing?

Dengan serverless computing, Anda bisa membangun dan menjalankan aplikasi serta layanan **tanpa memikirkan server**. Aplikasi serverless tidak mengharuskan Anda melakukan *provision*, *scale*, dan *manage* server apa pun. Semua yang dibutuhkan untuk menjalankan dan menskalakan aplikasi dengan high availability sudah **ditangani untuk Anda**.

Serverless adalah cara mendeskripsikan *services, practices, dan strategies* untuk membangun aplikasi yang lebih *agile*. AWS menangani tugas-tugas *infrastructure management* (seperti *capacity provisioning* dan *patching*), sehingga Anda bisa fokus menulis kode yang melayani customer.

### Karakteristik Serverless (dari narasi)
- **No infrastructure to provision or manage** — tidak ada infrastruktur untuk disediakan/dikelola; ditangani AWS.
- **Scale by unit of consumption** — menskalakan berdasarkan unit konsumsi, bukan per server.
- **Consumption-based pricing** — jika layanan tidak dipakai atau utilisasinya rendah, itu tercermin pada biaya.
- **Built-in security & highly available compute** — sifat bawaan dari fully managed service.

### Keuntungan Serverless (Advantages)
- **No infrastructure to provision or manage.**
- **No servers to provision, operate, or patch.**
- **Scales automatically by unit of consumption**, bukan per server unit.
- **Pay-for-value billing model.**
- **Built-in availability and fault tolerance.**

AWS menyediakan sekumpulan fully managed services untuk membangun dan menjalankan aplikasi serverless — mencakup *compute, databases, storage, stream processing, messaging, dan queues* — tanpa perlu provision/maintain/administer server untuk komponen backend.

---

## 2. Daftar Layanan Serverless

Dari narasi, beberapa layanan serverless sudah pernah dibahas dan sifatnya memang serverless secara alami:
- **Amazon Simple Storage Service (Amazon S3)** — storage object.
- **Amazon DynamoDB** — database.

Layanan yang akan dibahas lebih detail dalam course:
- **AWS Lambda**
- **Amazon Simple Notification Service (Amazon SNS)**
- **Amazon Simple Queue Service (Amazon SQS)**
- **Amazon API Gateway**
- **AWS Step Functions**
- **Amazon Kinesis**

Layanan serverless lain yang disinggung di slide:
- **Amazon Cognito** — membantu *authentication workflows*.
- **Amazon Athena** — layanan analytics; memakai bahasa **SQL** untuk query berbagai dataset.

---

## 3. Contoh Arsitektur Serverless (Alur Langkah demi Langkah)

Narator menjelaskan contoh arsitektur serverless end-to-end. Alurnya:

1. **Position 1 — Amazon API Gateway** meng-host sebuah **REST API**. Sebuah **POST request** dikirim (misalnya dari browser customer yang mengklik tombol) dan masuk ke API Gateway.
2. API Gateway terintegrasi dengan banyak layanan Amazon. Di sini dikonfigurasi untuk mengambil POST tersebut dan **mengirim pesan ke SQS** (Amazon Simple Queue Service).
3. **Position 3 — worker containers** berjalan di **AWS Fargate**, meng-*consume* pesan dari queue. Saat pesan di-consume, pesan hilang dari queue. Proses di sini adalah **menulis ke DynamoDB table**.
4. **Step 4** — setelah pemrosesan selesai, kode di dalam container Fargate berbicara ke **Amazon SNS** dan meminta mengirim **SMS notice** ke user yang sudah subscribe, memberi tahu bahwa pemrosesan selesai.

> Kutipan kunci:
> *"The interesting thing about this architecture is that I have not turned on a single server — this is a serverless architecture where I'm relying on a lot of fully managed services provided by AWS."*

### Peran tiap komponen (penanda numerik 1–4)
| Marker | Komponen | Peran |
|--------|----------|-------|
| 1 | **Amazon API Gateway** | Menerima semua request dan API calls; menangani penerimaan dan pemrosesan API calls |
| 2 | **Amazon SQS** | Queue yang di-*feed* oleh API Gateway; menjadi **buffer** bagi worker service saat terjadi traffic spike. Fully managed message queuing untuk men-*decouple* dan men-*scale* microservices |
| 3 | **AWS Fargate + Amazon DynamoDB** | Worker service (container di Fargate, auto-scale per container baru) menulis pesan hasil olahan ke DynamoDB (NoSQL serverless fully managed) dan menerima response saat request selesai |
| 4 | **Amazon SNS** | Saat worker menerima success response, SNS meng-*push* SMS notification ke semua subscriber. Messaging serverless untuk application-to-application dan application-to-person |

---

## 4. Aplikasi Serverless Modern: dari Monolith ke Microservices

Abstraksi infrastruktur di cloud bergerak dari **virtual servers → containers → serverless**. Pergerakan ini sejalan dengan bergesernya aplikasi dari **monolithic** menuju **service-oriented architectures** dan **microservices**.

Ide distributed applications dan microservices bukan hal baru, tetapi evolusi layanan cloud membuatnya lebih mudah dibangun.

### Analogi: Food Truck vs Sit-Down Diner
- **Food truck (monolith):** Anda melakukan semuanya sendiri — berdiri di balik konter, menagih kartu kredit, membuat pai dan burger. Satu "aplikasi" mengerjakan segalanya.
- **Sit-down diner (serverless/microservices):** pekerjaan di-*decompose*. Ada orang yang spesialis membuat donat, spesialis membuat pai, dan ada yang berdiri di kasir menerima pesanan. Banyak komponen kecil yang berkomunikasi, dengan integrasi antar komponen.

Ini paralel dengan arsitektur **monolithic** (satu aplikasi mengerjakan semua) vs **serverless terdekomposisi** (banyak komponen kecil + integrasi).

### Best Practices Aplikasi Serverless Modern (penanda 1–8)
| # | Best Practice | Isi |
|---|---------------|-----|
| 1 | **Small pieces, loosely joined** | Pakai potongan kecil yang terikat longgar agar fleksibel mengubah tanpa berdampak ke bagian lain, scale & deploy independen, serta keputusan yang reversible |
| 2 | **Serverless compute & event-driven patterns** | Pakai serverless compute agar fokus pada business logic; pakai event-driven patterns (koneksi asinkron) untuk decoupling dan fleksibilitas |
| 3 | **Purpose-built data stores** | Pilih data store sesuai kebutuhan layanan, bukan satu database "do-it-all"; cocokkan ke access/query pattern; scale pilihan database secara independen |
| 4 | **Purpose-built serverless databases** | Pilih fitur dan kapasitas yang pas dengan tipe dan volume data tiap layanan |
| 5 | **Specialized services for integration** | Pakai layanan integrasi khusus untuk mempercepat delivery dan menurunkan effort integrasi antar layanan |
| 6 | **Managed services for integration** | Managed services menyediakan API proxy, messaging, dan orchestration, plus prebuilt integration dengan Lambda dan AWS lain; sambungkan layanan dengan pola event-driven asinkron |
| 7 | **Automation using code** | Tulis Infrastructure as Code (IaC) untuk otomasi deployment; mudah mereplikasi environment dan deploy lebih sering dengan overhead minimal |
| 8 | **Serverless deployment frameworks** | Framework deployment serverless memudahkan pakai IaC dan otomasi deployment pipeline |

---

## 5. Perbandingan Monolith vs Serverless

### "Monolith is easier before it's harder"
- Di aplikasi monolithic, awalnya lebih mudah: lebih sederhana dibangun, lebih sederhana dites, hanya satu artifact untuk di-deploy.
- Untuk aplikasi kurang kompleks, monolith bisa jadi pilihan terbaik untuk waktu yang sangat lama.
- Untuk aplikasi kompleks yang tumbuh, *interdependencies* antar komponen dan koordinasi tim untuk test/deploy jadi makin sulit dan dapat **menurunkan produktivitas developer**.

### "Modern serverless application is harder before it's easier"
- Effort awal lebih tinggi; pindah ke karakteristik aplikasi modern butuh lonjakan effort karena semua orang di organisasi harus belajar.
- Setelah kurva belajar awal terlewati, *agility* mulai mempercepat kecepatan merilis fitur baru dan menurunkan effort menjaganya tetap berjalan.

| Aspek | Monolith | Serverless Modern |
|-------|----------|-------------------|
| Awal | Lebih mudah (1 artifact, mudah dites) | Lebih sulit (butuh belajar, surge effort) |
| Seiring tumbuh/kompleks | Makin sulit, produktivitas turun | Makin mudah, agility naik |
| Cocok untuk | Aplikasi kurang kompleks | Aplikasi kompleks yang tumbuh |

---

## 6. Distributed Data: Benefit & Challenge

Narator menjelaskan trade-off memindahkan aplikasi ke layanan terdistribusi dan lokasi data terdistribusi.

### Benefit (Use purpose-built data stores vs "do-it-all database")
- Punya pilihan **NoSQL databases**, **in-memory caches**, **time series data** — manfaatkan berbagai tempat penyimpanan.
- **Optimize for access and query patterns**: kadang butuh relational untuk *join* dan *aggregate*; kadang butuh in-memory cache. Access pattern dan requirement latency berbeda.
- **Scale databases independently**: jika satu database kena beban berat, cukup scale database itu saja.

### Challenge
- **Eventual consistency** — properti sistem terdistribusi. Merujuk **CAP theorem** (consistency, availability, partition tolerance), banyak layanan ini condong ke eventual consistency karena data tersimpan di banyak node; butuh waktu agar konsisten.
- **Distributed transactions & partial completions** — contoh: menagih kartu kredit yang melewati banyak layanan. Bagaimana jika gagal di langkah 8 dari 10? Harus dipertimbangkan dalam aplikasi.
- **ETL (Extract, Transform, Load)** — karena data terdistribusi, mungkin masuk akal menyimpan data **secara redundan**. Contoh: daftar customer di relational database untuk join, sekaligus di cache untuk query tercepat, atau di NoSQL. Data ada di beberapa lokasi; tool ETL menangani penyimpanan redundan agar tersedia di banyak lokasi sesuai kebutuhan.

---

## 7. Diagram (deskripsi)

- **Navigasi "Serverless computing"** — halaman definisi serverless dengan pesan: *"Reduce operational overhead and optimize resource costs with serverless architecture."*
- **"Serverless messaging service as described in the notes"** — diagram contoh arsitektur serverless (API Gateway → SQS → Fargate workers → DynamoDB → SNS → SMS ke subscriber), sesuai alur langkah 1–4 di atas.
- **Navigasi "Modern serverless applications"** — halaman aplikasi serverless modern yang membahas best practices (penanda 1–8) dan analogi food truck vs diner.

---

## Poin Kunci untuk Presentasi

- **Serverless = tanpa mengurus server**: AWS menangani provision, scale, patch, availability; developer fokus pada kode bisnis.
- Lima keuntungan serverless: no infra to manage, no servers to patch, auto-scale per konsumsi, **pay-for-value**, built-in availability & fault tolerance.
- S3 dan DynamoDB sudah serverless secara alami; course menambah Lambda, SNS, SQS, API Gateway, Step Functions, Kinesis.
- Contoh arsitektur serverless: **API Gateway → SQS → Fargate → DynamoDB → SNS (SMS)** tanpa menyalakan satu server pun.
- Analogi **food truck (monolith) vs diner (microservices)** menjelaskan dekomposisi aplikasi.
- Best practice utama: **small pieces loosely joined**, **purpose-built data stores**, **managed services for integration**, **IaC/automation**.
- Trade-off waktu: monolith mudah di awal lalu sulit; serverless sulit di awal lalu mempercepat agility.
- Data terdistribusi membawa benefit (purpose-built, independent scaling) dan challenge (**eventual consistency**, **distributed transactions**, **ETL/redundant store**).

## Kemungkinan Pertanyaan Audiens

**Q: Kalau tidak mengelola server, siapa yang men-scale aplikasi saya?**
A: Layanan serverless menskalakan sendiri per *unit of consumption*. Scaling, availability, dan patching ditangani AWS sebagai bagian dari fully managed service.

**Q: Apakah serverless selalu lebih baik daripada monolith?**
A: Tidak. Monolith lebih mudah di awal dan bisa jadi pilihan terbaik untuk aplikasi yang kurang kompleks dalam waktu lama. Serverless unggul untuk aplikasi kompleks yang tumbuh, meski butuh effort belajar di awal.

**Q: Apa itu "purpose-built data store"?**
A: Memilih jenis database sesuai kebutuhan tiap layanan (relational, NoSQL, in-memory cache, time series) alih-alih memaksakan satu database untuk semua, lalu menskalakannya secara independen.

**Q: Kenapa data kadang disimpan redundan di beberapa tempat?**
A: Untuk mencocokkan access pattern berbeda — misalnya relational untuk join, cache untuk latency tercepat. Tool ETL menjaga sinkronisasi penyimpanan redundan tersebut.

**Q: Apa konsekuensi eventual consistency?**
A: Karena data tersebar di banyak node (mengikuti CAP theorem), perubahan butuh waktu untuk konsisten di semua node, jadi aplikasi harus dirancang menoleransi kondisi belum-konsisten.
