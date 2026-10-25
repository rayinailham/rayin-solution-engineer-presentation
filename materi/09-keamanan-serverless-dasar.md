# Keamanan Serverless: Dasar

## Tujuan / Inti

Modul ini membahas **authentication, authorization**, serta bagaimana **API Gateway** dan **Amazon Cognito** dipakai dalam aplikasi serverless. Juga ditinjau bagaimana keamanan diterapkan di **semua layer** aplikasi serverless.

Tujuan belajar modul Securing:

- Membedakan **authentication** dan **authorization**.
- Menyebutkan opsi autentikasi ke API dengan **API Gateway**.
- Membedakan **Cognito user pools** dan **Cognito federated identities**.
- Menjelaskan bagaimana **ephemeral environment** dan **distributed perimeter** aplikasi serverless tercermin dalam security best practices.
- Mengidentifikasi metode dan layanan untuk menerapkan keamanan di **semua layer**.

> Catatan tambahan: Cognito dan keamanan API Gateway dibahas detail di `10-cognito-dan-keamanan-api-gateway.md`; keamanan Lambda, data store, dan auditing di `11-keamanan-lambda-data-dan-auditing.md`. File ini fokus pada **fondasi** keamanan serverless.

## Empat Fondasi Security Best Practice

Ada empat security best practice fondasi. Dalam konteks serverless, implementasi keamanan **berbeda** dari lingkungan tradisional. Empat hal yang membuat keamanan serverless berbeda:

### 1. Ephemeral environment (lingkungan singkat)

- Lingkungan ephemeral tempat **AWS Lambda** berjalan berarti penyerang yang mungkin mendapat pijakan (foothold) di dalam container **tidak mendapat akses** seperti pada lingkungan tradisional.
- Konsekuensinya: **logging dan metrics** yang kamu rancang jadi **lebih kritis**. Begitu kode selesai berjalan, kamu **tidak bisa** kembali ke server untuk mencari tahu apa yang terjadi.

### 2. Distributed perimeter (perimeter terdistribusi)

- Perimeter keamanan yang kamu pertahankan harus mempertimbangkan **berbagai service** yang mungkin memicu sebuah function.
- Kode kamu perlu mempertahankan **setiap jalur potensial** itu.

### 3. Fine-grained control (kontrol granular)

- Pakai kontrol granular Lambda untuk mempersempit jangkauannya dengan **set permission yang jauh lebih kecil** — berbeda dari pendekatan tradisional yang memberi permission luas untuk aplikasi di servernya.
- Scope function kamu untuk membatasi berbagi permission antar komponen yang tidak berhubungan.

### 4. Different tooling (perkakas berbeda)

- Tooling-nya berbeda. Contoh: teknik seperti **memasang agent di host** mungkin **tidak relevan lagi**.

## Shared Responsibility Model (Model Tanggung Jawab Bersama)

AWS mengikuti **shared responsibility model**: ada dua pihak yang bertanggung jawab mengamankan AWS.

- **AWS bertanggung jawab atas "security OF the cloud"** (keamanan *dari* cloud).
- **Customer bertanggung jawab atas "security IN the cloud"** (keamanan *di dalam* cloud).

### Pada layanan tradisional / infrastructure (mis. EC2)

**Tanggung jawab AWS:**

- **AWS global infrastructure** — data center fisik yang sesungguhnya; AWS mengamankannya.
- **AWS foundation services** — memastikan instance EC2 milik satu pelanggan dan pelanggan lain tidak bisa saling bicara, saling tahu, dan terisolasi. AWS bertanggung jawab atas keamanan **sampai lapisan hypervisor**.

**Tanggung jawab customer (pada infrastructure services seperti EC2):**

- **Patching operating system** secara rutin.
- Mengonfigurasi **network** dengan benar.
- Mengonfigurasi **firewall** dengan benar.
- **Mengenkripsi data** — banyak service AWS menawarkan enkripsi; kadang aktif default, kadang kamu harus mengaktifkannya sendiri untuk memenuhi tujuan keamanan dan compliance.
  - Termasuk **client-side data encryption** (mengenkripsi data sebelum dikirim ke service AWS) atau mengaktifkan fitur keamanan di service itu sendiri.
- Secara ringkas: dengan infrastructure services kamu masih bertanggung jawab atas **operating system, network, dan konfigurasi firewall**, serta **proteksi network traffic** dan enkripsi data **client-side maupun server-side**.
- Pada akhirnya: **data milikmu adalah tanggung jawabmu** — pastikan ada protective control seperti identity & access control dan enkripsi.

### Pada layanan serverless / abstracted services

Saat pindah ke serverless, garis tanggung jawab **naik ke atas (up the stack)**: **customer bertanggung jawab lebih sedikit**, **AWS bertanggung jawab lebih banyak**.

- Serverless services adalah **abstracted services**: di balik layar masih ada hal yang terjadi tanpa kamu lihat — kamu tinggal memakainya.
  - Contoh **S3**: kamu menyimpan file; di balik layar file disimpan di banyak fasilitas, direplikasi, dicek agar tidak korup — itu tanggung jawab AWS. Kamu tinggal memakai S3 dan memastikan hal seperti **enkripsi data**, **bucket policy** untuk membatasi akses.

**Tanggung jawab customer pada abstracted services:**

- **Access control** — siapa yang boleh meng-invoke service kamu, siapa yang boleh mengakses data, siapa yang boleh bekerja dengan solusimu.
- **Client-side encryption** — mengenkripsi data sebelum dikirim.
- **Kamu tetap memiliki datamu** — melindungi data yang masuk ke aplikasi dan membatasi akses ke resource AWS kamu.
- Kamu **tidak** bertanggung jawab atas operating system atau konfigurasi network tempat function berjalan; AWS menjamin keamanan data di dalam managed services. Kamu tetap harus melindungi data yang **berasal dari sisi client** atau yang **bergerak ke/dari endpoint di luar AWS**.

| Area | Infrastructure services (EC2) | Abstracted/serverless services |
|---|---|---|
| OS, patching | Customer | AWS |
| Network & firewall config | Customer | AWS |
| Global infrastructure & hypervisor | AWS | AWS |
| Keamanan data di dalam managed service | Customer (server-side) | AWS |
| Access control (siapa boleh akses) | Customer | Customer |
| Client-side encryption | Customer | Customer |
| Kepemilikan & proteksi data | Customer | Customer |

## Apply Security at All Layers (Defense in Depth)

Prinsip kunci: strategi keamanan harus menangani keamanan di **semua layer**. Pakai pendekatan **defense in depth** yang mencakup **banyak security control**. Terapkan prinsip desain keamanan di: **batas network, "pintu depan" aplikasi, antar komponennya, dan di dalam kode**.

### Layer-layer yang perlu diamankan (narasi video Morgan)

- **Edge network / VPC** — sekitar load balancer bisa dipasang **security group**.
- **Compute service** — dalam kasus serverless adalah **Lambda**; bagaimana mengamankannya.
- **API** — bagaimana mengamankan API.

### Contoh arsitektur defense in depth

Arsitektur contoh: **API Gateway → Lambda → DynamoDB**, dengan **CloudFront** di depan API Gateway, serta **AWS WAF** (web application firewall) dan **AWS Shield**.

Empat kategori kontrol yang diterapkan berlapis:

1. **Identity and access** (titik mulai):
   - **Amazon Cognito** untuk user yang melakukan autentikasi dan mendapat **JWT token** untuk membuktikan identitas dan izin akses ke API.
   - Bisa juga dikaitkan dengan **IAM permission** untuk mengakses API.
2. **Data protection:**
   - Di level **CloudFront** ada **field-level encryption** — jika user mengunggah data berisi **PII (personally identifiable information)**, kamu bisa mengenkripsi hanya field tersebut dan enkripsi itu mengalir melalui aplikasi.
   - Bisa mengenkripsi **logs** di API Gateway.
   - Di **Lambda** bisa menerapkan enkripsi (tergantung kode dan tujuan).
   - Bisa mengaktifkan enkripsi untuk tabel **DynamoDB** dan bucket **S3**.
3. **Attack protection:**
   - **AWS Shield** dan **AWS WAF** membantu melindungi dari **DDoS** dan serangan network lain. (Dibahas lebih lanjut di modul berikutnya.)
4. **Auditing and traceability:**
   - Layanan seperti **AWS X-Ray, CloudWatch, CloudTrail, dan Config**. (Dibahas di bab auditing.)

## Diagram (deskripsi)

Berdasarkan alt text dan narasi:

- **Security best practices** — ringkasan empat fondasi security best practice untuk serverless.
- **How serverless security is different from server-based security** — diagram empat marker: ephemeral environment, distributed perimeter, fine-grained control, dan different tooling.
- **Shared responsibility model with respect to serverless cloud applications** — menggambarkan garis tanggung jawab: pada infrastructure services customer bertanggung jawab atas OS/network/firewall/enkripsi; pada abstracted/serverless services garis naik sehingga AWS menanggung lebih banyak (OS, network, keamanan data internal) dan customer fokus pada access control, client-side encryption, dan kepemilikan data. Juga ilustrasi defense in depth: CloudFront + WAF + Shield di depan, API Gateway, Lambda, DynamoDB, dengan empat kategori kontrol (identity & access, data protection, attack protection, auditing & traceability).

## Poin Kunci untuk Presentasi

- Keamanan serverless berbeda dari tradisional lewat empat hal: **ephemeral environment**, **distributed perimeter**, **fine-grained control**, dan **different tooling**.
- **Ephemeral environment** membuat **logging dan metrics kritis** — setelah kode berjalan, kamu tidak bisa kembali ke server untuk menyelidiki; kirim log ke tempat persisten.
- Bedakan dengan jelas **authentication** (membuktikan siapa kamu) dan **authorization** (apa yang boleh kamu lakukan).
- **Shared responsibility model**: AWS mengamankan "security OF the cloud", customer mengamankan "security IN the cloud".
- Di serverless (**abstracted services**), garis tanggung jawab **naik**: AWS menangani OS/network/keamanan data internal; customer tetap menangani **access control, client-side encryption, dan kepemilikan/proteksi data**.
- Terapkan **defense in depth** — keamanan di semua layer: batas network, pintu depan aplikasi, antar komponen, dan di dalam kode.
- Arsitektur contoh berlapis: **Cognito** (identity & access) → **CloudFront field-level encryption + enkripsi DynamoDB/S3/logs** (data protection) → **Shield + WAF** (attack protection) → **X-Ray/CloudWatch/CloudTrail/Config** (auditing & traceability).
- Pakai **fine-grained control** Lambda untuk memberi permission sekecil mungkin dan mencegah berbagi permission antar komponen tak berhubungan.

## Kemungkinan Pertanyaan Audiens

**T: Apa beda authentication dan authorization?**
J: Authentication adalah verifikasi **identitas** (membuktikan siapa kamu, misal dengan username/password). Authorization adalah pemetaan **hak akses/izin** berdasarkan identitas itu (apa yang boleh kamu lakukan). Keduanya sering dibahas bersama tapi berbeda.

**T: Kenapa logging jadi lebih penting di serverless?**
J: Karena lingkungan serverless bersifat **ephemeral** — container Lambda dibongkar secara berkala. Setelah kode selesai berjalan, kamu tidak bisa kembali ke server untuk menyelidiki apa yang terjadi, sehingga log dan metrics yang kamu rancang serta pengiriman log ke penyimpanan persisten menjadi krusial untuk investigasi.

**T: Dalam shared responsibility model, apa yang menjadi tanggung jawab customer pada layanan serverless?**
J: Pada abstracted/serverless services, customer tetap bertanggung jawab atas **access control** (siapa boleh invoke/akses data), **client-side encryption**, dan **melindungi serta memiliki datanya** — termasuk data dari sisi client atau yang bergerak ke/dari endpoint di luar AWS. AWS menangani OS, konfigurasi network, dan keamanan data di dalam managed service.

**T: Apa itu defense in depth dalam konteks serverless?**
J: Menerapkan **banyak lapisan kontrol keamanan** di semua layer: batas network (security group/VPC), pintu depan aplikasi (CloudFront, WAF, Shield), identity & access (Cognito, IAM), proteksi data (field-level encryption, enkripsi DynamoDB/S3/logs), hingga di dalam kode, plus auditing (X-Ray, CloudWatch, CloudTrail, Config).

**T: Kenapa fine-grained control penting untuk Lambda?**
J: Supaya setiap function hanya punya **permission sekecil mungkin** (least privilege). Jika satu function dikompromikan, dampaknya terbatas karena tidak berbagi permission luas dengan komponen lain yang tidak berhubungan.
