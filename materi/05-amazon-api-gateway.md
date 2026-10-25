# Amazon API Gateway

## Tujuan / Inti

Bagian ini menjelaskan **Amazon API Gateway** sebagai "front door" aplikasi — titik masuk yang membuat, mem-publish, memelihara, memantau, dan mengamankan API pada skala apa pun. Dibahas integrasinya (terutama dengan Lambda, termasuk **timeout 30 detik** tanpa retry), unified API front end untuk microservices, keamanan/throttling, fitur developer & security/scale, tiga tipe API (**HTTP, REST, WebSocket**), contoh arsitektur, dan logging ke CloudWatch.

---

## 1. Apa Itu API & API Gateway?

**API** adalah mekanisme yang memfasilitasi komunikasi antara dua komponen software. API bertindak sebagai **front door** bagi aplikasi untuk mengakses data, business logic, atau functionality dari backend services.

**Amazon API Gateway** adalah layanan yang memfasilitasi **creation, publishing, maintenance, monitoring, dan security** API pada skala apa pun (virtually any scale). API Gateway menangani semua tugas seputar penerimaan dan pemrosesan **ratusan ribu concurrent API calls**, termasuk:
- **Traffic management**
- **Cross-Origin Resource Sharing (CORS) support**
- **Authorization and access control**
- **Throttling**
- **Monitoring**
- **API version management**

---

## 2. API Gateway sebagai Front Door

Dari narasi, API Gateway dapat meng-host sebuah API (mis. **REST API**) dan menjadi **entry point / front door** ke aplikasi Anda.

### Sumber Request (sisi masuk)
- Mobile applications, website, service lain, atau aplikasi lain mengirim request ke API Gateway.
- Dapat memproses **ribuan concurrent API calls**.
- Dapat dikonfigurasi **accessible ke internet** atau **internal only** (muncul di dalam **VPC** Anda).

### Tujuan Request (sisi keluar / integrasi)
API Gateway dapat meneruskan request ke:
- **Lambda functions.**
- **Public endpoints** yang berjalan di **EC2 instances**, atau AWS service lain (contoh sebelumnya: menulis ke **SQS queue**).
- **Publicly available endpoints** di mana pun aplikasi di-host.
- **Endpoints di dalam VPC**.
- **Direct Connect** → lalu di-route ke aplikasi **on-premises**.

> Sangat fleksibel: dari mana request datang dan ke mana diteruskan.

---

## 3. Unified API Front End untuk Microservices

Dengan API Gateway, Anda bisa membuat **unified API front end** untuk banyak microservices.
- API Gateway terintegrasi dengan **Lambda** → microservice dapat diimplementasikan sebagai **Lambda function**.
- Anda membuat beberapa **routes** yang masuk ke aplikasi di API Gateway, lalu mengatur route-route itu untuk meneruskan request ke Lambda.

### Keamanan & Kontrol Trafik
- **DDoS protection** (distributed denial of service) dan **throttling** untuk backend — mencegah banyak request masuk dan menghabiskan resource.
- Dapat **authenticate dan authorize** request ke backend. Opsi autentikasi:
  - Membuat **authentication modules** di dalam API Gateway (berupa **Lambda functions** — dikenal sebagai Lambda authorizers).
  - Integrasi dengan **Amazon Cognito**.
  - Menerima **SigV4 authentication** (bentuk signature yang sama dipakai AWS services).
  - **Authorization** juga dari **IAM** → tulis IAM policies untuk mengontrol action di dalam API Anda.
- **Throttle, meter, atau monetize** API untuk third-party developers lewat **API keys**:
  - Buat **API key** di API Gateway yang diberikan ke application developer.
  - Asosiasikan **usage plan** dengan API key.
  - Konfigurasi API agar hadir di **AWS Marketplace** → menjual API di marketplace AWS.

---

## 4. Integrasi dengan AWS Lambda: Timeout & Retry

API Gateway punya integrasi kaya dengan **AWS Lambda**. Pada **synchronous invocation**, layanan Lambda mengirim event langsung ke function lalu mengirim response kembali ke invoker.

Fakta penting:
- API Gateway meng-invoke Lambda functions **secara synchronous** dengan **built-in timeout 30 detik**.
- Jika Lambda tidak berhasil di-invoke dalam **30 detik**, atau function berjalan tapi menghasilkan error, **error dikembalikan ke API dan calling client**.
- **Tidak ada retry bawaan (no retries built in)**, dan requesting event harus menunggu response.
- Artinya: **tugas developer** menulis *error handling* di producer service atau client yang membuat request.
- Untuk meng-invoke function synchronously via AWS CLI: pakai command **`invoke`** dengan invoke type **`RequestResponse`**.

---

## 5. Fitur API Gateway

Disajikan dalam dua kategori yang bisa di-*expand*:

### Developer Features
- Membuat **RESTful (REST/HTTP)** atau **WebSocket APIs**.
- **Host multiple versions** dari sebuah API.
- **Generate SDKs** dari API.
- **Import/export Swagger atau OpenAPI 3.0 definitions**.
- Integrasi dengan AWS services dan backends lain.
- Membuat **proxy** atau **custom integrations**.

### Security and Scale Features
- **Invoke Lambda tanpa menulis Signature Version 4 authorization sendiri.**
- Memilih **endpoint type** yang paling cocok dengan pola akses yang diharapkan.
- **Authorize access** ke API Anda.
- **Throttle requests.**
- Melakukan **canary deployments**.
- Integrasi dengan **AWS Web Application Firewall (AWS WAF)**.

---

## 6. Tipe API (HTTP, REST, WebSocket)

Tiga tipe API yang ditawarkan API Gateway:

### HTTP API
- Membuat **RESTful APIs** dengan **latency lebih rendah dan biaya lebih rendah** daripada REST APIs.
- Dapat mengirim request ke **Lambda functions** atau ke **endpoint HTTP routable** apa pun.
- Dioptimalkan untuk membangun API yang mem-*proxy* ke Lambda functions atau HTTP backends → cocok untuk serverless workloads.
- **Belum menawarkan API management functionality.**
- Contoh: HTTP API terintegrasi dengan Lambda function di backend; saat client memanggil API, API Gateway mengirim request ke Lambda dan mengembalikan response function ke client.

### REST API
- **REST** = *representational state transfer*. REST mendefinisikan sekumpulan function — seperti **GET, PUT, DELETE** — yang dipakai client untuk mengakses data server. Client dan server bertukar data lewat **HTTP**.
- Fitur utama REST adalah **statelessness**: server tidak menyimpan data client antar request. Request client mirip URL yang Anda ketik di browser; response server berupa data polos (plain data), tanpa rendering grafis halaman web.
- REST APIs menawarkan **API proxy functionality** dan **API management features** dalam satu solusi — mencakup **usage plans, API keys, publishing, dan monetizing APIs**.

### WebSocket API
- Dapat diakses client lewat protokol **WebSocket**.
- Berbeda dari REST/HTTP, WebSocket memungkinkan **bidirectional communications**.
- Sering dipakai untuk aplikasi **real-time**: chat applications, collaboration platforms, multiplayer games, financial trading platforms.
- Menjaga **persistent connection** antar client terkoneksi untuk memfasilitasi komunikasi pesan real-time.
- Dapat mendefinisikan backend integrations dengan **Lambda functions, Amazon Kinesis, atau endpoint HTTP** apa pun untuk di-invoke saat pesan diterima dari client.

### Perbandingan Singkat
| Tipe | Ciri Utama | Cocok Untuk |
|------|-----------|-------------|
| **HTTP** | Latency & biaya lebih rendah; proxy ke Lambda/HTTP; belum ada API management | Serverless workloads sederhana |
| **REST** | Stateless (GET/PUT/DELETE via HTTP); API management lengkap (usage plans, API keys, publish, monetize) | API yang butuh manajemen & monetisasi |
| **WebSocket** | Koneksi persisten, komunikasi dua arah real-time | Chat, kolaborasi, game multiplayer, trading |

---

## 7. Contoh Arsitektur (Alur Langkah demi Langkah)

Narasi dan halaman "Example Architecture" menjelaskan alur berikut:

1. **Application client** (seseorang di depan browser) membuat request ke website.
2. **Static webpage disajikan dari S3 bucket** — S3 dibuat efektif menjadi web server lewat policy pada bucket. Di dalamnya ada front-end JavaScript (mis. aplikasi **React**) yang berjalan di browser dan mengirim request ke API Gateway.
3. Client browser berkomunikasi dengan **API Gateway memakai REST API**.
4. **API Gateway authenticate & authorize** request, lalu **meng-invoke Lambda function**.
5. **Lambda** (compute service, mis. kode **Python**) dibangun dengan **AWS SDK (Boto)** sehingga terintegrasi dengan **DynamoDB** → menambahkan record ke **DynamoDB table**.
6. **API Gateway cache (opsional)** — response caching untuk mengurangi beban backend dan latency saat melayani request berulang. Jika hasil untuk parameter tertentu boleh di-cache, request berikutnya direspons jauh lebih cepat.
7. **CloudWatch Logs** — stage API Gateway dikonfigurasi mengirim log ke CloudWatch Logs; demikian pula semua yang terjadi di dalam Lambda dapat dicatat di CloudWatch Logs.

---

## 8. Logging & Metrics ke CloudWatch

API Gateway dapat mengirim log ke **CloudWatch** untuk **tiap stage** di API Anda atau **tiap method**.
- Anda bisa mengatur **verbosity** logging: **Error** atau **Info**, dan apakah full request & response data harus dicatat.

**Detailed metrics** yang bisa dikirim API Gateway ke CloudWatch:
- **Number of API calls**
- **Latency**
- **Integration latency**
- **HTTP 400 dan 500 errors**

Anda juga bisa mengaktifkan **access logging** untuk mencatat **siapa** yang mengakses API dan **bagaimana** mereka mengaksesnya.

---

## 9. Diagram (deskripsi)

- **Navigasi "Introduction"** — halaman pengantar API sebagai front door dan API Gateway sebagai layanan pengelola API skala besar.
- **"Amazon API Gateway Service Icon"** — ikon layanan API Gateway.
- **"Amazon API Gateway with Lambda function"** — diagram API Gateway sebagai front door: request dari mobile/website/service → API Gateway → diteruskan ke Lambda, EC2 public endpoints, AWS service lain (mis. SQS), endpoint di VPC, atau on-premises via Direct Connect.
- **Navigasi "Features"** — halaman fitur developer & security/scale (dua kategori yang bisa di-expand).
- **Navigasi "API types"** — halaman tiga tab tipe API (HTTP, REST, WebSocket).
- **"Example usage of Amazon API Gateway"** — diagram contoh arsitektur: browser → static webpage di S3 → REST API di API Gateway (authenticate/authorize) → Lambda → DynamoDB, dengan optional API Gateway cache dan logging ke CloudWatch.

---

## Poin Kunci untuk Presentasi

- **API Gateway = front door** aplikasi: create, publish, maintain, monitor, secure API pada skala apa pun; menangani ratusan ribu concurrent API calls.
- Menangani traffic management, **CORS**, authorization/access control, **throttling**, monitoring, dan **API version management**.
- Bisa dikonfigurasi **internet-facing** atau **internal (VPC)**; meneruskan request ke Lambda, EC2, AWS service lain, VPC, atau on-premises via Direct Connect.
- **Unified API front end** untuk microservices (sering diimplementasikan sebagai Lambda functions via routes).
- Integrasi Lambda **synchronous** dengan **timeout 30 detik** dan **tanpa retry** → developer wajib menulis error handling; CLI pakai `invoke` + `RequestResponse`.
- Autentikasi/otorisasi: **Lambda authorizer**, **Cognito**, **SigV4**, dan **IAM policies**; **API keys + usage plans** untuk throttle/meter/monetize, bahkan jual di **AWS Marketplace**.
- Tiga tipe API: **HTTP** (murah & cepat, proxy serverless), **REST** (stateless, API management penuh: usage plans/API keys/monetize), **WebSocket** (dua arah, real-time).
- Fitur lain: generate SDK, import/export **Swagger/OpenAPI 3.0**, proxy/custom integration, **canary deployments**, integrasi **AWS WAF**.
- Contoh arsitektur: **S3 (static web) → API Gateway (REST) → Lambda → DynamoDB**, dengan **API Gateway cache** opsional dan log ke **CloudWatch**.
- Metrics ke CloudWatch: jumlah API calls, latency, integration latency, HTTP 400/500 errors; plus **access logging** (siapa & bagaimana mengakses).

## Kemungkinan Pertanyaan Audiens

**Q: Berapa timeout integrasi API Gateway ke Lambda, dan apakah ada retry?**
A: Timeout bawaan **30 detik** untuk synchronous invocation, dan **tidak ada retry bawaan**. Developer harus menulis error handling sendiri di client/producer.

**Q: Apa beda HTTP API dan REST API?**
A: HTTP API lebih murah dan latency lebih rendah, dioptimalkan untuk proxy ke Lambda/HTTP, tapi belum punya API management. REST API stateless dan menawarkan API management penuh (usage plans, API keys, publishing, monetizing).

**Q: Kapan memakai WebSocket API?**
A: Saat butuh komunikasi dua arah real-time dengan koneksi persisten, seperti chat, kolaborasi, game multiplayer, atau trading platform.

**Q: Bagaimana API Gateway mengamankan API?**
A: Lewat throttling & DDoS protection, Lambda authorizer, integrasi Cognito, SigV4, IAM policies, API keys + usage plans, serta integrasi AWS WAF.

**Q: Bagaimana cara memonetisasi API ke third-party developer?**
A: Buat API key, asosiasikan dengan usage plan, dan opsional publikasikan API di AWS Marketplace.

**Q: Metrics apa saja yang dikirim API Gateway ke CloudWatch?**
A: Number of API calls, latency, integration latency, serta HTTP 400 dan 500 errors; ditambah access logging untuk mencatat siapa dan bagaimana API diakses.
