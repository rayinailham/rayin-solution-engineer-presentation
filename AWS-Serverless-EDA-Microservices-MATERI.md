# AWS Solutions Architect — Designing a Serverless Architecture with Event-Driven Microservices

> Catatan lengkap materi kursus AWS Skill Builder. Disusun sebagai bahan presentasi.
> Sumber: AWS Skill Builder (course id PHC714WA2R). Berisi ringkasan konten slide + inti transcript video tiap pelajaran.

---

## Daftar Isi

1. [Gambaran Kursus (Course Overview)](#0-gambaran-kursus)
2. [Modul: Gathering the Customer Requirements](#1-gathering-the-customer-requirements)
3. [Modul: Designing Serverless Architectures](#2-designing-serverless-architectures)
4. [Modul: Decoupling Microservices with AWS Messaging Services](#3-decoupling-microservices-with-aws-messaging-services)
5. [Modul: Securing Serverless Architectures](#4-securing-serverless-architectures)
6. [Modul: Orchestrating Workflows](#5-orchestrating-workflows)
7. [Modul: Observability](#6-observability)
8. [Modul: Putting It All Together](#7-putting-it-all-together)
9. [Ringkasan Layanan AWS yang Dibahas](#ringkasan-layanan-aws)

---

## 0. Gambaran Kursus

**Judul:** Designing a Serverless Architecture with Event-Driven Microservices

**Deskripsi:** Kursus ini membangun di atas prinsip arsitektur untuk menyiapkan kamu merancang serverless architecture di AWS. Kamu mempelajari event-driven architecture dan cara menggunakan events untuk memicu (trigger) serta berkomunikasi antar service yang decoupled, guna membangun aplikasi modern dengan microservices.

**Tujuan kursus (course objectives):**
- Merancang arsitektur untuk serverless, event-driven microservices yang **scalable, secure, dan observable**.
- Meng-orkestrasi serverless workflows menggunakan **Step Functions state machines**.

**Audiens:** Technical professionals yang terlibat dalam arsitektur solusi AWS.

**Prasyarat:** Pengetahuan tentang AWS management interfaces (Course: AWS Technical Essentials).

**Format:** Recorded instruction + konten multimedia & interaktif + Knowledge Checks.

---

## 1. Gathering the Customer Requirements

### Studi Kasus: Startup Otomotif Elektrik (EV Direct-to-Consumer)

Seorang Solutions Architect bertemu startup otomotif listrik yang membangun **platform penjualan direct-to-consumer sepenuhnya di atas AWS serverless**. Ini "born in the cloud" company, tim kecil (lean), timeline agresif.

**Konteks bisnis:**
- Harus **go live dalam 6 bulan**, mulai dari nol (tanpa legacy system).
- Tujuan utama: pelanggan dapat **configure, order, dan track** pembelian kendaraan lewat pengalaman digital yang mulus.
- Alur pembeli: konfigurasi kendaraan → financing → order placement → delivery tracking.
- Harus menangani **ribuan concurrent users** saat product launch, tetap real-time untuk konfigurasi kendaraan & update inventory.

**Kebutuhan teknis kritis:**
- Sub-second response time untuk configuration tool.
- Real-time order processing + status update langsung ke seluruh delivery network.
- Integrasi dengan financing partner mulus (aplikasi kredit diproses dalam hitungan detik, bukan menit).
- **Security** jadi fokus utama (data finansial sensitif): proteksi data pelanggan, secure payment, compliance regulasi otomotif, audit trail lengkap, role-based access control.
- Tim kecil → tidak bisa dedikasikan banyak orang untuk infrastruktur → butuh platform yang **largely runs itself** (auto scaling + self-healing).
- Monitoring fokus ke business metrics (order completion rate, performa configuration tool).
- Data management: akses konsisten ke vehicle configs, customer profiles, order histories.
- Analytics: tracking opsi kendaraan populer, pola penjualan regional, conversion rate funnel.
- Pertumbuhan: rollout bertahap mulai 3 negara bagian → ekspansi nasional (US). Ada traffic spike saat model baru / promo → harus auto-scale.

### Daftar Architecture Requirements (ringkas)

- Unified entry point untuk semua frontend app, mobile client, dan third-party partner.
- Managed serverless infrastructure.
- Event-driven business processes (placing an order, validating payments).
- Millisecond latency, high availability, scale with demand.
- Flexible querying.
- Security untuk data sensitif.
- Decoupled architecture.
- Broadcast events ke banyak subscriber.
- Multi-step operations.
- Track log, metrics, dan business KPIs.

### Usulan Arsitektur Awal (Flipcards: Compute / Storage / Security)

| Kebutuhan | Masalah | Solusi AWS |
|---|---|---|
| **Compute** | Butuh respons event-driven ke proses bisnis; mau AWS yang urus kompleksitas operasional | **AWS Lambda** — mudah mengeksekusi kode sebagai respons event (order processing, payment validation). Serverless & fully managed. |
| **Storage** | Butuh simpan data bisnis dengan aman, akses cepat, scaling seamless on demand | **Amazon DynamoDB** — multi-layer security, millisecond latency, high availability, scale on demand. **Global Secondary Index** untuk flexible querying order. |
| **Security** | Butuh batasi akses berbasis tugas spesifik fungsi | **AWS IAM** — kelola role yang memberi akses function-specific ke service seperti DynamoDB, Amazon SNS, dan Amazon S3. |

---

## 2. Designing Serverless Architectures

**Tujuan modul:** fokus pada use case yang tepat untuk serverless infrastructure. Mengeksplorasi AWS serverless services, event-driven architecture, dan cara mencapai loose coupling.

Yang dipelajari:
- Mendefinisikan serverless computing.
- Mengidentifikasi komponen desain serverless modern yang event-driven.
- Merancang serverless workflow memakai AWS Lambda sebagai compute.
- Mem-publish API memakai API Gateway.

### 2.1 Thinking Serverless — Serverless Computing

**Definisi:** Dengan serverless computing, kamu membangun & menjalankan aplikasi **tanpa memikirkan server**. Tidak perlu provision, scale, atau manage server. Semua yang dibutuhkan untuk menjalankan & men-scale aplikasi dengan high availability ditangani oleh AWS.

**Karakteristik serverless:**
- Tidak ada infrastruktur untuk di-provision/manage.
- Tidak ada server untuk di-provision, operate, atau patch.
- **Scale otomatis per unit konsumsi** (bukan per unit server).
- Model billing **pay-for-value** (bayar sesuai pemakaian; tidak ada biaya saat kode tidak jalan).
- Built-in availability & fault tolerance.
- Umumnya **consumption-based pricing**; utilisasi rendah → biaya rendah.
- Built-in security, highly available compute (sifat bawaan fully managed service).

**Contoh layanan serverless di AWS:** Amazon S3 (object storage), Amazon DynamoDB (database), AWS Lambda, Amazon SNS, Amazon SQS, API Gateway, Step Functions, Amazon Kinesis, Amazon Cognito (auth), Amazon Athena (analytics berbasis SQL).

**Contoh arsitektur serverless (alur 4 langkah):**
1. Amazon API Gateway meng-host REST API. Request POST masuk (mis. dari browser pelanggan klik tombol).
2. API Gateway terintegrasi dengan banyak service AWS → dikonfigurasi mengirim pesan ke **SQS**.
3. Worker container di **AWS Fargate** meng-consume pesan dari queue; pesan hilang dari queue saat dikonsumsi. Processing = menulis ke **DynamoDB**.
4. Kode di container memanggil **Amazon SNS** untuk kirim notifikasi SMS ke user yang subscribe (processing selesai).

> Inti: seluruh arsitektur ini **tidak menyalakan satu server pun** — mengandalkan fully managed services.

### 2.2 Modern Serverless Applications

Abstraksi infrastruktur dari virtual server → container → sekarang serverless, sejalan dengan perpindahan dari aplikasi **monolith** menuju **service-oriented architecture & microservices**.

**Best practice yang ditekankan:**
- **Small pieces, loosely joined** — gunakan potongan kecil yang terhubung longgar agar fleksibel berubah tanpa mengganggu bagian lain, bisa scale & deploy independen, dan keputusan bersifat reversible.

**Monolith vs Serverless (perbandingan):**
- **Monolith: "easier before it's harder".** Awalnya lebih simpel dibangun, dites, satu artefak deploy. Untuk app kurang kompleks bisa jadi opsi terbaik untuk waktu lama. Tapi app kompleks yang tumbuh → interdependensi antar komponen & koordinasi tim untuk test/deploy jadi makin sulit, bisa menurunkan produktivitas developer.
- **Serverless modern: "harder before it's easier".** Awalnya butuh usaha lebih besar (learning curve organisasi). Setelah kurva awal, agility mempercepat rilis fitur baru & menurunkan effort menjaga sistem tetap jalan.

**Analogi Food Truck vs Sit-down Diner (dari video):**
- *Food truck* = kamu melakukan segalanya sendiri (ambil order, bayar kartu kredit, bikin pie & burger) → mirip **monolith**.
- *Sit-down diner* = pekerjaan dipecah ke spesialis (pembuat donat, pembuat pie, kasir) → mirip **decomposed serverless architecture** dengan banyak komponen kecil yang berkomunikasi.

**Data stores — purpose-built vs do-it-all database:**
- Gunakan **purpose-built data store**, bukan satu relational database untuk segalanya. Pilihan: NoSQL, in-memory cache, time series.
- Optimalkan untuk access & query pattern (relational untuk join/aggregate; in-memory cache untuk latency rendah).
- **Scale database independen** per beban.
- **Tantangan sistem terdistribusi:**
  - **Eventual consistency** (ref CAP theorem: Consistency, Availability, Partition tolerance) — data tersebar di banyak node, butuh waktu jadi konsisten.
  - **Distributed transactions / partial completions** — mis. charge kartu kredit melewati banyak service; bagaimana jika gagal di langkah 8 dari 10?
  - **ETL (Extract, Transform, Load)** — kadang masuk akal menyimpan data **redundant** di beberapa lokasi (relational untuk join, cache untuk query cepat, NoSQL) dan memakai tool ETL untuk sinkronisasi.

### 2.3 Event-Driven Design — Event-Driven Architecture (EDA)

**Mengapa EDA:** meng-decouple service → menaikkan velocity, memudahkan debug, menghilangkan bottleneck saat fitur melebar ke banyak tim → tiap tim maju lebih independen.

**Masalah pada pendekatan API request-response (tightly coupled):**
Contoh diner: Order API harus tahu & memanggil Donut API, Invoice API, lalu saat tambah menu baru (Pie API) & Inventory API, Order API harus di-upgrade terus untuk tahu semua service. Semakin banyak kontrak API antar service → makin rapuh & sulit berubah.

**Pendekatan event-driven:**
- **Event = sesuatu yang terjadi** (perubahan state/update). Contoh: trading saham, truk tiba di gudang, pesawat mendarat, "customer orders a dozen donuts".
- Event jadi mekanisme berbagi informasi antar service. Service **mengamati (observe)** channel event; yang tertarik memproses, yang tidak abaikan.
- Umumnya **asynchronous** (bukan request-response). Event diproduksi → diproses → mungkin memunculkan event baru (mis. "donat siap").
- **Event producer memakai messaging service** untuk membagikan event ke banyak consumer. Messaging service tahu consumer mana tertarik event mana.
- **Tambah service baru tanpa mengubah service lain** — service inventory baru cukup subscribe ke event yang sudah ada; event tidak berubah.
- Messaging service juga jadi **buffer** untuk consumer (analogi tiket kertas dalam queue; tambah "donut maker" = tambah resource consumer untuk memproses queue).

**Komunikasi Synchronous vs Asynchronous:**
- **Asynchronous (event-driven):** tidak ada response path. Service memunculkan event lalu langsung lanjut. Trade-off: tak ada channel langsung Service B mengembalikan info ke Service A (selain konfirmasi event diterima). Sering kali kopling eksplisit itu tidak diperlukan.
  - Contoh: Order service minta donat ke Donut API — API tidak membalas donat jadi; ada langkah downstream (ambil dari rak / buat donat). Order service tidak perlu menunggu; biasanya menerima **acknowledgement + identifier** untuk cek status nanti. Pekerjaan selesai asinkron tanpa memblok order berikutnya.
- **Synchronous:** ada request dan response langsung.

### 2.4 Amazon EventBridge

**Definisi:** Amazon EventBridge adalah service pendukung aplikasi serverless. Menggunakan event untuk menghubungkan komponen aplikasi → mudah membangun aplikasi event-driven yang scalable. Me-route event dari sumber (aplikasi buatan sendiri, AWS services, software pihak ketiga) ke aplikasi consumer di seluruh organisasi.

**Cara pakai:** pilih event source di console EventBridge → pilih target (AWS Lambda, Amazon SNS, Amazon Data Firehose, dll) → EventBridge mengantar event near real-time. EventBridge menyediakan cara konsisten untuk **ingest, filter, transform, deliver** event.

**Developer features (dari video):**
- Sumber event: aplikasi sendiri, customer events, AWS services sendiri (mis. "EC2 instance baru launch" muncul di default bus), aplikasi SaaS (mis. Zendesk).
- **Routing rules** untuk memfilter event.
- **Event scheduling** — sintaks mirip cron (tiap 5 menit, atau jam 5 tiap Jumat).
- Scale ke banyak target.
- **Schema feature** — mendefinisikan bentuk data & validasi event.

**Security & scale features:**
- Fully managed & scalable.
- Near real-time stream of system events tentang resource AWS.
- Terintegrasi CloudWatch metrics.
- Terintegrasi dukungan IAM termasuk resource policies.
- Event aplikasi SaaS-integrated berjalan di **AWS internal network** (penting untuk compliance keamanan).

**3 komponen workflow EventBridge:** **Event, Target, Rule.**
- **Event** = indikator perubahan di environment.
- **Rule** = mencocokkan event ke target berdasarkan **event pattern** (struktur event) atau **schedule**. Contoh: saat EC2 instance berubah pending → running, rule mengirim event ke Lambda function.
- **Target** = tujuan pengiriman event (Lambda, CloudWatch Logs, bus di akun AWS lain, dll).

**Resource EventBridge (dari video):**
- **Event sources:** AWS services, custom event bus (aplikasi sendiri), SaaS applications (partner event sources).
- **Event bus:** ada **default event bus** (untuk event AWS) di tiap akun; bisa buat **custom event bus** (mis. untuk satu keluarga aplikasi); partner event ditulis ke SaaS event bus.
- **Rules + targets:** rule mendefinisikan event yang diminati; filter bisa makin detail (mis. hanya department billing & fulfillment). Target bisa Lambda, CloudWatch Logs, atau bus di akun AWS lain.
- **Event archive & replay:** aktifkan archive → semua pesan di bus ditulis ke archive; bisa **replay** pesan ke bus asalnya untuk debugging.
- **Schema discovery & Schema Registry:** schema mendefinisikan struktur event (mis. field name=string, phone=integer, pola phone 10 digit). **Schema Registry** menyimpan koleksi schema yang bisa dicari seluruh developer. Bisa diisi manual atau otomatis via schema discovery (memantau pesan di bus & menurunkan info schema).

---

## 3. Designing Serverless Architectures — Compute & API (lanjutan)

### 3.1 AWS Lambda

**Definisi:** AWS Lambda adalah compute service **serverless, event-driven** yang menjalankan kode untuk hampir semua jenis aplikasi/backend **tanpa provisioning/managing server**. Lambda menjalankan kode di infrastruktur high-availability dan mengurus seluruh administrasi compute.

**Cara kerja (dari video):**
- Kamu package & upload kode ke Lambda → jadi **Lambda function**.
- Function **tidak selalu berjalan**; jalan sebagai respons **trigger**.
- Lambda menunggu/polling event sesuai trigger yang dipilih.
- Contoh trigger umum: **HTTP request, upload file ke Amazon S3, event dari AWS service lain, in-app activity dari mobile device.**
- Saat trigger terdeteksi → kode jalan di **managed environment** (auto-scalable, highly available, maintenance oleh AWS).
- Kamu memilih: bahasa (runtime), memory & CPU, permissions, dependencies.
- **Scaling:** 1 atau 1.000 trigger masuk → Lambda men-scale function sesuai demand, tiap eksekusi di environment terisolasi sendiri.
- **Batas runtime: di bawah 15 menit.** Bukan untuk proses panjang (deep learning, batch job, hosting WordPress). Cocok untuk: web backend menangani request, backend report processing, microservice hosting.
- **Billing:** tidak dibayar untuk kode yang tidak berjalan; hanya resource yang dipakai, dibulatkan ke **1 milidetik** terdekat.

**Demo (ResizeImage):** Lambda me-resize gambar yang di-upload ke employee directory jadi thumbnail. Alur: foto di-upload ke S3 → trigger Lambda → Lambda resize → upload thumbnail ke lokasi berbeda di bucket S3 yang sama.
- Create function → pilih "author from scratch" (opsi lain: blueprint, container image).
- Nama: ResizeImage; runtime: Python 3.9; permissions via **IAM role** (contoh: `LambdaS3FullAccess`).
- Add trigger: source **S3**, bucket `photo-upload-bucket-mw`, event type **PUT**, dengan **prefix input** (hindari recursive invocation karena input & output di bucket sama → output ke prefix berbeda).
- Upload kode (zip) di tab Code.
- Test: upload gambar ke folder `input` → thumbnail muncul di prefix `output`.

**Komponen inti Lambda:** **event source** (mem-publish event) dan **Lambda function** (kode custom untuk memproses event). Konfigurasi function via: Lambda console, Lambda API, AWS CloudFormation, atau **AWS SAM (Serverless Application Model)**. Invoke langsung via Lambda API atau lewat AWS service/resource sebagai respons event.

**Istilah penting:** Function, Trigger, Event, Application Environment, Deployment package, Runtime, Lambda function handler.

**Use cases Lambda:**
1. **Web applications** — static website, web app kompleks, package untuk Flask & Express.
2. (serta backend processing, microservice hosting, dan pemrosesan event-driven lain)

### 3.2 Amazon API Gateway

**Definisi:** API = mekanisme komunikasi antar dua komponen software; bertindak sebagai **"front door"** aplikasi untuk mengakses data, business logic, atau fungsi dari backend. **Amazon API Gateway** memfasilitasi pembuatan, publish, maintenance, monitoring, dan keamanan API pada skala apa pun. Menangani ratusan ribu concurrent API call termasuk traffic management, dukungan **CORS**, authorization & access control, throttling, monitoring, dan API version management.

**Dari video:**
- API Gateway meng-host API (mis. REST API) = **front door / entry point** aplikasi. Request bisa dari mobile app, website, service lain.
- Proses ribuan concurrent API call; bisa dikonfigurasi **public (internet)** atau **internal only (muncul di VPC)**.
- **Integrasi target:** Lambda function, public endpoint di EC2, AWS service lain (mis. menulis ke SQS queue), endpoint di VPC, on-premises via **Direct Connect**.
- **Unified API front end untuk banyak microservices** — route berbeda di API Gateway diteruskan ke Lambda.
- **DDoS protection & throttling** untuk backend.
- **Authentication & authorization:** modul auth custom (Lambda), integrasi **Cognito**, menerima **SigV4** (signature yang dipakai AWS service), authorization via **IAM policy**.
- **Monetisasi API** untuk third-party: **API keys** + **usage plan**; bisa dijual di **AWS Marketplace**.
- **Sample architecture:** browser minta static webpage dari S3 → front-end JS (mis. React) kirim request ke API Gateway → API Gateway teruskan ke Lambda (mis. Python pakai SDK Boto) → Lambda tulis ke DynamoDB. Tambahan: stage API Gateway kirim log ke **CloudWatch Logs**, dan **response caching** untuk mempercepat request berulang.

**Integrasi Lambda (sinkron):**
- API Gateway meng-invoke Lambda **secara synchronous**, built-in **timeout 30 detik**. Jika gagal invoke dalam 30 detik atau function error → error dikembalikan ke API & client.
- **Tidak ada retry bawaan**; event yang meminta harus menunggu response. Error handling jadi tugas developer (di producer/client). CLI: `invoke` dengan tipe `RequestResponse`.

**Features API Gateway:** dua kategori — **Developer features** dan **Security and scale features**.

**API types (3 jenis):**
- **HTTP API** — RESTful dengan **latency & biaya lebih rendah** dari REST API. Mengirim request ke Lambda atau endpoint HTTP routable mana pun. Dioptimalkan untuk proxy ke Lambda/HTTP backend → cocok serverless workload. **Belum menawarkan fungsi API management.**
- **REST API** — fitur manajemen API lebih lengkap.
- **WebSocket API** — komunikasi dua arah real-time.

**Logging & metrics ke CloudWatch:** API Gateway kirim log per stage atau per method; verbosity bisa diatur (Error / Info), bisa log full request/response. Metrics: **jumlah API call, latency, integration latency, error HTTP 400 & 500**. Bisa aktifkan **access logging** (siapa mengakses API & caranya).

### 3.3 Tech Talk — EC2 vs Serverless vs Containers

Diskusi memilih compute option. Poin inti:

- **Bukan progression/tahap kematangan** (EC2 → container → serverless). Ketiganya bisa jadi titik awal. Prinsip: **"right tool for the right job"**.
- **Amazon EC2 — kata kunci: CONTROL.** Kontrol penuh di level instance: pilihan OS, install custom software, tuning. Konsekuensi: kamu bertanggung jawab atas scaling, patching OS, deploy app (walau bisa diotomasi). Analogi: punya mobil (kontrol penuh + tanggung jawab maintenance). Cocok untuk: long-running process, konfigurasi OS spesifik, butuh kontrol penuh.
- **Containers — kata kunci: AGILITY** (juga portability & efficiency). Bagus untuk memecah monolith jadi microservices; agile di tiap tahap (push perubahan kecil lebih sering). Portable, scale fast / fail fast / recover quickly. Pilihan: orchestrator **Amazon ECS** atau **Amazon EKS**; jalan di EC2 atau serverless via **AWS Fargate** (Fargate memburamkan batas serverless vs container). Cocok untuk: microservices, environment konsisten dev↔prod, keseimbangan kontrol & overhead manajemen.
- **AWS Lambda — kata kunci: EVENT-DRIVEN.** Bagus untuk workload yang merespons event (upload, click, update). Fokus hanya ke kode. **Scale out paling cepat** (apalagi dengan **provisioned concurrency**), **scale to zero** saat demand berhenti (cost-efficient, bayar per milidetik). Batas: **15 menit execution time**. Cocok untuk: event-driven processing, task singkat, transaksional dekat user (mis. point-of-sale retail), bisa diorkestrasi dengan **Step Functions state machine**.
- **Biaya:** EC2 bayar walau idle; Lambda bayar hanya yang dipakai (per milidetik); container di antaranya (Fargate = bayar resource yang dipakai container).
- **Pendekatan hybrid (contoh retail dengan beban variabel):** Lambda untuk bagian event-driven (proses order, event sales), containers untuk service aplikasi utama, EC2 untuk komponen yang butuh konfigurasi khusus. Ketiganya terintegrasi baik (Lambda memicu container task, container memanggil Lambda, EC2 host database).

---

## 3b. Decoupling Microservices with AWS Messaging Services

**Tujuan modul:** mengkaji konsep queuing & messaging dalam event-driven architecture.

Yang dipelajari:
- Mengidentifikasi karakteristik utama **polling event source** yang memicu Lambda memakai SQS.
- Menjelaskan bagaimana Lambda mengelola perilaku SQS sebagai event source.
- Mengonfigurasi **Amazon SNS filtering**.
- Membandingkan fitur **Amazon EventBridge vs Amazon SNS**.

### 3b.1 Amazon SQS (Simple Queue Service)

**Definisi:** Amazon SQS = service fully managed, overhead administrasi nol, konfigurasi minim. Skala masif (miliaran pesan/hari). Menyimpan semua queue & pesan dalam satu **AWS Region** yang highly available dengan beberapa **Availability Zone** redundan.

**Cara kerja (dari video):**
- Buat queue → tulis pesan → proses lain meng-consume pesan dari queue.
- Produksi & konsumsi dipisah → pesan **persisten** sampai diproses.
- Saat pesan diambil untuk diproses → pesan jadi **invisible** bagi consumer lain; setelah selesai, consumer kirim sinyal ke SQS untuk **delete**.
- Bertindak sebagai **buffer antara sender & receiver** → cocok untuk pemrosesan asinkron (mis. populate search index tanpa memblok thread utama user).

**Manfaat (benefits):**
- **Loose coupling** — pindahkan job ke SQS → arsitektur loosely coupled (producer mis. web app di belakang load balancer; consumer bisa di Lambda/EC2).
- **Absorbs spikes** — menyerap lonjakan demand; jumlah server consumer bisa di-tune.
- **Failure tolerance** — server consumer boleh reboot; konsumsi berhenti sementara lalu lanjut; tambah fault tolerance.
- Konstruksi umum: **dead-letter queue** & **cost allocation tags**.

**Dead-letter queue (DLQ):** jika pesan diambil tapi gagal diproses sejumlah kali tertentu (mis. dikonfigurasi 10x; service crash tiap kali) → pesan dipindah ke DLQ (tempat pesan yang tidak bisa diproses consumer).

**Use cases SQS:**
1. **Work queues** — decouple komponen aplikasi terdistribusi yang bebannya tak sama; pilih standard atau FIFO queue.
2. Buffering & batch operations.
3. Request offloading.
4. (service-to-service communication, async work items, state change notifications)
- **Bukan untuk:** memilih pesan spesifik (tidak bisa "beri saya pesan country=Australia" → buat queue berbeda per jenis); pesan sangat besar (ada batas ukuran → simpan data di S3, tulis pointer lokasi S3 ke queue).

**Tipe queue (SQS queues):**
- **Standard queue:** **at-least-once delivery** (pesan bisa terkirim lebih dari sekali), **best-effort ordering** (urutan umumnya sama tapi bisa out-of-order karena arsitektur terdistribusi), throughput hampir tak terbatas (nearly unlimited API calls/detik). Pakai jika aplikasi tahan pesan yang datang >1x & out-of-order. (Video: tulis C,B,A bisa diproses B,C,C,A → C diproses 2x.)
- **FIFO queue:** urutan benar (C,B,A → C,B,A) + **deduplikasi** (duplikat dihapus). Berdampak pada jumlah API call. Deduplikasi berbasis **hash pesan** dalam periode deduplikasi; bisa supply **deduplication ID** sendiri (mis. customer ID → hanya diproses sekali dalam periode).

**Optimization (konfigurasi queue):**
- **Visibility timeout:** lama pesan invisible setelah diambil consumer; tergantung task (berapa lama dianggap failure). Jika timeout terlampaui → pesan kembali ke queue (mis. server consumer reboot & lupa posisinya).
- **Polling type:**
  - **Short polling** — "ada task?" → langsung dapat response (walau kosong). Lebih banyak API request.
  - **Long polling** — "ada task? saya tunggu" → koneksi tetap terbuka sampai ada pesan. **Lebih sedikit API call** (lebih hemat).

**Kapan pakai message queue:** service-to-service communication (decoupling + async), asynchronous work items, state change notifications (mis. harga saham berubah, user baru registrasi → kirim email welcome async).

---
