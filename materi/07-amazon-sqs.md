# Amazon SQS (Simple Queue Service)

## Tujuan / Inti

Modul ini membahas konsep **queuing dan messaging** dalam arsitektur event-driven. Fokus bab ini adalah **Amazon SQS**: layanan antrian (queue) fully managed yang dipakai untuk *decoupling* (memisahkan) komponen aplikasi serverless agar bekerja asinkron, tahan gagal, dan mampu menyerap lonjakan beban.

Tujuan belajar modul Decoupling:

- Mengidentifikasi karakteristik utama *polling event source* yang men-trigger Lambda menggunakan SQS.
- Menjelaskan bagaimana Lambda mengelola perilaku SQS sebagai event source.
- Mengonfigurasi *filtering* Amazon SNS.
- Membandingkan fitur Amazon EventBridge dan Amazon SNS.

> Catatan tambahan: bab SNS, perbandingan SNS vs SQS, dan SNS vs EventBridge dibahas di file `08-amazon-sns.md`. File ini khusus SQS.

## Apa itu Amazon SQS

Amazon Simple Queue Service (Amazon SQS) adalah layanan **fully managed** yang:

- Tidak butuh overhead administrasi dan hanya perlu sedikit konfigurasi.
- Bekerja pada skala masif — memproses **miliaran pesan per hari**.
- Menyimpan semua message queue dan message dalam **satu AWS Region** yang highly available, dengan **beberapa Availability Zone redundan**.

Inti cara kerja (dari penjelasan Russell di video):

- SQS adalah tempat membuat layanan antrian fully managed.
- Alurnya: buat **queue** → tulis **message** ke queue → ada **proses lain** yang meng-konsumsi message dari queue.
- Karena produksi dan konsumsi pesan **dipisah**, pesan harus **disimpan** (ada permanensi) sampai diproses saat diambil dari queue.
- Saat sebuah message diambil (picked up) untuk diproses, message itu menjadi **invisible** bagi consumer lain selama diproses.
- Setelah proses selesai, consumer mengirim sinyal ke SQS: *"job selesai, silakan dihapus"* → message dihapus dari queue.

> "It acts as a buffer between senders and receivers." — SQS berperan sebagai penyangga antara pengirim dan penerima.

### Kenapa dipakai: pemrosesan asinkron

Contoh dari video: user baru memasukkan sesuatu ke website, lalu kita ingin mengisi **search index**.

- Jangan lakukan di *main thread* tempat user berinteraksi.
- Lakukan **asinkron**: aplikasi menulis task ke queue, lalu proses terpisah menarik task itu dari queue untuk menambah data ke search index.
- Dengan memindahkan job ke SQS, kita merancang **arsitektur loosely coupled** (terkopel longgar).

## Arsitektur dasar: Producer → Queue → Consumer

Alur contoh dari video:

1. Ada aplikasi web berjalan di belakang **load balancer** — ini bertindak sebagai **producer**.
2. User masuk, menambahkan item untuk dijual di aplikasi.
3. Aplikasi menaruh task itu ke **queue**.
4. Di sisi lain ada **consumer** (kode yang kita tulis) yang menarik task dari queue.
   - Consumer bisa berjalan di compute apa pun: **Lambda** atau **EC2**.
5. Saat task diambil consumer → menjadi invisible untuk consumer lain.
6. Setelah selesai → task dihapus dari queue.
7. Kode di consumer, misalnya, menambah data ke **database RDS**.

Manfaat arsitektur ini (narasi video):

- **Decoupled dari main thread**: aplikasi web tidak perlu menunggu proses selesai; dikerjakan asinkron.
- **Fault tolerance tambahan**: kalau server consumer perlu reboot, bukan masalah besar. Konsumsi berhenti sementara saat reboot, lalu server kembali online dan lanjut menarik dari queue.
- **Menyerap demand spike**: kita kontrol berapa server yang memproses dan menyetelnya untuk periode panjang. Misal ada lonjakan besar jam 5 sore tapi menurun tengah malam → lonjakan diserap queue, bukan dibebankan ke aplikasi frontend.

### Dead-letter queue (DLQ)

- Jika sebuah message diambil dari queue dan **gagal diproses** sejumlah kali yang dapat dikonfigurasi (misal 10 kali) — message diambil, service crash; diambil lagi, crash lagi karena ada bug.
- Maka message itu dipindahkan dari queue utama ke **dead-letter queue**.
- DLQ adalah tempat menemukan pesan yang **tidak bisa diproses** oleh consumer, untuk diproses ulang atau di-debug nanti.

## Benefits (Manfaat Amazon SQS)

Amazon SQS menawarkan konstruk umum seperti **dead-letter queues** dan **cost allocation tags**. Tiga kategori manfaat utama:

| Manfaat | Penjelasan |
|---|---|
| **Loose coupling** | Dengan SQS kamu bisa memisahkan langkah preprocessing dari langkah compute dan post-processing. Pemrosesan asinkron mengisolasi logika *producer* menjadi komponen tersendiri, terpisah dari logika *consumer*. |
| **Absorbs spikes** | Queue membuat sistem lebih resilient; berperan sebagai buffer menyerap lonjakan trafik. Memberi aplikasi waktu tambahan menyelesaikan aksi scale-out. Hemat biaya karena tak perlu menyiapkan banyak compute idle hanya untuk menyerap spike. |
| **Failure tolerance** | Jika terjadi exception aplikasi atau kegagalan transaksi, pemrosesan order bisa di-retry. Saat jumlah retry maksimum tercapai, SQS mengarahkan message ke **dead-letter queue** untuk diproses ulang/di-debug. Hilangnya satu node/job dalam workload loosely coupled biasanya tidak menunda seluruh komputasi. |

## Use Cases (Kasus Penggunaan)

Amazon SQS memungkinkan kirim, simpan, dan terima pesan antar komponen software pada volume berapa pun, tanpa kehilangan pesan dan tanpa mensyaratkan service lain harus tersedia.

Empat use case utama:

1. **Work queues** — Memisahkan (decouple) komponen aplikasi terdistribusi yang mungkin tidak memproses jumlah kerja yang sama secara bersamaan. Bisa pilih **standard queue** atau **FIFO queue** sesuai kebutuhan aplikasi.
2. **Buffering and batch operations** — Menambah skalabilitas dan reliabilitas pada arsitektur; meratakan lonjakan volume sementara tanpa kehilangan pesan atau menambah latensi.
3. **Request offloading** — Memindahkan operasi lambat keluar dari jalur request interaktif dengan cara memasukkan request ke queue.
4. **Auto scaling instances** — Pakai SQS queue untuk menentukan beban aplikasi. Dikombinasikan dengan auto scaling, jumlah instance **Amazon EC2** bisa di-scale in/out tergantung volume trafik.

Poin tambahan dari video soal use case:

- **Service-to-service communication** — decoupling dan membuat proses asinkron. Message A punya tugas untuk Message B: A menulis ke queue lalu lanjut kerjaannya sendiri; keduanya kini decoupled.
- **Asynchronous work items** — tidak butuh respons langsung; cukup tulis ke queue.
- **State change notifications** — sesuatu terjadi di aplikasi (harga saham berubah, user baru daftar lalu harus kirim email selamat datang). Itu perubahan state yang bisa ditangani asinkron lewat queue.

### Kapan SQS TIDAK cocok

- **Selecting specific messages** — consumer bisa mengambil message mana saja; tidak bisa selektif. Tidak bisa berkata *"beri saya hanya message yang country = Australia"*. Kalau ada tipe message berbeda, buat **queue berbeda** untuk proses berbeda.
- **Large messages** — ada batas ukuran message. Solusi: tulis **pointer** ke queue. Simpan data besar di **S3**, lalu tulis lokasi S3 ke queue; consumer mengambil pointer lalu mengambil data besar dari S3.

## Dua Tipe SQS Queue

Ada dua tipe message queue:

| Properti | Standard Queue | FIFO Queue |
|---|---|---|
| Urutan | Best-effort ordering (umumnya terkirim sesuai urutan kirim, tapi karena arsitektur sangat terdistribusi, bisa ada salinan terkirim di luar urutan) | Urutan dijaga ketat (first-in-first-out) |
| Delivery | **At-least-once delivery** (satu pesan bisa terkirim lebih dari sekali) | **Exactly-once processing** + duplikat dihilangkan |
| Throughput / API | Hampir **tak terbatas** jumlah API call per detik | **Terbatas** jumlah API call per detik |
| Cocok untuk | Aplikasi yang bisa memproses pesan yang datang lebih dari sekali dan di luar urutan | Saat urutan operasi/event kritis, atau duplikat tidak bisa ditoleransi |

### Penjelasan video soal Standard vs FIFO

- **Standard**: message ditulis ke queue dengan urutan C B A, tapi mungkin tidak diproses dalam urutan itu — contoh diproses jadi B C C A. Perhatikan message **C diproses dua kali** → inilah **at-least-once delivery**.
  - Untuk sebagian aplikasi, diproses dua kali tidak masalah (misal update baris database yang sama dua kali, atau kirim email dua kali — walau sedikit mengganggu).
- **FIFO**: dipakai saat butuh urutan benar — tulis C B A, keluar diproses tetap C B A, dan **duplikat dihilangkan**.
  - FIFO memengaruhi jumlah API call yang bisa lewat (lebih terbatas).
  - **Deduplication**: saat menulis message ke FIFO queue, message dideduplikasi berdasarkan **hash** isi message. Dalam satu *deduplication period*, jika isi sama dan hash-nya sama, hanya muncul sebagai satu item.
  - Kamu juga bisa memberikan **deduplication ID** sendiri. Misal pakai customer ID; jika customer yang sama muncul lagi dalam deduplication period, hanya diproses sekali.

## Optimization (Mengoptimalkan Konfigurasi Queue)

Saat membuat SQS queue, pertimbangkan bagaimana aplikasi berinteraksi dengan queue untuk mengontrol biaya dan menaikkan performa. Dua konfigurasi utama:

### Visibility timeout

- Saat consumer menerima message SQS, message tetap di queue sampai consumer **menghapusnya**.
- Visibility timeout membuat message itu **invisible** ke consumer lain selama periode tertentu, mencegah consumer lain memproses message yang sama.
- **Default visibility timeout = 30 detik.**
- Consumer menghapus message setelah selesai memproses.
- Jika consumer gagal menghapus sebelum visibility timeout habis → message kembali **visible** ke consumer lain dan bisa diproses lagi.
- Panduan setel: set visibility timeout ke **waktu maksimum** yang dibutuhkan aplikasi untuk memproses dan menghapus message.
  - Timeout terlalu pendek → menaikkan kemungkinan message diproses dua kali.
  - Timeout terlalu panjang → menunda percobaan pemrosesan ulang berikutnya.
- Narasi video: visibility timeout sangat bergantung pada task — "berapa lama waktu yang kamu anggap sebagai kegagalan?" Setelah timeout terlampaui, proses dikembalikan ke queue (misal server pemroses reboot dan lupa posisinya).

### Polling type (Short polling vs Long polling)

Queue bisa dikonfigurasi memakai short polling atau long polling.

| Aspek | Short polling | Long polling |
|---|---|---|
| Respons | Langsung mengirim respons ke consumer segera setelah menerima request (respons lebih cepat) | Tidak mengembalikan respons sampai minimal satu message datang, atau poll timeout |
| Jumlah respons / biaya | Jumlah respons lebih banyak → biaya lebih tinggi | Respons lebih jarang → biaya lebih rendah |
| Perilaku koneksi (video) | Kode berkata *"Hey SQS, ada task untukku?"* dan langsung dapat jawaban | *"Hey SQS, ada task untukku? Aku tunggu."* Koneksi tetap terbuka sampai ada message, lalu message dikembalikan dan koneksi ditutup |

Trade-off (video): yang dibandingkan adalah **jumlah API request**. Setiap "panah" adalah satu request-response. Dengan **long polling**, API call dilakukan **lebih jarang**.

### Auto scaling berbasis metrik queue

- Queue bisa diukur skalanya seperti aplikasi lain.
- Ada **metrik** dari queue yang memberi tahu **berapa banyak message yang belum diproses** (unprocessed).
- Metrik itu dipakai untuk menyetel jumlah host yang memproses message dari queue tersebut.

## Diagram (deskripsi)

Berdasarkan alt text dan narasi video:

- **Amazon SQS use cases** — diagram memperlihatkan empat use case utama: work queues, buffering/batch operations, request offloading, dan auto scaling instances.
- **Arsitektur Producer → Queue → Consumer** — aplikasi web di belakang load balancer (producer) menulis task ke SQS; di sisi lain, consumer (berjalan di Lambda atau EC2) menarik task dari queue, memprosesnya (message menjadi invisible selama diproses), lalu menulis hasil ke database RDS; ada dead-letter queue untuk message yang gagal diproses berkali-kali.
- **FIFO queues** — diagram membandingkan standard queue (urutan best-effort, bisa duplikat, at-least-once) dengan FIFO queue (urutan ketat C B A → C B A, duplikat dihilangkan, exactly-once).

## Poin Kunci untuk Presentasi

- Amazon SQS adalah layanan antrian **fully managed**, skala miliaran pesan/hari, pesan disimpan di **satu Region** dengan banyak **AZ redundan**.
- SQS memisahkan **producer** dan **consumer** → arsitektur **loosely coupled**, asinkron, dan tahan gagal; berperan sebagai **buffer** antara pengirim dan penerima.
- Manfaat utama: **loose coupling**, **menyerap spike trafik**, dan **toleransi kegagalan** (retry + dead-letter queue).
- **Dead-letter queue** menampung pesan yang gagal diproses sejumlah kali yang dikonfigurasi untuk di-debug/diproses ulang.
- **Standard queue**: at-least-once, urutan best-effort, API hampir tak terbatas. **FIFO queue**: exactly-once, urutan ketat, API terbatas, dengan deduplication (hash atau deduplication ID).
- **Visibility timeout** (default **30 detik**) menyembunyikan pesan selama diproses; setel ke waktu proses maksimum agar tidak diproses ganda atau tertunda.
- **Short polling** cepat tapi mahal (banyak respons); **long polling** lebih murah karena respons lebih jarang.
- SQS **tidak** cocok untuk memilih pesan spesifik atau pesan besar (untuk pesan besar: simpan di S3, tulis pointer-nya ke queue).

## Kemungkinan Pertanyaan Audiens

**T: Apa bedanya standard queue dan FIFO queue, dan kapan pakai FIFO?**
J: Standard queue memberi *at-least-once delivery* dengan urutan best-effort dan throughput hampir tak terbatas — cocok bila aplikasi tahan duplikat dan tidak masalah di luar urutan. FIFO queue menjamin urutan ketat dan *exactly-once processing* dengan deduplikasi, tetapi jumlah API call per detik terbatas. Pakai FIFO saat urutan operasi kritis atau duplikat tidak bisa ditoleransi.

**T: Apa yang terjadi kalau consumer mengambil pesan tapi gagal memprosesnya?**
J: Selama diproses, pesan menjadi invisible sesuai *visibility timeout* (default 30 detik). Jika consumer gagal menghapus pesan sebelum timeout habis, pesan kembali visible dan bisa diproses consumer lain. Jika gagal berkali-kali melebihi batas yang dikonfigurasi, pesan dipindahkan ke **dead-letter queue**.

**T: Bagaimana menangani pesan yang ukurannya besar?**
J: Ada batas ukuran message di SQS. Simpan data besar di **Amazon S3**, lalu tulis **pointer** (lokasi S3) ke queue. Consumer mengambil pointer dari queue lalu menarik data besar dari S3.

**T: Kapan sebaiknya pakai long polling dibanding short polling?**
J: Pakai **long polling** untuk menurunkan biaya karena jumlah API request lebih sedikit (koneksi ditahan sampai ada pesan atau timeout). Pakai **short polling** bila butuh respons segera, dengan konsekuensi lebih banyak respons dan biaya lebih tinggi.

**T: Bagaimana SQS membantu auto scaling?**
J: SQS mengeluarkan metrik jumlah pesan yang belum diproses. Metrik ini bisa dipakai bersama auto scaling untuk menambah/mengurangi jumlah instance EC2 (atau menyetel jumlah host consumer) sesuai volume trafik.
