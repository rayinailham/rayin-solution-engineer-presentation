# Master Plan: AWS Serverless & EDA Storytelling Web Presentation (17 Slides Keynote)

Dokumen arsitektur, strategi narasi 4 Babak, panduan desain editorial, standar diagram resmi AWS, dan spesifikasi implementasi untuk aplikasi web presentasi interaktif 17 slide bertajuk:
**"Designing a Serverless Architecture with Event-Driven Microservices"**

---

## 1. Filosofi & Format Produk

- **Format Media**: **Aplikasi Web Modern Interaktif Berbasis Vite + GSAP**, BUKAN file PowerPoint (.pptx) dan **TANPA skrip Python (`.py`)**. Seluruh HTML5, CSS3, ES Modules, GSAP animation timeline, dan diagram SVG diintegrasikan dalam arsitektur modular yang rapi (`src/`).
- **Hot Module Replacement (HMR)**: Berjalan di server pengembangan Vite (`http://localhost:5173`) untuk iterasi instan saat mengedit teks, SVG, animasi, atau inspector payload tanpa mereset status slide.
- **Realtime Browser Monitoring via Playwright**: Saat sesi pengembangan dimulai, agent menjalankan dev server Vite dan langsung meluncurkan browser Playwright headed (`http://localhost:5173`) di layar desktop agar **Milord** dapat memantau proses perubahan secara langsung (*realtime*).
- **Aset & Acuan Diagram**: Aset SVG & PNG resmi dari direktori `assets/` dan panduan visual `assets/07-presentation-decks/AWS-Architecture-Icons-Deck_For-Light-BG.pptx` serta diagram referensi resmi AWS (`uploaded_media_0.png`).
- **Tema Visual**: **100% Strict Light Themed (Editorial Warm Paper)**.
  - Latar belakang kanvas: Kertas editorial hangat (*warm cream/off-white* `#f9f8f5`).
  - Latar belakang panggung visual: Putih bersih (`#ffffff`) dengan border tipis halus (`#e2e8f0`) dan bayangan lembut.
  - Tipografi: Kontras tinggi *deep charcoal* (`#0f172a`), teks sekunder *muted slate* (`#64748b`), dan aksen oranye resmi AWS (`#ea580c`).
- **Font Pairing (Editorial Modern)**:
  - **Judul Slide**: Google Font `Newsreader` (serif editorial yang anggun, tegas, dan berwibawa).
  - **Isi Teks & UI**: `Plus Jakarta Sans` (sans-serif modern yang sangat nyaman dibaca).
  - **Data Teknis & Kode**: `JetBrains Mono` (monospace presisi untuk payload JSON, spesifikasi SLA, dan klaim JWT).
- **Format 2-Kolom (Editorial Split-Screen)**:
  - **Kolom Kiri (38%)**:
    - Indikator seksi minimalis: `— SECTION 01`.
    - Badge Babak & Modul.
    - Judul slide tajam (`Newsreader`).
    - Ribbon pills layanan AWS yang terlibat.
    - Paragraf cerita pengantar singkat (2–3 kalimat dengan penekanan kata kunci berhuruf **tebal**).
    - 3 Poin teknis terarah untuk dibawakan secara verbal oleh presenter.
    - Catatan kaki editorial (*source & metadata*).
    - **Nol Teleprompter / Nol Naskah Panjang**: Penjelasan mendalam dilakukan oleh Milord secara lisan mengiringi visual di kolom kanan.
  - **Kolom Kanan (62%) - Panggung Arsitektur Resmi AWS**:
    - Kontainer resmi **AWS Cloud** dengan tab hitam `#242f3e` dan logo putih `aws` di sudut kiri atas.
    - Garis konektor ortogonal solid hitam (`#242f3e`) siku-siku 90° dengan label kata kerja aksi miring (*HTTP POST*, *clean*, *token check*, *valid token*, *decrypt secret*).
    - Ikon layanan resmi dengan label nama diletakkan tepat di bawah ikon (*centered label underneath*) tanpa efek glow berlebihan.
    - **Animasi Aliran Data GSAP**: Animasi titik/paket data (*data pulses*) yang mengalir di sepanjang garis konektor SVG untuk menggambarkan aliran pesan real-time.
    - **Sorotan Kontekstual (Topic Spotlight)**: Saat membahas keamanan, komponen WAF, API GW, Cognito, dan KMS aktif disorot dengan alur 401 Blocked vs Allowed.
- **Interaktivitas Mandiri**:
  - **Scroll-Driven Quantized Wheel Navigation**: Navigasi roda mouse/trackpad dengan GSAP smooth snap untuk berpindah antar slide secara mulus.
  - **Keyboard Controls**: <kbd>→</kbd>, <kbd>←</kbd>, <kbd>Space</kbd>, <kbd>F</kbd> (Fullscreen), <kbd>1–9</kbd>, <kbd>Esc</kbd>.
  - **Node Inspector Drawer**: Mengklik node layanan AWS membuka panel laci teknis di sisi kanan yang membedah spesifikasi SLA dan contoh payload JSON / kode asli yang tersimpan dalam data JavaScript terstruktur.
- **Portabilitas Siap Pakai**:
  - Menyertakan konfigurasi `vite-plugin-singlefile` sehingga saat dibutuhkan presentasi offline, perintah `npm run build` dapat menghasilkan satu berkas mandiri `dist/index.html` yang bisa dibuka langsung di browser mana pun tanpa server.

---

## 2. Struktur 17 Slide Keynote (Lengkap dengan Intro Animasi & Closing Terpisah)

```
[BABAK I: PEMBUKA & TANTANGAN]
├── Slide 01: [OPENING KEYNOTE] Cover Panggung, Judul & Animasi Pembuka Elegan
├── Slide 02: [THE 6-MONTH CLOCK] Ambisi Bisnis EV & Peta 5 Titik Kritis Customer Journey
├── Slide 03: Runtuhnya Monolith: Mengapa Server Konvensional (EC2/VM) Gagal?
└── Slide 04: Paradigma Baru: Event-Driven Architecture & Loose Coupling Core

[BABAK II: MEMBANGUN MESIN SERVERLESS]
├── Slide 05: Sistem Saraf Pusat: Amazon EventBridge Hub & Rules Routing
├── Slide 06: Otot Komputasi: AWS Lambda & Firecracker MicroVM Execution
├── Slide 07: Resepsionis Pintu Gerbang: Amazon API Gateway & Ingress Management
├── Slide 08: Matriks Strategis Komputasi: Spektrum FaaS hingga IaaS (Lambda vs Fargate vs ECS vs EC2)
├── Slide 09: Peredam Kejut & Siaran: Amazon SQS & SNS (Fan-Out & Buffering Pattern)
└── Slide 10: Otomasi Rilis & Reprodusibilitas: AWS SAM & GitHub Actions CI/CD Pipeline

[BABAK III: KEAMANAN, ORKESTRASI, DATA & OBSERVABILITY]
├── Slide 11: Pos KTP Digital: Cognito & AWS WAF (Zero-Trust Ingress & 401 Guard)
├── Slide 12: Pertahanan Bawah Tanah: VPC PrivateLink & Enkripsi KMS
├── Slide 13: Orkestrasi Transaksi Terdistribusi: AWS Step Functions Saga
├── Slide 14: Cetak Biru Web Modern: DynamoDB Single-Table Persistence
└── Slide 15: Mata Elang Sistem: Observability dengan AWS X-Ray & CloudWatch

[BABAK IV: KEMENANGAN ARSITEKTUR & PENUTUP]
├── Slide 16: [GRAND TOPOLOGY] "All Systems Go": Peta Arsitektur Produksi End-to-End yang Menyala
└── Slide 17: [CLOSING & Q&A] Executive Summary, 5 Golden Rules Serverless, Scorecard & Q&A
```

---

## 3. Rincian Teknis & Narasi 17 Slide

| Slide | Jenis Slide | Judul Slide | Fokus Cerita Kolom Kiri | Visual Panggung Kanan (AWS Diagram / Stage) | Payload Node Inspector |
|---|---|---|---|---|---|
| **01** | **OPENING** | **Designing a Serverless Architecture with Event-Driven Microservices** | Keynote Title Card: Arsitektur cloud generasi baru untuk sistem skala tinggi. Presenter: Rayina Ilham. Badge: Production Blueprint. | **Panggung Cover Sinematik**: Animasi typography GSAP staggered reveal, lencana AWS Serverless, dan visual grafis bus event minimalis elegan. | Spesifikasi Presentasi & Daftar Layanan Inti |
| **02** | Context | **The 6-Month Clock: Ambisi Sang Startup EV** | Startup EV direct-to-consumer tanpa dealer fisik, tenggat waktu 6 bulan, tim ramping tanpa sysadmin server fisik. | **Peta Customer Journey EV**: Smartphone App ➔ Configurator 3D ➔ Instant Credit ➔ Factory VIN ➔ Delivery Tracker (Target: 6 Bulan). | Spesifikasi Milestone Bisnis & Target Latensi |
| **03** | Problem | **Runtuhnya Monolith: Mengapa Server Konvensional Gagal?** | Monolith VM (EC2) crash saat flash sale pesanan, bayar sewa 24/7 saat sepi, Single Point of Failure (SPOF) merobohkan seluruh bisnis. | **Komparasi Sisi-ke-Sisi**: Monolith rapuh (kotak merah EC2 crash) vs Paradigma Serverless (pay-for-value, zero idle). | Bottleneck CPU/DB Monolith vs Serverless Scale |
| **04** | Principle | **Paradigma Baru: Event-Driven Architecture & Loose Coupling** | Bahaya panggilan sinkron REST (efek domino macet). Solusi: Setiap perubahan status bisnis dipancarkan sebagai Event mandiri. | **Point-to-Point Spaghetti vs Asynchronous Event Bus**: Produser dan Konsumen terisolasi sempurna. | Event Schema Principles & Decoupling Contract |
| **05** | Core EDA | **Sistem Saraf Pusat: Amazon EventBridge Hub** | Papan hubung pintar. Menerima `OrderPlaced` lalu mencocokkan Rules tanpa pengirim tahu siapa saja penerimanya. | **AWS Cloud Container**: EventBridge Hub di tengah merutekan event ke Financing, Pabrik, dan Notifikasi secara independen. | Payload JSON schema `OrderPlaced` (v1.0) |
| **06** | Compute | **Otot Komputasi: AWS Lambda & Firecracker MicroVM** | Eksekusi stateless per event, Firecracker sandbox, cold start vs warm reuse, dan penagihan per 1ms tanpa server idle. | **Lifecycle Sandbox**: Init Phase ➔ Invoke Handler ➔ Warm Reuse ➔ Horizontal Scale (1 hingga 1000+ instance instan). | Lambda Handler Code & Concurrency Config |
| **07** | Ingress | **Resepsionis Pintu Gerbang: Amazon API Gateway** | Managed ingress: Traffic throttling (token bucket), validasi schema request JSON, dan proxy langsung ke antrean AWS. | **Traffic Filter Ingress**: Client ➔ API Gateway (Throttling, Validation, Direct Proxy) ➔ Backend Services. | OpenAPI 3.0 snippet & Throttling Parameters |
| **08** | Trade-off | **Matriks Strategis Komputasi: Spektrum FaaS hingga IaaS** | Kapan memilih Lambda, Fargate, ECS, vs EC2. Matriks 3 dimensi: Beban Operasional vs Kontrol vs Durasi Eksekusi. | **Spektrum Komputasi AWS**: Garis axis Serverless hingga IaaS dengan rekomendasi tegas untuk startup EV. | Matriks Perbandingan Biaya & Operational Overhead |
| **09** | Messaging | **Peredam Kejut & Siaran: Amazon SQS & SNS (Fan-Out & Buffering)** | Pola emas perpesanan asynchronous: Event dikirim ke SNS Topic, disiarkan paralel ke SQS Queues untuk buffering lonjakan & DLQ isolasi. | **The Fan-Out Topology**: Order Service ➔ SNS Topic ➔ [SQS Payment] + [SQS Factory] + [SQS Notification] ➔ Worker Lambdas. | SQS Policy, DLQ Redrive & SNS Message Filter |
| **10** | DevOps/IaC | **Otomasi Rilis & Reprodusibilitas: AWS SAM & CI/CD** | Menghapus klik manual konsol (*No ClickOps*). Definisi arsitektur sebagai kode (YAML), validasi lokal, dan pipeline GitHub Actions instan. | **Pipeline Delivery Otomatis**: Git Push ➔ GitHub Actions CI ➔ `sam build & test` ➔ CloudFormation ChangeSet ➔ Produksi Zero-Downtime. | AWS SAM `template.yaml` snippet & CI workflow |
| **11** | Security | **Pos KTP Digital: Cognito & AWS WAF (Zero-Trust Ingress)** | Siapa pun yang masuk harus diverifikasi. WAF menyaring serangan Layer 7, Cognito Authorizer memvalidasi tiket JWT di gerbang. | **Pipeline Gerbang Keamanan**: Client ➔ WAF ➔ API Gateway ➔ 🔒 Cognito ➔ [401 Blocked] vs [Allowed Lambda] ➔ KMS. | Decoded JWT Claims & WAF IP Rule JSON |
| **12** | Network | **Pertahanan Bawah Tanah: VPC PrivateLink & Enkripsi KMS** | Worker berada di Private Subnet tanpa Internet Gateway (Zero Public IP). Akses layanan via PrivateLink dan enkripsi KMS HSM. | **Isolasi Jaringan VPC**: Private Subnet ➔ PrivateLink Endpoints ➔ S3 / KMS / CloudTrail Audit Logging. | KMS Key Policy & VPC Endpoint DNS config |
| **13** | Workflow | **Orkestrasi Transaksi Terdistribusi: Step Functions Saga** | Alur leasing kompleks (Cek Kredit ➔ Tagih DP ➔ Alokasi VIN). Jika gagal di tengah, sistem otomatis memicu rollback kompensasi. | **State Machine Interaktif**: Alur transaksi pembelian mobil dengan cabang sukses dan cabang kompensasi rollback. | ASL (Amazon States Language) JSON definition |
| **14** | Database | **Cetak Biru Web Modern: DynamoDB Single-Table Design** | Menghilangkan join SQL lambat. Single-Table design berlatensi milidetik dengan partition key, secondary index, dan Streams. | **End-to-End Stack**: S3 Web ➔ CloudFront ➔ API GW ➔ Lambda Validator ➔ DynamoDB Table. | DynamoDB Table Schema & GSI Access Patterns |
| **15** | Telemetry | **Mata Elang Sistem: Observability dengan AWS X-Ray** | Mengatasi masalah tanpa saling menyalahkan (*no blamestorming*). Trace ID unik melacak latensi dan membuktikan bottleneck eksternal. | **Distributed Service Map**: Trace ID breakdown, server AWS cepat (32ms), mendeteksi API bank eksternal lambat (820ms). | X-Ray Trace Segment JSON & Latency breakdown |
| **16** | **GRAND MAP** | **Kemenangan Sang Startup: Arsitektur Produksi Utuh** | Menyatukan seluruh puzzle: Ingress, Auth, Event Bus, Microservices, Workflow, Persistence, dan Observability dalam satu cetak biru hidup. | **Topologi Produksi Penuh (All Systems Go)**: Seluruh subsistem aktif menyala hijau dengan indikator denyut data realtime. | Production SLA, Throughput & RPO/RTO Metrics |
| **17** | **CLOSING** | **Executive Summary, Golden Rules & Sesi Q&A** | Rangkuman eksekutif: 5 Golden Rules Serverless EDA, Total Cost of Ownership (TCO) hemat 74%, dan pembukaan sesi tanya-jawab. | **Executive Closing Card**: 5 Prinsip Emas, Scorecard Kesiapan Go-Live, Kontak/Identitas Presenter, & Stage Q&A interaktif. | Production Readiness Scorecard & Checklist |

---

## 4. Standar Rekayasa untuk Sesi Pengembangan

Saat sesi pengembangan dimulai, implementasi kode akan mengikuti:
1. **Modern Vite + GSAP Stack**: Struktur modular `src/` dengan `index.html` sebagai entry point, styling CSS modular, dan `gsap` sebagai mesin penggerak animasi.
2. **Realtime Browser Monitoring via Playwright**: Agent wajib menyalakan Vite dev server dan membuka instance browser Playwright headed ke `http://localhost:5173` agar Milord dapat memantau panggung secara langsung di layar desktop.
3. **Desain Editorial Light-Themed**: Latar kertas warm `#f9f8f5`, headline `Newsreader`, body `Plus Jakarta Sans`, dan kode `JetBrains Mono`.
4. **Standar Diagram Resmi AWS**: Boundary box `AWS Cloud` dengan tab gelap `#242f3e` berlogo `aws`, garis konektor ortogonal 90° berlabel miring, dan label terpusat di bawah ikon.
5. **Scroll-Driven Quantized Wheel**: Navigasi alami berbasis scroll dengan debouncing GSAP dan boundary safety.
6. **Node Inspector Panel**: Interaktivitas klik pada node AWS untuk membuka panel detail teknis.
