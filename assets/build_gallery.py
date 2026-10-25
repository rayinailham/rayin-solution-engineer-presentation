#!/usr/bin/env python3
import os
import json

categories_meta = [
    {
        "id": "logos",
        "title": "AWS Core Brand & Cloud Logos",
        "badge": "Brand Assets",
        "desc": "Official Amazon Web Services smile logos (dark & white) and AWS Cloud box logos in SVG & high-res PNG.",
        "dir": "assets/01-aws-core-logos"
    },
    {
        "id": "categories",
        "title": "AWS Architectural Categories",
        "badge": "Domains",
        "desc": "Category icons representing core AWS domains (Serverless, Compute, Integration, Databases, Security, etc.).",
        "dir": "assets/02-categories"
    },
    {
        "id": "core-services",
        "title": "Core Services (EDA & Serverless Modules)",
        "badge": "Primary Services",
        "desc": "Primary services featured across the 15 modules (EventBridge, Lambda, API Gateway, SQS, SNS, Step Functions, Cognito, S3, DynamoDB, CloudWatch, X-Ray, etc.).",
        "dir": "assets/03-core-services",
        "subdirs": True
    },
    {
        "id": "compute-comparison",
        "title": "Compute & Containers (Module 06 TechTalk)",
        "badge": "Architecture Comparison",
        "desc": "EC2, ECS, EKS, ECR, and Fargate for architectural trade-off slides.",
        "dir": "assets/04-compute-and-container-comparison",
        "subdirs": True
    },
    {
        "id": "network-security",
        "title": "Networking & Security Services",
        "badge": "Security & Infra",
        "desc": "VPC, PrivateLink Endpoints, NAT Gateway, Internet Gateway, WAF, and Shield.",
        "dir": "assets/05-network-and-security",
        "subdirs": True
    },
    {
        "id": "supporting",
        "title": "Analytics & Supporting Event Services",
        "badge": "Ecosystem",
        "desc": "Kinesis Data Streams, DynamoDB Streams, EventBridge Pipes, Athena, OpenSearch, RDS.",
        "dir": "assets/08-analytics-and-supporting-services",
        "subdirs": True
    },
    {
        "id": "groups",
        "title": "Architecture Groups & Boundaries",
        "badge": "Diagram Components",
        "desc": "Official AWS group boundary icons for Regions, VPC, Subnets, and Auto Scaling groups.",
        "dir": "assets/06-architecture-groups"
    }
]

catalog = []

for cat in categories_meta:
    cat_items = []
    base_dir = cat["dir"]
    if not os.path.exists(base_dir):
        continue
    if cat.get("subdirs"):
        subdirs = sorted(os.listdir(base_dir))
        for sd in subdirs:
            sd_path = os.path.join(base_dir, sd)
            if os.path.isdir(sd_path):
                files = os.listdir(sd_path)
                svg_f = next((f for f in files if f.endswith(".svg")), None)
                png_512 = next((f for f in files if "512px" in f and f.endswith(".png")), None)
                png_320 = next((f for f in files if "320px" in f and f.endswith(".png")), None)
                png_64 = next((f for f in files if "64px" in f and f.endswith(".png")), None)
                name = sd.replace("-", " ").title()
                if name.startswith("0") or name.startswith("1"):
                    parts = name.split(" ", 1)
                    if len(parts) > 1:
                        name = parts[1]
                cat_items.append({
                    "name": name,
                    "rel_dir": sd_path,
                    "svg": os.path.join(sd_path, svg_f) if svg_f else None,
                    "png_512": os.path.join(sd_path, png_512) if png_512 else None,
                    "png_320": os.path.join(sd_path, png_320) if png_320 else None,
                    "png_64": os.path.join(sd_path, png_64) if png_64 else None,
                })
    else:
        files = sorted(os.listdir(base_dir))
        groups = {}
        for f in files:
            if f.endswith((".svg", ".png")):
                stem = f.split(".")[0].replace("-512px", "").replace("-256px", "").replace("-highres", "").replace("-64px", "").replace("-320px", "")
                groups.setdefault(stem, {})[f] = os.path.join(base_dir, f)
        
        for stem, fdict in sorted(groups.items()):
            svg_f = next((p for f, p in fdict.items() if f.endswith(".svg")), None)
            png_512 = next((p for f, p in fdict.items() if "512px" in p or "256px" in p or "highres" in p or "aws-logo.png" in p or "white.png" in p), None)
            png_reg = next((p for f, p in fdict.items() if p.endswith(".png") and p != png_512), None)
            name = stem.replace("-", " ").title()
            cat_items.append({
                "name": name,
                "rel_dir": base_dir,
                "svg": svg_f,
                "png_512": png_512,
                "png_320": None,
                "png_64": png_reg
            })
    catalog.append({
        "meta": cat,
        "items": cat_items
    })

# Now generate modern HTML gallery
html_content = f"""<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AWS Presentation Assets & Icon Hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {{
      --bg: #0d1117;
      --card-bg: rgba(22, 27, 34, 0.75);
      --card-border: rgba(255, 255, 255, 0.08);
      --card-hover: rgba(33, 38, 45, 0.95);
      --text: #f0f6fc;
      --text-muted: #8b949e;
      --accent: #ff9900;
      --accent-glow: rgba(255, 153, 0, 0.25);
      --blue: #38bdf8;
      --green: #3fb950;
      --purple: #a855f7;
      --tile-bg: rgba(13, 17, 23, 0.85);
      --tile-border: rgba(255, 255, 255, 0.06);
    }}

    body.light-mode {{
      --bg: #f8fafc;
      --card-bg: rgba(255, 255, 255, 0.9);
      --card-border: rgba(0, 0, 0, 0.08);
      --card-hover: #ffffff;
      --text: #0f172a;
      --text-muted: #64748b;
      --accent: #ea580c;
      --accent-glow: rgba(234, 88, 12, 0.2);
      --tile-bg: #f1f5f9;
      --tile-border: rgba(0, 0, 0, 0.05);
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
    }}

    body {{
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding-bottom: 80px;
    }}

    header {{
      background: linear-gradient(180deg, rgba(255, 153, 0, 0.1) 0%, transparent 100%);
      border-bottom: 1px solid var(--card-border);
      padding: 48px 32px 36px;
      margin-bottom: 40px;
      backdrop-filter: blur(12px);
    }}

    .container {{
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
    }}

    .header-content {{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 24px;
    }}

    .title-group h1 {{
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 14px;
    }}

    .title-group h1 span.aws-badge {{
      background: var(--accent);
      color: #000;
      font-size: 0.9rem;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
      letter-spacing: 0.05em;
    }}

    .title-group p {{
      color: var(--text-muted);
      font-size: 1.05rem;
      margin-top: 8px;
      max-width: 780px;
    }}

    .controls {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}

    .btn {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      border: 1px solid var(--card-border);
      background: var(--card-bg);
      color: var(--text);
    }}

    .btn:hover {{
      background: var(--card-hover);
      border-color: var(--accent);
    }}

    .btn-primary {{
      background: var(--accent);
      color: #000;
      border-color: var(--accent);
    }}

    .btn-primary:hover {{
      background: #e68a00;
      color: #000;
    }}

    .filter-bar {{
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
      flex-wrap: wrap;
      align-items: center;
    }}

    .search-input {{
      flex: 1;
      min-width: 260px;
      padding: 12px 18px;
      border-radius: 10px;
      border: 1px solid var(--card-border);
      background: var(--card-bg);
      color: var(--text);
      font-size: 0.95rem;
      outline: none;
    }}

    .search-input:focus {{
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }}

    .quick-decks {{
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }}

    .quick-decks-text h3 {{
      font-size: 1.15rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }}

    .quick-decks-text p {{
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-top: 4px;
    }}

    .deck-buttons {{
      display: flex;
      gap: 12px;
    }}

    .category-section {{
      margin-bottom: 48px;
    }}

    .category-header {{
      display: flex;
      align-items: baseline;
      gap: 14px;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 12px;
    }}

    .category-header h2 {{
      font-size: 1.35rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }}

    .category-header .badge {{
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      background: rgba(255, 153, 0, 0.15);
      color: var(--accent);
    }}

    .category-header p {{
      color: var(--text-muted);
      font-size: 0.88rem;
      flex: 1;
    }}

    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 18px;
    }}

    .asset-card {{
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      position: relative;
    }}

    .asset-card:hover {{
      border-color: rgba(255, 153, 0, 0.4);
      background: var(--card-hover);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    }}

    .preview-box {{
      height: 120px;
      background: var(--tile-bg);
      border: 1px solid var(--tile-border);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      overflow: hidden;
      position: relative;
    }}

    .preview-box img {{
      max-height: 84px;
      max-width: 84px;
      object-fit: contain;
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));
    }}

    .asset-title {{
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }}

    .asset-actions {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: auto;
    }}

    .action-btn {{
      padding: 7px 10px;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      text-align: center;
      text-decoration: none;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text);
      border: 1px solid var(--card-border);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }}

    .action-btn:hover {{
      background: var(--accent);
      color: #000;
      border-color: var(--accent);
    }}

    .copy-chip {{
      grid-column: span 2;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      padding: 6px 8px;
      border-radius: 6px;
      background: rgba(0,0,0,0.25);
      border: 1px dashed var(--card-border);
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}

    .copy-chip:hover {{
      color: var(--accent);
      border-color: var(--accent);
    }}

    .toast {{
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #3fb950;
      color: #000;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.9rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      display: none;
      z-index: 1000;
    }}
  </style>
</head>
<body>

  <header>
    <div class="container header-content">
      <div class="title-group">
        <h1>
          <span class="aws-badge">AWS</span>
          Presentation Assets & Architecture Icons
        </h1>
        <p>Koleksi aset visual resmi AWS untuk materi <strong>Designing a Serverless Architecture with Event-Driven Microservices</strong>. Tersedia format SVG lossless vector, high-res PNG (512px & 320px), serta slide deck PPTX resmi siap pakai.</p>
      </div>
      <div class="controls">
        <button class="btn" id="theme-toggle" onclick="toggleTheme()">🌓 Switch Theme</button>
      </div>
    </div>
  </header>

  <main class="container">
    <!-- PPTX Toolkits Banner -->
    <div class="quick-decks">
      <div class="quick-decks-text">
        <h3>📊 Official AWS PPTX Presentation Toolkits Ready!</h3>
        <p>Template presentasi resmi AWS berisi seluruh shape arsitektur, konektor, icon grup, dan pedoman diagram siap copy-paste.</p>
      </div>
      <div class="deck-buttons">
        <a class="btn btn-primary" href="07-presentation-decks/AWS-Architecture-Icons-Deck_For-Dark-BG.pptx" download>
          📥 Dark BG Deck (.pptx)
        </a>
        <a class="btn" href="07-presentation-decks/AWS-Architecture-Icons-Deck_For-Light-BG.pptx" download>
          📥 Light BG Deck (.pptx)
        </a>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="filter-bar">
      <input type="text" id="search" class="search-input" placeholder="🔍 Cari icon service (contoh: Lambda, EventBridge, SQS, DynamoDB, Cognito...)" oninput="filterAssets()">
    </div>

    <!-- Dynamic Categories -->
"""

for cat in catalog:
    meta = cat["meta"]
    items = cat["items"]
    html_content += f"""
    <section class="category-section" id="{meta['id']}">
      <div class="category-header">
        <h2>{meta['title']}</h2>
        <span class="badge">{meta['badge']}</span>
        <p>{meta['desc']}</p>
      </div>
      <div class="grid">
    """
    for it in items:
        # Determine image to show in preview box
        img_src = it["svg"] or it["png_512"] or it["png_64"]
        if not img_src:
            continue
        # Clean relative path for web
        rel_img = img_src.replace("assets/", "")
        svg_rel = it["svg"].replace("assets/", "") if it["svg"] else ""
        png512_rel = it["png_512"].replace("assets/", "") if it["png_512"] else ""
        png64_rel = it["png_64"].replace("assets/", "") if it["png_64"] else ""
        
        # Primary copy path
        copy_path = svg_rel if svg_rel else (png512_rel if png512_rel else rel_img)

        html_content += f"""
        <div class="asset-card" data-name="{it['name'].lower()}">
          <div class="preview-box">
            <img src="{rel_img}" alt="{it['name']}" loading="lazy">
          </div>
          <div class="asset-title" title="{it['name']}">{it['name']}</div>
          <div class="asset-actions">
            {'<a class="action-btn" href="' + svg_rel + '" download>SVG</a>' if svg_rel else ''}
            {'<a class="action-btn" href="' + png512_rel + '" download>PNG High-Res</a>' if png512_rel else ('<a class="action-btn" href="' + png64_rel + '" download>PNG</a>' if png64_rel else '')}
            <div class="copy-chip" onclick="copyText('assets/{copy_path}')" title="Klik untuk copy relative path">
              <span>assets/{copy_path.split('/')[-1]}</span>
              <span>📋</span>
            </div>
          </div>
        </div>
        """
    html_content += """
      </div>
    </section>
    """

html_content += """
  </main>

  <div id="toast" class="toast">Path copied to clipboard!</div>

  <script>
    function toggleTheme() {
      document.body.classList.toggle('light-mode');
    }

    function copyText(text) {
      navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById('toast');
        toast.textContent = 'Copied: ' + text;
        toast.style.display = 'block';
        setTimeout(() => {
          toast.style.display = 'none';
        }, 2200);
      });
    }

    function filterAssets() {
      const q = document.getElementById('search').value.toLowerCase();
      const cards = document.querySelectorAll('.asset-card');
      cards.forEach(card => {
        const name = card.getAttribute('data-name');
        if (name.includes(q)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>
"""

with open("assets/index.html", "w") as f:
    f.write(html_content)

print(f"Gallery generated successfully at assets/index.html with {sum(len(c['items']) for c in catalog)} icons!")
