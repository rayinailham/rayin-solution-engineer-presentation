#!/usr/bin/env python3
import re

with open('src/slides/diagrams.js', 'r') as f:
    code = f.read()

# ----------------------------------------------------
# SLIDE 03
# ----------------------------------------------------
old_s03 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          <marker id="arrow-03" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#242f3e" />
          </marker>
        </defs>

        <!-- TIER 1: COMPARISON ARCHITECTURE (y=20..315) -->
        <!-- LEFT SIDE: The Fragile Monolith (Red Danger Zone) -->
        <g transform="translate(15, 20)">
          <rect width="455" height="295" rx="10" fill="#fff5f5" stroke="#fca5a5" stroke-width="2"/>
          <rect x="0" y="0" width="455" height="38" rx="10" fill="#ef4444"/>
          <text x="227" y="25" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif">⚠ MONOLITHIC EC2 CLUSTER (SPOF)</text>

          <!-- Ingress Arrow -->
          <text x="227" y="62" fill="#991b1b" font-size="11" font-weight="600" text-anchor="middle" font-family="'JetBrains Mono', monospace">Flash Sale Burst: 25,000 RPS</text>
          <path d="M 227 68 L 227 88" stroke="#ef4444" stroke-width="2.5" marker-end="url(#arrow-03)"/>'''

new_s03 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          ${renderOpenArrowMarker("arrow-03", "#242f3e")}
          ${renderOpenArrowMarker("arrow-03-red", "#ef4444")}
          ${renderOpenArrowMarker("arrow-03-green", "#16a34a")}
        </defs>

        <!-- TIER 1: COMPARISON ARCHITECTURE (y=20..315) -->
        <!-- LEFT SIDE: The Fragile Monolith (Red Danger Zone) -->
        <g transform="translate(15, 20)">
          <rect width="455" height="295" rx="8" fill="#fff5f5" stroke="#fca5a5" stroke-width="1.8"/>
          <g transform="translate(0, 0)">
            <rect width="260" height="26" rx="4" fill="#475569"/>
            <image href="/assets/06-architecture-groups/Corporate-Data-Center-Group.svg" x="4" y="3" width="20" height="20"/>
            <text x="28" y="17" fill="#ffffff" font-size="10.5" font-weight="700" font-family="'Plus Jakarta Sans', sans-serif">Corporate Data Center / On-Premises</text>
          </g>
          <text x="227" y="58" fill="#991b1b" font-size="11" font-weight="600" text-anchor="middle" font-family="'JetBrains Mono', monospace">Flash Sale Burst: 25,000 RPS</text>
          <path d="M 227 64 L 227 86" stroke="#ef4444" stroke-width="2.5" marker-end="url(#arrow-03-red)"/>'''

assert old_s03 in code, "old_s03 not found"
code = code.replace(old_s03, new_s03)

# Slide 03 Right side
old_s03_right = '''        <!-- RIGHT SIDE: The Resilient Serverless Architecture (Green Zone) -->
        <g transform="translate(490, 20)">
          <rect width="455" height="295" rx="10" fill="#f0fdf4" stroke="#86efac" stroke-width="2"/>
          <rect x="0" y="0" width="455" height="38" rx="10" fill="#16a34a"/>
          <text x="227" y="25" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif">✔ EVENT-DRIVEN SERVERLESS PARADIGM</text>

          <!-- Ingress Arrow -->
          <text x="227" y="62" fill="#166534" font-size="11" font-weight="600" text-anchor="middle" font-family="'JetBrains Mono', monospace">Elastic Ingress Traffic Flow</text>
          <path d="M 227 68 L 227 88" stroke="#16a34a" stroke-width="2.5" marker-end="url(#arrow-03)"/>'''

new_s03_right = '''        <!-- RIGHT SIDE: The Resilient Serverless Architecture (Green Zone) -->
        <g transform="translate(490, 20)">
          <rect width="455" height="295" rx="8" fill="#f0fdf4" stroke="#232f3e" stroke-width="1.8"/>
          <g transform="translate(0, 0)">
            <rect width="118" height="26" rx="4" fill="#232f3e"/>
            <image href="/assets/06-architecture-groups/AWS-Cloud-Group.svg" x="4" y="3" width="20" height="20"/>
            <text x="28" y="17" fill="#ffffff" font-size="11" font-weight="700" font-family="'Plus Jakarta Sans', sans-serif">AWS Cloud</text>
          </g>
          <text x="300" y="18" fill="#15803d" font-size="11" font-weight="700" text-anchor="middle" font-family="'JetBrains Mono', monospace">EVENT-DRIVEN SERVERLESS PARADIGM</text>

          <!-- Ingress Arrow -->
          <text x="227" y="58" fill="#166534" font-size="11" font-weight="600" text-anchor="middle" font-family="'JetBrains Mono', monospace">Elastic Ingress Traffic Flow</text>
          <path d="M 227 64 L 227 86" stroke="#16a34a" stroke-width="2.5" marker-end="url(#arrow-03-green)"/>'''

assert old_s03_right in code, "old_s03_right not found"
code = code.replace(old_s03_right, new_s03_right)

# ----------------------------------------------------
# SLIDE 04
# ----------------------------------------------------
old_s04 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          <marker id="arrow-04" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#242f3e" />
          </marker>
        </defs>'''

new_s04 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          ${renderOpenArrowMarker("arrow-04", "#242f3e")}
          ${renderOpenArrowMarker("arrow-04-red", "#ef4444")}
        </defs>'''

assert old_s04 in code, "old_s04 not found"
code = code.replace(old_s04, new_s04)

old_s04_bottom = '''        <!-- Section Bottom: Event-Driven Core (EventBridge Hub) -->
        <g transform="translate(15, 170)">
          <rect width="930" height="155" rx="8" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5"/>
          <text x="25" y="25" fill="#166534" font-size="12" font-weight="700" font-family="'JetBrains Mono', monospace">BEST PRACTICE: Asynchronous Event Bus (Decoupled Core)</text>'''

new_s04_bottom = '''        <!-- Section Bottom: Event-Driven Core (EventBridge Hub) -->
        <g transform="translate(15, 170)">
          <rect width="930" height="155" rx="8" fill="#f0fdf4" stroke="#232f3e" stroke-width="1.8"/>
          <g transform="translate(0, 0)">
            <rect width="114" height="22" rx="4" fill="#232f3e"/>
            <image href="/assets/06-architecture-groups/AWS-Cloud-Group.svg" x="4" y="2" width="18" height="18"/>
            <text x="27" y="15" fill="#ffffff" font-size="10.5" font-weight="700" font-family="'Plus Jakarta Sans', sans-serif">AWS Cloud</text>
          </g>
          <text x="135" y="16" fill="#166534" font-size="11" font-weight="700" font-family="'JetBrains Mono', monospace">BEST PRACTICE: Asynchronous Event Bus (Decoupled Core)</text>'''

assert old_s04_bottom in code, "old_s04_bottom not found"
code = code.replace(old_s04_bottom, new_s04_bottom)

# ----------------------------------------------------
# SLIDE 05
# ----------------------------------------------------
old_s05 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          <marker id="arrow-05" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#242f3e" />
          </marker>
        </defs>

        <!-- TIER 1: EVENT ROUTING FLOW (y=20..325) -->'''

new_s05 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          ${renderOpenArrowMarker("arrow-05", "#242f3e")}
        </defs>

        <!-- TIER 1: EVENT ROUTING FLOW (y=20..325) -->
        <!-- AWS Cloud Group Container for EventBridge Hub & Target Handlers -->
        ${renderAwsCloudBoundary(195, 10, 755, 315)}'''

assert old_s05 in code, "old_s05 not found"
code = code.replace(old_s05, new_s05)

# ----------------------------------------------------
# SLIDE 06
# ----------------------------------------------------
old_s06 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          <marker id="arrow-06" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#242f3e" />
          </marker>
        </defs>

        <!-- TIER 1: 4 LIFECYCLE PHASES (y=20..315) -->'''

new_s06 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          ${renderOpenArrowMarker("arrow-06", "#242f3e")}
        </defs>

        <!-- AWS Cloud Group Container for Lambda Compute Environment -->
        ${renderAwsCloudBoundary(8, 6, 944, 322, "AWS Cloud • Lambda Compute Environment")}

        <!-- TIER 1: 4 LIFECYCLE PHASES (y=20..315) -->'''

assert old_s06 in code, "old_s06 not found"
code = code.replace(old_s06, new_s06)

# ----------------------------------------------------
# SLIDE 07
# ----------------------------------------------------
old_s07 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          <marker id="arrow-07" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#242f3e" />
          </marker>
        </defs>

        <!-- TIER 1: INGRESS PROCESSING CHAMBER (y=20..325) -->'''

new_s07 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          ${renderOpenArrowMarker("arrow-07", "#242f3e")}
        </defs>

        <!-- AWS Cloud Group Container for API Gateway & SQS Buffer -->
        ${renderAwsCloudBoundary(195, 10, 755, 315)}

        <!-- TIER 1: INGRESS PROCESSING CHAMBER (y=20..325) -->'''

assert old_s07 in code, "old_s07 not found"
code = code.replace(old_s07, new_s07)

# ----------------------------------------------------
# SLIDE 08
# ----------------------------------------------------
old_s08 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <!-- TIER 1: 4 COMPUTE SPECTRUM CARDS (y=20..250) -->'''

new_s08 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <g transform="translate(15, 0)">
          <rect width="150" height="18" rx="4" fill="#fff7ed" stroke="#fed7aa"/>
          <text x="75" y="13" fill="#ea580c" font-size="9.5" font-weight="700" text-anchor="middle" font-family="'JetBrains Mono', monospace">AWS COMPUTE DOMAIN</text>
        </g>
        <!-- TIER 1: 4 COMPUTE SPECTRUM CARDS (y=20..250) -->'''

assert old_s08 in code, "old_s08 not found"
code = code.replace(old_s08, new_s08)

# ----------------------------------------------------
# SLIDE 09
# ----------------------------------------------------
old_s09 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          <marker id="arrow-09" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#242f3e" />
          </marker>
        </defs>

        <!-- TIER 1: FAN-OUT PROCESSING TOPOLOGY (y=20..325) -->'''

new_s09 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          ${renderOpenArrowMarker("arrow-09", "#242f3e")}
        </defs>

        <!-- AWS Cloud Group Container for Messaging & Microservices Topology -->
        ${renderAwsCloudBoundary(8, 8, 944, 322)}

        <!-- TIER 1: FAN-OUT PROCESSING TOPOLOGY (y=20..325) -->'''

assert old_s09 in code, "old_s09 not found"
code = code.replace(old_s09, new_s09)

# ----------------------------------------------------
# SLIDE 10
# ----------------------------------------------------
old_s10 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          <marker id="arrow-10" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#242f3e" />
          </marker>
        </defs>

        <!-- Step 1: Git Push (Outside AWS) -->'''

new_s10 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          ${renderOpenArrowMarker("arrow-10", "#242f3e")}
        </defs>

        <!-- External CI/CD Environment Group (Outside AWS) -->
        <g class="stage-group" transform="translate(8, 8)">
          <rect width="384" height="270" rx="8" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 3"/>
          <g transform="translate(0, 0)">
            <rect width="170" height="22" rx="4" fill="#475569"/>
            <image href="/assets/06-architecture-groups/Corporate-Data-Center-Group.svg" x="4" y="2" width="18" height="18"/>
            <text x="27" y="15" fill="#ffffff" font-size="10" font-weight="700" font-family="'Plus Jakarta Sans', sans-serif">External CI/CD Environment</text>
          </g>
        </g>

        <!-- AWS Cloud Group Container for Deployment & Shift (Inside AWS) -->
        ${renderAwsCloudBoundary(398, 8, 554, 270)}

        <!-- Step 1: Git Push (Outside AWS) -->'''

assert old_s10 in code, "old_s10 not found"
code = code.replace(old_s10, new_s10)

# ----------------------------------------------------
# SLIDE 11
# ----------------------------------------------------
old_s11 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          <marker id="arrow-11" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#242f3e" />
          </marker>
        </defs>

        <!-- External Traffic (Outside AWS Cloud) -->'''

new_s11 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          ${renderOpenArrowMarker("arrow-11", "#242f3e")}
          ${renderOpenArrowMarker("arrow-11-green", "#16a34a")}
          ${renderOpenArrowMarker("arrow-11-red", "#dc2626")}
        </defs>

        <!-- AWS Cloud Group Container (Perimeter Guard) -->
        ${renderAwsCloudBoundary(195, 10, 755, 365)}

        <!-- External Traffic (Outside AWS Cloud) -->'''

assert old_s11 in code, "old_s11 not found"
code = code.replace(old_s11, new_s11)

old_s11_vpc = '''        <!-- Private Lambda Worker -->
        <g class="stage-group inspectable-node" data-node="lambda" transform="translate(665, 30)">'''

new_s11_vpc = '''        <!-- Private VPC Subnet Container -->
        ${renderSubnetBoundary(650, 18, 180, 260, false, "Private subnet", "10.0.0.24")}
        <!-- Private Lambda Worker -->
        <g class="stage-group inspectable-node" data-node="lambda" transform="translate(665, 30)">'''

assert old_s11_vpc in code, "old_s11_vpc not found"
code = code.replace(old_s11_vpc, new_s11_vpc)

# ----------------------------------------------------
# SLIDE 12
# ----------------------------------------------------
old_s12 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          <marker id="arrow-12" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#242f3e" />
          </marker>
        </defs>

        <!-- Private Subnet Group Container -->
        <g transform="translate(15, 20)">
          <rect width="930" height="480" rx="10" fill="#f8fafc" stroke="#0284c7" stroke-width="2" stroke-dasharray="6 4"/>
          <rect x="0" y="0" width="280" height="34" rx="8" fill="#0284c7"/>
          <text x="140" y="22" fill="#ffffff" font-size="11.5" font-weight="700" text-anchor="middle" font-family="'JetBrains Mono', monospace">PRIVATE SUBNET (NO IGW • ZERO EGRESS)</text>'''

new_s12 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          ${renderOpenArrowMarker("arrow-12", "#242f3e")}
          ${renderOpenArrowMarker("arrow-12-blue", "#0284c7")}
        </defs>

        <!-- VPC Boundary Group [10.0.0.0/16] -->
        ${renderVpcBoundary(15, 12, 555, 308, "Virtual private cloud (VPC)", "10.0.0.0/16")}

        <!-- Private Subnet Boundary Group [10.0.0.0/24] (Nested inside VPC with >0.05" buffer) -->
        ${renderSubnetBoundary(23, 44, 539, 268, false, "Private subnet (No IGW • Zero Egress)", "10.0.0.0/24")}

        <!-- AWS Managed Services Boundary Box on the Right -->
        ${renderAwsCloudBoundary(585, 12, 360, 308, "AWS Managed Services (Public Zone)")}

        <!-- VPC Contents -->
        <g transform="translate(15, 20)">'''

assert old_s12 in code, "old_s12 not found"
code = code.replace(old_s12, new_s12)

# ----------------------------------------------------
# SLIDE 13
# ----------------------------------------------------
old_s13 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          <marker id="arrow-13" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#242f3e" />
          </marker>
        </defs>

        <!-- Start Indicator -->'''

new_s13 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          ${renderOpenArrowMarker("arrow-13", "#242f3e")}
          ${renderOpenArrowMarker("arrow-13-green", "#16a34a")}
          ${renderOpenArrowMarker("arrow-13-red", "#dc2626")}
        </defs>

        <!-- AWS Step Functions Workflow Group Container -->
        ${renderStepFunctionsBoundary(8, 6, 944, 322, "AWS Step Functions workflow • OrderSagaStateMachine")}

        <!-- Start Indicator -->'''

assert old_s13 in code, "old_s13 not found"
code = code.replace(old_s13, new_s13)

# ----------------------------------------------------
# SLIDE 14
# ----------------------------------------------------
old_s14 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          <marker id="arrow-14" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#242f3e" />
          </marker>
        </defs>

        <!-- 1. CloudFront Edge & S3 Web Origin -->'''

new_s14 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          ${renderOpenArrowMarker("arrow-14", "#242f3e")}
        </defs>

        <!-- AWS Cloud Group Container for Web & Single-Table Stack -->
        ${renderAwsCloudBoundary(8, 8, 944, 275)}

        <!-- 1. CloudFront Edge & S3 Web Origin -->'''

assert old_s14 in code, "old_s14 not found"
code = code.replace(old_s14, new_s14)

# ----------------------------------------------------
# SLIDE 15
# ----------------------------------------------------
old_s15 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          <marker id="arrow-15" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#242f3e" />
          </marker>
        </defs>'''

new_s15 = '''      <svg class="aws-stage-svg" viewBox="0 0 960 520">
        <defs>
          ${renderOpenArrowMarker("arrow-15", "#242f3e")}
          ${renderOpenArrowMarker("arrow-15-red", "#dc2626")}
        </defs>'''

assert old_s15 in code, "old_s15 not found"
code = code.replace(old_s15, new_s15)

old_s15_map = '''        <!-- Service Map Node 1: API GW -->
        <g class="stage-group inspectable-node" data-node="apigateway" transform="translate(15, 125)">'''

new_s15_map = '''        <!-- AWS Cloud Boundary encompassing internal microservices -->
        ${renderAwsCloudBoundary(8, 115, 622, 230)}

        <!-- External Partner Boundary (Clear SPOF demarcation outside AWS) -->
        <g class="stage-group" transform="translate(640, 115)">
          <rect width="312" height="230" rx="8" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4 3"/>
          <g transform="translate(0, 0)">
            <rect width="180" height="22" rx="4" fill="#dc2626"/>
            <text x="90" y="15" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle" font-family="'JetBrains Mono', monospace">EXTERNAL 3RD-PARTY (SPOF)</text>
          </g>
        </g>

        <!-- Service Map Node 1: API GW -->
        <g class="stage-group inspectable-node" data-node="apigateway" transform="translate(15, 125)">'''

assert old_s15_map in code, "old_s15_map not found"
code = code.replace(old_s15_map, new_s15_map)

# ----------------------------------------------------
# SLIDE 16
# ----------------------------------------------------
old_s16_defs = '''        <defs>
          <!-- Forward Ingress Arrow (Dark Slate) -->
          <marker id="arrow-16" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#242f3e" />
          </marker>
          <!-- Return Response Arrow (Emerald Green) -->
          <marker id="arrow-16-return" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#16a34a" />
          </marker>
          <!-- Saga / Orchestration Feedback Arrow (Royal Blue) -->
          <marker id="arrow-16-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#2563eb" />
          </marker>
          <!-- Two-Way Persistence & Cryptographic Arrow (Purple) -->
          <marker id="arrow-16-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#7c3aed" />
          </marker>
        </defs>'''

new_s16_defs = '''        <defs>
          <!-- Forward Ingress Arrow (Dark Slate) -->
          ${renderOpenArrowMarker("arrow-16", "#242f3e")}
          <!-- Return Response Arrow (Emerald Green) -->
          ${renderOpenArrowMarker("arrow-16-return", "#16a34a")}
          <!-- Saga / Orchestration Feedback Arrow (Royal Blue) -->
          ${renderOpenArrowMarker("arrow-16-blue", "#2563eb")}
          <!-- Two-Way Persistence & Cryptographic Arrow (Purple) -->
          ${renderOpenArrowMarker("arrow-16-purple", "#7c3aed")}
        </defs>

        <!-- Grand AWS Cloud Boundary for Columns 2 to 5 -->
        ${renderAwsCloudBoundary(145, 10, 805, 498)}'''

assert old_s16_defs in code, "old_s16_defs not found"
code = code.replace(old_s16_defs, new_s16_defs)

with open('src/slides/diagrams.js', 'w') as f:
    f.write(code)

print("✅ Successfully updated all slides in diagrams.js with official AWS Architecture standards!")
