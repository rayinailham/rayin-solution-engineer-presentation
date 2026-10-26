# Narasi Presenter — Intro sampai Slide 17

**Presenter:** Rayina Ilham  
**Topik:** Designing a Serverless Architecture with Event-Driven Microservices  
**Bahasa narasi:** Indonesia  
**Perkiraan durasi:** 35–45 menit, bergantung tempo bicara, jeda, dan kedalaman tanya jawab.

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

Sekarang kita ikuti salah satu penerimanya: apa yang dilakukan Plan delivery setelah menerima event?

## Slide 6 — What Does Plan Delivery Do?

**Arahan visual:** Ikuti event dari EventBridge ke Lambda, tunjuk bagian handler dan lookup DynamoDB, lalu permintaan ke sistem pengiriman. Bedakan permintaan perencanaan dari hasil pengiriman.

Di slide sebelumnya, rule sudah menentukan penerima event. Sekarang kita perbesar tugas **Plan delivery** untuk melihat pola kerja Lambda: menerima input, menjalankan kode, lalu melakukan pekerjaan.

Pertama, **trigger**, yaitu pemicu function. Rule pengiriman di EventBridge cocok dengan event OrderConfirmed, sehingga EventBridge memanggil Lambda dengan data event tersebut.

Kedua, **handler**, yaitu bagian kode yang menjadi titik masuk saat function dijalankan. Kode ini kita tulis sendiri. Dalam contoh, handler mengambil nomor pesanan **EV-1042**, lalu membaca detail pengiriman dari DynamoDB.

Lambda menyediakan tempat untuk menjalankan kode dan menangani pengelolaan servernya. Lambda tidak otomatis memahami arti pesanan atau menyusun rencana pengiriman; logika bisnis tersebut tetap pekerjaan kita.

Ketiga, kode mengirim permintaan agar sistem pengiriman mulai menyusun rencana. Permintaan berhasil dikirim tidak berarti rencananya sudah selesai, apalagi kendaraannya sudah sampai ke pelanggan.

Pola ini sama dengan demo kursus: gambar diunggah ke S3, Lambda menjalankan kode untuk memperkecil gambar, lalu hasilnya disimpan kembali di S3. Pemicu dan pekerjaannya berbeda, tetapi polanya sama.

Kita sudah melihat pekerjaan setelah pesanan dikonfirmasi. Sekarang kita mundur ke pintu masuk: bagaimana permintaan pesanan pertama kali diterima aplikasi?

## Slide 7 — How Does an Order Enter the App?

**Arahan visual:** Ikuti POST dari aplikasi pembeli → API Gateway → StartExecution. Tunjuk balasan awal, kemudian PutItem dan status RECEIVED. Jangan menyamakan balasan awal dengan keberhasilan penyimpanan.

**API** adalah cara program meminta program lain melakukan pekerjaan. Di sini, aplikasi pembeli mengirim permintaan **HTTPS POST /orders**, beserta detail pesanannya.

Permintaan masuk melalui API Gateway. Kita mengatur pemeriksaan akses dan batas permintaan pada pintu masuk ini. Pemeriksaan akses tidak menggantikan pemeriksaan stok atau pembayaran.

Route REST API kemudian memanggil **StartExecution** pada Step Functions. Artinya, workflow pesanan mulai dijalankan. Balasan awal berisi referensi workflow; aplikasi tidak harus menunggu seluruh proses bisnis selesai.

Salah satu tugas awal workflow menulis data ke DynamoDB lewat **PutItem**. Contohnya, nomor pesanan EV-1042 dengan status **RECEIVED**. Status ini kita tentukan sendiri sebagai penanda bahwa pesanan sudah tersimpan.

Perhatikan dua perbedaan. Workflow sudah dimulai belum tentu data sudah tersimpan, karena penulisan masih bisa berjalan atau gagal. Lalu, RECEIVED belum berarti **CONFIRMED**: pemeriksaan pesanan, stok, dan pembayaran masih perlu dilakukan.

Untuk melihat kemajuan, aplikasi memakai route pemeriksaan status yang terpisah. Route tersebut disembunyikan pada diagram dan tetap harus memeriksa hak akses pembeli.

Kita juga perlu mengatur izin layanan, penanganan kegagalan, dan perlindungan terhadap permintaan berulang agar pesanan tidak dibuat atau dibayar dua kali.

Sejauh ini kita banyak memakai Lambda. Apakah semua pekerjaan harus dijalankan dengan Lambda?

## Slide 8 — Does Every Job Need Lambda?

**Arahan visual:** Baca tiga baris sebagai pilihan: Lambda, ECS dengan Fargate, lalu EC2. Tidak ada panah perpindahan atau tingkatan kematangan di sini.

Jawabannya, tidak. Cara menjalankan kode dipilih berdasarkan kebutuhan pekerjaan, bukan karena satu pilihan selalu lebih maju.

Pertama, **Lambda** cocok untuk tugas yang bereaksi terhadap event, seperti Check order. Untuk eksekusi Lambda standar yang dibahas di sini, batas waktunya sampai lima belas menit per pemanggilan. AWS menangani server dan penskalaannya; tim mengatur kode, izin, dan konfigurasi. Komponen biaya eksekusinya berdasarkan jumlah permintaan dan waktu berjalan.

Kedua, **container** mengemas program beserta dependensinya agar lingkungan menjalankannya konsisten. Ini dapat cocok untuk layanan yang terus berjalan atau pekerjaan yang membutuhkan waktu lebih panjang.

**Amazon Elastic Container Service**, atau **Amazon ECS**, mengatur tugas container. **AWS Fargate** menyediakan compute untuk menjalankannya tanpa kita mengelola server. Jadi, Fargate juga termasuk serverless. ECS juga dapat memakai EC2 sebagai tempat menjalankan container.

Ketiga, **EC2** memberi kendali lebih besar atas sistem operasi, perangkat lunak khusus, dan pengaturan server. Konsekuensinya, pada EC2 yang kita kelola sendiri, tim juga menangani patch sistem operasi, kapasitas, dan penskalaan.

Ketiganya dapat dipadukan. Bandingkan kebutuhan waktu jalan, kendali, dan biaya; instance EC2 serta tugas Fargate yang tetap berjalan masih menimbulkan biaya meskipun sedang tidak mengerjakan transaksi.

Untuk tugas Plan delivery kita tetap memakai Lambda. Lalu, bagaimana kalau pekerjaan pengiriman datang lebih cepat daripada kemampuan memprosesnya?

## Slide 9 — What If Delivery Work Arrives Too Fast?

**Arahan visual:** Tunjuk EventBridge → antrean SQS → Plan delivery. Lalu baca kondisi in progress, success, failure, dan jalur ke dead-letter queue.

Pada slide 6, EventBridge langsung memanggil Plan delivery. Di sini, kita menambahkan **Amazon Simple Queue Service**, atau **Amazon SQS**, sebagai tempat pesan menunggu.

Rule pengiriman masih mencari event yang sama. Bedanya, target rule sekarang adalah antrean SQS. Saat permintaan melonjak, pekerjaan bisa menunggu di antrean sambil kapasitas pemrosesan mengerjakannya.

Lambda membaca antrean melalui konfigurasi penghubung yang disebut **event source mapping**, lalu menjalankan Plan delivery. Jadi, SQS tidak mendorong panggilan langsung ke function; layanan Lambda melakukan polling atau membaca pesan yang tersedia.

Saat pesan sedang diproses, pesan disembunyikan sementara dari pembacaan lain. Jangka waktu ini disebut **visibility timeout**. Setelah pemrosesan berhasil, integrasi Lambda menghapus pesan dari antrean. Jika gagal, pesan dapat tersedia kembali setelah waktu tersebut habis.

Karena pesan bisa diproses lagi, kode harus aman terhadap pengulangan. Contohnya, periksa nomor pesanan agar percobaan ulang tidak membuat permintaan rencana pengiriman yang sama dua kali.

Kita juga mengatur **redrive policy**: pesan yang berulang kali gagal dipindahkan ke **dead-letter queue**, atau **DLQ**. Tim perlu menerima alarm, memeriksa penyebabnya, memperbaiki masalah, lalu memutuskan apakah pesan layak diproses ulang. DLQ tidak memperbaiki kesalahan sendiri.

Antrean Standard dapat mengulang pesan atau mengubah urutannya. FIFO menambah urutan per kelompok pesan dan deduplikasi, tetapi kode tetap perlu aman saat dicoba ulang.

SQS menampung pekerjaan yang menunggu. Bagaimana kalau satu pembaruan perlu dibagikan kepada beberapa penerima?

## Slide 10 — How Can One Update Reach Many People?

**Arahan visual:** Mulai dari workflow → topic SNS, lalu cabang SMS, aplikasi dukungan lewat HTTPS, dan antrean SQS opsional. Antrean ini berbeda dari antrean pengiriman pada slide 9.

Kita kembali ke cabang notifikasi yang diperkenalkan pada slide 2. Layanan yang dipakai adalah **Amazon Simple Notification Service**, atau **Amazon SNS**.

Workflow mengirim satu pembaruan status ke sebuah **topic**, yaitu saluran pesan bernama. Workflow cukup melakukan publish ke topic tersebut, tanpa menghubungi semua penerima satu per satu.

Penerima yang berlangganan disebut **subscriber**. Pada gambar, ada saluran SMS pembeli, aplikasi dukungan melalui HTTPS, serta antrean SQS opsional. Subscription dapat memakai filter untuk memilih pembaruan yang relevan.

SNS mendorong salinan pesan ke setiap subscription yang cocok. Pola membagikan satu pesan ke banyak penerima ini disebut **fan-out**. Setiap penerima memproses salinannya secara mandiri.

Jika salah satu penerima memakai SQS, salinannya bisa menunggu sampai consumer siap. Ini menunjukkan bahwa SNS dan SQS dapat dipakai bersama: SNS membagikan pembaruan, SQS menampung pekerjaan. EventBridge tetap berperan mencocokkan event dengan rules untuk menentukan target.

Pada topic Standard, pesan dapat berulang atau tiba tidak berurutan. Penanganan retry bergantung pada protokol penerima; subscription DLQ perlu dikonfigurasi untuk pesan yang gagal dikirim. Pesan terkirim juga belum membuktikan bahwa pembeli sudah membacanya.

Setelah membahas pembagian kabar, kita beralih ke keamanan. Siapa yang boleh melihat atau mengubah pesanan tersebut?

## Slide 11 — Who May See This Order?

**Arahan visual:** Ikuti aplikasi pembeli → Cognito → token kembali ke aplikasi → API Gateway → workflow. Akhiri pada kotak pemeriksaan pemilik pesanan dalam kode tugas.

Ada dua pertanyaan yang berbeda: siapa orangnya, dan apa yang boleh ia lakukan?

Pertanyaan pertama adalah **authentication**, yaitu pemeriksaan identitas. **Amazon Cognito user pool** menangani proses sign-in dan memberikan token. Aplikasi kemudian mengirim **access token** melalui HTTPS saat memanggil API.

Pertanyaan kedua adalah **authorization**, yaitu pemeriksaan hak akses. Pada contoh REST API ini, kita memakai **Cognito authorizer** di API Gateway untuk memvalidasi token, termasuk tanda tangan dan masa berlakunya. Kita juga mengatur **scope** pada method API untuk memeriksa apakah token mengizinkan tindakan yang diminta.

Namun, token valid dan izin memanggil API belum membuktikan bahwa semua pesanan boleh dilihat oleh pengguna tersebut.

Karena itu ada pemeriksaan ketiga di kode tugas: cocokkan identitas pembeli yang sudah diverifikasi dengan pemilik pesanan. Jika tidak sesuai, tolak akses sebelum data dikembalikan atau diubah. Jangan langsung mempercayai buyer ID dari isi permintaan, karena nilai tersebut bisa diganti oleh pemanggil.

Ini bagian dari **shared responsibility**, atau tanggung jawab bersama. AWS melindungi infrastruktur layanan terkelola; tim kita tetap menjaga kode, data, serta konfigurasi akses. WAF dan pembatasan permintaan dapat menambah perlindungan trafik, tetapi tidak menggantikan pemeriksaan pemilik pesanan.

Token bertanda tangan juga tidak berarti seluruh datanya terenkripsi. Perlindungan koneksi dan penyimpanan data tetap perlu diatur.

Pembeli sudah memiliki identitas dan hak akses. Sekarang bagaimana dengan program Lambda yang bekerja atas pesanan itu?

## Slide 12 — What May Each Task Access?

**Arahan visual:** Tunggu perpindahan cloud dan garis kolom selesai. Tunjuk alur EventBridge → Plan delivery → DynamoDB, lalu panel izin pemanggilan dan panel execution role. Ikon IAM menunjukkan pengaturan izin, bukan langkah pengiriman pesan.

Program juga membutuhkan izin. Untuk membedakannya dari hak akses pembeli, kita kembali ke jalur langsung Plan delivery dari slide 6. Ini pembesaran contoh tersebut, bukan berarti antrean pada slide 9 tiba-tiba dihapus dari semua rancangan.

Ada dua pertanyaan izin yang harus dipisahkan.

Pertama, **siapa yang boleh memanggil function?** Pada contoh ini, kita memasang **resource-based policy**, yaitu kebijakan yang melekat pada function Lambda. Policy tersebut mengizinkan layanan EventBridge, yang ditandai dengan **events.amazonaws.com**, melakukan **lambda:InvokeFunction**.

Izin itu dibatasi lagi menggunakan **aws:SourceArn** agar berasal dari rule pengiriman yang dimaksud. **ARN** adalah pengenal resource AWS. Jadi, kita tidak cukup hanya menyebut nama layanan; sumber pemanggilnya juga perlu dibatasi.

Kedua, **apa yang boleh dilakukan function setelah berjalan?** Lambda memakai **IAM execution role** dengan kredensial sementara. Role adalah identitas dengan izin yang digunakan function saat mengakses layanan AWS lain.

Dalam contoh lookup ini, kode hanya membutuhkan **dynamodb:GetItem** pada tabel Orders untuk membaca detail pesanan. Batasi action dan resource tabelnya; jangan memberi semua izin DynamoDB. Tugas lain sebaiknya memiliki role sendiri sesuai kebutuhannya.

Membaca pesanan tidak membutuhkan izin menghapus pesanan atau melakukan pembayaran. Izin logging dan akses lain yang memang dibutuhkan tetap perlu diatur secara terpisah. Simpan secret di **Secrets Manager** atau **Parameter Store SecureString**, dengan izin akses yang sesuai, bukan di dalam kode.

Prinsipnya disebut **least privilege**: berikan hak akses secukupnya untuk menyelesaikan tugas. VPC dapat menyediakan konektivitas privat, tetapi tidak menggantikan izin IAM. Validasi input, pembaruan dependensi, dan kode yang aman saat dicoba ulang tetap tanggung jawab tim.

Setelah membatasi akses setiap tugas, berikutnya kita kembali ke workflow: apa yang harus terjadi jika salah satu langkah pesanan gagal?

## Slide 13 — What Happens When an Order Step Fails?

**Arahan visual:** Ikuti urutan langkah workflow dari Check order → Reserve stock → Charge payment. Tunjuk Choice state yang memeriksa hasil, lalu tunjuk cabang oranye penanganan error (Retry/Catch). Terakhir, tunjuk pengiriman event OrderConfirmed ke EventBridge yang hanya terjadi setelah seluruh langkah wajib berhasil.

Pada slide sebelumnya, kita membatasi hak akses setiap tugas. Sekarang kita kembali memperbesar workflow pesanan yang pertama kali kita lihat di slide 3 sampai 5.

Di sini, **AWS Step Functions** menjalankan sebuah **state machine**, yaitu rangkaian langkah kerja dan titik keputusan yang terstruktur. Dalam state machine, hasil keluaran dari satu langkah dioper menjadi masukan bagi langkah berikutnya.

Alur standarnya berjalan berurutan: pertama memeriksa validitas pesanan (**Check order**), memesan stok kendaraan (**Reserve stock**), lalu menagih pembayaran (**Charge payment**). Step Functions melacak status proses ini secara terpusat. Jika terjadi gangguan jaringan, sistem tidak kehilangan jejak karena Step Functions mencatat persis di langkah mana proses sedang berada.

Namun, dalam sistem nyata, langkah bisnis bisa gagal. Di sinilah peran elemen-elemen state machine:

Pertama, **Choice state** bekerja seperti percabangan logika (*if-else*). State ini memeriksa hasil dari langkah sebelumnya—misalnya, apakah verifikasi stok mencukupi atau pembayaran disetujui—lalu memilih cabang alur berikutnya yang sesuai.

Kedua, kita menentukan apa yang harus dilakukan saat terjadi kegagalan. Kita bisa mengatur **Retry** otomatis dengan jeda waktu bertahap untuk menangani gangguan sementara (*transient error*), atau **Catch** untuk mengalihkan proses ke alur pemulihan (*recovery path*).

Perhatikan bahwa penanganan pembayaran wajib dirancang **idempotent**, yaitu aman terhadap pengulangan. Jika koneksi terputus dan Step Functions mencoba ulang panggilan pembayaran, pelanggan tidak boleh ditagih dua kali. Jika pembayaran akhirnya tetap gagal setelah stok terlanjur dipesan, workflow harus memanggil tugas pembatalan (*compensating transaction*) untuk melepaskan kembali stok tersebut.

Ketiga, event **OrderConfirmed** hanya dikirim ke EventBridge setelah seluruh langkah wajib tersebut berhasil diselesaikan. Dengan begitu, perencanaan pengiriman dan laporan penjualan di luar sana tidak pernah memproses pesanan yang gagal bayar.

Selain mengatur urutan langkah dan penanganan kegagalan, workflow ini menghasilkan rekaman data pesanan. Bagaimana kita menyimpan, melindungi, dan memeriksa riwayat data tersebut?

## Slide 14 — How Do We Protect and Review Order Data?

**Arahan visual:** Tunjuk tabel DynamoDB dan indeks sekundernya, lalu panel enkripsi data (in-transit via HTTPS dan at-rest via KMS). Terakhir, tunjuk panel audit: CloudTrail untuk pencatatan panggilan API dan AWS Config untuk kepatuhan pengaturan konfigurasi.

Workflow pesanan membutuhkan tempat penyimpanan data yang andal dan aman. Perlindungan data serta pencatatan perubahannya sama pentingnya dengan kode program yang kita jalankan.

Pertama, **Amazon DynamoDB** menjadi basis data utama untuk menyimpan rincian pesanan. DynamoDB adalah basis data NoSQL terkelola yang memberikan kecepatan akses dalam hitungan milidetik dan otomatis menyesuaikan kapasitas saat penggunaan meningkat.

Kita merancang struktur data sesuai pertanyaan bisnis yang sering diajukan. Selain pencarian dengan kunci utama nomor pesanan, kita bisa menambahkan **Global Secondary Index (GSI)**. Indeks tambahan ini memungkinkan kita mencari pesanan berdasarkan status—misalnya menampilkan seluruh pesanan yang berstatus RECEIVED—atau melacak pesanan berdasarkan wilayah tanpa harus membaca seluruh isi tabel.

Kedua, data dilindungi saat berpindah dan saat tersimpan. Komunikasi antar-layanan menggunakan koneksi terenkripsi **in transit** melalui protokol HTTPS. Sementara saat tersimpan di disk, data dienkripsi **at rest** menggunakan kunci yang dikelola oleh **AWS Key Management Service (AWS KMS)**.

Enkripsi memastikan data tidak dapat dibaca oleh pihak yang tidak berhak meskipun media penyimpanannya diakses. Namun, enkripsi tidak menggantikan izin IAM; kita tetap harus membatasi role mana saja yang boleh meminta kunci KMS dan membaca data tabel tersebut.

Ketiga, untuk kebutuhan audit dan tata kelola, kita mencatat aktivitas sistem. **AWS CloudTrail** merekam riwayat panggilan API AWS—mencatat siapa yang mengakses resource, kapan, dan dari alamat IP mana. Sementara itu, **AWS Config** terus memantau konfigurasi resource kita dan mencocokkannya dengan aturan kepatuhan—misalnya memastikan tabel basis data tidak dibuka ke publik dan enkripsi selalu aktif.

Panel-panel ini memperlihatkan kontrol data dan keamanan yang berjalan mendampingi sistem, bukan langkah tambahan di dalam alur transaksi pesanan.

Setelah data terlindungi dan tercatat rapi, bagaimana tim operasional mengetahui jika ada pesanan yang lambat atau gagal di lapangan?

## Slide 15 — How Do We Find a Slow or Failed Order?

**Arahan visual:** Bedakan garis biru (jalur observabilitas) dari alur transaksi data. Tunjuk tiga pilar satu per satu: panel CloudWatch Logs di kiri/atas, metrik dan alarm di tengah, serta peta jejak AWS X-Ray di kanan.

Pada arsitektur microservices terdistribusi, satu transaksi pesanan mengalir melewati banyak layanan mandiri. Ketika seorang pembeli mengeluh pesanannya lambat, kita tidak bisa masuk ke satu server lalu membaca file log tunggal.

Kita membutuhkan **observability**, yaitu kemampuan memahami kondisi kesehatan internal aplikasi berdasarkan data keluaran yang dikumpulkan dari seluruh sistem.

Ada tiga pilar observabilitas yang bekerja bersama:

Pertama, **Logs: apa yang sebenarnya terjadi?** Setiap kali Lambda atau API Gateway memproses permintaan, mereka mencatat kejadian tersebut ke **Amazon CloudWatch Logs**. Kita menyertakan nomor pesanan seperti EV-1042 ke dalam catatan log agar mudah dicari. Melalui **CloudWatch Logs Insights**, tim dapat menjalankan kueri interaktif untuk melacak riwayat kejadian suatu pesanan dalam hitungan detik. Ingat aturan kepatuhan: jangan pernah mencatat password, token, atau informasi kartu pembayaran ke dalam log.

Kedua, **Metrics: seberapa sering atau seberapa lama?** CloudWatch mengumpulkan data numerik dalam interval waktu tertentu—misalnya jumlah pemanggilan fungsi, persentase error, latensi eksekusi, usia pesan terlama di antrean SQS, hingga jumlah pesanan yang selesai. Dari metrik ini, kita memasang **CloudWatch Alarms** untuk memberi tahu tim operasional secara otomatis saat terjadi anomali sebelum pelanggan menyadarinya.

Ketiga, **Traces: di mana waktu paling banyak dihabiskan?** **AWS X-Ray** memetakan perjalanan satu permintaan secara menyeluruh dari API Gateway, Step Functions, Lambda, hingga panggilan basis data DynamoDB dan sistem luar. Setiap transaksi diberi pengenal unik bernama Trace ID. Melalui peta jejak X-Ray, kita bisa melihat rincian waktu setiap segmen—misalnya mengetahui apakah perlambatan disebabkan oleh query database yang menunggu kunci atau respons lambat dari gateway pembayaran mitra.

Data observabilitas ini mengalir di jalur terpisah tanpa memperlambat pengalaman belanja pengguna.

Sekarang seluruh komponen arsitektur telah lengkap kita telaah. Bagaimana semua bagian ini disatukan dan diuji untuk membuktikan bahwa kebutuhan startup Apex Mobility benar-benar terpenuhi?

## Slide 16 — Does This Design Meet the Startup Needs?

**Arahan visual:** Tunjukkan diagram integrasi menyeluruh yang menyatukan alur pesanan dari slide-slide sebelumnya: API Gateway → Step Functions → Lambda tugas → DynamoDB, jalur event EventBridge, antrean SQS, dan notifikasi SNS. Tekankan bahwa ini adalah usulan Proof of Concept (POC) yang harus dibuktikan dengan pengujian nyata.

Kita menyatukan seluruh potongan arsitektur yang telah kita pelajari ke dalam satu gambar utuh. Di akhir materi kursus, langkah ini diwujudkan dalam bentuk **Proof of Concept (POC)**, yaitu versi percontohan kerja berskala terukur untuk menguji kelayakan desain sebelum sistem dibangun secara penuh.

Gambar arsitektur yang rapi di atas kertas belum membuktikan bahwa sistem siap digunakan di dunia nyata. Untuk membuktikannya, tim melakukan tiga kelompok pengujian terarah:

Pertama, **menguji seluruh perjalanan pembeli (*buyer journey*)**. Kita memastikan alur mulai dari konfigurasi kendaraan di web, pengajuan pembiayaan, pembuatan pesanan, hingga pelacakan status berjalan mulus tanpa hambatan. Di tahap ini, kita memverifikasi bahwa isolasi akses berfungsi sempurna: setiap pembeli hanya bisa melihat dan mengubah pesanannya sendiri.

Kedua, **menguji kondisi beban puncak dan skenario kegagalan**. Kita mensimulasikan lonjakan pengunjung saat hari peluncuran mobil listrik. Kita menguji apakah antrean SQS berhasil menahan lonjakan pekerjaan pengiriman, apakah Step Functions berhasil menangani kegagalan jaringan saat menghubungi mitra bank, dan apakah pesan yang berulang kali gagal benar-benar dipindahkan ke dead-letter queue untuk diteliti.

Ketiga, **mengukur hasil secara nyata sebelum membuat klaim**. Target awal studi kasus mencakup respon konfigurasi di bawah satu detik dan proses pembiayaan dalam hitungan detik. Kita mengukur angka-angka tersebut menggunakan CloudWatch dan X-Ray pada POC, serta mencatat tingkat keberhasilan pesanan dan estimasi biaya per transaksi.

Bagi tim kecil Apex Mobility, arsitektur serverless event-driven ini memungkinkan mereka meluncurkan produk tepat waktu dalam enam bulan di tiga negara bagian awal, dengan keyakinan bahwa sistem dapat berekspansi ke tingkat nasional tanpa perlu mendesain ulang arsitektur dari nol.

Sebelum menutup presentasi dan membuka sesi tanya jawab, mari kita rangkum prinsip utama yang menjadi panduan dalam merancang arsitektur ini.

## Slide 17 — Choose Services by the Job

**Arahan visual:** Ajak audiens membaca lima kotak aturan emas (*five golden rules*). Gunakan nada merangkum yang tenang dan reflektif, lalu buka pertanyaan penutup untuk memicu diskusi interaktif.

Kita tiba pada kesimpulan akhir presentasi. Pesan terpenting dari studi kasus ini bukanlah menggunakan sebanyak mungkin layanan AWS, melainkan **memilih layanan yang tepat sesuai dengan tugas pekerjaannya**.

Ada lima prinsip panduan yang dapat kita simpulkan:

Pertama, **Mulai dari kebutuhan bisnis, bukan teknologinya**. Kenali apa yang diinginkan pelanggan—kemudahan konfigurasi dan kepastian status pesanan—dan pahami batasan tim: tim kecil ingin fokus menulis fitur bisnis tanpa terbebani tugas merawat sistem operasi dan server fisik.

Kedua, **Pisahkan tugas mandiri dan bagikan kabar lewat event**. Gunakan Lambda untuk menjalankan tugas komputasi spesifik secara mandiri. Gunakan Step Functions untuk mengorkestrasi langkah-langkah yang memiliki urutan dan ketergantungan ketat. Lalu gunakan event untuk memberi tahu sistem lain bahwa suatu perubahan status telah terjadi tanpa saling menunggu.

Ketiga, **Gunakan alat perpesanan yang sesuai fungsinya**. Jangan menyamakan peran layanan pesan:
- Gunakan **Amazon SQS** saat pekerjaan butuh antrean penampung sementara agar pemrosesan tidak kewalahan (*queueing and buffering*).
- Gunakan **Amazon SNS** saat satu kabar perlu disiarkan sekaligus ke banyak penerima (*1-to-many fan-out notifications*).
- Gunakan **Amazon EventBridge** saat event perlu diperiksa isinya menggunakan rules untuk diarahkan ke target yang spesifik (*content-based event routing*).

Keempat, **Lindungi setiap jalur akses dan data**. Autentikasi identitas pembeli di pintu masuk dengan Cognito dan API Gateway, tegakkan otorisasi kepemilikan data di kode aplikasi, berikan izin tugas sekecil mungkin melalui IAM execution role, dan amankan data dengan enkripsi KMS.

Kelima, **Kumpulkan bukti operasional dan uji sebelum peluncuran**. Pasang logging, metrik, dan tracing sejak hari pertama. Uji penanganan error, idempotensi pesan, dan lonjakan trafik secara nyata pada tahap POC sebelum merilis sistem ke publik.

Terima kasih atas perhatian dan waktu teman-teman semua. Sekarang saya membuka sesi tanya jawab atau diskusi: menurut teman-teman, dari arsitektur yang kita bahas tadi, bagian mana yang paling menantang untuk diterapkan di lingkungan kerja kita?

## Catatan akurasi untuk presenter

- **Fakta materi kursus:** studi kasus startup kendaraan listrik, tim kecil, target peluncuran enam bulan; Step Functions mengatur workflow; Lambda menjalankan kode; EventBridge memakai rules pada event bus untuk mencocokkan event dan mengirimnya ke target.
- **Pilihan ilustratif presentasi:** nama Apex Mobility; tugas dan urutan pemeriksaan pesanan, pemesanan stok, serta pembayaran; pengiriman OrderConfirmed setelah keberhasilan; sumber apex.orders; nomor EV-1042; status confirmed; syarat kedua rule; serta reaksi pengiriman dan laporan. Jangan disebut blueprint resmi kursus.
- **Penyederhanaan graph:** slide 3–4 menyembunyikan DynamoDB dan SNS. Slide 5 juga menyembunyikan API Gateway dan tiga tugas Lambda utama. Step Functions mewakili workflow yang sama; kotak rule memperinci bagian EventBridge, bukan layanan AWS baru.
- **Batas contoh:** pesanan dikonfirmasi tidak berarti kendaraan sudah dikirim. Pengiriman event dapat gagal atau berulang; penanganannya tetap perlu dirancang. Rules memilih pesan, bukan menjalankan pekerjaan bisnis.
- **Istilah di slide 5:** label `type` memendekkan istilah *detail type*, yaitu nama jenis event. Nomor pesanan dan status berada dalam bagian detail event. Kotak tersebut bukan format event lengkap.
- **Slide 6–7:** handler dan sistem perencanaan pengiriman adalah ilustrasi. Mengirim permintaan bukan bukti rencana atau pengiriman selesai. Balasan StartExecution membuktikan workflow dimulai, bukan penulisan DynamoDB berhasil. RECEIVED adalah status bisnis buatan contoh; tugas PutItem menggunakan integrasi langsung dan tidak membutuhkan Lambda perantara hanya untuk menulis data.
- **Slide 8:** pilihan compute bukan urutan migrasi wajib. Fargate juga serverless; ECS dapat berjalan di Fargate atau EC2. Batas lima belas menit merujuk pada eksekusi Lambda standar yang dibahas. Biaya sistem tidak hanya biaya eksekusi function.
- **Slide 9:** event source mapping Lambda melakukan polling SQS. Pesan disembunyikan, bukan langsung dihapus saat diterima. Sukses memicu penghapusan; kegagalan dapat memunculkan pesan kembali. DLQ memerlukan redrive policy dan pemantauan. FIFO tidak menghapus kebutuhan kode yang aman terhadap pengulangan.
- **Slide 10:** contoh memakai topic Standard. Retry bergantung pada protokol; DLQ subscription menangani kegagalan pengiriman, bukan otomatis semua kesalahan bisnis consumer. Antrean subscriber notifikasi berbeda dari antrean Plan delivery pada slide 9.
- **Slide 11:** contoh memakai REST API dengan Cognito user pool authorizer dan scope method. Pemeriksaan token serta scope tidak menggantikan pemeriksaan kepemilikan record. User pool token tidak sama dengan kredensial AWS dari identity pool atau execution role Lambda.
- **Slide 12:** contoh izin pemanggil menggunakan resource-based policy Lambda yang membatasi rule EventBridge lewat aws:SourceArn. Execution role mengatur akses keluar function dengan kredensial sementara; trust policy role mengizinkan layanan Lambda mengambil role tersebut. GetItem pada tabel Orders adalah ilustrasi izin data, bukan policy produksi lengkap. Izin logging dan akses lain yang dibutuhkan tetap harus ditentukan.
- **Slide 13:** State machine Step Functions pada contoh mewakili tipe Standard Workflow, di mana riwayat eksekusi disimpan visual dan auditable hingga 1 tahun. Idempotensi pembayaran bukan fitur otomatis Step Functions, melainkan tanggung jawab kode aplikasi (misalnya mengirim idempotency token ke payment gateway). Compensating transaction (membatalkan stok jika pembayaran gagal) harus didefinisikan secara eksplisit sebagai state pemulihan.
- **Slide 14:** DynamoDB mengelola partisi dan penskalaan secara otomatis; Global Secondary Index (GSI) memungkinkan kueri fleksibel dengan trade-off eventual consistency secara default dan biaya penulisan tambahan. Enkripsi data at-rest pada DynamoDB menggunakan AWS KMS (bisa AWS owned key atau Customer Managed Key). CloudTrail mencatat *management events* (aktivitas API AWS) secara default; *data events* (operasi GetItem/PutItem pada tabel) memerlukan konfigurasi dan biaya tambahan. AWS Config menilai kepatuhan pengaturan konfigurasi resource terhadap aturan, bukan memeriksa isi payload transaksi bisnis.
- **Slide 15:** Observability membutuhkan konfigurasi proaktif: CloudWatch Logs dan Metrics memerlukan perencanaan retensi untuk mengendalikan biaya. AWS X-Ray memerlukan instrumentasi pada kode (AWS X-Ray SDK atau AWS Distro for OpenTelemetry) dan tracing diaktifkan pada API Gateway, Lambda, dan Step Functions. Trace ID dan correlation ID (seperti order ID) harus diteruskan (*propagated*) melintasi batasan layanan dan antrean pesan. Data rahasia dan PII (Personally Identifiable Information) dilarang dicatat dalam plain text log.
- **Slide 16:** POC (Proof of Concept) adalah validasi arsitektur bertahap; klaim performa sub-detik pada konfigurasi dan batas peluncuran enam bulan adalah target studi kasus kursus, bukan jaminan otomatis dari platform tanpa pengujian beban, penyesuaian memory/concurrency Lambda, dan pemodelan data yang tepat. Integrasi mitra pembiayaan dan logistik pada diagram disederhanakan sebagai antarmuka aman.
- **Slide 17:** Tiga alat perpesanan (SQS, SNS, EventBridge) sering kali dipadukan dalam arsitektur modern (misalnya EventBridge mengirim ke SQS, atau SNS mem-fan-out ke beberapa antrean SQS), bukan pilihan yang saling meniadakan. Evaluasi menyeluruh terhadap serverless tetap harus mempertimbangkan batas kuota konkurensi, potensi *cold start*, dan titik impas biaya (*cost trade-offs*) saat skala transaksi mencapai volume sangat tinggi secara stabil.
- **Klaim pembuka:** jangan mengartikan “Zero Idle Cost” sebagai seluruh sistem pasti gratis saat tidak ada transaksi. Biaya bergantung pada layanan, konfigurasi, dan penggunaan.

## Rujukan lokal

- [Materi utama](AWS-Serverless-EDA-Microservices-MATERI.md)
- [Indeks materi](materi/00-INDEX.md)
- [Studi kasus dan requirements](materi/01-studi-kasus-dan-requirements.md)
- [Serverless dan aplikasi modern](materi/02-serverless-dan-aplikasi-modern.md)
- [Event-driven architecture dan EventBridge](materi/03-event-driven-architecture-dan-eventbridge.md)
- [AWS Lambda](materi/04-aws-lambda.md)
- [Amazon API Gateway](materi/05-amazon-api-gateway.md)
- [Pilihan EC2, container, dan serverless](materi/06-techtalk-ec2-vs-container-vs-serverless.md)
- [Amazon SQS](materi/07-amazon-sqs.md)
- [Amazon SNS](materi/08-amazon-sns.md)
- [Keamanan serverless dasar](materi/09-keamanan-serverless-dasar.md)
- [Cognito dan keamanan API Gateway](materi/10-cognito-dan-keamanan-api-gateway.md)
- [Keamanan Lambda, data, dan auditing](materi/11-keamanan-lambda-data-dan-auditing.md)
- [AWS Step Functions](materi/12-aws-step-functions.md)
- [Techtalk desain arsitektur serverless](materi/13-techtalk-desain-arsitektur-serverless.md)
- [Observability CloudWatch dan X-Ray](materi/14-observability-cloudwatch-xray.md)
- [POC recap dan latihan soal](materi/15-poc-recap-dan-latihan-soal.md)
- [Konten slide terbaru](src/data/slides.js)
- [Graph dan pembuka](src/slides/diagrams.js)
