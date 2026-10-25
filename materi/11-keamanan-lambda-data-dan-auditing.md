# Keamanan Lambda, Data Store, dan Auditing

## Tujuan / Inti

Bab ini menutup modul keamanan serverless dengan tiga topik:

1. **AWS Lambda and Application Security** — mengontrol akses function (least privilege), Lambda dengan VPC, melindungi data (environment variables, Parameter Store, Secrets Manager), dan melindungi function dari serangan.
2. **Protecting Data Stores** — melindungi data di S3 dan DynamoDB (access policy, block public access, enkripsi at rest).
3. **Auditing, Traceability, and Security Automation** — CloudTrail, AWS Config, EventBridge, CloudWatch alarms, WAF untuk audit dan otomasi keamanan.

---

## Bagian 1: AWS Lambda and Application Security

### Mengontrol akses function dengan least privilege

- Saat Lambda berinteraksi dengan resource AWS lain (mis. tabel **DynamoDB**), function memakai **AWS SDK**. Pastikan **execution role** function punya permission untuk action AWS yang dipakai di SDK.
- Saat membuat execution role, pakai **principle of least privilege**.

Contoh dari video dengan empat function:

- **get function** — hanya butuh **DynamoDB GetItem**.
- **store function** — hanya butuh **DynamoDB PutItem**.
- **stream function** — butuh beberapa API: **DescribeStream, GetRecords, GetShardIterator, ListStreams**, dll.
- **contest function** — tidak mengakses DynamoDB → **tidak** diberi permission DynamoDB apa pun.

Prinsipnya: jangan beri `DynamoDB:*` (semua action). Batasi hanya akses yang dibutuhkan. Jika satu function dikompromikan, ia hanya punya akses ke satu API spesifik, tidak bisa elevasi permission dan menjelajah semua data.

Dari slide (**Lambda function permissions**): permission function harus **segranular mungkin**; batasi lewat execution role. get function hanya **read** untuk tabel **Bookmarks**, store function punya izin **write**. Tiap function diberi permission secukupnya; jika perlu permission luas, pertimbangkan **memecah function**. stream function punya permission spesifik membaca record dari **DynamoDB stream** tabel Bookmarks.

Dua marker tambahan:

1. **Use granular invoke permissions** — invoke permission untuk get dan store Lambda di-scope lewat cara API didefinisikan dan diintegrasikan dengan Lambda. Tiap method hanya berizin meng-invoke function yang terkait method itu; **contest function** hanya bisa di-invoke oleh **Amazon EventBridge rule** yang terkait. **Resource-based policy** tiap function yang mengontrol permission ini.
2. **Limit the scope of the execution role** — batasi apa yang bisa dilakukan function lewat execution role; get hanya read, store boleh write; beri permission secukupnya; bila perlu luas, pecah function.

### Lambda dan VPC

Secara default, resource di dalam VPC **tidak** bisa diakses dari Lambda function. Kamu harus menyiapkan koneksi. Tiga aspek keamanan:

#### A. Security saat mengakses VPC resources dari Lambda

Contoh: satu Lambda function dengan beberapa invocation (4 di diagram) ingin mengakses resource di dalam VPC — aplikasi di **EC2 instance** dan data di **Amazon RDS**.

Langkah:

- Aktifkan function agar bisa mengakses resource di VPC.
- Sediakan konfigurasi VPC spesifik: **VPC subnet IDs**, **security group IDs**, dan subnet yang dituju.
- Lambda memakai info ini untuk menyiapkan **elastic network interface (ENI)** di setiap subnet yang dikonfigurasi.
- Beberapa invocation berbagi ENI ini — disebut **hyperplane ENI** (bisa berbagi ENI).
- Lalu function bisa mengakses resource di private subnet.
- Catatan: dulu tiap invocation harus spin up ENI sendiri; kini ENI bisa dibagi. ENI itu **ditorn down** setelah beberapa waktu, jadi harus dibuat ulang bila ada execution environment baru pertama kali.
- Dari slide: setelah function bisa akses VPC, **semua traffic tunduk pada routing rules VPC** — hanya bisa menarget **private subnet** dan **tidak ada outbound route langsung**. Jika butuh akses internet publik, perlu route ke internet via **NAT gateway**.
- Execution role Lambda harus punya permission **create, describe, delete elastic network interfaces**; AWS menyediakan policy bernama **AWSLambdaVPCAccessExecutionRole** dengan permission yang dibutuhkan. AWS menggunakan ulang ENI untuk merutekan banyak instance function ke VPC resources.

#### B. Security saat mengakses Lambda dari VPC-mu

- Jika satu-satunya alasan butuh internet publik adalah akses ke **public API Lambda**, kamu bisa pakai **VPC interface endpoint** untuk Lambda dan menjaga traffic tetap sepenuhnya di dalam VPC.
- Contoh video: kode di EC2 instance ingin meng-invoke Lambda function downstream → buat **VPC interface endpoint**, rutekan traffic lewat endpoint itu untuk sampai ke Lambda function.

#### C. Memastikan Lambda dideploy dengan VPC configuration

- Pakai **condition keys** (key khusus dalam IAM policy) untuk:
  - Mencegah deployment function di akunmu jika **tidak** dikonfigurasi dengan private VPC.
  - Mencegah function dibuat tanpa **subnet dan security group** tertentu di konfigurasi VPC.
- Ini mengunci lingkungan AWS agar resource dibuat sesuai standar keamanan/compliance.

### Melindungi data (Protecting data)

Tiga opsi memberi data ke Lambda function:

| Opsi | Scope | Shareable? | Rotasi secret | Throughput & biaya | Enkripsi |
|---|---|---|---|---|---|
| **Environment variables** | Satu function saja | **Tidak** (spesifik ke satu function) | — | Tidak ada batas throughput/biaya | Bisa pakai AWS managed atau customer managed keys |
| **Systems Manager Parameter Store** | Bisa dibagi lintas aplikasi/function (via API call + AWS SDK for SSM) | Ya | Tidak | **Biaya lebih rendah, throughput lebih rendah** dari Secrets Manager | Bisa dienkripsi (AWS/customer managed keys) |
| **AWS Secrets Manager** | Bisa dibagi lintas aplikasi/function | Ya | **Ya** (rotasi secret + cross-account access) | **Biaya lebih tinggi, throughput lebih tinggi** | Bisa dienkripsi (AWS/customer managed keys) |

Catatan dari video & slide:

- **Environment variables** dibuat langsung bersama Lambda function sebagai konfigurasi; berguna untuk nilai seperti **table name** atau **S3 bucket name** agar tidak hard-code; jika nilai berubah cukup ubah environment variable, tanpa CodeDeploy.
- **Parameter Store** menyimpan key-value pair; kode memakai AWS SDK for SSM untuk mengambilnya.
- **Secrets Manager** untuk menyimpan secret. Contoh: kredensial database perlu dirotasi tiap **30 hari** — jangan manual (bisa lupa/menimbulkan masalah). Set up secret + **rotation schedule**; Secrets Manager merotasi dan membuat secret baru; aplikasi me-refresh secret tiap API call ke database.
- Ketiganya bisa pakai **AWS managed atau customer managed keys** untuk melindungi informasi sensitif.
- Secrets Manager mendukung rotasi tanpa mengganggu aplikasi untuk **Amazon RDS, Amazon Redshift, dan DocumentDB**, serta mengamankan akses ke kredensial dengan IAM.

Contoh alur Secrets Manager (video): Lambda function (dengan kode) menjangkau Secrets Manager untuk mengunduh secret → secret dikembalikan → dipakai untuk connect ke **RDS**. Saat perlu rotasi, set rotation schedule di Secrets Manager yang akan merotasi secret.

### Melindungi function dari serangan

Empat langkah:

1. **Reduce dependency vulnerabilities** — kontrol dependency di deployment package. AWS Lambda execution environment berisi sejumlah library (mis. AWS SDK untuk runtime Node.js dan Python); Lambda memperbarui library ini secara berkala untuk fitur dan security update, yang bisa memperkenalkan perubahan perilaku halus. Untuk kontrol penuh, **package semua dependency** dengan deployment package dan kurangi dependency vulnerabilities.
2. **Protect against SQL injection attacks** — Lambda dipicu event yang mengirim event parameter.
   - **SQL injection**: user mengetik kode SQL (mis. drop table, query baris data) ke form text terbuka lalu submit ke backend. Jika tidak memakai parameterized query atau tidak meng-escape/membersihkan input, kode SQL itu dikirim langsung ke database, dianggap SQL (bukan nilai field), dieksekusi, dan bisa mengembalikan data ke penyerang, drop table, atau merusak data.
   - Contoh **rentan** (konkatenasi string): `SELECT * from Employees WHERE fname =` lalu input ditempel langsung dengan `+` → tidak aman.
   - Contoh **aman** (prepared statement, Java): `SELECT * FROM EMPLOYEES WHERE fname =?`, lalu set parameter di posisi 1 dengan input, baru execute. Memakai **prepared/pre-compiled SQL statements** mencegah SQL injection; pakai **ORM** juga membantu. Parameterkan query agar function mengharapkan satu input tunggal.
3. **Use Lambda code signing** — mencegah perubahan deployment package yang akan berjalan di Lambda. Admin membuat **resource code-signing configuration**; tiap profil punya **signature validation policy** yang **warn** (izinkan upload tak bertanda) atau **deny** upload kode yang tidak ditandatangani dengan signature benar. Buat policy yang warn atau deny deployment yang gagal signing profile. Tandatangani (**AWS-SHA384-ECDSA**) deployment package untuk memastikan kode tidak diubah.
4. **Protect database credentials** — pakai **Secrets Manager** yang: menyimpan kredensial secara aman; memberi SDK methods untuk mengambilnya; merotasi kredensial tanpa mengganggu aplikasi (RDS, Redshift, DocumentDB) — memudahkan pakai kredensial sementara dibanding kredensial jangka panjang yang kurang aman; mengamankan akses ke kredensial dengan IAM.

---

## Bagian 2: Protecting Data in Serverless Data Stores

### Melindungi data di Amazon S3

Resource S3 — **bucket, object, dan sub-resource terkait** — bersifat **private** secara default: hanya **resource owner** (akun AWS yang membuatnya) yang bisa mengaksesnya. S3 mendukung dua tipe access policy:

- **Identity-based (user) policy** — permission terkait **identitas**; pemilik identitas bisa melakukan action di policy.
- **Resource-based (bucket) policy** — permission terkait **bucket atau object**. Contoh: menolak operasi pada bucket tertentu kecuali request berasal dari rentang IP tertentu. **Access control list (ACL)** adalah contoh lain resource-based policy.

Dari video, tempat melindungi data S3:

- **Private by default** — bucket dan object privat secara default.
- **Block public access** — mencegah paparan publik tak sengaja atas object; umumnya object S3 dijaga privat.
- **Bucket policy** — resource-based policy yang menempel langsung ke satu bucket; memakai bahasa gaya IAM untuk mendefinisikan **principal** yang diizinkan, **action** apa, terhadap **resource** mana, dan dalam **kondisi** apa (mis. hanya jika traffic dari VPC tertentu).
- **Origin access control** dari **CloudFront** — mengunci bucket sehingga hanya CloudFront yang bisa berinteraksi dengan S3; referensikan distribusi CloudFront langsung di bucket policy.
- **IAM entity permissions** — mis. role yang mengakses bucket bisa diberi izin di role atau di bucket policy; **best practice: pakai keduanya** (IAM policy + bucket policy).
- Dalam satu akun, memodifikasi resource-based policy mungkin tak selalu perlu, tapi best practice tetap pakai keduanya.

Dua hotspot (slide):

1. **Protecting objects in Amazon S3** — default semua resource S3 privat; hanya owner yang bisa akses. S3 mendukung identity-based dan resource-based policy. Best practice: **terapkan kedua tipe** — beri **least privilege** ke user/group/role dan kunci masing-masing resource.
2. **Origin access identity (OAI)** — kamu mungkin memakai S3 untuk meng-host data statis bagi aplikasi web publik; memakai **OAI** dengan CloudFront mengunci bucket sehingga hanya CloudFront yang bisa membacanya.

### Melindungi data at rest (enkripsi)

AWS data stores menyediakan **encryption at rest** lewat opsi konfigurasi yang kamu kontrol, memanfaatkan **AWS Key Management Service (AWS KMS)** dan key yang kamu atau AWS kelola.

**Amazon DynamoDB:**

- Semua data di DynamoDB **fully encrypted at rest** memakai encryption keys yang disimpan di **AWS KMS**.
- Kamu memilih memakai **AWS service keys** atau **customer managed keys** saat membuat tabel.
- Melindungi data begitu ditulis ke disk; untuk data sangat sensitif bisa dienkripsi dulu sebelum dikirim ke DynamoDB, lalu dienkripsi lagi saat ditulis ke disk.

**Amazon S3** — tiga opsi server-side encryption:

| Opsi | Keterangan |
|---|---|
| **SSE-S3 (Amazon S3 managed keys)** | S3 mengelola proses enkripsi/dekripsi dan key-nya untukmu. |
| **SSE-KMS (AWS KMS keys stored in AWS KMS)** | Key disimpan di KMS; S3 memakai KMS key untuk enkripsi/dekripsi object. Memberi **audit trail** — bisa melihat siapa memakai key, lebih banyak visibilitas dan kontrol; cocok untuk standar compliance tinggi. |
| **SSE-C (Customer provided keys)** | Kamu menyediakan key sendiri; sertakan pada request saat mem-posting object ke S3 untuk memberi tahu tipe enkripsi yang diinginkan. |

- S3 bisa dikonfigurasi untuk **otomatis mengenkripsi object sebelum menyimpannya** jika request penyimpanan masuk tidak membawa informasi enkripsi — dan ini kini **perilaku default**: secara default **semua object di S3 dienkripsi**.

---

## Bagian 3: Auditing, Traceability, and Security Automation

Best practice: **monitor, alert, dan audit** aksi dalam lingkunganmu secara **real time**, dan integrasikan pengumpulan log dan metric agar bisa otomatis menyelidiki event (mis. event terkait keamanan). Kadang kamu bisa melihat saat API call tertentu naik tak terduga atau error rate naik (mis. assume-role terus ditolak) — indikasi event keamanan.

### CloudTrail

- Diaktifkan di akun dan **menangkap API activity** di akun itu, termasuk record dari **IAM users, roles, dan AWS service APIs**.
- Contoh: jika seseorang membuat resource API Gateway, itu membuat record di CloudTrail yang di-log.
- Log bisa dianalisis, dipakai memicu event lain, dan membentuk **trail** yang bisa dilihat untuk event history akun.
- Memberi detail penuh aksi API: **siapa** yang membuat request, **apa** request-nya, **apa** response-nya, **timestamp**, terhadap **resource mana**.
- Bisa melacak event pada/dalam resource di **S3 bucket** — sampai level **object**.
- Melacak pola normal volume API call dan bisa menghasilkan insight via **AWS CloudTrail Insights** (mis. API call yang biasanya jarang tiba-tiba sering → indikasi masalah).

### AWS Config

- Membantu **mengaudit akun**: mengambil inventory semua resource dan melihat **konfigurasinya**.
- Mengevaluasi apakah resource **compliant** terhadap standar konfigurasi.
- Contoh: untuk alasan compliance, resource tertentu harus punya konfigurasi tertentu — mis. memastikan API hanya boleh dibuat sebagai **private API**. Jika seseorang membuat API Gateway, Config mengevaluasi resource itu terhadap standar dan menentukan compliant atau tidak.
- Jika tidak compliant, pakai **remediation actions**: mengubah konfigurasi, menghapus resource, atau membuat **runbook** (mis. email owner bahwa resource akan dihapus dalam waktu tertentu kecuali diperbaiki).

Ringkasan peran:

- **CloudTrail** menjawab: **resource mana** yang dimodifikasi, **siapa** memodifikasi, **kapan** dimodifikasi.
- **Config** menjawab: apakah modifikasi ini **comply** dengan aturan kita, dan **bagaimana resource saling berhubungan** (karena mengambil inventory resource).

### Security automation examples (4 marker)

1. **AWS WAF** — menyediakan set **AWS managed rules** untuk proteksi terhadap kerentanan aplikasi umum atau traffic tak diinginkan, tanpa harus menulis rule sendiri. Kamu bisa mengotomasi update rule WAF memakai **Lambda** yang menganalisis web log, mengidentifikasi request berbahaya, dan otomatis memperbarui security rule — mis. memblokir IP address yang mengirim request melebihi ambang tertentu.
2. **AWS Config** — set AWS managed rules untuk mengevaluasi kepatuhan resource terhadap best practice umum; bisa tulis custom rules. Rule mengidentifikasi resource compliant atau tidak; remediasi manual atau otomatis. Contoh: memaksa API di API Gateway harus **private**; percobaan mengubah ke Regional/edge API bisa meng-invoke function untuk mengembalikannya ke private endpoint.
3. **CloudTrail and EventBridge** — CloudTrail bisa mendeteksi saat **management API calls** dibuat terhadap API Gateway dan mengirim notifikasi ke **EventBridge**. EventBridge adalah **serverless event bus** yang menghubungkan aplikasi dengan data dari berbagai sumber dan bisa mengarahkan pesan ke berbagai target berdasarkan rule yang cocok. Contoh: rule untuk meng-invoke Lambda function saat API dibuat, diperbarui, atau dihapus.
4. **CloudWatch alarms** — bisa mengirim notifikasi ke **Amazon SNS topic**. Saat ambang target error rate terlampaui, subscriber bisa menerima email, Lambda function bisa di-invoke, atau pesan dipublish ke target HTTP/S.

Catatan tambahan dari video:

- **WAF** bisa otomatis memblokir IP address yang datang dengan volume tinggi (buat rule untuk memfilter traffic).
- **Config** memantau lingkungan terus-menerus (mis. apakah API Gateway dibuat private, apakah S3 bucket private atau dibuat publik).
- **EventBridge** menangkap AWS service events; mis. di lingkungan dengan scrutiny tinggi, saat seseorang membuat resource API Gateway, bisa spin up Lambda untuk analisis kompleks lalu kirim email atau ambil aksi otomatis.
- **CloudWatch alarms**: kirim email saat ambang error rate terlampaui (mis. banyak permission-denied atau 500 errors) — notifikasi push via SNS (text/email) alih-alih polling manual.

### Rangkuman modul keamanan (dari video penutup)

- Pertimbangkan sifat **ephemeral environment** — lingkungan dibongkar berkala; **logging dan shipping log ke tempat persisten** sangat penting untuk investigasi.
- Pertimbangkan **distributed perimeter** — terapkan keamanan di **semua layer**, lihat tiap service dan fitur keamanannya.
- Terapkan **strong identity and access foundation** termasuk **principle of least privilege**.
- Lindungi data **in transit dan at rest**, opsional **client-side encryption**.
- Lindungi dari serangan dengan **Shield atau WAF**; pastikan kode aman dari **SQL injection** dan serangan lain.
- Pastikan **auditing dan traceability** aktif dan otomasi best practice keamanan sebanyak mungkin dengan layanan seperti **AWS Config**.

## Diagram (deskripsi)

Berdasarkan alt text dan narasi:

- **Lambda function permissions scope** — empat function (get, store, stream, contest) dengan execution role berbeda; get = GetItem (read), store = PutItem (write), stream = DescribeStream/GetRecords/GetShardIterator/ListStreams, contest = tanpa permission DynamoDB — menggambarkan least privilege.
- **Lambda and VPCs** — satu Lambda function dengan beberapa invocation berbagi **hyperplane ENI** di subnet yang dikonfigurasi untuk mengakses EC2 dan RDS di private subnet; contoh lanjutan memakai VPC interface endpoint untuk meng-invoke Lambda downstream dari EC2.
- **SQL injection attack** — menggambarkan event parameter (`event input`) yang dikonkatenasi langsung ke string SQL (rentan) vs prepared statement dengan parameter `?` (aman).
- **Protecting database credentials** — Lambda mengunduh secret dari Secrets Manager untuk connect ke RDS; rotation schedule merotasi secret.
- **Protecting data in Amazon S3** — identity-based vs resource-based policy; block public access; OAI/OAC dengan CloudFront mengunci bucket; best practice pakai IAM policy + bucket policy.
- **Protecting data at rest** — DynamoDB terenkripsi penuh via KMS; S3 tiga opsi SSE (SSE-S3, SSE-KMS, SSE-C) dengan enkripsi default.
- **Security automation tools** — WAF, Config, CloudTrail+EventBridge, dan CloudWatch alarms bekerja bersama untuk security check dan remediation otomatis.

## Poin Kunci untuk Presentasi

- **Least privilege** untuk execution role Lambda: tiap function hanya diberi action yang dibutuhkan (get=read, store=write); jika perlu luas, **pecah function**. Resource-based policy mengontrol siapa yang boleh invoke tiap function.
- **Lambda + VPC**: sediakan subnet ID + security group ID; Lambda membuat **ENI (hyperplane ENI)**; semua traffic tunduk routing VPC (hanya private subnet, butuh **NAT gateway** untuk internet); role butuh **AWSLambdaVPCAccessExecutionRole**; **VPC interface endpoint** menjaga traffic ke API Lambda tetap internal; **condition keys** memaksa deployment ber-VPC.
- **Melindungi data Lambda**: environment variables (satu function), **Parameter Store** (shareable, murah), **Secrets Manager** (shareable, bisa **rotasi secret**, throughput tinggi); ketiganya bisa enkripsi via AWS/customer managed keys.
- **Proteksi function dari serangan**: reduce dependency vulnerabilities, cegah **SQL injection** (prepared statement/parameterized query/ORM), **Lambda code signing** (AWS-SHA384-ECDSA), lindungi kredensial DB via Secrets Manager.
- **S3**: privat by default + **block public access**; **bucket policy** (resource-based) + **IAM policy** (identity-based) → best practice pakai keduanya; **OAI/OAC** mengunci bucket hanya untuk CloudFront.
- **Enkripsi at rest**: DynamoDB terenkripsi penuh via **KMS**; S3 punya **SSE-S3, SSE-KMS (audit trail), SSE-C**, dan enkripsi default aktif.
- **Auditing**: **CloudTrail** = siapa/apa/kapan/resource mana (plus CloudTrail Insights, sampai level object S3); **AWS Config** = compliance konfigurasi + remediation, serta relasi antar resource.
- **Security automation**: **WAF** (managed rules + blokir IP via Lambda), **Config** (evaluasi & remediasi), **CloudTrail + EventBridge** (trigger Lambda saat resource dibuat/ubah/hapus), **CloudWatch alarms → SNS** (email/Lambda/HTTP saat error rate terlampaui).

## Kemungkinan Pertanyaan Audiens

**T: Bagaimana menerapkan least privilege pada Lambda?**
J: Beri execution role tiap function hanya action yang benar-benar dipakai lewat AWS SDK — misalnya get function hanya `DynamoDB:GetItem`, store function hanya `DynamoDB:PutItem`, dan function yang tidak menyentuh DynamoDB tidak diberi izin DynamoDB. Jangan pakai wildcard seperti `DynamoDB:*`. Jika sebuah function butuh izin luas, pertimbangkan memecahnya.

**T: Kenapa Lambda butuh konfigurasi khusus untuk mengakses resource di VPC?**
J: Secara default resource di VPC tidak bisa diakses dari Lambda. Kamu harus memberi subnet ID dan security group ID; Lambda lalu membuat ENI (hyperplane ENI) di subnet itu. Setelah terhubung, semua traffic tunduk pada routing VPC — hanya bisa menarget private subnet dan butuh NAT gateway untuk internet. Role juga perlu izin membuat/describe/delete ENI (policy AWSLambdaVPCAccessExecutionRole).

**T: Kapan pakai environment variables, Parameter Store, atau Secrets Manager?**
J: **Environment variables** untuk nilai sederhana spesifik satu function (mis. nama tabel/bucket), tidak bisa dibagi. **Parameter Store** untuk key-value yang dibagi lintas aplikasi, biaya dan throughput lebih rendah. **Secrets Manager** untuk secret yang perlu **rotasi otomatis** (mis. kredensial DB) dan cross-account, dengan throughput lebih tinggi. Ketiganya mendukung enkripsi dengan AWS atau customer managed keys.

**T: Bagaimana mencegah SQL injection di Lambda?**
J: Jangan mengkonkatenasi input langsung ke string SQL. Gunakan **prepared/pre-compiled statements** (parameterized query dengan placeholder `?`) sehingga function hanya mengharapkan satu input tunggal, atau gunakan **ORM**. Ini membuat input diperlakukan sebagai nilai, bukan perintah SQL.

**T: Apa beda SSE-S3, SSE-KMS, dan SSE-C di S3?**
J: **SSE-S3** = S3 mengelola key dan proses enkripsi/dekripsi. **SSE-KMS** = key disimpan di KMS, memberi audit trail dan kontrol lebih (cocok compliance tinggi). **SSE-C** = kamu menyediakan key sendiri dan menyertakannya pada request. S3 juga mengenkripsi object secara default.

**T: Apa beda peran CloudTrail dan AWS Config?**
J: **CloudTrail** mencatat aktivitas API — menjawab resource mana yang diubah, siapa yang mengubah, dan kapan (bahkan sampai level object S3, dengan CloudTrail Insights untuk anomali volume API). **AWS Config** mengaudit konfigurasi resource — menjawab apakah perubahan mematuhi aturan compliance dan bagaimana resource saling berhubungan, lengkap dengan remediation untuk resource yang tidak compliant.

**T: Bagaimana mengotomasi respons keamanan di AWS?**
J: Gunakan **WAF** (managed rules + Lambda untuk blokir IP di atas ambang), **AWS Config** (evaluasi kepatuhan + remediasi otomatis, mis. kembalikan API ke private), **CloudTrail + EventBridge** (trigger Lambda saat API dibuat/diubah/dihapus), dan **CloudWatch alarms** yang mengirim notifikasi ke SNS (email), meng-invoke Lambda, atau publish ke target HTTP/S saat error rate melewati ambang.
