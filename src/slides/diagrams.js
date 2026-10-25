/**
 * Diagrams and Architectural Stage Visuals for all 17 Slides
 * Standard: AWS Official Light Background Architecture (dark slate connectors #242f3e,
 * AWS Cloud boundary with top-left black tab, official SVG icons with centered labels,
 * orthogonal lines, short action labels, and GSAP entrances).
 * Language: English Study Case.
 */
import gsap from 'gsap';
import { AWS_SERVICES } from '../data/slides.js';
import { INSPECTOR_DATA, SLIDE_3_INSPECTORS, SLIDE_4_INSPECTORS, SLIDE_5_INSPECTORS } from '../data/inspectors.js';

// --------------------------------------------------------------------------
// AWS ARCHITECTURE ICONS & GROUP STANDARDS (Release 24-2026.07.31)
// --------------------------------------------------------------------------

/**
 * Standard AWS Open Arrow Marker (Size 4, unfilled stroke)
 */
function renderOpenArrowMarker(id, stroke = '#242f3e', size = 6.5) {
  return `
    <marker id="${id}" viewBox="0 0 12 12" refX="9" refY="6" markerWidth="${size}" markerHeight="${size}" orient="auto-start-reverse">
      <polyline points="2 2, 8.5 6, 2 10" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    </marker>
  `;
}

/**
 * AWS Cloud Group Boundary Box with official top-left tab
 */
function renderAwsCloudBoundary(x, y, width, height, label = "AWS Cloud", officialLogo = false) {
  if (officialLogo) return `<g class="aws-cloud-boundary official-cloud" transform="translate(${x}, ${y})">
    <rect width="${width}" height="${height}" fill="none" stroke="#232f3e" stroke-width="1.667" />
    <image href="/assets/06-architecture-groups/AWS-Cloud-Logo-Group.svg" width="40" height="40" />
    <text x="52" y="26" font-family="Arial, sans-serif" font-size="16" fill="#232f3e">${label}</text>
  </g>`;
  return `
    <g class="aws-cloud-boundary" transform="translate(${x}, ${y})">
      <rect width="${width}" height="${height}" rx="8" fill="none" stroke="#232f3e" stroke-width="1.5" />
      <g transform="translate(0, 0)">
        <rect width="114" height="22" rx="4" fill="#232f3e"/>
        <image href="/assets/06-architecture-groups/AWS-Cloud-Group.svg" x="4" y="2" width="18" height="18"/>
        <text x="27" y="15" fill="#ffffff" font-size="10.5" font-weight="700" font-family="'Plus Jakarta Sans', sans-serif">${label}</text>
      </g>
    </g>
  `;
}

export function renderSlideDiagram(slideId) {
  if (slideId === 1) return renderSlide01();
  if (slideId === 17) return renderSlide17();
  if (GRAPHS[slideId]) return renderGraph(slideId);
  return `<div class="stage-placeholder-banner"><span class="stage-badge font-mono">Slide ${slideId}</span></div>`;
}

// --------------------------------------------------------------------------
// SLIDE 01: [OPENING KEYNOTE] Minimalist, Clean Cover with Pure Official AWS Logo
// --------------------------------------------------------------------------
function renderOpeningOrbit() {
  const services = ['lambda', 'eventbridge', 'sqs', 'dynamodb', 'apigateway', 'stepfunctions'];
  return `<div class="opening-orbit" aria-hidden="true">
    <div class="opening-orbit-track"></div>
    <div class="opening-orbit-ring">${services.map((key, i) => {
      const angle = i * Math.PI / 3;
      return `<div class="opening-orbit-anchor" style="left:${50 + Math.cos(angle) * 42}%;top:${50 + Math.sin(angle) * 42}%">
        <div class="opening-orbit-card"><img src="${AWS_SERVICES[key].icon}" alt="" width="64" height="64" /></div>
      </div>`;
    }).join('')}</div>
    <img class="opening-orbit-logo" src="/assets/01-aws-core-logos/aws-logo.svg" alt="" />
  </div>`;
}

function renderSlide01() {
  return `
    <section class="slide-opening-wrapper" aria-label="Opening keynote">
      <div class="opening-minimal-hero">
        <div class="opening-copy">
          <div class="opening-aws-brand"><span class="opening-aws-logo-slot" aria-hidden="true"></span><span class="font-mono">ARCHITECTURE KEYNOTE / 2026</span></div>
          <h1 class="opening-hero-title font-serif">Designing a<br />Serverless Architecture<span>with Event-Driven Microservices</span></h1>
          <p class="opening-hero-subtitle">Enterprise Production Blueprint:<br />High Scale, Zero Idle Cost &amp; Maximum Resilience</p>
          <div class="opening-course-tags font-mono" aria-label="Course source, role, and level"><span class="course-source-tag">AWS Skill Builder</span><span class="course-source-tag">Solutions Architect</span><span class="course-source-tag">Intermediate</span></div>
          <div class="opening-hero-presenter"><strong>Rayina Ilham</strong><span>IT Operation Intern at AnterAja</span></div>
          <div class="opening-hero-actions"><span class="opening-hero-prompt font-mono">Press <kbd>→</kbd> to begin</span><button class="opening-replay font-mono" type="button">Replay intro ↻</button></div>
        </div>
        <div class="opening-visual">${renderOpeningOrbit()}<span class="opening-orbit-caption font-mono">INDEPENDENT SERVICES. CONNECTED BY EVENTS.</span></div>
      </div>
      <div class="opening-intro" hidden>
        <span class="opening-intro-label font-mono">AWS / EVENT-DRIVEN ARCHITECTURE</span>
        <button class="opening-skip font-mono" type="button">Skip intro →</button>
      </div>
    </section>`;
}

// Nodes use icon centers; links are explicitly routed to keep labels and icons apart.
// Only the graph belongs on the stage. Narrative and implementation details live in the editorial column and inspector.
const GRAPHS = {
  2: {
    title: 'Proposed order-processing services', cloud: [210, 75, 720, 455],
    nodes: [
      ['mobile', 85, 285, 'EV buyer'],
      ['apigateway', 320, 285, 'Amazon API Gateway', 'Receive requests'],
      ['stepfunctions', 555, 285, 'AWS Step Functions', 'Manage order steps'],
      ['dynamodb', 815, 170, 'Amazon DynamoDB', 'Store orders'],
      ['sns', 815, 410, 'Amazon SNS', 'Send notifications'],
    ],
    links: [
      ['M120 285H285', 'HTTPS', 200, 264],
      ['M355 285H520', 'Start workflow', 437, 264],
      ['M590 285H675V170H780', 'Read / write', 725, 149],
      ['M675 285V410H780', 'Publish', 725, 389],
    ],
  },
  3: {
    title: 'Compare server work, task releases, and task errors', height: 800, cloud: [190, 40, 750, 740],
    headings: [[225, 110, '(2)  One release for all tasks'], [225, 390, '(2)  Separate code for each task']],
    taskBoxes: [[410, 155, 'Check order'], [410, 200, 'Reserve stock'], [410, 245, 'Charge payment']],
    annotations: [
      [225, 320, '(1)  Team maintains server software'],
      [225, 345, '(3)  Task errors can interrupt the shared process'],
      [225, 730, '(1)  AWS manages the servers'],
      [225, 755, '(3)  Retry failed tasks; prevent duplicate charges'],
    ],
    nodes: [
      ['mobile', 85, 210, 'Customer'],
      ['ec2', 310, 210, 'Amazon EC2', 'One application'],
      ['rds', 845, 210, 'Amazon RDS', 'Application data'],
      ['mobile', 85, 450, 'Customer'],
      ['apigateway', 275, 450, 'Amazon API Gateway'],
      ['stepfunctions', 490, 450, 'AWS Step Functions', 'Sets the task order'],
      ['lambda', 440, 620, 'AWS Lambda', 'Check order', 'check-order'],
      ['lambda', 650, 620, 'AWS Lambda', 'Reserve stock', 'reserve-stock'],
      ['lambda', 860, 620, 'AWS Lambda', 'Charge payment', 'charge-payment'],
    ],
    links: [
      ['M120 210H275', 'Request', 192, 189],
      ['M730 210H810', 'Data', 770, 189],
      ['M120 450H240', 'HTTPS', 180, 429],
      ['M310 450H455', 'Start workflow', 383, 429],
      ['M525 450H575V545H440V585', '', 0, 0],
      ['M575 545H650V585', '', 0, 0],
      ['M650 545H860V585', 'Call tasks', 750, 530],
    ],
  },
  4: {
    title: 'The same order workflow publishes an event for independent reactions',
    height: 800, cloud: [190, 40, 750, 740],
    headings: [[225, 110, '(1)  Same order workflow'], [660, 460, '(3)  Independent reactions']],
    annotations: [
      [225, 690, '(2)  Event: OrderConfirmed'],
      [225, 715, 'Contains order ID + status'],
      [225, 750, 'Rules match this event to each target'],
    ],
    nodes: [
      ['mobile', 85, 180, 'Customer'],
      ['apigateway', 275, 180, 'Amazon API Gateway'],
      ['stepfunctions', 490, 180, 'AWS Step Functions', 'Sets the task order'],
      ['lambda', 440, 350, 'AWS Lambda', 'Check order', 'check-order'],
      ['lambda', 650, 350, 'AWS Lambda', 'Reserve stock', 'reserve-stock'],
      ['lambda', 860, 350, 'AWS Lambda', 'Charge payment', 'charge-payment'],
      ['eventbridge', 490, 560, 'Amazon EventBridge', 'Event bus + rules'],
      ['lambda', 790, 535, 'AWS Lambda', 'Plan delivery', 'plan-delivery'],
      ['lambda', 790, 690, 'AWS Lambda', 'Update sales report', 'update-sales-report'],
    ],
    links: [
      ['M120 180H240', 'HTTPS', 180, 159],
      ['M310 180H455', 'Start workflow', 383, 159],
      ['M525 180H575V275H440V315', '', 0, 0],
      ['M575 275H650V315', '', 0, 0],
      ['M650 275H860V315', 'Call tasks', 750, 260],
      ['M455 195H375V560H455', 'Publish after success', 490, 480],
      ['M525 560H630V535H755', 'Match rule', 688, 514, 'event'],
      ['M630 560V690H755', 'Match rule', 688, 669, 'event'],
    ],
  },
  5: {
    title: 'OrderConfirmed matches two EventBridge rules, each sending a copy to its own Lambda target',
    height: 800, cloud: [40, 40, 880, 740],
    headings: [[410, 160, '(1)  The event'], [380, 395, '(2)  Check each rule'], [695, 395, '(3)  Targets']],
    annotations: [[410, 110, 'Same workflow, closer look at its event'],
      [100, 285, 'Publish after success'],
      [100, 735, 'Both rules match. Both targets receive a copy.'],
      [100, 760, 'No fixed order between these two tasks.']],
    eventCard: [410, 185, 390, 155],
    rules: [
      ['delivery-rule', 380, 420, 'Delivery rule', ['type = OrderConfirmed', 'status = confirmed', 'MATCH: send a copy']],
      ['report-rule', 380, 590, 'Sales report rule', ['type = OrderConfirmed', 'MATCH: send a copy']],
    ],
    nodes: [
      ['stepfunctions', 210, 145, 'AWS Step Functions', 'Same order workflow'],
      ['eventbridge', 210, 440, 'Amazon EventBridge', 'Event bus: event channel'],
      ['lambda', 790, 465, 'AWS Lambda', 'Plan delivery', 'plan-delivery'],
      ['lambda', 790, 635, 'AWS Lambda', 'Update sales report', 'update-sales-report'],
    ],
    links: [
      ['M245 145H365V260H410', '', 0, 0, 'event'],
      ['M410 300H350V365H210V405', '', 0, 0, 'event'],
      ['M245 440H330V465H380', '', 0, 0, 'event'],
      ['M330 465V635H380', '', 0, 0, 'event'],
      ['M610 465H755', 'Copy', 680, 445, 'event'],
      ['M610 635H755', 'Copy', 680, 615, 'event'],
    ],
  },
  6: {
    title: 'Events trigger independent Lambda invocations', cloud: [30, 55, 900, 500],
    nodes: [
      ['eventbridge', 145, 290, 'EventBridge'],
      ['lambda', 480, 140, 'Lambda', 'Invocation 1'],
      ['lambda', 480, 290, 'Lambda', 'Invocation 2'],
      ['lambda', 480, 440, 'Lambda', 'Invocation N'],
      ['dynamodb', 815, 290, 'DynamoDB'],
    ],
    links: [
      ['M180 290H295V140H445', 'Invoke', 365, 120],
      ['M295 290H445', 'Invoke', 365, 270],
      ['M295 290V440H445', 'Invoke', 365, 420],
      ['M515 140H655V290H780', '', 0, 0],
      ['M515 290H655', 'Write', 590, 270],
      ['M515 440H655V290', '', 0, 0],
    ],
  },
  7: {
    title: 'Direct ingress without an intermediate Lambda', cloud: [230, 95, 700, 390],
    nodes: [
      ['mobile', 100, 285, 'EV app'], ['apigateway', 465, 285, 'API Gateway', 'Validate & throttle'],
      ['sqs', 825, 285, 'SQS', 'Buffer requests'],
    ],
    links: [
      ['M135 285H430', 'HTTPS POST', 280, 265],
      ['M500 285H790', 'SendMessage', 645, 265],
    ],
  },
  8: {
    title: 'Match each workload to its compute model', cloud: [30, 55, 900, 535],
    nodes: [
      ['eventbridge', 145, 170, 'EventBridge'], ['lambda', 480, 170, 'Lambda', 'Event handlers'],
      ['dynamodb', 815, 170, 'DynamoDB'],
      ['ecs', 145, 400, 'ECS', 'Container scheduler'],
      ['fargate', 650, 350, 'Fargate', 'Managed capacity'],
      ['ec2', 650, 495, 'EC2', 'Self-managed hosts'],
    ],
    links: [
      ['M180 170H445', 'Invoke', 310, 150], ['M515 170H780', 'Persist', 645, 150],
      ['M180 400H350V350H615', 'Run containers', 485, 330],
      ['M350 400V495H615', 'Run containers', 485, 475],
    ],
  },
  9: {
    title: 'SNS fans out; SQS buffers each consumer', cloud: [30, 45, 900, 520],
    nodes: [
      ['lambda', 120, 270, 'Order producer'], ['sns', 335, 270, 'SNS'],
      ['sqs', 600, 120, 'SQS', 'Payment'], ['lambda', 840, 120, 'Payment worker'],
      ['sqs', 600, 270, 'SQS', 'Factory'], ['lambda', 840, 270, 'Factory worker'],
      ['sqs', 600, 420, 'SQS', 'Notification'], ['sqs', 840, 500, 'Dead-letter queue'],
    ],
    links: [
      ['M155 270H300', 'Publish', 225, 250],
      ['M370 270H465V120H565', '', 0, 0], ['M465 270H565', 'Fan-out', 475, 250],
      ['M465 270V420H565', '', 0, 0],
      ['M635 120H805', 'Poll', 720, 100], ['M635 270H805', 'Poll', 720, 250],
      ['M635 420H720V500H805', 'Failed retries', 735, 480, 'failure'],
    ],
  },
  10: {
    title: 'From source change to a guarded release', cloud: [360, 65, 570, 490],
    nodes: [
      ['desktop', 90, 200, 'Source code'], ['desktop', 270, 200, 'CI runner', 'GitHub Actions'],
      ['sam', 475, 200, 'AWS SAM'], ['cloudformation', 700, 200, 'CloudFormation'],
      ['lambda', 700, 420, 'Lambda', 'Canary → live alias'],
      ['cloudwatch', 475, 420, 'CloudWatch', 'Release alarms'],
    ],
    links: [
      ['M125 200H235', 'Push', 180, 180], ['M305 200H440', 'Build', 370, 180],
      ['M510 200H665', 'Deploy', 585, 180], ['M700 270V385', 'Update', 743, 315],
      ['M665 420H510', 'Metrics', 585, 400],
      ['M475 455V520H865V420H735', 'Rollback on alarm', 680, 540, 'failure'],
    ],
  },
  11: {
    title: 'Filter traffic, verify identity, then invoke', cloud: [215, 55, 715, 500],
    nodes: [
      ['mobile', 95, 290, 'Customer'], ['waf', 300, 290, 'AWS WAF'],
      ['apigateway', 560, 290, 'API Gateway', 'JWT authorizer'],
      ['cognito', 560, 125, 'Cognito', 'User tokens'],
      ['lambda', 820, 290, 'Lambda'], ['kms', 820, 475, 'KMS'],
    ],
    links: [
      ['M130 290H265', 'HTTPS', 195, 270], ['M335 290H525', 'Allowed', 430, 270],
      ['M560 215V255', 'JWT', 610, 238], ['M595 290H785', 'Valid JWT', 690, 270],
      ['M820 365V440', 'Decrypt', 865, 395],
    ],
  },
  12: {
    title: 'Private access to managed services', cloud: [25, 45, 910, 510],
    groups: [
      [50, 150, 435, 285, 'VPC · private subnet', '#8C4FFF'],
    ],
    nodes: [
      ['lambda', 155, 290, 'Lambda', 'No public IP'],
      ['privatelink', 380, 290, 'VPC endpoints'],
      ['dynamodb', 790, 135, 'DynamoDB', 'Gateway endpoint'],
      ['kms', 790, 290, 'KMS', 'Interface endpoint'],
      ['s3', 790, 445, 'S3', 'Gateway endpoint'],
    ],
    links: [
      ['M190 290H345', 'Private route', 267, 270],
      ['M415 290H585V135H755', '', 0, 0],
      ['M585 290H755', 'AWS network', 670, 270],
      ['M585 290V445H755', '', 0, 0],
    ],
  },
  13: {
    title: 'A saga coordinates tasks and compensation', cloud: [25, 45, 910, 545],
    groups: [[50, 95, 860, 365, 'Step Functions workflow', '#E7157B']],
    nodes: [
      ['lambda', 180, 210, 'Authorize credit'], ['lambda', 480, 210, 'Charge deposit'],
      ['lambda', 780, 210, 'Allocate VIN'],
      ['lambda', 480, 365, 'Refund deposit'], ['lambda', 180, 365, 'Cancel credit hold'],
      ['sns', 780, 500, 'SNS', 'Order status'],
    ],
    links: [
      ['M215 210H445', 'Approved', 330, 190], ['M515 210H745', 'Charged', 630, 190],
      ['M815 210H865V365H515', 'VIN unavailable', 650, 345, 'failure'],
      ['M780 285V465', 'Completed', 830, 430],
      ['M445 365H215', 'Compensate', 330, 345, 'failure'],
      ['M180 440V500H745', 'Cancelled', 475, 480, 'failure'],
    ],
  },
  14: {
    title: 'Persist the order, then publish from the change stream', cloud: [25, 45, 910, 510],
    nodes: [
      ['cloudfront', 140, 155, 'CloudFront'], ['apigateway', 475, 155, 'API Gateway'],
      ['lambda', 810, 155, 'Order handler'],
      ['dynamodb', 810, 410, 'DynamoDB'], ['streams', 475, 410, 'DynamoDB Streams'],
      ['eventbridge', 140, 410, 'EventBridge'],
    ],
    links: [
      ['M175 155H440', 'API request', 305, 135], ['M510 155H775', 'Invoke', 640, 135],
      ['M810 235V375', 'PutItem', 855, 290],
      ['M775 410H510', 'Item changes', 640, 390],
      ['M440 410H175', 'Via Pipes', 305, 390],
    ],
  },
  15: {
    title: 'Trace the request and surface slow dependencies', cloud: [25, 55, 660, 500],
    nodes: [
      ['apigateway', 120, 170, 'API Gateway'], ['lambda', 390, 170, 'Lambda'],
      ['internet', 820, 170, 'Bank API', '820 ms'],
      ['dynamodb', 590, 370, 'DynamoDB'],
      ['xray', 210, 450, 'X-Ray', 'Distributed traces'],
      ['cloudwatch', 490, 450, 'CloudWatch', 'Metrics & alarms'],
    ],
    links: [
      ['M155 170H355', 'Request', 255, 150], ['M425 170H785', 'Credit check', 605, 150],
      ['M390 250V370H555', 'Read / write', 465, 350],
      ['M120 250V310H210V415', 'Trace', 160, 290, 'telemetry'],
      ['M390 250V310H210', '', 0, 0, 'telemetry'],
      ['M390 310H490V415', 'Metrics', 490, 325, 'telemetry'],
    ],
  },
  16: {
    title: 'The production event-driven architecture', cloud: [180, 40, 755, 545],
    nodes: [
      ['mobile', 80, 140, 'EV buyer'], ['cloudfront', 280, 140, 'CloudFront'],
      ['apigateway', 515, 140, 'API Gateway', 'WAF · Cognito'],
      ['eventbridge', 810, 140, 'EventBridge'],
      ['stepfunctions', 810, 330, 'Step Functions'],
      ['sqs', 515, 330, 'SQS'], ['lambda', 280, 330, 'Lambda'],
      ['dynamodb', 280, 475, 'DynamoDB'], ['kms', 515, 475, 'KMS'],
      ['cloudwatch', 810, 475, 'CloudWatch'],
    ],
    links: [
      ['M115 140H245', 'HTTPS', 180, 120], ['M315 140H480', 'Request', 395, 120],
      ['M550 140H775', 'PutEvents', 660, 120],
      ['M810 215V295', 'Start saga', 855, 235],
      ['M845 140H890V265H650V330H550', 'Enqueue', 700, 285],
      ['M480 330H315', 'Consume', 395, 310],
      ['M280 410V440', 'Persist', 324, 425],
      ['M315 345H395V475H480', 'Decrypt', 440, 430],
      ['M245 330H205V565H915V80H810V105', 'Domain events', 660, 550, 'feedback'],
      ['M775 330H740V475H775', 'Metrics', 800, 430, 'telemetry'],
    ],
  },
};

const EXTRA_ICONS = {
  mobile: '/assets/09-general-resources/client-mobile.svg',
  desktop: '/assets/09-general-resources/client-desktop.svg',
  internet: '/assets/09-general-resources/internet.svg',
  rds: '/assets/08-analytics-and-supporting-services/06-amazon-rds/Amazon-RDS.svg',
  streams: '/assets/08-analytics-and-supporting-services/02-amazon-dynamodb-streams/Amazon-DynamoDB-Streams.svg',
  cloudformation: '/assets/03-core-services/18-aws-cloudformation/AWS-CloudFormation.svg',
};

function renderGraph(slideId) {
  const graph = GRAPHS[slideId];
  const marker = `graph-arrow-${slideId}`;
  return `<div class="diagram-container service-graph${[2, 3, 4, 5].includes(slideId) ? ' graph-context' : ''}">
    <svg class="aws-stage-svg" viewBox="0 0 960 ${graph.height || 600}" role="img" aria-labelledby="graph-title-${slideId}">
      <title id="graph-title-${slideId}">${graph.title}</title>
      <defs>
        ${renderOpenArrowMarker(marker)}
        ${renderOpenArrowMarker(`${marker}-event`)}
        ${renderOpenArrowMarker(`${marker}-failure`, '#b45309')}
        ${renderOpenArrowMarker(`${marker}-telemetry`, '#0284c7')}
        ${renderOpenArrowMarker(`${marker}-feedback`, '#167b55')}
      </defs>
      ${slideId === 2 ? '<text x="210" y="45" class="graph-group-label" fill="#232f3e">Proposed order-processing services</text>' : ''}
      ${renderAwsCloudBoundary(...graph.cloud, 'AWS Cloud', [2, 3, 4, 5].includes(slideId))}
      ${(graph.headings || []).map(([x, y, text]) => `<text x="${x}" y="${y}" class="graph-group-label" fill="#232f3e">${text}</text>`).join('')}
      ${(graph.groups || []).map(([x, y, width, height, label, color]) => `
        <g class="graph-boundary">
          <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="8" fill="none" stroke="${color}" stroke-width="1.2"/>
          <text x="${x + 16}" y="${y + 25}" class="graph-group-label" fill="${color}">${label}</text>
        </g>`).join('')}
      ${slideId === 3 ? '<line class="comparison-divider" x1="220" y1="362" x2="910" y2="362" stroke="#cbd5e1" stroke-width="1.667" /><rect class="shared-app-boundary" x="225" y="135" width="505" height="160" fill="none" stroke="#232f3e" stroke-width="1.667" />' : ''}
      ${(graph.taskBoxes || []).map(([x, y, text]) => `<g class="comparison-task"><rect x="${x}" y="${y}" width="285" height="34" rx="0" fill="#f8fafc" stroke="#64748b"/><text x="${x + 142.5}" y="${y + 22}" text-anchor="middle" fill="#232f3e">${text}</text></g>`).join('')}
      ${(graph.annotations || []).map(([x, y, text]) => `<text x="${x}" y="${y}" class="comparison-note" fill="#232f3e">${text}</text>`).join('')}
      ${graph.eventCard ? `<g class="routing-event inspectable-node" data-node="event" data-inspector="order-event" role="button" tabindex="0" aria-label="Inspect OrderConfirmed event">
        <rect class="node-rect" x="410" y="185" width="390" height="155" rx="0" fill="#f8fafc" stroke="#64748b" />
        <text x="430" y="215">source: apex.orders</text>
        <text x="430" y="245">type: OrderConfirmed</text>
        <text x="430" y="275">order ID: EV-1042</text>
        <text x="430" y="305">status: confirmed</text>
        <text x="430" y="328">type = event name (detail type)</text>
      </g>` : ''}
      ${(graph.rules || []).map(([key, x, y, title, lines]) => `<g class="routing-rule inspectable-node" data-node="rule" data-inspector="${key}" role="button" tabindex="0" aria-label="Inspect ${title}">
        <rect class="node-rect" x="${x}" y="${y}" width="230" height="110" rx="0" fill="#f8fafc" stroke="#64748b" />
        <text x="${x + 15}" y="${y + 25}" font-weight="700">${title}</text>
        ${lines.map((text, i) => `<text x="${x + 15}" y="${y + 50 + i * 23}">${text}</text>`).join('')}
      </g>`).join('')}
      ${graph.links.map(([path, label, x, y, kind]) => `
        <g class="graph-link ${kind || ''}">
          <path d="${path}" marker-end="url(#${marker}${kind ? `-${kind}` : ''})"/>
          ${label ? `<text x="${x}" y="${y}" class="graph-link-label">${label}</text>` : ''}
        </g>`).join('')}
      ${graph.nodes.map(([key, x, y, label, caption, inspectorKey], index) => {
        const service = AWS_SERVICES[key];
        const inspectable = Boolean(INSPECTOR_DATA[key] || (slideId === 3 && SLIDE_3_INSPECTORS[key]) || (slideId === 4 && SLIDE_4_INSPECTORS[key]) || (slideId === 5 && SLIDE_5_INSPECTORS[inspectorKey || key]));
        return `<g class="graph-node${inspectable ? ' inspectable-node' : ''}" ${inspectable ? `data-node="${key}" data-node-index="${index}" data-inspector="${inspectorKey || key}" role="button" tabindex="0" aria-label="Inspect ${label}${caption ? `: ${caption}` : ''}"` : ''} transform="translate(${x}, ${y})">
          <rect class="node-rect" x="-82" y="-45" width="164" height="${caption ? 122 : 100}" rx="8" fill="transparent" stroke="transparent"/>
          <image href="${service?.icon || EXTRA_ICONS[key]}" x="-32" y="-32" width="64" height="64"/>
          <text y="57" class="graph-node-label">${label}</text>
          ${caption ? `<text y="77" class="graph-node-caption">${caption}</text>` : ''}
        </g>`;
      }).join('')}
    </svg>
  </div>`;
}


function renderSlide17() {
  return `
    <div class="slide-closing-wrapper">
      <div class="closing-hero-card">
        <div class="closing-eyebrow font-mono">
          <span class="badge-tag">ACT IV: ARCHITECTURAL VICTORY</span>
          <span class="badge-accent">Executive Summary &amp; Scorecard</span>
        </div>
        <h1 class="closing-main-title font-serif">5 Golden Rules of Serverless Event-Driven Architecture</h1>
        <p class="closing-summary font-sans">
          Essential architectural principles proving the success of launching the digital EV e-commerce platform in 6 months with 74% cost reduction and zero downtime.
        </p>

        <!-- 5 Golden Rules Grid -->
        <div class="rules-five-grid font-sans">
          <div class="rule-box">
            <span class="rule-num font-mono">01</span>
            <div class="rule-content">
              <h4 class="rule-title">Small, Purpose-Specific Events</h4>
              <p class="rule-desc">Design event schemas as compact domain facts within bounded contexts, not monolithic database dumps.</p>
            </div>
          </div>
          <div class="rule-box">
            <span class="rule-num font-mono">02</span>
            <div class="rule-content">
              <h4 class="rule-title">Embrace Eventual Consistency</h4>
              <p class="rule-desc">Adopt distributed Saga workflows with automated compensating rollbacks instead of slow distributed locks.</p>
            </div>
          </div>
          <div class="rule-box">
            <span class="rule-num font-mono">03</span>
            <div class="rule-content">
              <h4 class="rule-title">Offload Ingress &amp; Buffering</h4>
              <p class="rule-desc">Delegate rate limiting to API Gateway and shock absorption directly to SQS FIFO without custom compute code.</p>
            </div>
          </div>
          <div class="rule-box">
            <span class="rule-num font-mono">04</span>
            <div class="rule-content">
              <h4 class="rule-title">Single-Table Persistence</h4>
              <p class="rule-desc">Leverage pre-planned DynamoDB partition schemas for predictable single-digit millisecond latency and lower cost.</p>
            </div>
          </div>
          <div class="rule-box">
            <span class="rule-num font-mono">05</span>
            <div class="rule-content">
              <h4 class="rule-title">Observability First via Traces</h4>
              <p class="rule-desc">Unique Trace IDs across every hop eliminate cross-team friction and pinpoint third-party bottlenecks instantly.</p>
            </div>
          </div>
        </div>

        <!-- Scorecard & Q&A Stage Trigger -->
        <div class="closing-scorecard-row font-mono">
          <div class="score-pill">
            <span class="score-lbl">TCO SAVINGS</span>
            <span class="score-val text-green">-74%</span>
          </div>
          <div class="score-pill">
            <span class="score-lbl">AVAILABILITY</span>
            <span class="score-val text-green">99.99%</span>
          </div>
          <div class="score-pill">
            <span class="score-lbl">IDLE SERVER FEE</span>
            <span class="score-val text-orange">USD $0</span>
          </div>
          <div class="score-pill">
            <span class="score-lbl">TIME-TO-MARKET</span>
            <span class="score-val text-green">6 Months</span>
          </div>
        </div>

        <div class="qa-stage-banner font-sans">
          <span class="qa-badge-live font-mono">OPEN Q&amp;A &amp; DISCUSSION SESSION</span>
          <span class="qa-presenter">Presented by <strong>Rayina Ilham</strong> &bull; IT Operation Intern at AnterAja</span>
        </div>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// GSAP ANIMATIONS PER SLIDE
// --------------------------------------------------------------------------
export function animateSlideDiagram(slideId, options = {}) {
  if (slideId === 1) {
    const root = document.querySelector('.slide-opening-wrapper');
    const overlay = root.querySelector('.opening-intro');
    const copy = root.querySelector('.opening-copy');
    const orbit = root.querySelector('.opening-orbit');
    const caption = root.querySelector('.opening-orbit-caption');
    const logo = document.getElementById('sharedAwsLogo');
    const orbitLogo = orbit.querySelector('.opening-orbit-logo');
    const track = orbit.querySelector('.opening-orbit-track');
    const cards = orbit.querySelectorAll('.opening-orbit-card');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timeline;
    const finish = () => {
      timeline?.kill();
      copy.inert = false;
      if (overlay.contains(document.activeElement)) root.querySelector('.opening-replay').focus({ preventScroll: true });
      overlay.hidden = true;
      root.classList.remove('is-playing');
      gsap.set([copy, caption, logo], { opacity: 1 });
      gsap.set(orbit, { x: 0, y: 0, opacity: 1 });
      gsap.set(orbitLogo, { x: 0, y: 0, scale: 1, opacity: 1 });
      gsap.set(track, { opacity: 1 });
      gsap.set(cards, { opacity: 1, scale: 1 });
    };
    const play = (fromStartRect = options.startLogoRect) => {
      finish();
      if (reduced.matches) return;
      const bounds = root.getBoundingClientRect();
      const target = orbit.getBoundingClientRect();
      overlay.hidden = false;
      copy.inert = true;
      root.classList.add('is-playing');
      gsap.set([copy, caption, logo], { opacity: 0.01 });
      gsap.set(orbit, { x: bounds.left + bounds.width / 2 - target.left - target.width / 2,
        y: bounds.top + bounds.height / 2 - target.top - target.height / 2, opacity: 1 });
      gsap.set(overlay, { opacity: 1 });
      timeline = gsap.timeline({ onComplete: finish });

      if (fromStartRect) {
        const orbitLogoRect = orbitLogo.getBoundingClientRect();
        const dy = fromStartRect.top - orbitLogoRect.top;
        const dx = fromStartRect.left - orbitLogoRect.left;
        const scale = fromStartRect.width / orbitLogoRect.width;

        gsap.set(orbitLogo, { x: dx, y: dy, scale, opacity: 1 });
        gsap.set(track, { opacity: 0 });
        gsap.set(cards, { opacity: 0, scale: 0.6 });

        timeline.to(orbitLogo, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.75,
          ease: 'power3.inOut'
        }, 0);

        timeline.to(track, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.45);

        timeline.fromTo(cards,
          { opacity: 0, scale: 0.65 },
          { opacity: 1, scale: 1, duration: 0.45, stagger: 0.15, ease: 'power2.out' },
          0.5
        );

        timeline.to(orbit, { x: 0, y: 0, duration: 1.45, ease: 'power3.inOut' }, 1.7)
          .to(overlay, { opacity: 0, duration: 0.4 }, 2.5)
          .to([copy, logo], { opacity: 1, duration: 0.8, ease: 'power2.out' }, 2.4)
          .to(caption, { opacity: 1, duration: 0.5 }, 2.7);
      } else {
        gsap.set(orbitLogo, { x: 0, y: 0, scale: 1, opacity: 1 });
        gsap.set(track, { opacity: 1 });
        timeline.fromTo(cards,
          { opacity: 0, scale: 0.65 },
          { opacity: 1, scale: 1, duration: 0.45, stagger: 0.12, ease: 'power2.out' }
        )
        .to(orbit, { x: 0, y: 0, duration: 1.45, ease: 'power3.inOut' }, 1.2)
        .to(overlay, { opacity: 0, duration: 0.4 }, 2.0)
        .to([copy, logo], { opacity: 1, duration: 0.8, ease: 'power2.out' }, 1.9)
        .to(caption, { opacity: 1, duration: 0.5 }, 2.2);
      }
    };
    root.querySelector('.opening-skip').addEventListener('click', () => {
      finish();
      root.querySelector('.opening-replay').focus({ preventScroll: true });
    });
    root.querySelector('.opening-replay').addEventListener('click', () => {
      play(null);
      if (!overlay.hidden) root.querySelector('.opening-skip').focus({ preventScroll: true });
    });
    const onMotionChange = () => { if (reduced.matches) finish(); };
    reduced.addEventListener('change', onMotionChange);
    window.addEventListener('resize', finish);
    play();
    return () => {
      timeline?.kill();
      reduced.removeEventListener('change', onMotionChange);
      window.removeEventListener('resize', finish);
    };
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Smooth diagram entrance without mutating SVG element transform coordinates
  gsap.fromTo('.diagram-container', 
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
  );

  // Pulse dots animation using safe opacity pulsing (avoids mutating SVG coordinates)
  const pulseDots = document.querySelectorAll('.pulse-dot');
  if (pulseDots.length > 0) {
    gsap.fromTo(pulseDots, 
      { opacity: 0.2 },
      { opacity: 1, repeat: -1, yoyo: true, duration: 0.8, ease: 'sine.inOut', stagger: 0.2 }
    );
  }

}
