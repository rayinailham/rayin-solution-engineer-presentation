# Amazon SNS (Simple Notification Service)

## Tujuan / Inti

**Amazon SNS** adalah web service untuk menyiapkan, mengoperasikan, dan mengirim notifikasi dari cloud. Mengikuti paradigma messaging **publish-subscribe (pub-sub)**: notifikasi dikirim ke klien memakai mekanisme **push**.

Amazon SQS dan Amazon SNS sama-sama memfasilitasi komunikasi antar komponen yang loosely coupled dalam aplikasi serverless. File ini membahas SNS, arsitektur **fan-out**, serta perbandingan **SNS vs SQS** dan **EventBridge vs SNS**.

## Apa itu Amazon SNS

Cara kerja inti (narasi Russell di video):

- Di dalam SNS kamu membuat **topic**.
- Kode menulis message ke topic itu.
- Satu topic punya **banyak subscriber**.
- Mekanisme pengiriman adalah **push**: subscriber akan menerima notifikasi (bukan menarik/polling seperti SQS).

Model pub-sub lebih detail:

- Kamu membuat topic dan mengontrol akses dengan mendefinisikan **policy** yang menentukan publisher dan subscriber mana yang boleh berkomunikasi dengan topic.
- **Publisher** mengirim message ke topic (yang ia buat atau yang ia punya izin publish).
- Alih-alih mencantumkan alamat tujuan spesifik di tiap message, publisher mengirim message ke **topic**.
- SNS mencocokkan topic ke daftar subscriber-nya, lalu mengirim message ke **setiap subscriber**.
- Tiap topic punya **nama unik** yang mengidentifikasi endpoint SNS tempat publisher mem-posting message dan tempat subscriber mendaftar notifikasi.
- Semua subscriber pada satu topic menerima **message yang sama**.

### Tipe subscriber (endpoint)

Dari diagram dan narasi, subscriber sebuah topic bisa berupa:

- **Email**
- **SMS**
- **Mobile push** (Apple, Google, Kindle Fire)
- **HTTP / HTTPS endpoint** (aplikasi lain)
- **AWS Lambda** (function)
- **Amazon SQS** queue (bisa beberapa queue di-attach ke satu topic)
- **Amazon Kinesis Data Firehose** — konsep serupa; Firehose mengotomasi pengiriman data ke service AWS seperti **S3**

### Kenapa pakai SNS

- **Amazon CloudWatch** terintegrasi dengan SNS: saat membuat CloudWatch alarm, ada konfigurasi *"ketika masuk status alarm, kirim message ke topic ini"*. Lalu alamat email bisa di-subscribe ke topic itu.
- **Email dan SMS** untuk mailing list.
- **Push notification** untuk update aplikasi — misal aplikasi mobile yang memberi tahu "mobilmu segera tiba" mengirim pesan via SNS.

## Karakteristik Amazon SNS

- **Single published message → multiple subscribers**: satu message yang dipublish dikirim ke banyak subscriber (email, mobile push, SQS queue, dll).
- **No recall options**: sekali message terkirim, tidak bisa ditarik kembali; akan terkirim ke subscriber. Kalau butuh "pembatalan", harus dibangun di aplikasi sebagai tipe message lain (*"abaikan pesan sebelumnya"*).
- **HTTP/HTTPS retry**: salah satu subscriber bisa berupa endpoint HTTPS. Kamu bisa mengonfigurasi jumlah **retry** bila server kebetulan sedang reboot atau ada gangguan jaringan sesaat (misal retry 3 kali, 10 kali) — dapat dikonfigurasi per subscription.
- **Standard atau FIFO topics**: FIFO topic dipakai saat **urutan** dan **deduplikasi** pesan penting. Pada FIFO topic kamu perlu memberikan **deduplication ID**; jika ID yang sama terlihat dua kali, pesan hanya dikirim sekali.

Karakteristik tambahan (dari slide):

- Saat message terkirim sukses, **tidak ada cara menariknya kembali**.
- Bisa pakai **SNS Delivery Policy** untuk mengontrol pola retry: *linear, geometric, exponential backoff*, delay retry maksimum/minimum, dan pola lain.
- Untuk mencegah pesan hilang, semua pesan **disimpan redundan** di banyak server dan data center.
- SNS dirancang untuk aplikasi terbesar dan paling menuntut; aplikasi bisa mem-publish banyak pesan kapan saja.
- **Mobile Push notification** mendukung Apple, Google, Kindle Fire; HTTP/HTTPS; email atau email-JSON; SMS; SQS queue; atau Lambda function.
- SNS menyediakan **mekanisme access control** untuk melindungi topic dan pesan dari akses tak sah. Pemilik topic bisa menetapkan policy yang membatasi siapa yang boleh publish/subscribe, dan bisa mewajibkan mekanisme pengiriman memakai **HTTPS** (enkripsi).

### Use case SNS (3 marker)

1. **Notifikasi event langsung** — menerima notifikasi segera saat sebuah event terjadi, misalnya perubahan tertentu pada **Auto Scaling group**.
2. **News headlines** — mendorong (push) berita bertarget ke subscriber via email atau SMS; penerima bisa memilih "pelajari lebih lanjut" dengan membuka website atau meluncurkan aplikasi.
3. **App update notification** — mengirim notifikasi ke aplikasi bahwa update tersedia; pesan bisa menyertakan link untuk mengunduh dan memasang update.

## Arsitektur Fan-out (SNS + SQS)

Memakai layanan highly available seperti SNS untuk *message routing* dasar adalah cara efektif mendistribusikan pesan ke microservices. Dua bentuk komunikasi utama antar microservices: **request-response** dan **observer**.

Dalam skenario **fan-out**: satu message dikirim ke SNS topic, lalu **direplikasi** dan di-push ke banyak **SQS queue**, HTTP endpoint, atau alamat email → memungkinkan **pemrosesan paralel asinkron**.

Contoh dari video (satu order masuk):

1. Terjadi event di aplikasi: **online order diterima** (misal ada yang memesan mainan mandi/bath toy).
2. Aplikasi mengirim **satu notifikasi** ke SNS → dari sudut pandang aplikasi, ini **langsung selesai** (satu API call), walau ingin dua jenis pemrosesan berbeda.
3. Dari SNS, **dua SQS queue** berbeda di-subscribe ke topic.
4. Tiap queue punya aplikasi consumer:
   - **Queue 1 → order processing**: memproses/memenuhi order (kirim barang ke pembeli). Dalam contoh diagram, dua instance EC2 masing-masing mengamati satu queue; satu menangani fulfillment order.
   - **Queue 2 → analysis**: menganalisis semua order ("mainan mandi lagi populer" → update analisis, mungkin iklankan di halaman depan). Instance kedua terhubung ke **data warehouse** untuk analisis.
5. Ke depan bisa ada 10 jenis pemrosesan; cukup tambah queue + aplikasi baru. Misal **kontrol inventory** = satu queue tambahan + satu aplikasi tambahan.

Inti fan-out: satu event di aplikasi (online order diterima) memicu banyak bentuk pemrosesan asinkron, sementara aplikasi cukup mengirim **satu notifikasi** — menyederhanakan aplikasi dan men-*decouple* fakta "order baru tiba" dari jumlah pemrosesan yang mengikutinya.

### Cara men-subscribe SQS queue ke SNS topic

- Untuk mengirim notifikasi SNS ke SQS queue: subscribe ke topic, tentukan **Amazon SQS sebagai transport** dan **SQS queue valid sebagai endpoint**.
- Agar SQS queue boleh menerima notifikasi dari SNS, **pemilik SQS queue** harus men-subscribe queue tersebut ke topic SNS.
- Jika pemilik SNS topic **sama** dengan pemilik SQS queue → tidak perlu apa-apa lagi; setiap pesan ke topic otomatis dikirim ke SQS queue.
- Jika pemilik SQS queue **berbeda** dari pemilik SNS topic → SNS mewajibkan **konfirmasi eksplisit** atas permintaan subscription.

## Perbandingan Amazon SNS vs Amazon SQS

| Aspek | Amazon SNS | Amazon SQS |
|---|---|---|
| **Message persistence** | Tidak persisten. SNS mendefinisikan delivery policy per protokol; saat delivery policy habis, SNS berhenti retry dan **membuang pesan**, kecuali ada **dead-letter queue** yang di-attach ke subscription. | Mem-persisten pesan di queue sesuai konfigurasi, dan mengarahkan pesan gagal ke **dead-letter queue**. |
| **Delivery mechanism** | **Push** — mengirim pesan time-critical ke banyak subscriber. | **Polling** — pengirim dan penerima decoupled; consumer mem-polling queue (short/long polling). |
| **Producer & consumer** | Model **publish-subscribe**: publisher mempublish ke banyak subscriber. | Pesan ditaruh di queue; consumer harus **polling** queue untuk mengambil pesan. |
| **Distribution model** | **One-to-many** (satu event, banyak aplikasi tertarik). | **One-to-one** (satu pesan ditulis, satu consumer memprosesnya). |

Ilustrasi video: SNS = "sebuah trade saham baru terjadi", banyak aplikasi tertarik pada notifikasi itu (one-to-many). SQS = "tolong update satu record database", satu consumer memproses (one-to-one).

## Memilih antara Amazon EventBridge dan Amazon SNS

Perbandingan fitur (dari materi):

**Keunggulan / karakteristik EventBridge:**

- Punya **native integration** untuk lebih banyak **event source dan target**, dan makin banyak **integrasi SaaS**. SNS tidak punya ini.
- **Routing rules** yang bisa dibuat lebih **advanced**. Namun, penyetelannya bisa sedikit lebih banyak kerja dibanding SNS.
- Punya **SchemaRegistry** untuk menstandarkan cara tim menulis event.
- **Retention period 24 jam**.

**Keunggulan / karakteristik SNS:**

- Cocok untuk **email dan SMS subscription**, juga untuk workflow yang memakai **polling** (contoh pola **webhooks** atau **WebSockets**).
- **SNS FIFO topics** adalah opsi bagus saat perlu **menjaga urutan pesan**.
- Dengan SNS kamu bisa punya **lebih banyak consumer dan latensi lebih rendah** dibanding EventBridge, walaupun keduanya dirancang untuk integrasi asinkron yang scalable.
- Mendukung **fan-out lebar** dan bisa berperan sebagai **dead-letter queue untuk Lambda functions**.
- **Retry policies** membentang hingga **berhari-hari**.

| Aspek | Amazon EventBridge | Amazon SNS |
|---|---|---|
| Integrasi event source/target & SaaS | Native untuk banyak sumber/target + SaaS makin banyak | Tidak punya integrasi seluas itu |
| Routing rules | Lebih advanced (setup lebih banyak kerja) | Lebih sederhana |
| Standarisasi skema event | Punya **SchemaRegistry** | — |
| Retention | 24 jam | — (retry policies hingga berhari-hari) |
| Email/SMS & polling (webhooks/WebSockets) | — | Cocok |
| Urutan pesan | — | **FIFO topics** menjaga urutan |
| Consumer & latensi | Scalable asinkron | Lebih banyak consumer, latensi lebih rendah |
| Fan-out & DLQ Lambda | — | Fan-out lebar, bisa jadi DLQ untuk Lambda |

## Diagram (deskripsi)

Berdasarkan alt text dan narasi:

- **Publish subscribe model** — diagram model pub-sub: kode (publisher) menulis message ke sebuah **topic**; topic punya banyak subscriber di sisi kanan (email, SMS, mobile push, HTTP endpoint, Lambda, SQS, Kinesis Data Firehose). Mekanisme push.
- **How Amazon pushes notifications** — menggambarkan karakteristik push SNS: satu published message didistribusikan ke banyak subscriber melalui mekanisme push.
- **Amazon SNS with Amazon SQS architecture diagram (fan-out)** — satu event (online order diterima) dikirim sebagai satu notifikasi ke SNS topic; SNS mem-fan-out ke dua SQS queue; dua instance EC2 masing-masing mengamati satu queue (satu untuk fulfillment order, satu terhubung ke data warehouse untuk analisis). Bisa ditambah queue lain, misal inventory control.
- **Comparing Amazon SNS and Amazon SQS** — tabel perbandingan empat aspek: message persistence, delivery mechanism, producer & consumer, dan distribution model.

## Poin Kunci untuk Presentasi

- SNS adalah layanan notifikasi **pub-sub** berbasis **push**: publisher menulis ke **topic**, topic mem-push pesan yang sama ke **semua subscriber**.
- Subscriber bisa beragam: **email, SMS, mobile push, HTTP/HTTPS, Lambda, SQS, Kinesis Data Firehose**.
- **No recall**: pesan yang sudah terkirim tidak bisa ditarik; retry HTTP/HTTPS dapat dikonfigurasi; tersedia **standard dan FIFO topics** (FIFO butuh deduplication ID).
- **Fan-out**: satu event → satu notifikasi ke topic → direplikasi ke banyak SQS queue/endpoint untuk pemrosesan paralel asinkron; aplikasi tetap sederhana (satu API call).
- **SNS vs SQS**: SNS = push, pub-sub, one-to-many, tidak persisten (kecuali DLQ di subscription); SQS = polling, queue, one-to-one, persisten dengan DLQ.
- **EventBridge vs SNS**: EventBridge unggul di integrasi SaaS/sumber-target, routing advanced, SchemaRegistry, retensi 24 jam; SNS unggul di email/SMS, polling (webhooks/WebSockets), FIFO ordering, fan-out lebar, DLQ Lambda, lebih banyak consumer & latensi rendah, retry hingga berhari-hari.
- Men-subscribe SQS lintas pemilik butuh **konfirmasi eksplisit**; dalam pemilik yang sama otomatis.
- SNS mendukung access control via policy dan dapat mewajibkan pengiriman via **HTTPS** (enkripsi); pesan disimpan redundan agar tidak hilang.

## Kemungkinan Pertanyaan Audiens

**T: Apa beda mendasar SNS dan SQS?**
J: SNS adalah **push** dan **pub-sub one-to-many** — satu pesan di-push ke banyak subscriber, tidak persisten (kecuali ada DLQ di subscription). SQS adalah **polling** dan **one-to-one** — pesan ditaruh di queue dan satu consumer menariknya, dengan persistensi pesan dan dead-letter queue.

**T: Apa itu arsitektur fan-out dan kenapa berguna?**
J: Fan-out mengirim satu pesan ke SNS topic lalu mereplikasinya ke banyak SQS queue/endpoint. Berguna karena satu event (misal order masuk) bisa memicu banyak pemrosesan paralel asinkron (fulfillment, analisis, inventory) sementara aplikasi cukup mengirim satu notifikasi, sehingga aplikasi tetap sederhana dan loosely coupled.

**T: Kapan pilih EventBridge, kapan pilih SNS?**
J: Pilih **EventBridge** bila butuh integrasi native dengan banyak sumber/target dan SaaS, routing rules advanced, standarisasi skema (SchemaRegistry). Pilih **SNS** untuk email/SMS, pola polling seperti webhooks/WebSockets, menjaga urutan via FIFO topics, fan-out lebar, DLQ untuk Lambda, serta saat butuh lebih banyak consumer dengan latensi rendah dan retry berhari-hari.

**T: Bisakah satu SQS queue menjadi subscriber SNS, dan apa syaratnya?**
J: Bisa — SQS adalah salah satu tipe subscriber SNS. Subscribe queue ke topic dengan SQS sebagai transport dan queue valid sebagai endpoint. Jika pemilik topic dan queue sama, otomatis berjalan; jika beda pemilik, SNS mewajibkan konfirmasi eksplisit atas subscription.

**T: Apakah SNS menjamin urutan pesan?**
J: Standard topic tidak menjamin urutan, tetapi **SNS FIFO topics** menjaga urutan dan menghilangkan duplikat (butuh deduplication ID). Pakai FIFO topic saat urutan pesan penting.
