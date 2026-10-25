# Studi Kasus & Requirements Gathering

## Tujuan / Inti

Bagian ini memperkenalkan course **"Designing a Serverless Architecture with Event-Driven Microservices"** dan studi kasus utama yang dipakai sepanjang pelatihan: sebuah **startup otomotif listrik** yang membangun platform penjualan langsung ke konsumen (direct-to-consumer) sepenuhnya di atas arsitektur serverless AWS. Inti bagian ini: memahami proses pengumpulan requirements dari customer, lalu memetakan kebutuhan tersebut ke layanan AWS awal (compute, storage, security).

---

## 1. Course Overview

### Deskripsi Course
Course ini membangun di atas prinsip-prinsip architecting untuk menyiapkan peserta mendesain arsitektur serverless di AWS. Peserta akan mempelajari **event-driven architectures** dan cara memakai *events* untuk men-*trigger* serta berkomunikasi antar *decoupled services*, guna membangun aplikasi modern berbasis microservices.

Format course mencakup instruksi terekam (recorded instruction), konten multimedia dan interaktif, serta **Knowledge Checks** untuk mengevaluasi dan memperkuat pemahaman sebelum dan sesudah pelatihan.

### Tujuan Course (Course Objectives)
Peserta akan belajar cara:
- Mendesain arsitektur untuk **serverless, event-driven microservices** yang *scalable, secure, dan observable*.
- Meng-*orchestrate* serverless workflows menggunakan **Step Functions state machines**.

### Target Audiens
- Technical professionals yang terlibat dalam architecting solusi AWS.

### Prasyarat (Prerequisites)
- Pengetahuan tentang AWS management interfaces (Course: **AWS Technical Essentials**).

---

## 2. Studi Kasus: Startup Otomotif Listrik

Solutions Architect (narator: **Melissa**) bertemu dengan sebuah startup otomotif listrik yang membangun platform penjualan direct-to-consumer. Bagian ini adalah proses *requirements gathering*-nya.

### Profil Perusahaan
- **Born in the cloud company** — perusahaan yang lahir di cloud, dengan tim kecil (*lean team*).
- **Timeline agresif**: harus *go live* dalam **enam bulan**.
- **Tanpa legacy systems** — memulai dari nol (fresh start), tidak perlu mengakomodasi sistem lama.
- **Tujuan utama**: memungkinkan customer melakukan *configure*, *order*, dan *track* pembelian kendaraan lewat pengalaman digital yang mulus (seamless digital experience).

### Business Objectives
- Fokus pada **customer experience**: pembeli harus bergerak mulus dari *vehicle configuration* → *financing* → *order placement* → *delivery tracking*.
- Platform harus menangani **ribuan concurrent users** saat peluncuran produk (product launches).
- Harus mempertahankan **real-time responsiveness** untuk konfigurasi kendaraan dan update inventory.

### Kebutuhan Teknis (Technical Requirements)
- **Sub-second response times** untuk configuration tool.
- **Real-time order processing**.
- **Immediate status updates** di seluruh delivery network.
- Integrasi dengan **financing partners** harus mulus; aplikasi kredit (credit applications) diproses dalam hitungan **detik, bukan menit**.

### Keamanan (Security)
Area fokus utama karena menangani data finansial sensitif:
- Perlindungan kuat (robust protection) untuk informasi customer.
- Secure payment processing.
- Kepatuhan (compliance) dengan regulasi industri otomotif.
- **Comprehensive audit trails**.
- **Role-based access control** untuk anggota tim.

### Kendala Operasional (Operations Constraints)
- Tim kecil → tidak bisa mengalokasikan sumber daya besar untuk *infrastructure management*.
- Butuh platform yang **largely runs itself** — berjalan sendiri dengan *automated scaling* dan *self-healing capabilities*.
- Monitoring berfokus pada **business metrics**, seperti *order completion rates* dan *configuration tool performance*.

### Data Management & Analytics
- Perlu akses konsisten ke *vehicle configurations*, *customer profiles*, dan *order histories*.
- Analytics: melacak opsi kendaraan populer (popular vehicle options), memantau pola penjualan regional (regional sales patterns), dan mengukur *conversion rates* di sepanjang sales funnel.

### Rencana Pertumbuhan (Growth Trajectory)
- **Phased rollout**: mulai di **tiga negara bagian** (states) lalu ekspansi ke seluruh AS (nationwide).
- Ekspektasi **traffic spikes** signifikan saat peluncuran model baru dan event promosi.
- Platform harus *scale automatically* sambil menjaga performa.

> Kutipan kunci narator:
> *"The platform needs to handle thousands of concurrent users during product launches while maintaining real-time responsiveness."*

---

## 3. Daftar Architecture Requirements

Ringkasan requirement arsitektur yang dikumpulkan dari customer:

| # | Requirement | Penjelasan singkat |
|---|-------------|--------------------|
| 1 | Unified entry point | Satu pintu masuk untuk semua frontend apps, mobile clients, dan third-party partners |
| 2 | Managed serverless infrastructure | Infrastruktur serverless yang dikelola AWS |
| 3 | Event-driven business processes | Proses bisnis berbasis event (placing an order, validating payments) |
| 4 | Millisecond latency, high availability, scale with demand | Latency rendah, ketersediaan tinggi, skala sesuai permintaan |
| 5 | Flexible querying | Query data yang fleksibel |
| 6 | Security for sensitive data | Keamanan untuk data sensitif |
| 7 | Decoupled architecture | Arsitektur yang terpisah (loose coupling) |
| 8 | Broadcast events to multiple subscribers | Siarkan event ke banyak subscriber |
| 9 | Multi-step operations | Operasi multi-langkah |
| 10 | Track log, metrics, and business KPIs | Pelacakan log, metrik, dan KPI bisnis |

---

## 4. Proposal Awal: Pemetaan Requirement ke Layanan AWS

Berdasarkan informasi dari customer, berikut usulan arsitektur untuk kebutuhan **compute, storage, dan security**. Disajikan dalam format *flipcards* (sisi depan = kebutuhan, sisi belakang = solusi).

### Compute
- **Kebutuhan (depan):** Butuh *event-driven responses* ke proses bisnis. Ingin AWS menangani sebagian besar kompleksitas operasional.
- **Solusi (belakang):** **AWS Lambda** memudahkan mengeksekusi kode sebagai respons terhadap event untuk *order processing* dan *payment validation*. Lambda bersifat **serverless dan fully managed**.

### Storage
- **Kebutuhan (depan):** Butuh menyimpan data bisnis secara aman dengan akses langsung (immediate access) dan skalabilitas mulus sesuai permintaan.
- **Solusi (belakang):** **Amazon DynamoDB** menawarkan *multi-layer security*, *millisecond latency*, *high availability*, dan kemampuan *scale on demand*. **Global secondary indexes** menyediakan *flexible querying* untuk orders mereka.

### Security
- **Kebutuhan (depan):** Butuh membatasi akses berdasarkan tugas spesifik per fungsi (function-specific tasks).
- **Solusi (belakang):** **AWS IAM** membantu mengelola *roles* yang memberikan akses function-specific ke layanan seperti **Amazon DynamoDB, Amazon SNS, dan Amazon S3**.

> Catatan: layanan yang akan dibahas lebih dalam sepanjang course ini akan menjadi "mesin" di balik solusi otomotif serverless dan event-driven tersebut.

---

## 5. Diagram (deskripsi)

Berdasarkan alt text dan narasi:

- **Navigasi "Architecture requirements"** — halaman daftar kebutuhan arsitektur yang dikumpulkan dari customer (lihat tabel di Bagian 3).
- **"Melissa speaking"** — adegan narator (Melissa, Solutions Architect) menjelaskan proses requirements gathering lewat video: menceritakan pertemuan awal dengan CTO startup, tujuan bisnis, kebutuhan teknis, keamanan, kendala operasional, dan rencana ekspansi.
- **Flipcards Compute / Storage / Security** — tiga kartu interaktif. Sisi depan menampilkan kebutuhan customer; setelah dibalik (flip) menampilkan proposal layanan AWS yang sesuai (Lambda, DynamoDB, IAM).

---

## Poin Kunci untuk Presentasi

- Course ini mengajarkan desain **serverless, event-driven microservices** di AWS yang scalable, secure, dan observable, plus orkestrasi dengan **Step Functions**.
- Studi kasus utama: **startup mobil listrik** *born in the cloud*, tim kecil, target go-live **6 bulan**, tanpa legacy system.
- Kebutuhan bisnis berpusat pada **customer experience** end-to-end: configure → financing → order → delivery tracking.
- Kebutuhan teknis utama: **sub-second response**, **real-time order processing**, integrasi financing partner dalam hitungan **detik**.
- Keamanan sangat penting: data finansial, **audit trails**, dan **role-based access control**.
- Kendala tim kecil → butuh platform **self-managing** (automated scaling + self-healing) → pendorong utama pilihan **serverless**.
- Rencana pertumbuhan **phased rollout** (3 states → nationwide) dengan traffic spikes → butuh **auto-scaling**.
- Pemetaan awal: **Lambda** (compute), **DynamoDB** (storage, dengan Global Secondary Indexes), **IAM** (security).

## Kemungkinan Pertanyaan Audiens

**Q: Kenapa startup ini cocok dengan serverless, bukan server tradisional?**
A: Karena tim kecil dan tidak ingin repot mengelola infrastruktur; mereka butuh platform yang berjalan sendiri dengan automated scaling dan self-healing. Serverless memindahkan beban operasional ke AWS.

**Q: Kenapa DynamoDB dipilih untuk storage, bukan database relasional?**
A: Mereka butuh millisecond latency, high availability, skala on-demand, dan keamanan multi-layer. DynamoDB memenuhi itu, dan Global Secondary Indexes memberi flexible querying untuk data orders.

**Q: Bagaimana kebutuhan keamanan "role-based access control" dipenuhi di proposal awal?**
A: Lewat AWS IAM, yang mengelola roles untuk memberikan akses function-specific ke layanan seperti DynamoDB, SNS, dan S3.

**Q: Apa yang dimaksud "unified entry point for all frontend apps"?**
A: Satu pintu masuk tunggal (nantinya API Gateway) untuk semua frontend web, mobile, dan third-party partners, sehingga integrasi lebih rapi dan terpusat.

**Q: Kenapa traffic spikes jadi perhatian khusus?**
A: Karena peluncuran model baru dan event promosi menyebabkan lonjakan trafik mendadak; platform harus auto-scale tanpa degradasi performa, dan serverless menskalakan per unit konsumsi.
