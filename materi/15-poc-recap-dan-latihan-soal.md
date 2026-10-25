# POC Recap & Latihan Soal — Designing a Serverless Architecture

## Tujuan / Inti

File ini merangkum dua hal penutup kursus:

1. **Delivering the Proof of Concept (POC)** — review arsitektur serverless event-driven final untuk sebuah **electric automotive startup**, menjelaskan bagaimana tiap service menjawab kebutuhan unik mereka.
2. **Activity: Designing a Serverless Architecture** — latihan membangun diagram arsitektur untuk skenario baru (**global digital news organization**) lewat 8 soal knowledge check, plus recap arsitektur dan informasi **Contact Us**.

Inti: kedua bagian memperkuat pola arsitektur serverless event-driven yang konsisten — **API Gateway → Lambda → DynamoDB**, di-decouple dengan **SQS/SNS**, di-orkestrasi dengan **Step Functions**, diamankan dengan **IAM least privilege**, dan diamati dengan **CloudWatch**.

---

## Bagian 1 — Delivering the POC (Electric Automotive Startup)

### Skenario

Sebuah startup otomotif listrik **"born-in-the-cloud"** membangun backend yang sepenuhnya serverless untuk mendukung:

- Penjualan **direct-to-consumer**.
- **Vehicle configuration** (konfigurasi kendaraan).
- Pipeline **order fulfillment**.

Dengan tim yang ramping (lean) dan timeline go-to-market yang agresif, perusahaan memanfaatkan AWS serverless services untuk mengurangi pengelolaan infrastruktur dan scale cepat seiring permintaan tumbuh.

### Desain arsitektur (dari narasi)

- **API Gateway** sebagai **unified entry point** (pintu depan aman): menangani semua request vehicle configuration, order submission, dan status check dari aplikasi web dan mobile. Juga mengelola integrasi **third-party financing partner** lewat interface aman yang sama, sambil otomatis scale menghadapi **traffic spike** saat product launch.
- **Lambda functions** untuk business logic, diorganisasi di sekitar core workflow:
  - Saat customer mengonfigurasi kendaraan → Lambda memvalidasi konfigurasi dan mengecek **real-time inventory**.
  - Saat order processing → function terpisah menangani **payment processing** dan berkoordinasi dengan delivery partners.
  - Pemisahan ini memberi fleksibilitas meng-update dan scale tiap komponen secara independen.
- **DynamoDB** sebagai primary database: memberi **sub-second response time** yang dibutuhkan untuk configuration tool, sambil otomatis scale untuk pertumbuhan terproyeksi. Data model dirancang mendukung query kompleks, seperti menemukan semua order dalam status tertentu atau melacak konfigurasi kendaraan populer per region.
- **Event-driven pattern dengan SQS dan SNS**: saat status order berubah atau delivery milestone tercapai, pesan mengalir lewat **SNS** untuk menotifikasi customer di channel pilihan mereka. **SQS** memastikan pemrosesan yang reliable bahkan saat volume tinggi.
- **Step Functions**: mengoordinasi workflow kompleks seperti proses persetujuan **financing approval**.
- **Security** di seluruh desain: tiap Lambda function beroperasi dengan **minimum required permissions**; semua data dienkripsi **in transit dan at rest**; audit log detail dijaga lewat **CloudWatch**. API Gateway menangani authentication dan authorization sehingga hanya user dan partner valid yang bisa mengakses resource yang sesuai.
- **Monitoring & automated responses**: **CloudWatch dashboards** melacak key business metrics; ada automated alerts dan responses untuk skenario umum. Tim bisa fokus membangun fitur baru sementara AWS menangani infrastructure scaling dan maintenance.
- **Skalabilitas pertumbuhan**: arsitektur bisa tumbuh dari **tiga state awal** menjadi cakupan **nationwide**; serverless otomatis scale menghadapi beban meningkat. Menambah fitur atau integrasi partner baru = men-deploy Lambda function baru dan meng-update API routes.
- **Rencana POC**: mendemokan complete customer journey dari vehicle configuration → order placement → status tracking; menunjukkan sistem menjaga performa saat simulated traffic spike dan menangani fulfillment workflow kompleks.

### Architecture recap (ringkas komponen)

| Service | Peran dalam arsitektur final |
|---------|------------------------------|
| **Amazon API Gateway** | Unified entry point untuk semua frontend app, mobile client, dan third-party partner (mis. financing provider atau dealership); mengekspos secure RESTful APIs. |
| **AWS Lambda** | Dipicu oleh incoming API request; mengimplementasikan business logic (mis. menempatkan order, memvalidasi payment). |
| **Amazon DynamoDB** | Menyimpan vehicle order, configuration, dan customer profile; dipilih karena millisecond latency, high availability, dan kemampuan scale. **Global Secondary Indexes (GSIs)** memungkinkan query fleksibel order berdasarkan status, VIN, region, atau customer ID. |
| **Amazon SQS** | Decoupling antar service; contoh: Lambda order creation mengirim message ke queue, Lambda lain mengambilnya untuk memproses fulfillment. |
| **Amazon SNS** | Broadcast event seperti "order shipped" ke banyak subscriber (mis. email, SMS, downstream services). |
| **AWS Step Functions** | Mengoordinasi operasi multi-langkah seperti inventory check, billing, dan notification workflow dengan built-in retries dan state tracking. |
| **Amazon CloudWatch** | Mengumpulkan Lambda logs, metrics, dan custom business KPIs. |
| **IAM roles** | Mengelola akses function-specific ke service seperti DynamoDB, SNS, dan S3. |

### Diagram (deskripsi) — POC final

Berdasarkan alt text ("Automotive Scenario Final Architecture Diagram for POC"): diagram final menggambarkan alur event-driven — client web/mobile dan third-party partner masuk lewat **API Gateway** → memicu **Lambda** (business logic) → menyimpan/membaca **DynamoDB** (dengan GSI) → **SQS** men-decouple langkah fulfillment → **SNS** mem-broadcast notifikasi (email/SMS/downstream) → **Step Functions** mengoordinasi workflow multi-langkah (inventory, billing, notifikasi) → **CloudWatch** mengumpulkan log/metrics/KPI → **IAM roles** menegakkan akses least privilege per function.

---

## Bagian 2 — Activity: Designing a Serverless Architecture (Global Digital News)

### Skenario latihan

Sebuah **global digital news organization** butuh backend yang scalable dan cost-optimized untuk memproses dan mendistribusikan **large volumes of incoming multimedia content** (video, gambar, audio). Editorial workflow mereka mencakup:

- Meng-**ingest** raw media dari jurnalis dan kontributor.
- Men-**transcode** media ke berbagai format.
- Menyimpan media secara efisien.
- Menotifikasi downstream publishing systems.

Semuanya dengan **minimal operational overhead** dan **high responsiveness**.

Aktivitas ini terdiri dari **8 soal** untuk membangun diagram arsitektur. Soal bisa diulang sebanyak yang diperlukan, dan jawaban benar wajib untuk lanjut ke soal berikutnya.

### Soal Latihan (8 soal)

#### Soal 1
Organisasi berita perlu mengamankan endpoint bagi jurnalis dan editor untuk meng-upload media, submit metadata, dan memulai processing workflow dari aplikasi web atau mobile. Service mana yang memenuhi kebutuhan ini? (Pilih 1.)

- A. Amazon API Gateway
- B. Amazon SQS
- C. Amazon Transit Gateway
- D. AWS Lambda

**Jawaban benar: A. Amazon API Gateway**

**Rationale:** Benar! Amazon API Gateway adalah service yang memfasilitasi pembuatan, publishing, maintenance, monitoring, dan keamanan API Milord pada skala berapa pun.

---

#### Soal 2
Organisasi berita ingin menyederhanakan dan/atau mengotomasi task seperti memvalidasi file upload, mengekstrak metadata, menandai (tagging) konten, dan merutekan job ke processing components. Mereka membutuhkan opsi serverless compute. Service mana yang memenuhi kebutuhan ini? (Pilih 1.)

- A. Amazon SNS
- B. Amazon EC2
- C. AWS Step Functions
- D. AWS Lambda

**Jawaban benar: D. AWS Lambda**

**Rationale:** Benar! AWS Lambda adalah serverless, event-driven compute service yang memungkinkan Milord menjalankan kode untuk hampir semua jenis aplikasi atau backend service tanpa provisioning atau mengelola server.

---

#### Soal 3
Ada banyak processing step. Organisasi berita ingin men-decouple langkah-langkah itu. Misalnya, mengotomasi pengiriman message ke queue setelah upload divalidasi, lalu kemudian memicu media transcoding atau image resizing workflow. Service mana yang memenuhi kebutuhan ini? (Pilih 1.)

- A. CloudWatch Alarms
- B. Amazon SNS
- C. Amazon SQS
- D. Amazon Step Functions

**Jawaban benar: C. Amazon SQS**

**Rationale:** Benar! Amazon SQS adalah fully managed service yang tidak memerlukan administrative overhead dan sedikit konfigurasi. Service ini bekerja pada skala masif, memproses miliaran message per hari. Ia menyimpan semua message queue dan message dalam satu AWS Region yang highly available dengan beberapa redundant Availability Zones.

---

#### Soal 4
Customer ingin cara untuk meng-orkestrasi multi-step processing workflow seperti **ingest > transcode > compress > tag > notify**, memastikan resiliency, auditability, dan built-in retries untuk langkah yang gagal. Service mana yang memenuhi kebutuhan ini? (Pilih 1.)

- A. AWS Step Functions
- B. AWS Lambda
- C. Amazon SNS
- D. Amazon SQS

**Jawaban benar: A. AWS Step Functions**

**Rationale:** Benar! AWS Step Functions adalah visual workflow service yang membantu developer memakai AWS services untuk membangun distributed applications, mengotomasi proses, meng-orkestrasi microservices, dan membuat data serta machine learning (ML) pipeline.

---

#### Soal 5
Customer harus menyimpan media metadata (mis. title, tag, info kontributor, status), dan mendukung editorial query lintas region, category, atau publish status. Service mana yang memenuhi kebutuhan ini? (Pilih 1.)

- A. Amazon DynamoDB Accelerator
- B. Amazon DynamoDB with Global Secondary Indexes (GSI)
- C. Amazon S3
- D. AWS Lambda with Amazon DynamoDB

**Jawaban benar: B. Amazon DynamoDB with Global Secondary Indexes (GSI)**

**Rationale:** Benar! Menggunakan Amazon DynamoDB dengan GSI memungkinkan data di-query dengan cepat sekaligus mendukung banyak strategi querying yang berbeda.

---

#### Soal 6
Customer memakai Lambda functions dan workflow lainnya. Mereka butuh cara memonitor logs dan metrics dari semua Lambda functions dan workflow, agar tim teknis newsroom bisa memantau media processing throughput, success rate, dan performance bottleneck. Service mana yang memenuhi kebutuhan ini? (Pilih 1.)

- A. Amazon SNS
- B. CloudWatch Alarms
- C. Amazon DataSync
- D. Amazon CloudWatch

**Jawaban benar: D. Amazon CloudWatch**

**Rationale:** Benar! Amazon CloudWatch adalah AWS service yang menyediakan near-real-time stream of system events. Event tersebut mendeskripsikan perubahan pada AWS resource Milord. Dengan CloudWatch, Milord bisa merespons cepat perubahan operasional dan mengambil tindakan korektif. CloudWatch alarms mengirim notifikasi atau otomatis melakukan perubahan pada resource yang dimonitor berdasarkan rule yang Milord tentukan.

---

#### Soal 7
Terakhir, customer butuh cara menotifikasi stakeholder saat media asset siap untuk direview, dipublikasikan, atau didistribusikan ke partner platform (mis. mobile app, email channel, syndication service). Service mana yang memenuhi kebutuhan ini? (Pilih 1.)

- A. CloudWatch Alarms
- B. CloudWatch Logs
- C. Amazon SQS
- D. Amazon SNS

**Jawaban benar: D. Amazon SNS**

**Rationale:** Benar! Amazon SNS adalah web service yang bisa Milord pakai untuk set up, mengoperasikan, dan mengirim notifikasi dari cloud. Service ini mengikuti paradigma **publish-subscribe (pub-sub)**, dengan notifikasi dikirim ke client menggunakan mekanisme **push**.

---

#### Soal 8
Untuk memastikan akses yang tepat bagi tiap Lambda function, apa yang bisa customer pakai untuk memastikan **scoped permissions** hanya ke service yang dibutuhkan (mis. write ke DynamoDB, publish ke SNS, atau read dari S3)? (Pilih 1.)

- A. Amazon Inspector
- B. AWS CloudTrail
- C. Amazon Simple Notification Service
- D. IAM Roles

**Jawaban benar: D. IAM Roles**

**Rationale:** Benar! IAM Roles bisa dipakai untuk menerapkan prinsip **least privilege** kepada employee yang menjalankan task tertentu.

---

### Kunci Jawaban (ringkas)

| Soal | Jawaban | Service |
|------|---------|---------|
| 1 | A | Amazon API Gateway |
| 2 | D | AWS Lambda |
| 3 | C | Amazon SQS |
| 4 | A | AWS Step Functions |
| 5 | B | Amazon DynamoDB with GSI |
| 6 | D | Amazon CloudWatch |
| 7 | D | Amazon SNS |
| 8 | D | IAM Roles |

### Architecture recap (Global Digital News)

| Service | Peran dalam arsitektur final |
|---------|------------------------------|
| **Amazon API Gateway** | Mengekspos secure RESTful endpoints bagi jurnalis & editor untuk upload media, submit metadata, dan memulai processing workflow dari web/mobile. |
| **AWS Lambda** | Dipicu incoming API request; menangani task seperti memvalidasi file upload, mengekstrak metadata, tagging konten, dan merutekan job ke processing components. |
| **Amazon DynamoDB** | Menyimpan media metadata (title, tag, info kontributor, status) memakai **GSIs** untuk mendukung editorial query lintas region, category, atau publish status. |
| **Amazon SQS** | Men-decouple processing step — Lambda mengirim message ke queue setelah upload divalidasi, lalu Lambda lain mengambilnya untuk memicu transcoding atau image resizing. |
| **Amazon SNS** | Menotifikasi stakeholder saat media asset siap direview, dipublikasikan, atau didistribusikan ke partner platform (mobile app, email channel, syndication). |
| **AWS Step Functions** | Mengoordinasi multi-step processing workflow **ingest > transcode > compress > tag > notify**, dengan resiliency, auditability, dan built-in retries. |
| **Amazon CloudWatch** | Mengagregasi logs dan metrics dari semua Lambda function dan workflow; memantau throughput, success rate, dan performance bottleneck. |
| **IAM roles** | Menegakkan least-privilege access per Lambda function (scoped permissions: write DynamoDB, publish SNS, read S3). |

### Diagram (deskripsi) — Activity final

Berdasarkan alt text ("architecture diagram, described in the following question" dan "Final architecture, described in the following checkboxes"): tiap soal secara bertahap menambahkan satu komponen ke diagram. Arsitektur final menggambarkan alur media: jurnalis/editor masuk lewat **API Gateway** → **Lambda** memvalidasi/mengekstrak metadata/tagging/routing → metadata disimpan di **DynamoDB (GSI)** → **SQS** men-decouple langkah transcode/resize → **Step Functions** mengoordinasi pipeline `ingest > transcode > compress > tag > notify` → **SNS** menotifikasi stakeholder → **CloudWatch** memantau semua log/metrics → **IAM roles** mengamankan tiap function dengan least privilege.

---

## Bagian 3 — Contact Us (Feedback)

Jika menemukan masalah isi kursus (akurasi teknis, typo) atau mengalami masalah teknis saat mengambil kursus, pengguna diminta memberi tahu lewat **CONTACT US**. Informasi yang dikumpulkan membantu memperbaiki iterasi kursus berikutnya. Saat submit, isi informasi berikut untuk resolusi lebih cepat:

- Masukkan alamat email Anda.
- Untuk **Inquiry type**, pilih **AWS Training & Certification**.
- Untuk **Problem Type**, pilih **Training (Digital & Classroom)**.
- Untuk **Additional details**, pilih opsi yang paling sesuai dengan feedback Anda.
- Pada kotak **How can we assist you today?**, sertakan nama kursus, link ke kursus, dan deskripsi detail masalah Anda.

> Catatan tambahan: Hak cipta materi — © 2026, Amazon Web Services, Inc. atau afiliasinya. All rights reserved.

---

## Poin Kunci untuk Presentasi

- POC electric automotive startup dan Activity global digital news memakai **pola serverless event-driven yang sama**: API Gateway → Lambda → DynamoDB, di-decouple SQS/SNS, di-orkestrasi Step Functions, diamankan IAM, dipantau CloudWatch.
- **API Gateway** = unified/secure entry point untuk web, mobile, dan third-party partner; otomatis scale saat traffic spike.
- **Lambda** = business logic yang terpisah per workflow sehingga tiap komponen bisa di-update dan scale independen.
- **DynamoDB + GSI** = penyimpanan low/millisecond latency yang mendukung query fleksibel (status, VIN, region, category, publish status, customer ID).
- **SQS** men-decouple langkah pemrosesan (reliable walau volume tinggi); **SNS** mem-broadcast notifikasi pub-sub berbasis push ke banyak subscriber.
- **Step Functions** mengoordinasi workflow multi-langkah (mis. `ingest > transcode > compress > tag > notify`, atau inventory/billing/financing) dengan retries dan state tracking.
- **IAM roles** menegakkan least privilege per function; data dienkripsi in transit dan at rest.
- **CloudWatch** mengumpulkan log, metrics, dan business KPI, serta mendukung alert/automated response.
- Kunci jawaban latihan: **1-A, 2-D, 3-C, 4-A, 5-B, 6-D, 7-D, 8-D**.

---

## Kemungkinan Pertanyaan Audiens

**Q: Kenapa pada Soal 2 jawabannya Lambda, bukan Step Functions, padahal keduanya serverless?**
A: Soal 2 meminta **serverless compute** untuk mengeksekusi task individual (validasi upload, ekstraksi metadata, tagging, routing). Itu peran Lambda. Step Functions muncul di Soal 4, yang meminta **orkestrasi multi-step workflow** (`ingest > transcode > compress > tag > notify`) dengan retries dan auditability.

**Q: Kapan pakai SQS vs SNS?**
A: SQS (Soal 3) untuk **decoupling** langkah pemrosesan lewat queue yang reliable — satu Lambda kirim message, Lambda lain ambil. SNS (Soal 7) untuk **notifikasi pub-sub** berbasis push ke banyak subscriber (email, SMS, syndication) saat asset siap/dipublikasikan.

**Q: Kenapa DynamoDB dipilih dengan GSI, bukan DynamoDB biasa atau S3?**
A: Karena kebutuhan menyimpan metadata dan melakukan editorial query lintas region/category/publish status. GSI memungkinkan query cepat dengan banyak strategi querying berbeda, sesuatu yang tidak dicakup S3 (object storage) atau DynamoDB tanpa index tambahan.

**Q: Apa yang memastikan tiap Lambda hanya punya akses seperlunya?**
A: IAM Roles (Soal 8). Role memberi scoped permissions sesuai kebutuhan tiap function (mis. write DynamoDB, publish SNS, read S3) sehingga menegakkan prinsip least privilege.

**Q: Bagaimana cara melaporkan masalah pada kursus ini?**
A: Lewat tombol CONTACT US. Isi email, pilih Inquiry type "AWS Training & Certification", Problem Type "Training (Digital & Classroom)", pilih Additional details yang sesuai, lalu pada kotak "How can we assist you today?" sertakan nama kursus, link kursus, dan deskripsi detail masalah.
