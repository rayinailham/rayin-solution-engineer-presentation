# Amazon Cognito dan Keamanan API Gateway

## Tujuan / Inti

Bab ini membahas dua hal:

1. **Amazon Cognito** — layanan authentication, authorization, dan user management untuk aplikasi web/mobile; termasuk **user pools** vs **identity pools (federated identities)**, jenis token, dan alur otorisasi.
2. **Securing API Gateway** — opsi autentikasi/otorisasi di API Gateway (JWT authorizers, Lambda authorizers, IAM) serta cara API Gateway melindungi API dan datanya.

## Authentication vs Authorization

Sering dipikir bersama, tapi beda:

- **Authentication (AuthN)** — verifikasi **identitas** user/entity memakai mekanisme seperti username/password.
- **Authorization (AuthZ)** — memetakan **privilege (hak akses)** ke user/entity berdasarkan identitasnya.

### Apa yang dilakukan Identity Provider (IdP)

- Authentication bertanggung jawab **membuat dan memelihara identitas** user atau principal lain.
- Authorization menyediakan autentikasi bagi user tersebut ke aplikasi lain dalam network terdistribusi.
- IdP bertindak sebagai **trusted source** dalam **federated login**, memungkinkan user mengakses sistem **tanpa kredensial** untuk sistem itu.

## Amazon Cognito

Amazon Cognito menyediakan **authentication, authorization, dan user management** untuk aplikasi web dan mobile. User bisa sign in langsung dengan username/password, atau lewat pihak ketiga (Facebook, Amazon, Google, Apple).

- Menyediakan **identity store** yang skala hingga **jutaan user**.
- Mendukung **social dan enterprise identity federation**.
- Menawarkan fitur keamanan lanjutan.
- Dibangun di atas **open identity standards**, mendukung berbagai regulasi compliance, dan terintegrasi dengan resource pengembangan frontend/backend.

### Fitur & komponen Cognito (poin video + slide)

- Menggunakan **standards-based platform**: token dan authentication flow yang didefinisikan **OIDC (Open ID Connect)** dan **OAuth 2**.
- Bisa **meng-host sign-in dan sign-up** untuk kamu (tak perlu coding layar username/password sendiri).
- Mendukung **federated sign-in** lewat social (Facebook, Google, Amazon) dan enterprise identity (mis. SAML / Active Directory).
- Bisa dikonfigurasi sebagai **IdP untuk JWT authorizer** — Cognito mengembalikan **token**, lalu API Gateway dikonfigurasi menerima token itu, memverifikasi klaim dan signature-nya.
- **Fully managed service**, scalable hingga **ratusan juta user**.
- **Cognito user pools** bisa menjadi database user-mu, skala sangat tinggi, dengan kontrol atribut apa saja yang dikumpulkan per user.
- Mendukung **multi-factor authentication (MFA)** — mis. **TOTP (time-based one-time password)**, kode 6 digit dari authenticator app, dipakai bersama password (seperti aplikasi perbankan).
- **Advanced security**: risk-based, **adaptive authentication** — mendeteksi risiko pada sign-in.
- **Mencegah penggunaan compromised credentials**.
- Memberikan **short-lived credentials** (via identity pools) untuk berinteraksi dengan resource AWS; JWT token juga punya **expiry** sehingga menghindari kredensial berumur panjang (bisa di-refresh selama identitas masih valid).

## User Pools vs Identity Pools (Federated Identities)

Dua komponen utama authentication & authorization di Cognito. Bisa dipakai **terpisah atau bersama**.

### Berdasarkan fungsi (narasi video)

| Fungsi | User pools | Federated identities (identity pools) |
|---|---|---|
| Peran | Bertindak sebagai **identity provider** & profile management; host database semua user; bisa federasi dengan IdP pihak ketiga (Facebook, Google, Amazon, Apple) | Membuat **unique identity**, melakukan federasi, mengembalikan **AWS credentials** |
| Output autentikasi | **JWT token** (setelah sukses sign in, bisa lewat layar yang di-host user pools) untuk diverifikasi dan dipakai autentikasi | **AWS credentials**: access key, secret, session token — kredensial sementara short-lived untuk akses resource AWS |
| Kontrol akses | Token diverifikasi dan dipakai untuk autentikasi (mis. ke API Gateway) | Ada **policy** yang menempel, mengontrol resource AWS mana yang bisa diakses dengan kredensial sementara itu |

Catatan video: kamu tidak selalu memakai keduanya. Kalau hanya butuh **sign-up/sign-in**, pakai **user pools**. Federated identities dipakai saat perlu **menukar satu identitas menjadi AWS credentials**.

### Detail User pools (slide)

User pool adalah **user directory** di Cognito. User bisa sign in ke aplikasi web/mobile lewat Cognito, atau federasi lewat IdP pihak ketiga. Semua anggota user pool punya **directory profile** yang bisa diakses lewat SDK. User pools menyediakan:

- Layanan **sign-up dan sign-in**.
- **Built-in, customizable web UI** untuk sign in user.
- **Social sign-in** dengan Facebook, Google, Login with Amazon, Sign in with Apple, serta lewat **SAML dan OIDC** IdP dari user pool.
- **User directory management** dan user profiles.
- Fitur keamanan: **MFA**, pengecekan **compromised credentials**, **account takeover protection**, verifikasi phone dan email.
- Workflow terkustomisasi dan **user migration** lewat **AWS Lambda triggers**.

### Detail Identity pools (tab)

Dengan identity pool, user bisa memperoleh **temporary AWS credentials** untuk mengakses service AWS seperti **Amazon S3 dan DynamoDB**. Identity pools mendukung **anonymous guest users**, serta IdP berikut untuk autentikasi:

- Amazon Cognito user pools
- Social sign-in (Facebook, Google, Login with Amazon, Sign in with Apple)
- OpenID Connect (OIDC) providers
- SAML identity providers
- Developer authenticated identities

## Token untuk Authentication

Cognito mengautentikasi user dan memberi akses ke resource dengan **token**. Token punya **claims** (potongan informasi tentang user). Ada tiga tipe token:

| Token | Isi / Fungsi |
|---|---|
| **ID token** | Berisi claims tentang **identitas** user terautentikasi, seperti name dan email address. |
| **Access token** | Berisi claims tentang user terautentikasi, daftar **groups** user, dan daftar **scopes**. |
| **Refresh token** | Dipakai untuk **mengambil ID dan access token baru** saat access token kedaluwarsa. |

Catatan penting:

- **Scope** adalah sesuatu yang boleh kamu lakukan (bagian dari open standard). Scope dikonfigurasi di sisi Cognito; di API Gateway bisa diatur: "kamu boleh melakukan ini jika punya scope ini".
- **JWT tokens are signed** — penting karena berisi banyak info user. Jika disadap atau dipalsukan, penyerang bisa menyamar sebagai user. API Gateway mengambil **public key** dari lokasi *well-known* di IdP untuk memverifikasi signature.
- **Refresh token dienkripsi** dan dikirim kembali ke Cognito untuk ditukar dengan access token baru.
- Kamu bisa **me-revoke refresh token** user lewat AWS API. Saat di-revoke, semua access token yang sebelumnya diterbitkan oleh refresh token itu menjadi **invalid**. Refresh token lain milik user itu **tidak terpengaruh**.

> "JWT tokens are signed." — token ditandatangani agar integritas dan keaslian klaim bisa diverifikasi.

## Alur Otorisasi dengan Cognito

### A. Authorization flow REST API memakai Cognito User Pools

1. Client **autentikasi** dengan user pool.
2. Client mendapatkan **tiga JWT** (ID, access, refresh).
3. Client mengirim **ID dan access token** di header sebagai bagian dari panggilan ke **API Gateway**.
4. API Gateway **memvalidasi token** (decode + verifikasi signature, mengambil public key dari IdP).
5. API Gateway meng-invoke resource backend yang diintegrasikan (contoh: **Lambda function**).
6. Lambda function mengakses **resource AWS lain**.

Catatan video: untuk Lambda mengakses DynamoDB, **identitas berbeda** yang berlaku — Lambda punya **role** tersendiri, dan identitas role itulah yang dipakai mengakses DynamoDB.

### B. Granting IAM Permissions dengan Cognito Federated Identities

Federated identities (identity pools) membuat unique identity dan memfederasikannya dengan IdP, tetapi **bukan** bertindak sebagai IdP sendiri.

1. Client **autentikasi** dengan Cognito **user pool**.
2. Client mendapatkan **JWTs** dari user pool.
3. Client memakai token itu untuk **meminta temporary AWS credentials**.
4. Cognito federated identities **memvalidasi ID token**.
5. Cognito federated identities **mengembalikan temporary credentials**.
6. Client memakai kredensial itu untuk **menandatangani payload**.
7. Client memanggil API dengan **payload yang ditandatangani**.
8. API Gateway memeriksa **IAM policy** yang terkait temporary credentials dan mengizinkan aksi sesuai policy.
9. API Gateway meng-invoke **Lambda function** sesuai permission di IAM policy.

Catatan video: ada **auth role** (dan **unauth role**) terkait federated identity, dengan **policy** terlampir. Kredensial yang didapat hanya bisa beroperasi dalam batas policy role itu. Ini adalah contoh **federation** — menukar satu identitas (Cognito, atau social provider seperti Facebook/Google/Amazon) menjadi **AWS credentials**; dengan AWS credentials itu client bahkan bisa langsung bicara ke service AWS lain jika role mengizinkan.

## Securing API Gateway

API Gateway adalah **"pintu depan" (front door)** aplikasi. Saat request masuk, bagaimana kita mengautentikasi dan mengetahui identitas pembuat request? Ada lebih dari satu opsi.

### Tiga tipe API Gateway authorizer

Dua aspek utama keamanan aplikasi di sekitar API Gateway: **mengontrol akses ke API** dan **melindungi API setelah akses diberikan**. Langkah pertama mencegah akses tak diinginkan: menerapkan **Amazon Cognito** atau third-party provider untuk autentikasi di depan API. **IAM** berperan penting mengontrol siapa yang boleh authenticated dan authorized memakai resource API Gateway.

Tiga tipe authorizer:

#### 1. JWT authorizers

- Developer mengirim **ID dan access token** ke third-party IdP untuk mengamankan JWT, yang lalu dipakai mengotorisasi akses ke resource aplikasi.
- Token hidup relatif singkat; client harus menyimpan **refresh token** (bisa hidup hingga **1 tahun**) untuk diam-diam me-refresh ID dan access token di balik layar.
- Token menyederhanakan identitas bagi developer dan memungkinkan meneruskan **user context** ke downstream service secara ringan.
- Saat memakai **Cognito user pool directory** sebagai IdP, AWS meng-host seluruh pengalaman. Jika user pool diset federasi dengan IdP pihak ketiga, user pool mempercayai identitas itu dan mengarahkannya seolah user ada di direktorinya.
- Didukung untuk **REST dan HTTP APIs** (HTTP API mendukungnya secara native; REST API bisa diintegrasikan dengan Cognito user pools).

Alur JWT authorizer untuk HTTP API:
1. Client autentikasi dengan IdP.
2. Client mendapatkan JWTs.
3. Client mengirim ID dan access token di header saat memanggil API Gateway.
4. API Gateway memvalidasi token.
5. API Gateway meng-invoke resource backend (contoh Lambda function).
6. Lambda mengakses resource AWS lain.

#### 2. Lambda authorizers

- Dipakai saat JWT dan IAM **tidak cukup** untuk use case-mu (mis. memakai token lain seperti **SAML**). Kamu **menulis kode** untuk melakukan otorisasi, mengembalikan **policy** yang menyatakan identitas tertentu di-**allow** atau **deny** untuk request tertentu.
- Tersedia untuk **REST dan HTTP APIs**. HTTP API bisa memakai format payload authorizer yang lebih sederhana dibanding REST API.

Alur Lambda authorizer:
1. Client autentikasi dengan **third-party IdP**.
2. Client mendapatkan **custom tokens**.
3. Info token dikirim di header ke API Gateway.
4. API Gateway cek **policy cache** — jika requestor baru-baru ini sudah diotorisasi, bisa melewati langkah validasi token dan pengembalian policy.
5. Jika policy requestor belum di-cache, API Gateway meng-invoke **Lambda authorizer function**.
6. Function berisi kode untuk **mengeluarkan IAM policy** dan mengembalikannya ke API Gateway.
7. API Gateway memakai IAM policy (cached atau baru) untuk memvalidasi permission requestor.

#### 3. IAM based authorization

- Request ke API Gateway ditandatangani dengan **SigV4 signature** — persis cara AWS API bekerja (mengambil identitas AWS, membangun signature, menyertakannya dengan request).
- Signature dibuat unik dan mencakup **waktu request, resource yang diminta, dan action**, sehingga walaupun signature disadap dan dipakai ulang nanti, signature itu sudah tidak valid lagi.
- Ini opsi **paling aman**, tapi mensyaratkan API client tahu cara menandatangani request-nya. Untuk akses API **antar sistem yang berjalan di AWS**, pakai IAM — paling cocok untuk **system-to-system authorization**.
- Dengan IAM based authorization:
  - Requestor harus punya **IAM credentials**.
  - Informasi key ditambahkan ke **authorization header**.
  - API Gateway menentukan apakah IAM user/role punya permission meng-invoke API.
- Penerapan: di **API level** untuk REST API memakai **resource policy**; juga di **method level** (REST) atau **route level** (REST dan HTTP).
- Dari video: untuk HTTP API bisa diterapkan di **route level** (mis. `/customerpost` butuh IAM permission); untuk REST API bisa di **seluruh API** atau sampai **method level**. Dengan AWS CLI, flag `--debug` memperlihatkan signature yang dikirim ke service AWS.

### Mekanisme otorisasi per tipe API

| Tipe API | Mekanisme otorisasi yang didukung |
|---|---|
| **REST API** | IAM policies (termasuk IAM user policies dan resource policies), AWS Lambda authorizers, Amazon Cognito user pools |
| **HTTP API** | IAM policies (termasuk IAM user policies), JSON Web Token (JWT) authorizers |
| **WebSocket API** | (mekanisme untuk mengotorisasi akses ke WebSocket API) |

> Catatan tambahan: pada raw material, daftar mekanisme spesifik untuk **WebSocket API** tidak dirinci lebih lanjut selain menyebut bahwa API Gateway mendukung REST, HTTP, dan WebSocket API dengan set mekanisme otorisasi yang berbeda-beda.

### Melindungi API (Protecting APIs)

API Gateway menyediakan opsi membuat **private endpoints** yang hanya bisa dijangkau dari dalam **Amazon VPC**. API Gateway juga bisa menyediakan **backend integration** ke resource di dalam VPC lewat **VPC link**. Lindungi API agar melindungi service lain yang bisa diakses API dan service terintegrasi.

Cara API Gateway melindungi data:

- API Gateway mewajibkan **semua data dienkripsi** dan mewajibkan **HTTPS endpoints**.
- Definisi API di-deploy **in memory** dan di-cache ke **disk terenkripsi**.
- **Integration responses** yang dipilih untuk di-cache dapat dikonfigurasi memakai **encryption at rest**.
- **Logging** harus **dikonfigurasi secara eksplisit** agar dipersisten.
- Selain enkripsi, secured caching, dan mekanisme logging, bisa diterapkan proteksi di API endpoints, backend integrations, terhadap **rate-based attacks**, dan serangan jahat lainnya.

## Ringkasan Opsi Autentikasi API Gateway (dari video)

Tiga opsi autentikasi/otorisasi di API Gateway:

- **JWT-based authorizers** — JWT adalah open standard, token base64-encoded besar yang ditandatangani, dikirim bersama request. Didukung untuk **REST dan HTTP APIs**.
- **Lambda custom authorizer** — tulis authorizer sendiri di Lambda.
- **IAM authentication** — memakai AWS credentials (SigV4).

Peran Cognito: **user pools** menyediakan opsi sign-up/sign-in (bisa host layar atau via Cognito API); **federated identities** dipakai untuk menukar identitas di satu sistem menjadi AWS credentials.

## Diagram (deskripsi)

Berdasarkan alt text dan narasi:

- **Authentication and authorization / Amazon Cognito** — menggambarkan posisi Cognito dalam arsitektur serverless: user pools sebagai IdP/profile store yang mengeluarkan JWT, federated identities yang menukar identitas menjadi AWS credentials.
- **Architecture diagram (REST API + user pools)** — mobile app sign in ke Cognito (SRP), mendapat tiga token (ID, access, refresh); dengan access token, client memanggil API Gateway yang men-decode dan memverifikasi signature (mengambil public key dari IdP); API Gateway memanggil Lambda; Lambda (dengan role-nya sendiri) mengakses DynamoDB.
- **Architecture diagram (federated identities)** — client autentikasi ke Cognito user pools, lalu menukar token ke Cognito federated identities untuk mendapat temporary AWS credentials (dengan auth/unauth role + policy); client memakai kredensial untuk IAM authentication ke API Gateway (atau langsung ke service AWS lain); API Gateway memeriksa IAM policy lalu meng-invoke Lambda.
- **IAM authorization policy** — ilustrasi otorisasi berbasis IAM: request ditandatangani SigV4, API Gateway menentukan apakah IAM user/role berizin meng-invoke API.

## Poin Kunci untuk Presentasi

- **Authentication** = buktikan identitas; **Authorization** = tentukan hak akses. IdP adalah trusted source untuk federated login.
- **Cognito user pools** = direktori user + sign-up/sign-in + JWT; **Cognito identity pools (federated identities)** = menukar identitas menjadi **temporary AWS credentials** (access key, secret, session token).
- Cognito mengeluarkan tiga token: **ID token** (identitas), **access token** (groups + scopes), **refresh token** (ambil token baru; bisa di-revoke). **JWT tokens are signed** dan diverifikasi via public key IdP.
- API Gateway adalah **front door**; tiga tipe authorizer: **JWT authorizers**, **Lambda authorizers** (custom, mis. SAML), dan **IAM based authorization** (SigV4, paling aman, cocok system-to-system di AWS).
- Mekanisme per tipe API: **REST** (IAM, Lambda authorizers, Cognito user pools), **HTTP** (IAM, JWT authorizers), **WebSocket** (set mekanismenya sendiri).
- Alur user pools: autentikasi → 3 JWT → kirim ID+access token ke API Gateway → validasi → invoke Lambda → akses resource AWS (Lambda pakai role-nya sendiri).
- Alur federated identities: autentikasi user pools → tukar JWT jadi temporary AWS credentials → tanda tangani payload → panggil API → API Gateway cek IAM policy → invoke Lambda.
- API Gateway melindungi data: wajib **HTTPS/enkripsi**, definisi API di disk terenkripsi, cache integration response bisa encryption at rest, logging harus eksplisit; bisa buat **private endpoint** (hanya dari VPC) dan **VPC link** ke backend.

## Kemungkinan Pertanyaan Audiens

**T: Apa beda Cognito user pools dan identity pools?**
J: **User pools** adalah direktori user yang menangani sign-up/sign-in dan mengeluarkan **JWT token** (ID, access, refresh) untuk autentikasi. **Identity pools (federated identities)** menukar identitas (dari user pools atau social/SAML/OIDC) menjadi **temporary AWS credentials** agar user bisa mengakses service AWS seperti S3 dan DynamoDB. Bisa dipakai terpisah atau bersama.

**T: Apa fungsi masing-masing dari tiga token Cognito?**
J: **ID token** berisi klaim identitas (nama, email). **Access token** berisi klaim user, daftar groups, dan scopes (dipakai mengotorisasi aksi API). **Refresh token** dipakai mengambil ID dan access token baru saat kedaluwarsa, dan bisa di-revoke sehingga access token yang diterbitkannya menjadi invalid.

**T: Kapan memilih JWT authorizer, Lambda authorizer, atau IAM authorization?**
J: Pakai **JWT authorizer** untuk autentikasi berbasis token OIDC (mis. dari Cognito) pada REST/HTTP API. Pakai **Lambda authorizer** saat butuh logika custom atau token lain seperti SAML. Pakai **IAM authorization** (SigV4) untuk keamanan tertinggi dan komunikasi **system-to-system antar service di AWS**.

**T: Kenapa JWT token harus ditandatangani (signed)?**
J: Karena token membawa banyak informasi user. Jika disadap atau dipalsukan, penyerang bisa menyamar sebagai user. Signature memungkinkan API Gateway memverifikasi keaslian token dengan mengambil public key dari lokasi well-known di IdP.

**T: Bagaimana API Gateway melindungi API dan datanya?**
J: API Gateway mewajibkan HTTPS dan enkripsi semua data, menyimpan definisi API in-memory dan cache ke disk terenkripsi, mendukung encryption at rest untuk integration response yang di-cache, mewajibkan logging dikonfigurasi eksplisit, serta mendukung private endpoint (hanya dari VPC), VPC link ke backend, dan proteksi terhadap rate-based/malicious attacks.

**T: Saat Lambda di belakang API Gateway mengakses DynamoDB, identitas siapa yang dipakai?**
J: Identitas **role** milik Lambda function itu sendiri (execution role), bukan identitas user yang memanggil API. User diautentikasi/otorisasi di API Gateway; akses Lambda ke DynamoDB dikontrol oleh role dan policy Lambda tersebut.
