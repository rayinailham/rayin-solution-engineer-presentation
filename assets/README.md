# AWS Presentation Assets & Architecture Icons Hub

Koleksi lengkap aset visual resmi AWS untuk kebutuhan slide presentasi materi **AWS Solutions Architect – Designing a Serverless Architecture with Event-Driven Microservices**.

---

## 🚀 Quick Start: Visual Asset Gallery

Untuk melihat, menyalin path, atau men-drag and drop icon secara langsung ke slide presentasi (PowerPoint, Google Slides, Keynote, Canva, Figma):

1. Buka file **`assets/index.html`** di browser (klik ganda atau buka via file manager / Zen browser):
   ```bash
   xdg-open assets/index.html
   ```
2. Fitur gallery:
   - **Interactive Search**: Cari service apapun secara instan (contoh: `lambda`, `eventbridge`, `sqs`, `dynamodb`).
   - **Dark / Light Theme Toggle**: Uji kecocokan icon terhadap background slide gelap atau terang.
   - **One-Click Path Copy**: Salin relative file path untuk disisipkan ke markdown, HTML, atau LaTeX.
   - **Download Link**: Unduh SVG vector lossless atau PNG high-resolution (512px).

---

## 📊 Official PowerPoint Decks (Siap Pakai)

Tersedia template deck presentasi resmi dari AWS di folder **`assets/07-presentation-decks/`**:

- **[`AWS-Architecture-Icons-Deck_For-Dark-BG.pptx`](07-presentation-decks/AWS-Architecture-Icons-Deck_For-Dark-BG.pptx)**: Khusus slide bertema gelap (Dark Mode). Berisi icon, konektor panah, boundary box, dan panduan layout resmi AWS.
- **[`AWS-Architecture-Icons-Deck_For-Light-BG.pptx`](07-presentation-decks/AWS-Architecture-Icons-Deck_For-Light-BG.pptx)**: Khusus slide bertema terang (Light Mode / Clean White).

> [!TIP]
> **Dokumentasi Lengkap Aturan & Contoh Penggunaan**:  
> Seluruh aturan desain diagram resmi, DOs and DON'Ts, panduan nesting group, konektor, tipografi, serta katalog 26 kategori lengkap telah diekstrak dan didokumentasikan di **[`AWS-ARCHITECTURE-ICONS-GUIDELINES.md`](../AWS-ARCHITECTURE-ICONS-GUIDELINES.md)**.

Bisa dibuka langsung menggunakan **LibreOffice Impress**, **Microsoft PowerPoint**, atau di-upload ke **Google Slides**.

---

## 📁 Struktur Direktori Asset

Setiap service dan komponen disediakan dalam 3 hingga 4 format:
1. **`.svg`**: Vektor standar resmi AWS (skalabilitas tak terbatas, tidak pecah di proyektor 4K).
2. **`-512px.png`**: High-resolution PNG transparan (hasil rasterisasi render kualitas tajam).
3. **`-320px.png` / `-256px.png`**: Retina format bawaan AWS package (@5x).
4. **`-64px.png`**: Icon standar compact untuk diagram alur kecil.

```
assets/
├── index.html                                 # Visual Gallery interaktif
├── build_gallery.py                           # Generator script untuk index.html
├── 01-aws-core-logos/                         # Logo Utama AWS
│   ├── aws-logo.svg & .png (1200px)           # Logo AWS resmi (Dark Navy text + Orange Smile)
│   ├── aws-logo-white.svg & .png (1200px)     # Logo AWS resmi untuk background hitam/gelap
│   ├── aws-cloud-logo-box.svg & .png          # AWS Cloud Box icon (Light)
│   └── aws-cloud-logo-box-dark.svg & .png     # AWS Cloud Box icon (Dark)
│
├── 02-categories/                             # Category Icons AWS
│   ├── category-serverless.*                  # Icon Domain Serverless
│   ├── category-compute.*                     # Icon Domain Compute
│   ├── category-application-integration.*     # Icon Domain App Integration (EDA)
│   ├── category-containers.*                  # Icon Domain Containers
│   ├── category-databases.*                   # Icon Domain Databases
│   ├── category-security-identity.*           # Icon Domain Security & IAM
│   ├── category-storage.*                     # Icon Domain Storage
│   ├── category-management-governance.*       # Icon Domain CloudWatch / Governance
│   ├── category-networking-content-delivery.* # Icon Domain VPC / API GW
│   └── category-analytics.*                   # Icon Domain Analytics
│
├── 03-core-services/                          # Service Utama Sesuai 15 Modul
│   ├── 01-amazon-eventbridge/                 # Modul 03 (EDA Core Engine)
│   ├── 02-aws-lambda/                         # Modul 04 & 11 (Compute Core)
│   ├── 03-amazon-api-gateway/                 # Modul 05 & 10 (REST, HTTP, WebSocket)
│   ├── 04-amazon-sqs/                         # Modul 07 (Standard & FIFO Queues, DLQ)
│   ├── 05-amazon-sns/                         # Modul 08 (Pub/Sub & Fan-out)
│   ├── 06-aws-step-functions/                 # Modul 12 (State Machine & Workflow)
│   ├── 07-amazon-cognito/                     # Modul 10 (User Pools & Identity Pools)
│   ├── 08-aws-iam/                            # Modul 09 & 11 (Roles, Policies, Least Privilege)
│   ├── 09-amazon-s3/                          # Modul 11 & 13 (Object Storage & Static Web)
│   ├── 10-amazon-dynamodb/                    # Modul 13 & 15 (NoSQL Serverless Database)
│   ├── 11-amazon-cloudwatch/                  # Modul 14 (Logs, Metrics, Alarms, Insights)
│   ├── 12-aws-xray/                           # Modul 14 (Distributed Tracing & Service Map)
│   ├── 13-aws-kms/                            # Modul 11 (Envelope Encryption & KMS Keys)
│   ├── 14-aws-secrets-manager/                # Modul 11 (Credential & Rotation Management)
│   ├── 15-aws-cloudtrail/                     # Modul 11 (Governance & Audit Trails)
│   └── 16-aws-config/                         # Modul 11 (Resource Compliance Tracking)
│
├── 04-compute-and-container-comparison/       # Modul 06 (TechTalk EC2 vs Container vs Serverless)
│   ├── 01-amazon-ec2/                         # IaaS Virtual Machines
│   ├── 02-amazon-ecs/                         # Elastic Container Service
│   ├── 03-amazon-eks/                         # Elastic Kubernetes Service
│   ├── 04-amazon-ecr/                         # Elastic Container Registry
│   └── 05-aws-fargate/                        # Serverless Container Compute Engine
│
├── 05-network-and-security/                   # Modul 09, 10, 11 (Network Boundaries)
│   ├── 01-amazon-vpc/                         # Virtual Private Cloud
│   ├── 02-vpc-nat-gateway/                    # Outbound Internet Gateway untuk Private Subnet
│   ├── 03-vpc-endpoints-privatelink/          # PrivateLink ke AWS Services tanpa Internet
│   ├── 04-vpc-internet-gateway/               # Public Internet Ingress/Egress
│   ├── 05-aws-waf/                            # Web Application Firewall
│   └── 06-aws-shield/                         # DDoS Protection
│
├── 06-architecture-groups/                    # Kotak Pembungkus / Boundary Diagram
│   ├── AWS-Cloud-Group.*                      # Batas Region AWS Cloud
│   ├── VPC-Group.*                            # Batas Virtual Private Cloud (VPC)
│   ├── Public-Subnet-Group.*                  # Batas Public Subnet
│   ├── Private-Subnet-Group.*                 # Batas Private Subnet
│   ├── Region-Group.*                         # Batas Wilayah Geografis
│   ├── Auto-Scaling-Group.*                   # Batas Cluster Auto Scaling
│   └── Corporate-Data-Center-Group.*          # Batas On-Premises / Hybrid Cloud
│
├── 07-presentation-decks/                     # PPTX Toolkits Lengkap Siap Pakai
│   ├── AWS-Architecture-Icons-Deck_For-Dark-BG.pptx
│   └── AWS-Architecture-Icons-Deck_For-Light-BG.pptx
│
└── 08-analytics-and-supporting-services/      # Skenario Latihan & Telemetri EV
    ├── 01-amazon-kinesis-data-streams/        # Real-time Streaming Ingestion
    ├── 02-amazon-dynamodb-streams/            # Change Data Capture (CDC)
    ├── 03-amazon-eventbridge-pipes/           # Point-to-Point Event Wiring
    ├── 04-amazon-athena/                      # Serverless SQL Query di atas S3
    ├── 05-amazon-opensearch-service/          # Log Search & Analytics
    └── 06-amazon-rds/                         # Relational Database Service (Aurora/PostgreSQL)
```

---

## 🎯 Pemetaan Asset per Modul Materi Presentasi

| No | Modul Materi | Topik Utama | Asset Rekomendasi |
|:---|:---|:---|:---|
| **01** | `01-studi-kasus-dan-requirements.md` | Startup EV, Telemetri, Decoupling | `aws-logo`, `category-serverless`, `category-application-integration` |
| **02** | `02-serverless-dan-aplikasi-modern.md` | Monolith vs Microservices | `category-serverless`, `02-aws-lambda`, `AWS-Cloud-Group` |
| **03** | `03-event-driven-architecture-dan-eventbridge.md` | Event Buses, Rules, Schema, EDA | `01-amazon-eventbridge`, `03-amazon-eventbridge-pipes` |
| **04** | `04-aws-lambda.md` | Compute Model, Scaling, Concurrency | `02-aws-lambda`, `category-compute` |
| **05** | `05-amazon-api-gateway.md` | REST, HTTP, WebSocket APIs | `03-amazon-api-gateway`, `01-amazon-vpc` |
| **06** | `06-techtalk-ec2-vs-container-vs-serverless.md` | Trade-offs: EC2 vs ECS/EKS vs Lambda | `01-amazon-ec2`, `02-amazon-ecs`, `03-amazon-eks`, `05-aws-fargate`, `02-aws-lambda` |
| **07** | `07-amazon-sqs.md` | Standard & FIFO Queues, DLQ, Buffering | `04-amazon-sqs` |
| **08** | `08-amazon-sns.md` | Pub/Sub, Fan-Out, Topic Filtering | `05-amazon-sns` |
| **09** | `09-keamanan-serverless-dasar.md` | Shared Responsibility, Security Groups | `category-security-identity`, `08-aws-iam` |
| **10** | `10-cognito-dan-keamanan-api-gateway.md` | User Pools, Identity Pools, JWT | `07-amazon-cognito`, `03-amazon-api-gateway` |
| **11** | `11-keamanan-lambda-data-dan-auditing.md` | VPC Endpoints, KMS, Secrets, Auditing | `08-aws-iam`, `03-vpc-endpoints-privatelink`, `13-aws-kms`, `14-aws-secrets-manager`, `15-aws-cloudtrail`, `16-aws-config` |
| **12** | `12-aws-step-functions.md` | State Machines, Standard vs Express | `06-aws-step-functions` |
| **13** | `13-techtalk-desain-arsitektur-serverless.md` | Web App Email Collector (End-to-End) | `09-amazon-s3`, `03-amazon-api-gateway`, `02-aws-lambda`, `10-amazon-dynamodb` |
| **14** | `14-observability-cloudwatch-xray.md` | Logs, Metrics, Alarms, Distributed Trace | `11-amazon-cloudwatch`, `12-aws-xray` |
| **15** | `15-poc-recap-dan-latihan-soal.md` | End-to-end Solution Architecture | Seluruh icon arsitektur + `07-presentation-decks` |
