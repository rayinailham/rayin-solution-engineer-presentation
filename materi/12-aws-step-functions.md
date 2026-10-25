# AWS Step Functions — Orkestrasi Workflow Serverless

## Tujuan / Inti

Modul ini memperkenalkan cara meng-orkestrasi (mengatur) alur kerja multi-langkah pada arsitektur serverless menggunakan **AWS Step Functions**. Fokus utama:

- Menggunakan Step Functions untuk meng-orkestrasi sebuah workflow.
- Menggunakan predefined states dan templated code untuk logika state machine.
- Memilih tipe workflow (**Standard** atau **Express**) yang paling sesuai dengan use case.

Inti: Step Functions mengubah "flowchart" proses bisnis menjadi state machine yang berjalan, mengkoordinasi banyak Lambda function / service, menyimpan state aplikasi, melacak langkah mana yang sedang berjalan, serta menyediakan error catching sehingga aplikasi bisa melanjut dari titik terakhir jika ada komponen yang gagal atau hang.

---

## Apa itu AWS Step Functions

AWS Step Functions adalah **visual workflow service** yang membantu developer memakai AWS services untuk:

- Membangun distributed applications.
- Mengotomasi proses (automate processes).
- Meng-orkestrasi microservices.
- Membuat data pipeline dan machine learning (ML) pipeline.

Step Functions menyediakan **serverless orchestration** untuk aplikasi modern. Orchestration mengelola workflow secara terpusat dengan cara:

- Memecah workflow menjadi beberapa langkah (steps).
- Menambahkan flow logic (logika alur).
- Melacak input dan output antar langkah.

Saat aplikasi berjalan, Step Functions:

- Memelihara application state (menjaga kondisi aplikasi).
- Melacak persis langkah workflow mana yang sedang dijalankan aplikasi.
- Menyimpan event log berisi data yang dioper antar komponen aplikasi.

Manfaat utamanya: jika jaringan gagal (network fail) atau komponen hang, aplikasi bisa melanjut persis dari titik terakhir (pick up right where it left off).

> Catatan tambahan: "Step Functions adalah flowchart in action" — artinya diagram alur yang benar-benar dijalankan, bukan sekadar gambar.

### Poin kunci dari narasi (transcript)

- Step Functions dipakai untuk meng-orkestrasi multi-step workflow; microservices dikoordinasi lewat visual workflow.
- Yang didesain disebut **state machine**; Step Functions-lah yang mengkoordinasinya.
- Step Functions melakukan **initiating** (memulai) dan **tracking** (melacak) setiap langkah.
- Ada error catching: jika sebuah Lambda function atau service yang dikonfigurasi mengembalikan error, alur bisa melompat ke posisi error di dalam workflow.
- Analogi proses bisnis: seseorang memesan sepatu baru → ada banyak langkah yang harus dilalui sebelum order benar-benar dimasukkan ke kotak dan dikirim. Proses multi-langkah seperti itulah yang didesain dengan Step Functions.

---

## State Machine

**State machine** adalah sebuah objek yang memiliki sejumlah kondisi operasi (operating conditions) yang bergantung pada kondisi sebelumnya untuk menentukan output-nya. Dengan kata lain, state machine adalah graph berisi operasi dan keputusan (decisions) yang perlu dibuat dalam sebuah proses. Saat berpindah antar langkah, **output dari langkah sebelumnya dioper (passed along) ke langkah berikutnya**.

### Analogi vending machine soda

Contoh klasik state machine adalah mesin vending soda:

1. **Operating state** — mesin menunggu transaksi.
2. **Soda selection** — saat uang dimasukkan, pindah ke pemilihan soda; tekan tombol untuk memilih soda → pindah ke state berikutnya.
3. **Vending state** — soda dikeluarkan/dikirim ke pelanggan.
4. Setelah selesai, state kembali ke **operating**.

Dengan Step Functions, Milord bisa membuat dan mengotomasi state machine sendiri di lingkungan AWS. Analogi serupa bisa diterapkan pada proses nyata, seperti pelanggan memulai order di situs e-commerce.

### States (elemen state machine)

**States** adalah elemen-elemen dalam state machine. Sebuah state bisa melakukan beragam fungsi:

- Membuat pilihan antar cabang (branch) yang akan dijalankan — **Choice state**.
- Berhenti dengan status gagal atau sukses — **Fail** atau **Succeed state**.
- Mengoper input-nya ke output, atau menyuntikkan data tetap (fixed data) — **Pass state**.
- Memberi jeda selama durasi tertentu, atau hingga waktu/tanggal tertentu — **Wait state**.
- Memulai cabang paralel — **Parallel state**.
- Melakukan iterasi langkah secara dinamis — **Map state**.

---

## Contoh Alur Workflow (langkah demi langkah)

Berdasarkan narasi dan contoh pada materi, alur sebuah transaksi:

1. **Aplikasi (sisi kiri)** menerima form data sebagai HTTP POST, lalu meneruskannya ke **API Gateway**.
2. **API Gateway** dikonfigurasi dengan sebuah Step Functions workflow dan meluncurkan workflow tersebut. Di awal workflow, dioper sebuah dokumen berisi parameter — dalam contoh ini **customer ID / customer number**.
3. **Lambda function pertama** di-invoke dengan membawa customer ID. Function ini melihat ke **DynamoDB**, memuat (load) data customer, lalu menyertakan data itu dalam response-nya.
4. **Lambda function kedua** memahami response dari langkah sebelumnya dan **menghasilkan reference number** (menggabungkan beberapa atribut customer). Reference number dioper dalam dokumen ke langkah berikutnya.
5. Langkah berikutnya **terintegrasi langsung dengan DynamoDB** — mengekstrak sesuatu dari input document dan menuliskannya ke sebuah record di DynamoDB.
6. **Choice state** — berdasarkan input ke choice, alur bergerak ke **success state** atau **failure state** (ibarat if statement).
   - Jika **failure state**: dijalankan sebuah Lambda function yang menaruh pesan ke sebuah notification location untuk memberi tahu administrator bahwa order tidak bisa diproses — mungkin butuh human intervention.
   - Jika **success**: workflow selesai dengan sukses.

Keuntungan desain ini: function-function di dalamnya bisa ditulis untuk **reuse** dan bersifat **stateless** — setiap state yang perlu diketahui dioper sebagai parameter dari langkah sebelumnya.

### Contoh transaksi pada materi

Seorang client menyelesaikan transaksi → mengirim **POST request** ke API Gateway. Event di API Gateway ini **menginisiasi Step Functions workflow** untuk mencatat transaksi ke **DynamoDB**. Workflow bergerak melewati tiap state sampai workflow selesai dan berakhir.

---

## Common Elements dalam State Machine

Elemen-elemen umum yang terdapat pada sebuah Step Functions state machine:

| No | Elemen | Penjelasan |
|----|--------|-----------|
| 1 | **Step Functions state machine** | States di dalam state machine menerima input, melakukan sesuatu, lalu mengoper output. State machine menerima teks JSON sebagai input dan mengoper input itu ke state pertama dalam workflow. |
| 2 | **States** | Elemen yang menjalankan fungsi dalam state machine. Nama state adalah string untuk mengidentifikasinya. State machine selalu punya field **StartAt** (menunjukkan nama state tempat proses dimulai) dan selalu punya section **States** (mendefinisikan semua state di dalam state machine). |
| 3 | **Type** | Setiap state harus punya field **Type** yang menunjukkan jenis state tersebut. Tiap tipe state dirancang untuk jenis logika yang berbeda; beberapa field hanya relevan untuk tipe state tertentu. |
| 4 | **Next atau End** | Sebagian besar state punya field **next** atau **end**, yang memberi tahu state machine apa yang harus dilakukan setelah state itu selesai. **States tidak diproses sesuai urutan daftar** — field `next` yang menentukan urutan operasi. |

---

## Tipe-Tipe State (Types of States)

Step Functions berbasis state machine dan task. State machine = workflow; tiap langkah dalam workflow = sebuah state. Ada **empat tipe state** yang dibahas: Task, Choice, Parallel, dan Wait.

| Tipe State | Fungsi | Contoh / Catatan |
|------------|--------|------------------|
| **Task state** | Menjalankan pekerjaan menggunakan activity atau AWS Lambda function, atau dengan mengoper parameter ke API action service lain. | Pada contoh "pie" (membuat pai), sebagian besar item adalah Task states karena ada pekerjaan di tiap langkah. Bisa berupa Lambda function, interaksi dengan service lain, atau application code yang Milord tulis dan host di tempat lain. |
| **Choice state** | Menambahkan conditional logic ke state machine. Choice rules menentukan apa yang dilakukan state machine berikutnya berdasarkan pilihan. | Contoh Choice state bernama "Pie type"; rule mengarahkan alur ke "peeling apples" atau "pitting cherries" sebagai langkah berikutnya. |
| **Parallel state** | Menambahkan cabang eksekusi terpisah (separate branches) dalam state machine. | Untuk menjalankan beberapa cabang sekaligus. |
| **Wait state** | Menunda state machine untuk melanjut selama waktu tertentu. | Bisa memilih **relative time** (dalam detik sejak state dimulai) atau **absolute end time** (sebagai timestamp). |

> Catatan tambahan: Selain empat tipe di atas, pada bagian States juga disebut tipe lain (Fail, Succeed, Pass, Map) sebagai fungsi yang bisa dilakukan state.

### Map state (iterasi pada array)

Sering kali input ke sebuah langkah berupa daftar item dengan jumlah bervariasi. **Map state** dipakai untuk menjalankan langkah yang sama untuk banyak entri array dalam state input.

- Contoh: pada state machine pemesanan donut, Map state bisa menjalankan function "Ice donuts" untuk setiap input dalam array order donut customer. Function yang sama berjalan untuk tiap item array memakai nilai dari item array individual.
- Map state belum selesai sampai function selesai melakukan iterasi pada **semua** item di array.
- Iterasi Map state berjalan **parallel**, sehingga dataset bisa diproses dengan cepat.
- Map state bisa menerima berbagai tipe input: **JSON array**, **daftar Amazon S3 objects**, atau **file CSV**.

---

## Menunggu Penyelesaian Pekerjaan (Task state)

### Menunggu job selesai di dalam Task state

Saat Milord menunjuk sebuah AWS resource (seperti Lambda function, Amazon SNS) di dalam Task state, Step Functions **menunggu HTTP response** lalu melanjut ke state berikutnya. **Step Functions tidak menunggu job-nya benar-benar selesai.**

Beberapa integrasi AWS service — seperti **AWS Batch** atau **Amazon Elastic Container Service (Amazon ECS)** — mendukung integration pattern yang memungkinkan Step Functions task menunggu sampai external task selesai sebelum melanjut, menggunakan suffix **`.sync`**.

### Menunggu callback dengan task token di dalam Task state

**Callback tasks** menyediakan cara untuk mem-pause workflow sampai sebuah **task token** dikembalikan. Berguna ketika task perlu menunggu:

- Human approval (persetujuan manusia).
- Integrasi dengan pihak ketiga (third party).
- Memanggil legacy systems.

Untuk kasus seperti ini, Step Functions bisa di-pause **tanpa batas waktu (indefinitely)** menunggu proses/eksternal workflow selesai. Milord mengoper task token ke **AWS SDK service integrations** dan sebagian **Optimized service integrations**. Task akan pause sampai menerima task token kembali lewat panggilan **`SendTaskSuccess`** atau **`SendTaskFailure`**.

---

## Error Handling: Retry dan Catch

Setiap state bisa mengalami runtime error. Penyebab error antara lain:

- Masalah definisi state machine (contoh: tidak ada matching rule pada Choice state).
- Task failures (contoh: exception pada AWS Lambda function).
- Transient issues (contoh: network partition events).

Secara default, ketika sebuah state melaporkan error, AWS Step Functions membuat eksekusi **gagal total (fail entirely)**.

- **Retry**: Task dan Parallel state bisa punya field **`Retry`** yang nilainya berupa array of object yang disebut **retriers**. Satu retrier merepresentasikan sejumlah percobaan ulang, biasanya pada interval waktu yang makin meningkat (increasing time intervals).
- **Catch**: Task, Map, dan Parallel state masing-masing bisa punya field **`Catch`** yang nilainya berupa array of object yang disebut **catchers**.

> Catatan tambahan: Pada model Standard, task dan state tidak pernah dijalankan lebih dari sekali kecuali Milord menetapkan perilaku **Retry** (lihat bagian tipe workflow di bawah).

---

## Standard vs Express Workflows

Dengan Step Functions, Milord bisa membuat dua tipe workflow: **Standard** dan **Express**. Tipe default untuk state machine adalah **Standard**.

| Aspek | Standard Workflows | Express Workflows |
|-------|--------------------|-------------------|
| Peruntukan | Long-running, durable, auditable workflows | High-volume, event-processing workloads (IoT data ingestion, streaming data processing & transformation, mobile application backends) |
| Durasi maksimum run | Hingga **1 tahun** | Hingga **5 menit** |
| Riwayat aktivitas | Full history dapat diakses hingga **90 hari** setelah workflow selesai | — |
| Execution model | **Exactly-once** — task dan state tidak pernah dijalankan lebih dari sekali, kecuali Milord menetapkan Retry | **At-least-once** — ada kemungkinan satu eksekusi dijalankan lebih dari sekali |
| Status | Tipe default | Pilihan untuk volume tinggi |

---

## Diagram (deskripsi)

Berdasarkan alt text gambar dan narasi materi:

- **Diagram alur transaksi**: Sebuah event di API Gateway menginisiasi Step Functions workflow untuk mencatat transaksi ke DynamoDB. Workflow bergerak melewati setiap state sampai workflow selesai dan berakhir.
- **Diagram State machine (common elements)**: Menunjukkan "States in Step Functions" dengan empat marker bernomor (state machine → states → type → next/end) yang menjelaskan struktur dasar sebuah state machine.
- **Diagram Types of states**: Rangkaian tab bergambar — Task state → Choice state → Parallel state → Wait state — masing-masing dengan transisi "Move to the next tab".
- **Diagram "Waiting for a task to complete"**: Alur Task state yang menunggu HTTP response sebelum melanjut.
- **Diagram "Waiting for a callback"**: Alur Task state yang pause menunggu task token kembali (`SendTaskSuccess` / `SendTaskFailure`).
- **Diagram "Step function workflow"**: Representasi visual keseluruhan alur state dari input JSON hingga workflow berakhir.

---

## Poin Kunci untuk Presentasi

- AWS Step Functions = **visual workflow service** untuk orkestrasi serverless: memecah workflow jadi langkah, menambah flow logic, dan melacak input/output antar langkah.
- Step Functions menjaga **application state**, melacak langkah aktif, dan menyimpan **event log** → jika ada kegagalan, aplikasi lanjut dari titik terakhir.
- Yang didesain adalah **state machine** — graph operasi & keputusan; output langkah sebelumnya dioper ke langkah berikutnya (memungkinkan Lambda ditulis **stateless** dan reusable).
- Empat tipe state utama: **Task, Choice, Parallel, Wait**; ditambah **Map** (iterasi array, berjalan parallel), serta Fail/Succeed/Pass.
- Elemen umum state machine: **StartAt**, section **States**, field **Type**, dan field **next/end** (urutan ditentukan `next`, bukan urutan daftar).
- Task state hanya menunggu **HTTP response** secara default; pakai suffix **`.sync`** (mis. AWS Batch, Amazon ECS) untuk menunggu job selesai, atau **callback task token** (`SendTaskSuccess`/`SendTaskFailure`) untuk human approval / integrasi pihak ketiga.
- Error handling via **Retry** (retriers, interval meningkat) dan **Catch** (catchers); default error = eksekusi gagal total.
- **Standard** (default): sampai 1 tahun, history 90 hari, exactly-once. **Express**: sampai 5 menit, high-volume, at-least-once.

---

## Kemungkinan Pertanyaan Audiens

**Q: Apa bedanya Standard dan Express workflow, kapan pakai yang mana?**
A: Standard untuk workflow yang long-running, durable, dan auditable (sampai 1 tahun, history 90 hari, model exactly-once) — cocok untuk proses bisnis seperti order fulfillment. Express untuk beban high-volume/event-processing (IoT ingestion, streaming, mobile backend) dengan durasi sampai 5 menit dan model at-least-once.

**Q: Kalau sebuah Lambda di tengah workflow gagal, apakah seluruh proses harus diulang dari awal?**
A: Tidak harus. Step Functions menjaga state dan event log, jadi bisa melanjut dari titik terakhir. Selain itu Task/Parallel state bisa diberi `Retry` (mencoba ulang dengan interval meningkat) dan `Catch` untuk menangani error, mis. melompat ke failure state yang mengirim notifikasi ke administrator.

**Q: Step Functions menunggu Lambda-nya selesai atau tidak?**
A: Secara default Task state hanya menunggu HTTP response, bukan sampai job selesai. Untuk benar-benar menunggu pekerjaan selesai, gunakan pola `.sync` (mis. AWS Batch, Amazon ECS) atau pola callback dengan task token.

**Q: Bagaimana memproses daftar item yang jumlahnya berubah-ubah?**
A: Gunakan **Map state**. Ia menjalankan langkah yang sama untuk setiap item array (JSON array, daftar S3 objects, atau CSV), berjalan parallel, dan baru selesai setelah semua item teriterasi.

**Q: Kenapa Step Functions membantu microservices tetap stateless?**
A: Karena state machine mengoper output tiap langkah sebagai input langkah berikutnya. Setiap state yang perlu diketahui dioper sebagai parameter, sehingga tiap Lambda function bisa ditulis untuk satu tujuan, reusable, dan stateless.
