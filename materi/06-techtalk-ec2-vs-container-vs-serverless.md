# Tech Talk: EC2 vs Container vs Serverless

## Tujuan / Inti

Bagian ini merangkum **Tech Talk** antara **Melissa** dan **Joe** yang membahas perbedaan tiga opsi compute AWS: **Amazon EC2**, **Containers**, dan **Serverless (AWS Lambda)**. Inti pesannya: ketiganya **bukan tangga maturity** (bukan progresi EC2 → container → serverless); yang benar adalah **memilih tool yang tepat untuk pekerjaan yang tepat** ("right tool for the right job"), dan sering kali jawabannya adalah **pendekatan hybrid**.

---

## 1. Konteks: Banyak Pilihan Compute

AWS menawarkan banyak opsi compute. Dulu **EC2 praktis satu-satunya pilihan**; sekarang pilihan melimpah. Banyak presentasi memecah opsi compute ke **tiga kategori besar**:
- **EC2 instances**
- **Containers**
- **Serverless**

### Mitos: Ini Bukan Tangga Maturity
- Visual tiga kategori ini kadang **menyesatkan** seolah ada progresi *cloud maturity*: semua mulai dari **EC2**, lalu pindah ke **containers**, lalu akhirnya **serverless**.
- Untuk sebagian customer itu memang perjalanannya — dan itu wajar — **tapi tidak berlaku untuk semua orang**.
- **Ketiga opsi bisa jadi titik awal.** Ini lebih tentang **memilih tool yang tepat untuk pekerjaan yang tepat**.

> Catatan: banyak customer selalu meraih **EC2 sebagai default** karena paling familiar — mudah dibandingkan dengan on-prem server atau virtual machine. Bagi yang baru di cloud, workload yang berjalan sepenuhnya di Lambda functions adalah hal yang belum pernah mereka lihat.

---

## 2. Amazon EC2 — Satu Kata: **Control**

Jika harus memilih satu kata untuk EC2: **control**.

- EC2 adalah pilihan utama saat butuh **full control** di level instance.
- Anda mendapat pilihan **operating system**, bisa **install custom software**, dan **tune** semuanya persis sesuai keinginan.
- Konsekuensinya: Anda **bertanggung jawab atas segalanya** — dari *scaling the infrastructure*, *patching the OS*, hingga *deploying applications*.
- Banyak dari itu bisa diotomasi, tetapi **keputusan seberapa banyak otomasi dan caranya ada di tangan Anda**.

### Analogi: Memiliki Mobil
- EC2 seperti **memiliki mobil**: Anda punya kontrol penuh atas semua opsi yang dipilih, tetapi juga **bertanggung jawab atas seluruh maintenance**.
- Kadang bahkan seperti **memiliki armada mobil (fleet of cars)**.

### Cocok Untuk
- Long-running processes.
- Aplikasi yang butuh **konfigurasi OS spesifik**.
- Saat butuh **full control** atas infrastruktur.

---

## 3. Containers — Satu Kata: **Agility**

Untuk containers, banyak keunggulan (portability, efficiency), tetapi satu kata yang dipilih: **agility**.

- Itu sebabnya containers sering muncul saat membahas **memecah aplikasi monolithic menjadi microservices**.
- Perbandingan migrasi:
  - **Lift and shift ke EC2**: workload berperilaku mirip seperti di on-prem — lebih scalable dan lebih cost efficient, tapi **tidak radикal berbeda**.
  - **Refactor legacy apps menjadi microservices modern**: mulai membuka lebih banyak **agility** yang ditawarkan cloud; lebih agile di setiap tahap.
- Lebih agile di **development** (push perubahan kecil lebih sering tanpa menunggu big release), di **integration**, dan di **production** (scale fast, fail fast, recover quickly) karena aplikasi containerized sangat **portable**.
- Cocok untuk aplikasi yang perlu **scale out horizontally** tetapi tidak butuh full control ala EC2.

### Pilihan di Dunia Container
- Memilih antara AWS managed orchestrators: **Amazon ECS** atau **Amazon EKS**.
- Memilih menjalankan container di **EC2 instances** atau **serverless di AWS Fargate**.
- **Fargate mengaburkan garis (blur the line)** antara container dan serverless — serverless dan container bisa berpadu sangat baik.

### Cocok Untuk
- Microservices.
- Aplikasi yang butuh **environment konsisten** antara development dan production.
- Saat ingin **keseimbangan antara control dan management overhead**.

---

## 4. Serverless / AWS Lambda — Satu Kata: **Event-Driven**

Kata yang dipilih untuk serverless dengan Lambda: **event-driven** (meski hyphenated).

- Lambda luar biasa untuk workload yang **merespons events** seperti uploads, clicks, atau updates. Anda **hanya mengurus kode**; AWS menangani sisanya.
- Contoh umum: **image processing service** memakai Lambda functions (contoh yang sering dipakai di banyak course AWS) — ilustrasi kekuatan Lambda.
- **Latency & scaling**: jika peduli latency, Anda bisa **scale out Lambda functions lebih cepat** daripada opsi lain yang dibahas, terutama dengan **provisioned concurrency**.
- **Cost efficiency**: saat demand berhenti, Anda **scale to zero** — berbeda dari EC2 instances atau containers yang juga scalable tetapi biasanya **longer running**.
- Cocok untuk hal yang sangat **transactional dan dekat ke user**, mis. **point-of-sale retail**.
- Dapat di-*orchestrate* memakai **Step Functions state machine**.

### Batasan
- **15-minute execution time limit** — batas waktu eksekusi Lambda.

### Cocok Untuk
- **Event-driven processing**.
- **Short-running tasks**.
- Saat ingin **fokus murni pada kode** tanpa mengelola infrastruktur.

---

## 5. Cara Memutuskan (Breakdown)

Pendekatan pemilihan yang diusulkan:

| Opsi | Pilih saat... |
|------|---------------|
| **EC2** | Long-running processes, aplikasi butuh konfigurasi OS spesifik, atau butuh **full control** atas infrastruktur |
| **Containers** | Microservices, aplikasi butuh **environment konsisten** antara dev & prod, atau ingin **keseimbangan** antara control dan management overhead |
| **Lambda** | **Event-driven processing**, short-running tasks, atau ingin **fokus murni pada kode** tanpa mengelola infrastruktur |

---

## 6. Pertimbangan Biaya (Cost)

- **EC2**: Anda tetap **membayar meski idle** (saat menganggur).
- **Lambda**: hanya **membayar untuk yang dipakai, sampai ke millisecond**.
- **Containers**: **di antara keduanya** — terutama dengan **Fargate**, Anda membayar untuk **resource yang dipakai container** Anda.

---

## 7. Contoh Keputusan: Aplikasi Retail

**Skenario**: customer membangun aplikasi retail dengan workload bervariasi — sibuk di siang hari, sepi di malam hari, dan kadang **lonjakan besar (huge spikes)** saat event sale besar.

**Usulan: pendekatan hybrid.**
- **Lambda** untuk bagian **event-driven** seperti **processing orders** dan **handling sales events**.
- **Containers** untuk **main application services**.
- **EC2** untuk komponen yang butuh **konfigurasi khusus (specialized configuration)**.

### Pesan Penutup
- Ini **bukan soal memilih satu solusi**, tetapi **memilih tool yang tepat untuk tiap bagian aplikasi**.
- Bagian terbaiknya: **ketiganya terintegrasi baik bersama**. Contoh:
  - Lambda functions dapat men-*trigger* container tasks.
  - Containers dapat memanggil Lambda functions.
  - EC2 instances dapat meng-host databases yang terhubung ke semuanya.

> Kutipan kunci:
> *"It is really not always about picking one solution, but choosing the right tool for each part of the application... and the best part is that they all integrate well together."*

---

## 8. Ringkasan Perbandingan Tiga Opsi

| Aspek | EC2 | Containers | Serverless (Lambda) |
|-------|-----|------------|---------------------|
| Satu kata | **Control** | **Agility** | **Event-driven** |
| Kendali infra | Penuh (OS, software, tuning) | Seimbang | Minimal (fokus kode) |
| Tanggung jawab | Scaling, patching OS, deploy | Sebagian (orkestrasi) | AWS tangani hampir semua |
| Scaling | Scalable, longer running | Scale out horizontal, portable | Scale cepat, **scale to zero**, provisioned concurrency |
| Biaya | Bayar walau idle | Di antara (Fargate: bayar resource container) | Bayar per pakai, sampai millisecond |
| Batas | — | — | **15 menit** execution limit |
| Cocok | Long-running, OS spesifik, full control | Microservices, env konsisten, balance | Event-driven, short tasks, fokus kode |
| Orkestrasi | — | ECS / EKS; EC2 atau Fargate | Step Functions |

---

## 9. Diagram (deskripsi)

- **Navigasi "EC2 vs Serverless vs Containers"** — halaman pembuka Tech Talk. Format percakapan antara dua cloud technologist (Melissa dan Joe) yang membandingkan tiga opsi compute, menekankan bahwa ini bukan tangga maturity melainkan pemilihan tool yang tepat, dengan analogi (EC2 = memiliki mobil/armada) dan contoh skenario retail hybrid.

---

## Poin Kunci untuk Presentasi

- Tiga opsi compute AWS: **EC2, Containers, Serverless (Lambda)** — **bukan tangga maturity**, melainkan **right tool for the right job**.
- **EC2 = Control**: full control OS/software/tuning, tapi tanggung jawab penuh (scaling, patching, deploy). Analogi: memiliki mobil/armada.
- **Containers = Agility**: portable, cocok memecah monolith jadi microservices; scale fast, fail fast, recover quickly; pilih **ECS/EKS**, jalankan di **EC2 atau Fargate**.
- **Serverless/Lambda = Event-Driven**: hanya urus kode, scale cepat (**provisioned concurrency**), **scale to zero**; batas **15 menit**; orkestrasi via **Step Functions**.
- **Fargate** mengaburkan garis container vs serverless (bayar resource container yang dipakai).
- Biaya: **EC2 bayar walau idle**, **Lambda bayar per pakai sampai millisecond**, **containers di antara**.
- Keputusan: EC2 untuk long-running/OS spesifik/full control; containers untuk microservices/env konsisten/balance; Lambda untuk event-driven/short task/fokus kode.
- Skenario retail variabel → **hybrid**: Lambda (orders & sales events), containers (main services), EC2 (komponen konfigurasi khusus).
- Ketiganya **terintegrasi baik**: Lambda memicu container tasks, container memanggil Lambda, EC2 meng-host database yang terhubung ke semuanya.

## Kemungkinan Pertanyaan Audiens

**Q: Apakah harus mulai dari EC2 lalu pindah ke serverless?**
A: Tidak. Itu mitos tangga maturity. Ketiga opsi (EC2, container, serverless) bisa jadi titik awal; pilih sesuai kebutuhan workload.

**Q: Satu kata untuk tiap opsi compute?**
A: EC2 = **control**, containers = **agility**, serverless/Lambda = **event-driven**.

**Q: Bagaimana perbandingan biayanya?**
A: EC2 membayar meski idle; Lambda membayar hanya saat dipakai hingga millisecond; containers di antara keduanya, dengan Fargate membayar resource yang dipakai container.

**Q: Untuk aplikasi retail dengan lonjakan trafik, opsi apa yang disarankan?**
A: Pendekatan hybrid: Lambda untuk bagian event-driven (orders, sales events), containers untuk main services, dan EC2 untuk komponen yang butuh konfigurasi khusus.

**Q: Apa peran Fargate dalam diskusi ini?**
A: Fargate menjalankan container secara serverless sehingga mengaburkan garis antara container dan serverless; Anda membayar untuk resource yang dipakai container tanpa mengelola server.

**Q: Apa batasan utama Lambda yang perlu diingat?**
A: Batas waktu eksekusi **15 menit**, sehingga tidak cocok untuk proses long-running.
