# Designing a Serverless Architecture with Event-Driven Microservices

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![GSAP](https://img.shields.io/badge/GSAP-3.x-88CE02?logo=greensock&logoColor=white)](https://greensock.com/gsap/)
[![AWS Architecture](https://img.shields.io/badge/AWS-Official%20Icons%20Light%20Theme-232F3E?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/architecture/icons/)

An interactive, production-grade web keynote presentation illustrating the transition from a monolithic virtual server topology to a resilient, decoupled event-driven serverless architecture on Amazon Web Services (AWS).

> **Presenter**: Rayina Ilham — IT Operation Intern at AnterAja  
> **Course / Track**: AWS Skill Builder • Solutions Architect (Intermediate)

---

## 🌟 Key Highlights & Features

- **17 Interactive Keynote Slides**: Spans the full architectural journey across four distinct acts:
  - **Act I: Introduction & Challenges** (Cover, EV order journey, monolith collapse, decoupled event-driven paradigm).
  - **Act II: Building the Serverless Engine** (Amazon EventBridge, AWS Lambda & Firecracker, Amazon API Gateway, compute spectrum FaaS vs Containers vs IaaS, Amazon SQS & SNS buffering, automated CI/CD with AWS SAM).
  - **Act III: Security, Orchestration, Data & Observability** (Cognito & WAF Zero-Trust, VPC PrivateLink & KMS, AWS Step Functions distributed Saga, DynamoDB single-table design, end-to-end tracing with AWS X-Ray & CloudWatch).
  - **Act IV: Architectural Victory & Executive Summary** (Grand end-to-end production topology, 5 golden rules of serverless, go-live scorecard & interactive Q&A).
- **Official AWS Architecture Standards**: Built using official AWS 2026 Light Background iconography, strict orthogonal connector routings, and AWS Cloud boundary boxes.
- **Interactive Node Inspector Drawer**: Clicking on any architectural node on the stage opens a deep-dive technical drawer displaying architectural SLA, operational role, real JSON event payloads, and least-privilege IAM policies.
- **GSAP FLIP Motion System**: Seamless, smooth animated transitions between architectural states, including carrying service nodes and expanding event routers without jarring layout shifts.
- **Hardware-Accelerated Fluidity**: 60 FPS transitions driven by GSAP 3 and hardware compositing.
- **Complete Offline Portability**: Produces a standalone, single-file HTML bundle via `vite-plugin-singlefile` with all vector assets and styles inlined.

---

## 🛠️ Tech Stack

- **Core**: Vanilla JavaScript (Modern ES Modules)
- **Animation**: [GSAP 3](https://greensock.com/gsap/) (GreenSock Animation Platform)
- **Bundler & Dev Server**: [Vite 6](https://vitejs.dev/) + [`vite-plugin-singlefile`](https://github.com/richardtallent/vite-plugin-singlefile)
- **Typography**: Google Fonts (`Newsreader` serif headline, `Plus Jakarta Sans` body, `JetBrains Mono` code & metadata)
- **Testing & Verification**: [Playwright](https://playwright.dev/) with headless/headed GPU offload runners

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (recommended: v24.x)
- npm 10+

### Installation
```bash
git clone https://github.com/rayinailham/aws-serverless-eda-presentation.git
cd aws-serverless-eda-presentation
npm install
```

### Running Locally (Dev Server with HMR)
```bash
npm run dev
```
Open [http://localhost:5175](http://localhost:5175) in your modern browser.

### Building Standalone Single-File Bundle
```bash
npm run build
```
The optimized single-file distribution will be generated in `dist/index.html`.

---

## ⌨️ Presentation Keyboard Controls

| Key | Action |
|---|---|
| <kbd>→</kbd> / <kbd>Space</kbd> / <kbd>PageDown</kbd> | Next Slide |
| <kbd>←</kbd> / <kbd>PageUp</kbd> | Previous Slide |
| <kbd>F</kbd> | Toggle Fullscreen Mode |
| <kbd>Esc</kbd> | Close Node Inspector Drawer |
| <kbd>Tab</kbd> | Cycle through interactive inspectable nodes |
| <kbd>Enter</kbd> / <kbd>Space</kbd> (on node) | Open Service Inspector Drawer |

---

## 📁 Repository Structure

```
.
├── assets/                  # Official AWS architecture SVG icons & categories
├── index.html               # Main HTML entry point
├── package.json             # Project dependencies and runner scripts
├── vite.config.js           # Vite configuration & single-file plugin
├── src/
│   ├── data/
│   │   ├── slides.js        # Slide definitions, narrative copy & metadata
│   │   └── inspectors.js    # Architectural specs, SLA & real JSON payloads
│   ├── slides/
│   │   └── diagrams.js      # SVG diagram renderers & GSAP timelines per slide
│   ├── styles/
│   │   └── main.css         # Keynote styling, typography & layout system
│   └── main.js              # PresentationApp state machine & event handlers
└── scripts/                 # Automated validation & GPU test suites
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).  
Official AWS Architecture Icons and trademarks are property of Amazon Web Services, Inc.
