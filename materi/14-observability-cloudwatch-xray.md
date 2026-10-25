# Observability — CloudWatch Logs & AWS X-Ray

## Tujuan / Inti

Modul ini memberi kerangka berpikir tentang **observability** sebagai bagian dari proses mendesain arsitektur serverless. Yang dipelajari:

- Menjelaskan bagaimana sifat **distributed** dari serverless meningkatkan pentingnya observability.
- Mendefinisikan **tiga pilar observability**: logs, traces, dan metrics.
- Menggunakan **CloudWatch Logs** untuk mereview dan melakukan query log.
- Menggunakan **X-Ray traces** untuk memberi visibilitas terhadap request individual.
- Memvisualisasikan dan bertindak atas operational metrics dan custom metrics.

Inti: **Monitoring** berfokus mengidentifikasi kegagalan (failures) di seluruh layer stack. **Observability** adalah pendekatan budaya organisasi dan praktik pengembangan tentang bagaimana mengumpulkan dan memakai data sistem untuk melakukan lebih dari sekadar memantau kegagalan.

> Catatan tambahan: Monitoring pada aplikasi tradisional telah berevolusi menjadi observability pada aplikasi modern.

---

## Observability vs Monitoring

- **Monitoring**: berfokus mengidentifikasi failures di berbagai layer stack.
- **Observability**: mencerminkan pendekatan budaya organisasi + development practices yang mendorong cara kita berpikir tentang mengumpulkan dan menggunakan data sistem — bukan hanya untuk memantau kegagalan.

Observability memperluas monitoring tradisional dengan pendekatan yang menjawab pertanyaan yang ingin Milord jawab tentang aplikasi. Business metrics sering jadi pemikiran belakangan (afterthought) — baru dicari saat seseorang di sisi bisnis bertanya, lalu harus mencari cara mendapatkan jawaban dari data yang ada. Jika kebutuhan ini dibangun sejak awal pengembangan aplikasi, visibilitas atas apa yang terjadi di aplikasi jauh lebih besar.

---

## Tantangan Observability pada Arsitektur Serverless

Ada empat tantangan utama saat mengamati (observe) arsitektur serverless:

| No | Tantangan | Penjelasan |
|----|-----------|-----------|
| 1 | **Short-lived resources** | Kita kehilangan akses ke infrastruktur setelah eksekusi business logic selesai. Tidak bisa memasang background agents untuk mengumpulkan data eksekusi dalam skenario ini. |
| 2 | **More devices, services and data** | Banyak device dan service terhubung lewat network; mengumpulkan batch data dari semua device menjadi tantangan. |
| 3 | **Faster release velocity** | Dengan pengembangan dan deployment komponen yang terdistribusi, siklus rilis aplikasi memendek. Mendefinisikan mekanisme observability tambahan dalam skenario ini menjadi tantangan. |
| 4 | **User experience** | Terlepas dari tantangan lain, user experience adalah pertimbangan terpenting untuk performa aplikasi. Latency akibat mekanisme monitoring/observability **tidak dapat diterima**. |

---

## Tiga Pilar Observability

| Pilar | Definisi |
|-------|----------|
| **Logs** | Catatan ber-timestamp dari event diskret, seperti failure, error, atau state change. Logs bisa menyertakan metrics. |
| **Traces** | Memberi satu transaksi utuh dari perjalanan (journey) user melewati aplikasi terpisah atau bagian-bagian aplikasi. |
| **Metrics** | Data numerik yang diukur pada interval. Sering berupa service-level indicators seperti request rate atau error rate, tetapi juga bisa business metrics seperti jumlah order atau pembayaran yang diterima. |

---

## Amazon CloudWatch Logs

Logs adalah aspek penting untuk mencapai observability dan monitoring aplikasi. Dengan **Amazon CloudWatch Logs**, Milord bisa:

- Mereview dan melakukan **query** terhadap log.
- Bertindak atas log data via **metric alarms**.
- Meng-**export** data untuk use case tambahan, misalnya:
  - Export ke **Amazon S3**.
  - Stream via **Amazon Data Firehose** ke **Amazon OpenSearch Service**, lalu gunakan tools seperti **OpenSearch Dashboards** untuk menganalisis log.
  - Export ke **third-party tool** untuk analisis atau pemrosesan.

### API Gateway logging

- Secara **default**, saat membuat API di API Gateway, **logging tidak dikonfigurasi** — harus diaktifkan secara eksplisit.
- Logging bekerja sedikit berbeda untuk tipe API **REST** vs **HTTP**.
- Untuk mengaktifkan logging **HTTP APIs**: bisa memakai **logging variables** untuk mengustomisasi isi log.
- Monitoring **REST API** dilakukan via **CloudWatch**, yang mengumpulkan dan memproses raw data dari API Gateway menjadi metric yang mudah dibaca dan near-real-time.
  - Statistik direkam selama **15 bulan**, sehingga bisa mengakses informasi historis dan memahami performa aplikasi/service.
  - Secara default, data metric API Gateway otomatis dikirim ke CloudWatch dalam **periode satu menit (one-minute periods)**.

Ada dua tipe API logging di CloudWatch: **execution logging** dan **access logging**.

| Tipe logging | Penjelasan |
|--------------|-----------|
| **Execution logging** | API Gateway yang mengelola CloudWatch Logs. Prosesnya mencakup membuat log groups dan log streams, serta melaporkan ke log streams semua request dan response pemanggil (caller). Data yang dicatat mencakup error atau execution traces (seperti nilai parameter/payload request atau response), data yang dipakai Lambda authorizers (dulu disebut custom authorizers), apakah API keys diperlukan, apakah usage plans diaktifkan, dan sebagainya. |
| **Access logging** | Milord sebagai API developer ingin mencatat **siapa** yang mengakses API dan **bagaimana** caller mengaksesnya. Milord bisa membuat log group sendiri atau memilih log group yang sudah ada (bisa dikelola oleh API Gateway). |

### AWS Lambda logging

Lambda mencatat semua request dan hasil ke sebuah CloudWatch **log group** bernama **`/aws/lambda/<function name>`**. Ada relasi **satu-ke-satu** antara function dan log group. Log group dibuat pertama kali saat function berjalan; jika memakai **provisioned concurrency**, log group dibuat saat provisioned concurrency dibuat. Log group adalah entity yang biasanya dipakai untuk mencari event di dalam Lambda logs.

Komponen logging Lambda (empat marker):

| No | Komponen | Penjelasan |
|----|----------|-----------|
| 1 | **Lambda log group** | Lambda mencatat semua request & hasil ke log group `/aws/lambda/<function name>`. Relasi satu-ke-satu antara function dan log group; dibuat saat function pertama kali berjalan (atau saat provisioned concurrency dibuat). Entity utama untuk mencari event. |
| 2 | **Log stream** | Log group terdiri dari **log streams** yang diidentifikasi oleh **tanggal, function version, dan unique identifier**. Lambda otomatis membuat log stream baru di dalam group berdasarkan faktor internal terkait cara invocation dialokasikan ke environment dan timing invocation. |
| 3 | **Log events** | Tiap log stream berisi urutan event yang mendeskripsikan detail request Lambda. Tiap request punya **RequestID** unik dan mencakup event **START**, **END**, dan **REPORT** yang dengan cepat memberi informasi ringkasan request Lambda. |
| 4 | **RequestID** | RequestID adalah identifier utama untuk menemukan event terkait sebuah invocation tertentu. Event **REPORT** adalah cara cepat melihat berapa lama function berjalan, **billing duration**, serta memory yang dikonfigurasi dan memory yang terpakai. Durasi **"Init"** menandakan invocation tersebut adalah **cold start**. |

### CloudWatch Logs Insights

**CloudWatch Logs Insights** memungkinkan Milord mencari dan menganalisis log data secara interaktif di Amazon CloudWatch Logs.

- Bisa menjalankan query untuk merespons masalah operasional secara lebih efisien dan efektif.
- Jika terjadi masalah, Logs Insights bisa dipakai untuk mengidentifikasi penyebab potensial dan memvalidasi fix yang sudah di-deploy.
- Menyediakan **purpose-built query language** dengan beberapa command yang sederhana namun powerful.

---

## AWS X-Ray

**AWS X-Ray** adalah service yang mengumpulkan data tentang request yang dilayani aplikasi Milord, serta menyediakan tools untuk melihat, memfilter, dan mendapatkan insight dari data itu untuk mengidentifikasi masalah dan peluang optimasi.

- Membantu menganalisis dan men-debug aplikasi produksi yang distributed, seperti yang dibangun dengan arsitektur microservices.
- Membantu memahami bagaimana aplikasi dan underlying service-nya berperforma, untuk mengidentifikasi dan troubleshoot **root cause** dari masalah performa dan error.
- Memberi **end-to-end view** dari request saat melewati aplikasi, dan menampilkan **map** dari komponen-komponen underlying aplikasi.

Cara kerja data: X-Ray menerima data dari service sebagai **segments**. X-Ray lalu mengelompokkan segment yang punya request yang sama menjadi **traces**. X-Ray memproses traces untuk menghasilkan **service graph** — representasi visual dari aplikasi.

### Poin kunci dari narasi (transcript)

- **Supply traces**: menggabungkan banyak request berbeda yang masuk ke satu aksi tunggal dalam aplikasi.
- **Untuk Lambda cukup satu tombol**: cukup konfigurasi Lambda ke **active tracing**, maka Lambda mengirim trace information ke X-Ray.
- **X-Ray SDK**: bisa diinkorporasi untuk meng-instrument kode aplikasi. SDK meng-instrument hal seperti: tempat melakukan SQL queries, HTTP requests, dan penggunaan AWS SDK — lalu melaporkannya ke X-Ray dan dikorelasikan ke satu trace.
- **Visual detection of latency distribution**: setelah traces masuk ke X-Ray console, latency bisa dilihat per kolom. Contoh breakdown: panggilan ke S3 memakan **200 milidetik**, lalu panggilan ke third-party API via HTTP library memakan **300 milidetik**. Ini mempermudah debugging karena semuanya terkorelasi di satu tempat.
- **Filter & group by error type**: request bisa difilter/dikelompokkan berdasarkan banyak hal. Saat melihat map, klik sebuah request type → muncul aggregate untuk semua bagian trace tersebut.
- **Service map**: mengetahui Lambda bicara ke S3 dan ke DynamoDB → X-Ray membuat representasi grafis; klik tiap interaksi untuk melihat aggregate metrics, drill down ke detail trace individual.
- **Segments & subsegments**: trace dipecah menjadi segments dan subsegments; bisa melihat JSON document untuk semua timing dan aksi. Segment memberi info seperti resource name (mis. "talked to Dynamo"); subsegment memecah timing lebih granular.
- **Post sendiri segments/subsegments**: bisa menambahkan segment/subsegment sendiri. Alat yang disebut: **AWS Powertools for Lambda** — cukup memberi attribute pada method sendiri agar segment/subsegment muncul di trace.
- **Annotations vs metadata**: keduanya key-value pair (contoh: `user number = 99`). Bedanya: **annotations di-index sehingga bisa dicari**, sedangkan **metadata hanya muncul di samping trace**. Berguna saat ada laporan "error dengan customer number 99" → cari annotation tersebut di console.

### Contoh kode: instrumentasi dengan X-Ray SDK (Node.js/JavaScript)

Narasi menjelaskan sample code: menarik X-Ray SDK, lalu memakainya untuk meng-instrument library — `captureAWS` membungkus request ke AWS SDK agar trace masuk ke X-Ray, dan `captureHTTPsGlobal` menangkap request HTTPS di library lain seperti **Axios** (mis. untuk memanggil third-party library).

```javascript
// Menarik X-Ray SDK
const AWSXRay = require('aws-xray-sdk');

// Instrument AWS SDK -> membungkus request ke AWS SDK agar trace dikirim ke X-Ray
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

// Instrument HTTPS secara global -> menangkap request HTTPS di library lain (mis. Axios)
AWSXRay.captureHTTPsGlobal(require('https'));
```

> Catatan tambahan: Kode di atas merekonstruksi contoh dari narasi (nama method `captureAWS` dan `captureHTTPsGlobal` disebut persis di raw); nama variabel adalah ilustrasi pola umum X-Ray SDK Node.js.

### Bagaimana X-Ray meringkas detail & menyoroti trouble spots

| No | Langkah | Penjelasan |
|----|---------|-----------|
| 1 | **Trace requests** | X-Ray mengumpulkan data tentang sebuah request dari underlying services yang dilaluinya dan menandai (tags) data dengan sebuah ID. |
| 2 | **Record traces** | X-Ray menerima data dari service sebagai segments dan mengelompokkannya berdasarkan request menjadi traces yang bisa di-group dan difilter. |
| 3 | **Review the service map** | X-Ray meringkas traces lewat map yang bisa diklik, menyoroti hal seperti latency, HTTP statuses, dan metadata. |
| 4 | **Drill down into trace details** | X-Ray menyajikan breakdown tersegmentasi dari tiap request individual sehingga Milord bisa menunjuk (pinpoint) sebuah isu. |

### Komponen sebuah Trace

AWS X-Ray menerima data dari service sebagai **segments**, lalu mengelompokkan segment yang punya request yang sama menjadi **traces**.

| Komponen | Definisi |
|----------|----------|
| **Segments** | Membungkus semua data point untuk **satu komponen** aplikasi terdistribusi (contoh: authorization service). Mencakup data system-defined dan user-defined dalam bentuk annotations, dan terdiri dari satu atau lebih sub-segment yang merepresentasikan remote calls dari service tersebut. |
| **Subsegments** | Memecah data pekerjaan menjadi bagian lebih granular. Memberi informasi timing lebih detail dan detail tentang downstream calls yang dibuat aplikasi untuk memenuhi request awal. Bisa berisi detail tambahan tentang panggilan ke AWS service, external HTTP API, atau SQL database. Milord bahkan bisa mendefinisikan subsegment sembarang untuk meng-instrument function atau baris kode tertentu. |
| **Annotations** | Data system-defined atau user-defined yang terkait dengan sebuah segment. Satu segment bisa punya banyak annotation. System-defined: data yang ditambahkan AWS services (mis. region data untuk AWS service calls disuntik otomatis). User-defined: metadata yang ditambahkan developer (mis. menambahkan region data sendiri untuk panggilan ke non-AWS services). **Annotations di-index** (bisa dicari). |
| **Metadata** | Key-value pair dengan nilai bertipe apa pun (termasuk object dan list), **tetapi tidak di-index**. Dipakai untuk merekam data yang ingin disimpan di trace tetapi tidak perlu dipakai untuk mencari (searching) traces. |

---

## Diagram (deskripsi)

Berdasarkan alt text dan narasi:

- **Evolusi monitoring → observability**: Diagram menggambarkan bagaimana monitoring pada aplikasi tradisional berevolusi menjadi observability pada aplikasi modern.
- **Aspek serverless yang memengaruhi observability**: Visual yang menampilkan berbagai aspek aplikasi serverless (short-lived resources, banyak device/service/data, release velocity, user experience) sebagai empat marker tantangan.
- **Tiga pilar observability**: Diagram tiga pilar — Logs, Traces, Metrics.
- **AWS X-Ray functional features**: Diagram fitur fungsional X-Ray — trace requests (data ditandai ID), record traces (segments → traces), review service map (map yang bisa diklik: latency, HTTP status, metadata), dan drill down ke trace details (breakdown tersegmentasi per request). Service map menampilkan hubungan antar komponen, mis. Lambda → DynamoDB dan Lambda → third-party API; tiap interaksi bisa diklik untuk melihat aggregate metrics.

---

## Poin Kunci untuk Presentasi

- **Monitoring** = mencari kegagalan; **observability** = budaya + praktik mengumpulkan dan memakai data sistem untuk menjawab lebih dari sekadar "apakah gagal". Bangun kebutuhan ini sejak awal aplikasi.
- Serverless menyulitkan observability karena **short-lived resources** (tak bisa pasang background agent), banyak device/service/data, **release velocity** tinggi, dan latency monitoring tak boleh mengganggu **user experience**.
- Tiga pilar observability: **Logs** (event diskret ber-timestamp), **Traces** (satu perjalanan transaksi user), **Metrics** (data numerik per interval; service-level maupun business).
- **CloudWatch Logs**: review, query, metric alarms, dan export (S3, Firehose→OpenSearch, third-party). Logging API Gateway **tidak aktif secara default** dan harus diaktifkan eksplisit.
- API Gateway: **execution logging** (dikelola API Gateway: request/response, authorizer, API key, usage plan) vs **access logging** (siapa & bagaimana API diakses). REST API metric disimpan **15 bulan**, dikirim default **per 1 menit**.
- Lambda logging: log group **`/aws/lambda/<function name>`** (relasi satu-ke-satu), log stream per tanggal/version/unique id, tiap request punya **RequestID** dengan event **START/END/REPORT**; durasi **Init** = **cold start**.
- **CloudWatch Logs Insights**: query interaktif dengan purpose-built query language untuk menelusuri log dan memvalidasi fix.
- **AWS X-Ray**: end-to-end view + service graph untuk aplikasi distributed/microservices. Aktifkan **active tracing** Lambda (satu tombol) atau pakai **X-Ray SDK** (instrument SQL/HTTP/AWS SDK).
- Trace tersusun dari **segments** & **subsegments**; tambahkan **annotations** (di-index, bisa dicari) vs **metadata** (tidak di-index). Alat bantu: **AWS Powertools for Lambda**.

---

## Kemungkinan Pertanyaan Audiens

**Q: Apa beda logs, traces, dan metrics?**
A: Logs = catatan ber-timestamp event diskret (failure, error, state change). Traces = satu transaksi utuh perjalanan user melewati bagian-bagian aplikasi. Metrics = data numerik per interval (request rate, error rate, atau business metric seperti jumlah order).

**Q: Kenapa observability lebih sulit di serverless dibanding server tradisional?**
A: Karena resource-nya short-lived — setelah business logic selesai, akses ke infrastruktur hilang, jadi tidak bisa memasang background agent. Ditambah banyaknya device/service/data, release velocity tinggi, dan keharusan tidak menambah latency yang mengganggu user experience.

**Q: Apakah logging API Gateway otomatis aktif?**
A: Tidak. Secara default logging tidak dikonfigurasi dan harus diaktifkan eksplisit. Ada dua tipe: execution logging (dikelola API Gateway) dan access logging (mencatat siapa dan bagaimana API diakses).

**Q: Bagaimana cara tahu sebuah invocation Lambda adalah cold start?**
A: Lihat event REPORT di log stream. Jika ada durasi "Init", itu menandakan invocation tersebut cold start. RequestID dipakai untuk menemukan semua event (START/END/REPORT) sebuah invocation.

**Q: Apa beda annotations dan metadata di X-Ray?**
A: Keduanya key-value pair, tetapi annotations di-index sehingga bisa dicari (mis. mencari `user number = 99`), sedangkan metadata tidak di-index dan hanya muncul di samping trace sebagai data pelengkap.

**Q: Bagaimana cara mengaktifkan tracing untuk Lambda?**
A: Cukup aktifkan active tracing pada Lambda (satu tombol) agar trace terkirim ke X-Ray. Untuk instrumentasi lebih dalam (SQL, HTTP, AWS SDK, method sendiri), gunakan X-Ray SDK atau AWS Powertools for Lambda.
