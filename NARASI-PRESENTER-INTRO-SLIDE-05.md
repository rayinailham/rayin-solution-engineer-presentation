# Narasi Presenter — Intro sampai Slide 5

**Presenter:** Rayina Ilham  
**Topik:** Designing a Serverless Architecture with Event-Driven Microservices  
**Bahasa narasi:** Indonesia  
**Perkiraan durasi:** 6–8 menit, bergantung jeda dan penunjukan diagram.

Teks narasi dapat dibacakan langsung. Bagian *arahan visual* dan *catatan akurasi* merupakan pegangan presenter, bukan teks yang harus dibaca.

## Intro — Pembukaan

Selamat pagi/siang, teman-teman. Perkenalkan, saya Rayina Ilham, IT Operation Intern di AnterAja.

Hari ini saya akan membahas materi AWS Skill Builder, dengan contoh sebuah startup kendaraan listrik.


## Slide 1 — Designing a Serverless Architecture with Event-Driven Microservices

**Arahan visual:** Biarkan animasi pembuka selesai. Gunakan judul sebagai pengantar; tidak perlu menjelaskan setiap ikon.

Ada tiga istilah pada judul ini yang akan kita pakai.

Pertama, **serverless**. Servernya tetap ada, tetapi untuk layanan yang kita bahas, AWS menangani pengelolaan server di baliknya. Tim tetap bertanggung jawab atas kode aplikasi, akses, dan datanya.

Kedua, **microservices**, yaitu membagi aplikasi menjadi layanan dengan tanggung jawab yang lebih kecil. Misalnya, pekerjaan memeriksa pesanan dipisahkan dari pekerjaan pembayaran.

Ketiga, **event-driven**. Event adalah pesan tentang sesuatu yang sudah terjadi. Layanan lain dapat menerima pesan itu lalu melakukan pekerjaan yang sesuai.

Supaya lebih mudah dibayangkan, kita lihat dulu masalah bisnis yang ingin diselesaikan.

## Slide 2 — Apex Mobility: Six Months to Launch

**Arahan visual:** Mulai dari kebutuhan di kiri, lalu tunjuk pelanggan → API Gateway → Step Functions. Setelah itu, tunjuk DynamoDB dan SNS.

Bayangkan sebuah startup kendaraan listrik dengan tim kecil. Mereka harus meluncurkan platform penjualan dalam enam bulan, mulai dari nol. Dalam presentasi ini, kita beri nama **Apex Mobility**. Nama tersebut adalah nama karangan untuk memudahkan cerita.

Pelanggan perlu memilih konfigurasi kendaraan, mengajukan pembiayaan, membuat pesanan, dan melacak pengiriman. Platform juga harus siap menghadapi ribuan pengguna bersamaan, menjaga data stok tetap sesuai, serta melindungi pembayaran dan data pelanggan.

Tim kecil ini membutuhkan cara untuk membangun fitur tanpa terlalu banyak pekerjaan mengurus infrastruktur.

Graph di kanan memperlihatkan usulan awal untuk bagian pemrosesan pesanan.

**Amazon API Gateway** menjadi pintu masuk permintaan dari aplikasi pelanggan. Permintaan tersebut diteruskan ke **AWS Step Functions**, layanan yang mengatur langkah-langkah dalam suatu proses. Proses dengan beberapa langkah ini kita sebut **workflow**.

**Amazon DynamoDB** menyimpan dan menyediakan data pesanan. Sementara itu, **Amazon SNS** membagikan pembaruan status ke saluran notifikasi yang terhubung.

Garis pada graph menunjukkan hubungan antarlayanan. Urutan pekerjaan tetap ditentukan oleh workflow, bukan sekadar bentuk cabang pada gambar.

Sekarang kita sudah melihat kebutuhan dan usulan awalnya. Mengapa pendekatan serverless layak dipertimbangkan untuk tim ini?

## Slide 3 — Why Consider Serverless?

**Arahan visual:** Bandingkan baris atas dan bawah mengikuti poin 1–3. Pada baris bawah, tunjuk Step Functions lalu tiga tugas Lambda.

Slide ini membandingkan dua cara membangun platform. Ini pilihan desain sejak awal, bukan cerita bahwa Apex sudah memiliki aplikasi lama.

Di bagian atas, beberapa pekerjaan berada dalam satu aplikasi yang berjalan di **Amazon EC2**, yaitu layanan server virtual. Pendekatan ini dapat memudahkan pengembangan awal. Namun, ketika aplikasi membesar, perubahan pada satu pekerjaan dapat ikut membutuhkan rilis seluruh aplikasi. Tim juga perlu merawat perangkat lunak servernya.

Di bagian bawah, pekerjaan dibagi menjadi tugas yang terpisah. **AWS Lambda** menjalankan program kecil saat dipanggil. Dalam contoh kita, ada tugas memeriksa pesanan, memesan stok, dan meminta pembayaran.

Step Functions tetap mengatur urutannya. Cabang garis menunjukkan tugas yang dipanggil, bukan berarti semuanya dimulai bersamaan.

Ada tiga hal yang ingin kita lihat. Pertama, AWS menangani pengelolaan server untuk layanan terkelola ini. Kedua, kode satu tugas dapat diperbarui tanpa merilis seluruh aplikasi. Ketiga, workflow dapat diatur untuk mencoba ulang tugas yang gagal.

Namun, mencoba ulang pembayaran tetap membutuhkan perlindungan agar pelanggan tidak ditagih dua kali. Serverless tidak otomatis menyelesaikan semua kesalahan aplikasi.

DynamoDB dan SNS dari slide sebelumnya tetap ada dalam rancangan, tetapi disembunyikan agar kita fokus pada pembagian pekerjaan. EC2 juga dapat menjalankan layanan terpisah; satu aplikasi di bagian atas hanyalah contoh pembanding.

Setelah pekerjaan dipisah, muncul pertanyaan berikutnya: bagaimana bagian lain mengetahui bahwa sebuah pesanan sudah dikonfirmasi?

## Slide 4 — How Do Separate Tasks Share Updates?

**Arahan visual:** Tunjuk workflow di atas, lalu EventBridge dan dua tugas di bawah. Bedakan garis penuh dengan garis putus-putus.

Di slide sebelumnya, kita membagi pekerjaan menjadi beberapa tugas. Sekarang kita menambahkan cara untuk membagikan kabar setelah sesuatu terjadi.

Workflow utama tetap dipertahankan. Permintaan pelanggan masuk melalui API Gateway, lalu Step Functions mengatur tugas pemeriksaan pesanan, pemesanan stok, dan pembayaran.

Setelah langkah yang diperlukan berhasil, sebuah langkah yang kita atur pada workflow mengirim event bernama **OrderConfirmed**. Artinya, pesanan sudah dikonfirmasi. Pesan ini membawa nomor pesanan dan statusnya.

Event tersebut masuk ke **Amazon EventBridge**, layanan yang menerima event dan meneruskannya ke penerima yang sesuai. Event masuk melalui **event bus**, yaitu saluran untuk menerima event. Rule pada bus memeriksa pesan dan menentukan target penerimanya.

Dalam contoh ini, satu salinan dikirim ke Lambda **Plan delivery** untuk memulai perencanaan pengiriman. Salinan lain dikirim ke Lambda **Update sales report** untuk memperbarui laporan penjualan.

Keduanya merupakan reaksi di luar workflow utama. Workflow menunggu hasil pengiriman event ke EventBridge, tetapi tidak menunggu perencanaan pengiriman atau laporan selesai. Kedua tugas tersebut juga tidak memiliki urutan tetap satu sama lain.

Garis penuh menunjukkan panggilan layanan. Garis putus-putus menunjukkan pengiriman event. EventBridge menambah cara berbagi kabar; Step Functions tetap mengatur langkah pesanan, Lambda tetap menjalankan kode, dan DynamoDB serta SNS tetap memiliki perannya.

Lalu, bagaimana EventBridge memilih penerima kabar itu? Kita perbesar bagian tersebut pada slide berikutnya.

## Slide 5 — Who Gets the Order Update?

**Arahan visual:** Ikuti penanda 1 → 2 → 3. Tunjuk nilai pada event, syarat masing-masing rule, lalu Lambda penerimanya. Kotak event menunjukkan data; kotak rule menunjukkan pemeriksaan di EventBridge.

Di slide sebelumnya, kita melihat bagaimana kabar pesanan yang sudah dikonfirmasi dibagikan ke layanan lain. Sekarang, bagaimana EventBridge menentukan siapa yang menerima kabar itu?

Workflow pesanan tetap sama. Step Functions masih mengatur pemeriksaan pesanan, pemesanan stok, dan pembayaran. Setelah langkah yang diperlukan berhasil, workflow mengirim event bernama OrderConfirmed.

Lihat kotak pertama. Pesan ini membawa nomor pesanan **EV-1042** dan status **confirmed**. Sumbernya, **apex.orders**, menandai aplikasi pesanan kita. Jadi, penerima tahu apa yang terjadi dan pesanan mana yang dimaksud.

Berikutnya, EventBridge memeriksa **rule**, yaitu syarat pada isi pesan. Rule pengiriman mencari OrderConfirmed dengan status confirmed. Keduanya cocok, sehingga salinan pesan dikirim ke Lambda Plan delivery.

Rule laporan penjualan hanya memeriksa nama event. Syarat ini juga cocok, sehingga salinan lain dikirim ke Lambda Update sales report. Kecocokan pada rule pertama tidak menghentikan pemeriksaan rule lainnya.

Lambda penerima ini disebut **target**, yaitu tujuan pengiriman event. Kedua tugas tersebut tidak harus berjalan dalam urutan tertentu. Workflow utama juga tidak menunggu keduanya selesai.

Jadi, satu kabar bisa dipakai beberapa tugas. Step Functions tetap mengatur langkah pesanan; EventBridge memilih penerima kabarnya. Nama event dan syarat di sini hanyalah contoh untuk menjelaskan prinsipnya.

## Catatan akurasi untuk presenter

- **Fakta materi kursus:** studi kasus startup kendaraan listrik, tim kecil, target peluncuran enam bulan; Step Functions mengatur workflow; Lambda menjalankan kode; EventBridge memakai rules pada event bus untuk mencocokkan event dan mengirimnya ke target.
- **Pilihan ilustratif presentasi:** nama Apex Mobility; tugas dan urutan pemeriksaan pesanan, pemesanan stok, serta pembayaran; pengiriman OrderConfirmed setelah keberhasilan; sumber apex.orders; nomor EV-1042; status confirmed; syarat kedua rule; serta reaksi pengiriman dan laporan. Jangan disebut blueprint resmi kursus.
- **Penyederhanaan graph:** slide 3–4 menyembunyikan DynamoDB dan SNS. Slide 5 juga menyembunyikan API Gateway dan tiga tugas Lambda utama. Step Functions mewakili workflow yang sama; kotak rule memperinci bagian EventBridge, bukan layanan AWS baru.
- **Batas contoh:** pesanan dikonfirmasi tidak berarti kendaraan sudah dikirim. Pengiriman event dapat gagal atau berulang; penanganannya tetap perlu dirancang. Rules memilih pesan, bukan menjalankan pekerjaan bisnis.
- **Istilah di slide 5:** label `type` memendekkan istilah *detail type*, yaitu nama jenis event. Nomor pesanan dan status berada dalam bagian detail event. Kotak tersebut bukan format event lengkap.
- **Klaim pembuka:** jangan mengartikan “Zero Idle Cost” sebagai seluruh sistem pasti gratis saat tidak ada transaksi. Biaya bergantung pada layanan, konfigurasi, dan penggunaan.

## Rujukan lokal

- [Materi utama](AWS-Serverless-EDA-Microservices-MATERI.md)
- [Indeks materi](materi/00-INDEX.md)
- [Studi kasus dan requirements](materi/01-studi-kasus-dan-requirements.md)
- [Serverless dan aplikasi modern](materi/02-serverless-dan-aplikasi-modern.md)
- [Event-driven architecture dan EventBridge](materi/03-event-driven-architecture-dan-eventbridge.md)
- [AWS Lambda](materi/04-aws-lambda.md)
- [AWS Step Functions](materi/12-aws-step-functions.md)
- [Konten slide terbaru](src/data/slides.js)
- [Graph dan pembuka](src/slides/diagrams.js)
