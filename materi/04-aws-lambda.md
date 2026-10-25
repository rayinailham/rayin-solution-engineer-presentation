# AWS Lambda

## Tujuan / Inti

Bagian ini menjelaskan **AWS Lambda** sebagai layanan compute *serverless* dan *event-driven* yang menjalankan kode tanpa provision/manage server. Dibahas cara kerja Lambda (trigger → event → function), komponen intinya, batasan penting (runtime di bawah **15 menit**, billing per **1-millisecond**), handler, deployment package, runtime, demo resize image, dan beragam use case.

> AWS Lambda menjalankan kode Anda di infrastruktur compute *high-availability* dan melakukan seluruh administrasi resource compute untuk Anda.

---

## 1. Apa Itu AWS Lambda?

**AWS Lambda** adalah layanan compute *serverless, event-driven* yang memungkinkan menjalankan kode untuk hampir semua jenis aplikasi atau backend service **tanpa provisioning atau managing servers**.

Alur dasarnya:
- Anda **package dan upload** kode ke layanan Lambda → terbentuk **Lambda function**.
- Lambda function **tidak selalu berjalan terus-menerus**. Function berjalan sebagai **respons terhadap triggers**.
- Anda mengonfigurasi trigger kapan function harus berjalan. Lambda lalu **menunggu trigger** atau **melakukan polling** terhadap event untuk men-trigger function, tergantung jenis trigger yang dipilih.

### Contoh Trigger Umum
Ada daftar panjang trigger untuk Lambda dan terus bertambah. Contoh umum:
- **HTTP request.**
- **Upload file ke Amazon S3.**
- **Events dari AWS services lain.**
- **In-app activity dari mobile devices.**

Saat trigger terdeteksi, kode otomatis berjalan di **managed environment** yang **automatically scalable, highly available**, dan seluruh maintenance-nya dilakukan AWS.

### Yang Tetap Anda Kontrol
- Bahasa (language) Lambda function Anda.
- Jumlah **memory dan CPU** yang dialokasikan.
- **Permissions**, **dependencies**, dan banyak aspek lain cara function berjalan.

### Scaling
Jika ada **1 atau 1.000 incoming triggers**, AWS Lambda akan men-*scale* function untuk memenuhi permintaan, **masing-masing di environment-nya sendiri yang terisolasi** (isolated environment).

---

## 2. Batasan & Model Biaya

### Batas Runtime
- Lambda saat ini dirancang menjalankan kode dengan **runtime di bawah 15 menit**.
- **Bukan** untuk proses long-running seperti *deep learning* atau *batch jobs*.
- **Tidak cocok** meng-host sesuatu seperti **WordPress site**.
- Lebih cocok untuk pemrosesan cepat: **web backend** menangani request, **backend report processing service**, atau **microservice hosting**.

### Billing
- Anda **tidak dikenai biaya untuk kode yang tidak berjalan**.
- Hanya dibayar untuk resource yang dipakai, **dibulatkan ke atas ke interval 1-millisecond terdekat** ("rounded up to the nearest 1-millisecond interval").
- Anda membayar **hanya untuk compute time** yang dikonsumsi — tidak ada charge saat kode tidak berjalan.

> Kutipan kunci:
> *"One of the best things about Lambda is that you aren't billed for code that isn't running."*

---

## 3. Cara Kerja AWS Lambda

Komponen inti Lambda adalah **event source** dan **Lambda function**. Event source mem-*publish* event; Lambda function adalah kode kustom yang Anda tulis untuk memproses event; Lambda menjalankan function Anda.

Anda bisa mengonfigurasi Lambda function lewat: **Lambda console, Lambda API, AWS CloudFormation, atau AWS Serverless Application Model (AWS SAM)**. Function bisa di-*invoke* langsung lewat **Lambda API**, atau Anda konfigurasi AWS service/resource untuk meng-invoke function sebagai respons event.

### Komponen Utama

**Function**
Resource yang Anda invoke untuk menjalankan kode di Lambda. Lambda menjalankan instance function untuk memproses event. Saat dibuat, function dapat di-*author* dengan beberapa cara:
- Buat **from scratch**.
- Pakai **blueprint** yang disediakan AWS (sample code + konfigurasi preset).
- Pilih **container image** untuk di-deploy.
- Telusuri **AWS Serverless Application Repository**.

**Trigger**
Mendeskripsikan **kapan** Lambda function harus berjalan. Trigger mengintegrasikan Lambda function dengan AWS services lain dan *event source mappings*. Function bisa berjalan sebagai respons terhadap API calls tertentu atau dengan membaca item dari stream/queue — meningkatkan kemampuan merespons event tanpa aksi manual.

**Event**
Dokumen berformat **JSON** yang berisi data untuk diproses Lambda function. Runtime mengonversi event menjadi object dan meneruskannya ke kode function Anda. Saat meng-invoke function, Anda menentukan struktur dan isi event.

**Application Environment**
Menyediakan runtime environment yang aman dan terisolasi untuk Lambda function. Mengelola proses dan resource yang dibutuhkan untuk menjalankan function.

**Deployment Package**
Anda men-deploy kode Lambda lewat deployment package. Lambda mendukung dua tipe:
- **.zip file archive** — berisi kode function + dependencies-nya. **Lambda menyediakan OS dan runtime** untuk function.
- **Container image** — kompatibel dengan spesifikasi **Open Container Initiative (OCI)**. Anda menambahkan kode function + dependencies ke image. **Anda juga harus menyertakan OS dan Lambda runtime.**

**Runtime**
Menyediakan environment language-specific yang berjalan di application environment. Saat membuat function, Anda menentukan runtime. Runtime bawaan (built-in) mencakup: **Python, Node.js, Ruby, Go, Java, atau .NET Core**. Atau implementasikan function pada **custom runtime**.

**Lambda Function Handler**
Method di kode function yang memproses event. Saat function di-invoke, Lambda menjalankan **handler method**. Saat handler keluar atau mengembalikan response, ia kembali tersedia untuk menangani event lain.

Sintaks umum handler (Python):
```python
def handler_name(event, context):
    ...
    return some_value
```

---

## 4. Demo: Resize Image (Alur Langkah demi Langkah)

Narator membuat Lambda function yang **me-resize image** yang diupload ke employee directory menjadi ukuran thumbnail seragam. Logika ini cocok untuk Lambda karena Anda tidak butuh aplikasi berjalan 24/7 di EC2 hanya untuk resize foto — cukup jalankan logika resize saat foto baru diupload.

### Diagram Aplikasi
Saat foto baru diupload ke **S3**, itu men-*trigger* Lambda function yang me-resize image dan meng-uploadnya kembali ke **S3 bucket yang sama**, tetapi ke **lokasi (prefix) berbeda** dari tempat image asli disimpan.

### Langkah-langkah di Console
1. Buka **AWS Lambda console** → klik **Create function**.
2. Pilih tipe authoring: **author from scratch** / **blueprint** (sample code + preset) / **container image** (Lambda mendukung container). → Pilih **author from scratch**.
3. **Function name**: `ResizeImage`.
4. Pilih **runtime** (bahasa function) → **Python 3.9** (karena function ditulis di Python).
5. **Permissions** didelegasikan ke function lewat **IAM roles** → pilih **Use an existing role** → pilih role **LambdaS3FullAccess** (role IAM yang sudah dibuat, memberi izin read/write ke S3).
6. Scroll down → **Create function**.
7. **Add trigger** → konfigurasi trigger source. Dropdown menampilkan layanan AWS yang bisa jadi trigger (API Gateway, Application Load Balancer, DynamoDB, dll). → Pilih **S3**.
8. Pilih **S3 bucket** sebagai event source → `photo-upload-bucket-mw`.
9. Pilih **event type** → hanya **PUT** (operasi PUT yang men-trigger function).
10. Berikan **prefix**: hanya trigger function jika PUT terjadi di lokasi spesifik di bucket → upload foto ke **input prefix** yang men-trigger function.
11. **Acknowledge** peringatan **recursive invocations**: memakai bucket sama untuk input dan output bisa memicu invokasi rekursif. Solusinya: event dipicu saat image diupload ke **input prefix**, tetapi output diupload ke lokasi berbeda (**output prefix**). Centang checkbox → **Add**.
12. Di **Function overview** → buka tab **Code**. Ada Lambda function stub bawaan ("Hello from Lambda!").
13. **Upload kode**: klik **Upload from** → **zip file** → **Upload** → pilih `ResizeImage.zip` → **Open** → **Save**.
14. Function berhasil dibuat: trigger terdefinisi, kode terupload.
15. **Test**: upload image ke S3. Cari **S3** di search bar → pilih bucket → masuk folder **input** → **Upload** → **Add files** → upload image → **Open** → **Upload** (sukses).
16. **Cek output**: kembali ke bucket, naik satu level → terlihat **output prefix** sudah terbuat → di dalamnya ada **thumbnail image** hasil resize.

> Narator menutup: seluruh backend employee directory bisa saja di-host di Lambda dengan beberapa refactoring, tetapi itu untuk pembahasan lain.

---

## 5. Use Cases AWS Lambda

Enam kategori use case (penanda numerik 1–6):

| # | Use Case | Contoh |
|---|----------|--------|
| 1 | **Web applications** | Static websites, complex web applications, packages untuk Flask dan Express |
| 2 | **Backends** | Applications and services, mobile, Internet of Things (IoT) |
| 3 | **Data processing** | Real-time processing, MapReduce, AWS Batch |
| 4 | **Chatbots** | Powering chatbot logic |
| 5 | **Amazon Alexa** | Powering voice-activated applications, Alexa Skills Kit |
| 6 | **IT automation** | Policy engines, extending AWS services, infrastructure management |

---

## 6. Diagram (deskripsi)

- **Navigasi "Introduction"** — halaman pengantar Lambda sebagai layanan compute serverless event-driven yang berjalan di infrastruktur high-availability.
- **Navigasi "How AWS Lambda works"** — diagram cara kerja Lambda: event source mem-publish event → Lambda menjalankan function (handler memproses event). Alt text: *"You can author a Lambda function from scratch, by using a blueprint or selecting a container image."* — menggambarkan tiga cara authoring function.
- **Diagram demo resize image** — alur: foto diupload ke **S3 (input prefix)** → men-trigger **Lambda ResizeImage** → Lambda me-resize → menyimpan thumbnail ke **S3 (output prefix)** di bucket yang sama.
- **Navigasi "Use cases"** — halaman enam kategori use case (web apps, backends, data processing, chatbots, Alexa, IT automation).

---

## Poin Kunci untuk Presentasi

- AWS Lambda = compute **serverless, event-driven**: jalankan kode tanpa provision/manage server; AWS tangani administrasi compute.
- Alur: **package & upload kode → Lambda function → berjalan saat trigger** (Lambda menunggu atau polling event).
- Trigger umum: **HTTP request, upload file ke S3, event AWS service lain, in-app activity mobile**.
- Scaling otomatis: 1 atau 1.000 trigger ditangani, masing-masing di **isolated environment**.
- Batas penting: **runtime < 15 menit** (bukan untuk long-running/deep learning/batch/WordPress), cocok untuk web backend, report processing, microservice hosting.
- Billing: bayar hanya saat kode berjalan, **dibulatkan ke 1-millisecond terdekat**; tidak ada charge saat idle.
- Komponen: **Function, Trigger, Event (JSON), Application Environment, Deployment Package, Runtime, Handler**.
- Dua deployment package: **.zip** (Lambda sediakan OS+runtime) dan **container image/OCI** (Anda sertakan OS+runtime).
- Runtime built-in: **Python, Node.js, Ruby, Go, Java, .NET Core** (atau custom runtime).
- Demo resize image memakai pola **S3 PUT (input prefix) → Lambda → output prefix**, dengan acknowledge risiko **recursive invocation**.

## Kemungkinan Pertanyaan Audiens

**Q: Berapa batas waktu eksekusi Lambda function?**
A: Di bawah **15 menit**. Lambda tidak cocok untuk proses long-running seperti deep learning atau batch jobs.

**Q: Bagaimana cara Lambda menagih biaya?**
A: Hanya untuk compute time yang dipakai, dibulatkan ke atas ke interval **1-millisecond** terdekat; tidak ada biaya saat kode tidak berjalan.

**Q: Apa beda deployment lewat .zip dan container image?**
A: Dengan **.zip**, Lambda menyediakan OS dan runtime. Dengan **container image (OCI)**, Anda yang menyertakan OS dan Lambda runtime di dalam image bersama kode dan dependencies.

**Q: Apa yang memicu Lambda berjalan?**
A: Trigger yang dikonfigurasi, seperti HTTP request, upload file ke S3, event dari AWS service lain, atau in-app activity dari mobile device.

**Q: Di demo, kenapa perlu input prefix dan output prefix yang berbeda?**
A: Untuk menghindari **recursive invocations**. Jika input dan output di lokasi sama dalam satu bucket, output baru bisa memicu Lambda lagi. Memisahkan prefix input (pemicu) dan output (hasil) mencegah loop.

**Q: Bahasa apa saja yang didukung Lambda?**
A: Runtime built-in mencakup Python, Node.js, Ruby, Go, Java, dan .NET Core; Anda juga bisa memakai custom runtime.
