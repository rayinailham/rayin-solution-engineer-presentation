# Event-Driven Architecture & Amazon EventBridge

## Tujuan / Inti

Bagian ini menjelaskan **event-driven architecture** sebagai pola integrasi antar komponen aplikasi serverless, membandingkan komunikasi **synchronous vs asynchronous**, lalu memperkenalkan **Amazon EventBridge** sebagai event bus untuk menghubungkan komponen aplikasi lewat event. Dibahas pula komponen EventBridge (Event, Rule, Target), fitur developer/security/scale, cara kerjanya langkah demi langkah, serta Schema Registry.

> Event-driven architecture memungkinkan Anda men-*decouple* layanan, meningkatkan *velocity*, dan memudahkan *debugging*. Ini juga menghilangkan *bottleneck* saat fitur meluas ke banyak tim, sehingga tiap tim dapat maju lebih independen.

---

## 1. Masalah: Integrasi Berbasis API (Request-Response)

Cara umum membuat komponen aplikasi bekerja sama adalah lewat arsitektur **API-driven, request-response**. Komunikasinya bisa **synchronous** atau **asynchronous**.

### Analogi Diner: Komunikasi lewat API
Di dalam sit-down diner ada banyak event/service: ada yang memesan, menyiapkan tagihan (bill), menyiapkan pesanan (order), dan ada koki yang membuat donat dan pai.

Jika setiap komponen diekspos sebagai REST API:
1. Front end (kasir) mengumpulkan order → memanggil **Order API**.
2. Order API memanggil **Donut API**: *"order ini butuh lima strawberry donuts."*
3. Order API lalu memanggil **Invoice API**: *"tagih customer untuk order donat."*

**Masalah muncul saat menambah menu:**
- Mulai menjual pai → buat **Pie API**.
- Order API tadinya hanya tahu Donut API → harus di-*upgrade* agar bicara ke Donut API **dan** Pie API, sambil tetap memelihara kode ke Invoice API.
- Tambah lagi **Inventory API** yang harus diberi tahu setiap kali stok berubah ("baru keluar dua donat, kurangi inventory").

Akibatnya: **API contracts** antar service makin banyak, dan setiap penambahan fitur memaksa perubahan kode di service lain → *tight coupling*.

---

## 2. Solusi: Event-Driven Architecture

### Apa itu Event?
> *"An event is something that happened."*

Contoh event di berbagai aplikasi: *trading a share*, *a truck pulling up at a warehouse*, *a plane landing at an airport*. Secara formal: **event merepresentasikan perubahan state (change in state) atau sebuah update.** Event bisa **membawa state** itu sendiri, atau **berisi identifiers** untuk mencari informasi terkait.

### Cara Kerja (Analogi Diner Versi Event-Driven)
- Setelah ada **events**, event menjadi mekanisme berbagi informasi antar service.
- Service **mengamati (observing)** sebuah *channel of events*. Sebagian service tertarik pada event tertentu, sebagian tidak.
- Contoh: event **"customer orders a dozen donuts"**:
  - Service pembuat **donut** subscribe → mulai membuat donat.
  - Service pembuat **pie** tidak subscribe → mengabaikannya.
  - Service **invoicing** mendengar event order donat (customer ID ada di dalam event) → membuat tagihan untuk customer tersebut.
- **Event producers** memakai **message service** untuk berbagi event ke banyak consumer. Message service tahu consumer mana yang tertarik pada event mana, dan menangani *delivery*-nya.

### Keunggulan: Menambah Service Tanpa Mengubah yang Lain
- Tambah **inventory service** baru → tidak ada event yang berubah; event "order 12 donuts" tetap ditulis sama.
- Tidak perlu memodifikasi service lain. Service baru cukup ikut tertarik pada event yang sama ("the same thing that happened").
- Contoh event lain: **"order two pies"** gratis (free pie day) → pie service tertarik, inventory service meng-update, invoicing mendeteksi ini event *no-charge* sehingga tidak melakukan apa-apa.

### Buffer & Scaling lewat Messaging
- Message service bisa menyediakan **buffer** bagi consumer. Analogi: tiket kertas (paper tickets) dalam antrean saat hanya ada satu koki donat (satu consumer, satu donat pada satu waktu).
- **Scaling** mudah: "menyewa koki donat kedua" setara menambah resource pada consumer agar antrean (queue) diproses lebih cepat.

---

## 3. Synchronous vs Asynchronous Communication

### Synchronous Communication
- Client membuat request ke **Service A**. Service A memanggil **Service B**, lalu **menunggu** Service B merespons sebelum melanjutkan dan akhirnya merespons client.
- Contoh: Order service mengirim request ke **Invoice API** → invoice service membuat invoice dan **langsung merespons** dengan invoice lengkap. Order service tidak lanjut sampai invoice service selesai dan mengembalikan response.

### Asynchronous Communication (Event-Driven)
- **Tidak ada response path.** Service memunculkan (surface) event lalu langsung bergerak maju.
- Trade-off: tidak ada channel langsung bagi Service B untuk mengembalikan informasi ke Service A, selain konfirmasi bahwa event diterima. Namun di banyak kasus Anda tidak butuh *coupling* eksplisit antara request dan response.
- Contoh: Order service meminta donat dari Donut API; API **tidak** membalas dengan donat jadi. Ada langkah downstream (ambil donat dari rak / buat donat). Order service tidak perlu menunggu langkah itu untuk lanjut ke order berikutnya. Biasanya order service **langsung menerima acknowledgement** dengan sebuah *identifier* untuk mengecek kapan donat siap. Pekerjaan penyelesaian order terjadi asinkron dan tidak menghalangi order service pindah ke order berikutnya.

| Aspek | Synchronous | Asynchronous (Event-Driven) |
|-------|-------------|------------------------------|
| Response path | Ada; A menunggu B | Tidak ada; A langsung lanjut |
| Coupling | Lebih erat (request↔response) | Decoupled |
| Balasan ke A | Response lengkap | Hanya acknowledgement + identifier |
| Contoh | Order → Invoice API (invoice langsung) | Order → Donut API (diproses belakangan) |

---

## 4. Amazon EventBridge

**Amazon EventBridge** adalah layanan yang mendukung aplikasi serverless. Ia memakai **events** untuk menghubungkan komponen aplikasi, memudahkan membangun aplikasi event-driven yang scalable. Dipakai untuk me-*route* event dari sumber seperti aplikasi buatan sendiri (homegrown), AWS services, dan software pihak ketiga ke aplikasi consumer di seluruh organisasi.

EventBridge menyediakan cara konsisten untuk **ingest, filter, transform, dan deliver** events sehingga aplikasi baru cepat dibangun. Di console EventBridge Anda memilih **event source**, lalu memilih **target** dari AWS services — termasuk **AWS Lambda, Amazon SNS, dan Amazon Data Firehose**. EventBridge mengirim event secara **near real-time** otomatis.

### Fitur Developer (dari narasi)
- **Event source** bisa: aplikasi Anda sendiri, customer events, **AWS services** itu sendiri (EventBridge adalah tempat AWS menulis banyak event tentang infrastruktur, mis. "sebuah EC2 instance baru saja diluncurkan" muncul di default bus), dan **SaaS applications** (contoh: **Zendesk** dapat menulis event ke bus Anda).
- **Routing rules** untuk memfilter event; rule punya **targets** untuk mengirim event ke lokasi berbeda.
- **Event scheduling**: sintaks mirip **cron**, mis. buat event tiap 5 menit, atau jam 5 sore tiap Jumat.
- **Scale** ke sejumlah besar target.
- **Schema feature**: mendefinisikan bentuk (shape) data dan validasi event yang ditulis ke bus.

### Fitur Security & Scale
- **Fully managed and scalable.**
- **Near-real-time stream of system events** tentang AWS resources (menekan latency agar bisa bereaksi cepat).
- **Integrated CloudWatch metrics** (lihat jumlah event / performa aplikasi di CloudWatch Metrics).
- **Integrated IAM support including resource policies** (tulis IAM policy untuk menentukan identity mana boleh melakukan action apa di EventBridge).
- **SaaS-integrated application events travel over the AWS internal network** (penting untuk security compliance — jaringan mana yang dilalui pesan).

---

## 5. Komponen / Resource EventBridge

### Event Sources
- **AWS services** — sesuatu yang terjadi di infrastruktur AWS (mis. CloudFormation template selesai, EC2 baru launch).
- **Custom event bus (aplikasi Anda sendiri)** — tempat menulis event seperti "customer just ordered a pie".
- **SaaS applications / partner event sources** — mis. Zendesk; cara integrasi aplikasi lain.

### Event Bus
- **Default event bus** ada di setiap account — tempat event AWS service ditulis.
- **Custom event bus** — bisa dibuat tambahan; mis. satu bus untuk satu keluarga aplikasi yang saling tertarik pada event yang sama.
- **Partner event bus (SaaS event bus)** — tempat partner event ditulis.
- Semua event yang masuk ke EventBridge terasosiasi dengan **sebuah event bus**. **Rules terikat ke satu event bus**, jadi hanya berlaku untuk event di bus itu. Custom event bus bisa dibuat untuk mengirim/menerima event dari account atau Region berbeda.

### Rules
- **Rule** mencocokkan incoming events dan mengirimnya ke targets untuk diproses.
- Satu rule bisa mengirim event ke **banyak target** yang berjalan **paralel**.
- Rule berbasis **event pattern** (mendefinisikan struktur event dan field yang dicocokkan) **atau** berbasis **schedule** (menjalankan action pada interval reguler).

### Targets
- **Target** adalah resource atau endpoint tujuan pengiriman event saat event cocok dengan event pattern sebuah rule. Rule memproses data event dan mengirim informasi relevan ke target.
- EventBridge butuh **permission** untuk mengakses resource target.
- **Maksimal 5 target per rule** ("You can define up to five targets for each rule").
- Target bisa berupa AWS service seperti **Lambda** atau **CloudWatch Logs**, built-in targets, atau bahkan **bus di AWS account lain**.

---

## 6. Event Structure & Event Pattern

Contoh event (dari narasi):
- `source` = **AWS partner** (berasal dari aplikasi SaaS) — sesuatu terjadi di aplikasi SaaS.
- Detail tambahan mencakup **orderId** dan **department**.

Rule untuk aplikasi yang tertarik:
- Bisa minta **semua event** dari AWS partner SaaS tertentu.
- Bisa lebih detail: hanya event dari **department billing dan fulfillment**.
- Tiap rule punya **target** terasosiasi → menentukan event mana dikirim ke target mana.

### Komponen Event (dari halaman definisi)
Event selalu mencakup: **detail type**, **source**, dan **details**. Filter bisa dibuat berdasarkan tiap komponen ini. Contoh: rule pertama mencocokkan field `source`; rule kedua mencocokkan elemen spesifik di dalam bagian `detail`.

---

## 7. Cara Kerja EventBridge (Langkah demi Langkah)

Berdasarkan "How Amazon EventBridge works" (halaman 1–5):

1. **How it works (ringkas):** EventBridge menerima **event** (indikator perubahan environment) lalu menerapkan **rule** untuk me-*route* event ke **target**. Rule mencocokkan event ke target berdasarkan **event pattern** (struktur event) atau **schedule**. Contoh: saat **EC2 instance** berubah dari `pending` ke `running`, sebuah rule dapat mengirim event itu ke **Lambda function**.
2. **Event received from event source:** Semua event yang masuk terasosiasi dengan sebuah event bus. Rule terikat ke satu event bus (hanya berlaku untuk event di bus itu). Account punya **default event bus** untuk event AWS services, dan Anda bisa buat **custom event buses** untuk kirim/terima event dari account atau Region berbeda.
3. **Event definition:** Event selalu menyertakan **detail type, source, dan details**. Filter bisa dibuat atas tiap komponen. Pada contoh: rule pertama mencari match di field `source`; rule kedua mencari elemen spesifik di dalam bagian `detail`. Yang pertama match karena cocok `source`; yang kedua match karena cocok salah satu department di bagian `detail`.
4. **Event delivered to the target:** Bisa asosiasikan **banyak target** ke tiap rule. EventBridge butuh permission untuk mengakses target. **Maksimal 5 target per rule.** Target dipilih dari AWS services termasuk **Lambda, SNS, dan Amazon Data Firehose**.
5. **Summary:** Model asynchronous berbasis event bersifat *fast, clean, and easy to use*. **Publisher (SaaS application) dan consumer (kode di AWS) benar-benar decoupled** — tidak bergantung pada shared communication protocol, runtime environment, atau programming language. Anda bisa pakai Lambda function sederhana untuk menangani event dari SaaS, dan me-route event ke berbagai target AWS lain.

---

## 8. Fitur Lanjutan: Archive & Schema

### Event Archive
- Bisa diaktifkan; EventBridge membuat **managed rule** untuk bus yang menulis **setiap pesan** di bus itu ke archive.
- Kegunaan: **replay archived messages** ke bus asal pembuatannya → membantu *debugging*.

### Schema & Schema Discovery
- **Schema** mendefinisikan bentuk (shape) data — mis. customer event punya first name, last name, zip code, street address; menetapkan properti yang diharapkan.
- Dengan schema, bisa melakukan **validation** dan **generate code** untuk memudahkan membuat event yang cocok schema.
- **Schema discovery** bisa diaktifkan: memantau pesan di bus dan mulai menurunkan (derive) informasi schema otomatis; atau Anda isi schema sendiri.

### Schema Registry
- **Schema** merepresentasikan struktur sebuah event, biasanya mencakup judul (title) dan format tiap potongan data. Contoh: field `name` (text string) dan `phone number` (integer), plus pola seperti nomor telepon harus **10 digit**.
- Schema penting karena menunjukkan informasi apa yang ada di event dan membantu menulis kode berbasis data itu.
- **Schema registry** menyimpan koleksi schema yang bisa dicari (searchable) sehingga developer di organisasi mudah mengaksesnya — alih-alih menelusuri dokumentasi atau mencari penulis schema. Schema bisa ditambahkan manual atau diotomasi lewat fitur **EventBridge schema discovery**.

---

## 9. Terminologi Workflow EventBridge (ringkas)

Tiga komponen dalam workflow EventBridge:

| Komponen | Definisi |
|----------|----------|
| **Event** | Indikator perubahan di environment (AWS environment, AWS Partner SaaS service/aplikasi, atau aplikasi/service Anda sendiri) |
| **Target** | Resource/endpoint tujuan event saat cocok event pattern sebuah rule; butuh permission; **maks 5 target per rule** |
| **Rule** | Mencocokkan incoming events dan mengirim ke target (bisa banyak target paralel); berbasis event pattern atau schedule |

---

## 10. Diagram (deskripsi)

- **Navigasi "Event-Driven architecture"** — halaman pembuka konsep event-driven, menekankan decoupling, velocity, dan kemudahan debugging. Narasi memakai analogi diner (Order/Donut/Pie/Invoice/Inventory API → event-driven).
- **Navigasi "Amazon EventBridge"** — halaman pengenalan EventBridge sebagai event bus; diagram memperlihatkan event sources (AWS services, custom bus, SaaS/partner) → event bus → rules (match event pattern) → targets (Lambda, CloudWatch Logs, bus di account lain), plus contoh struktur event JSON (source=AWS partner, orderId, department) dan event pattern.
- **"Schema registry"** — diagram schema registry: koleksi schema tersimpan dan dapat dicari oleh developer, berisi struktur event (mis. name=string, phone=integer 10 digit).

---

## Poin Kunci untuk Presentasi

- **Event = something that happened**: merepresentasikan perubahan state; bisa membawa state atau berisi identifier.
- API request-response menimbulkan **tight coupling**: menambah fitur memaksa perubahan kode di banyak service (analogi Order/Donut/Pie/Inventory API).
- Event-driven **men-decouple** service: tambah service baru tanpa mengubah service lain; producer dan consumer saling independen.
- **Synchronous**: A menunggu B. **Asynchronous (event-driven)**: A langsung lanjut, hanya terima acknowledgement + identifier.
- **Amazon EventBridge** = event bus untuk ingest/filter/transform/deliver event near real-time ke target (Lambda, SNS, Data Firehose).
- Tiga komponen EventBridge: **Event, Rule, Target**. Rule terikat **satu event bus**; satu rule → banyak target paralel; **maks 5 target per rule**.
- Event bus: **default** (event AWS) dan **custom** (aplikasi sendiri), plus **partner/SaaS bus**; bisa lintas account/Region.
- Rule berbasis **event pattern** (match source/detail) atau **schedule** (cron-like, mis. tiap 5 menit / Jumat jam 5).
- Fitur penting: **CloudWatch metrics**, **IAM resource policies**, **Event Archive + replay** (debugging), **Schema Registry + schema discovery** (validasi & generate code).

## Kemungkinan Pertanyaan Audiens

**Q: Apa bedanya rule, target, dan event di EventBridge?**
A: Event adalah perubahan yang terjadi; rule mencocokkan event (via pattern atau schedule) dan menentukan tujuannya; target adalah resource/endpoint penerima event tersebut.

**Q: Berapa banyak target yang bisa dihubungkan ke satu rule?**
A: Maksimal **5 target per rule**, dan target-target itu berjalan paralel.

**Q: Kapan pakai synchronous vs asynchronous?**
A: Synchronous saat A butuh hasil B sebelum lanjut (mis. invoice harus langsung jadi). Asynchronous saat A cukup memunculkan event dan lanjut tanpa menunggu hasil (mis. pembuatan donat diproses belakangan).

**Q: Untuk apa fitur Event Archive?**
A: Menulis setiap pesan di bus ke archive, lalu bisa di-replay ke bus asalnya untuk membantu debugging.

**Q: Apa manfaat Schema Registry?**
A: Menyimpan struktur event yang dapat dicari sehingga developer tidak perlu menelusuri dokumentasi; memungkinkan validasi event dan generate code yang cocok schema. Bisa diisi manual atau otomatis lewat schema discovery.

**Q: Dari mana saja event bisa berasal?**
A: Dari aplikasi Anda sendiri (custom bus), dari AWS services (default bus, mis. EC2 launched), dan dari SaaS/partner seperti Zendesk (partner event source).
