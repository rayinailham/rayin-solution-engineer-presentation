/**
 * Diagrams and Architectural Stage Visuals for all 17 Slides
 * Standard: AWS Official Light Background Architecture (dark slate connectors #242f3e,
 * AWS Cloud boundary with top-left black tab, official SVG icons with centered labels,
 * orthogonal lines, short action labels, and GSAP entrances).
 * Language: English Study Case.
 */
import gsap from 'gsap';
import { AWS_SERVICES, SLIDES } from '../data/slides.js';
import { INSPECTOR_DATA, SLIDE_INSPECTORS } from '../data/inspectors.js';

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
    title: 'Lambda: event input, our handler code, and a delivery planning request',
    height: 800, cloud: [40, 40, 880, 585],
    headings: [[410, 160, '(1)  INPUT · Event data'], [420, 390, '(2)  RUN · Execute']],
    annotations: [[85, 110, 'Inside one event-driven task']],
    eventCard: [410, 185, 390, 155],
    outputCard: true,
    nodes: [
      ['eventbridge', 210, 260, 'Amazon EventBridge', 'Delivery rule matched'],
      ['lambda', 605, 455, 'AWS Lambda', 'Plan delivery', 'plan-delivery'],
      ['dynamodb', 815, 455, 'Amazon DynamoDB', 'Order details'],
    ],
    links: [
      ['M245 260H410', 'Send event', 325, 240, 'event'],
      ['M605 340V407', '', 0, 0, 'event'],
      ['M653 455H783', 'Read by order ID', 738, 417],
      ['M605 615V650', 'Send request', 735, 645],
    ],
  },
  7: {
    title: 'API Gateway starts the order workflow, which stores an order with status RECEIVED in DynamoDB',
    height: 800, cloud: [210, 40, 720, 720],
    nodes: [
      ['mobile', 85, 220, 'Buyer app'],
      ['apigateway', 350, 220, 'Amazon API Gateway', 'REST API route'],
      ['stepfunctions', 730, 220, 'AWS Step Functions', 'Same order workflow'],
      ['dynamodb', 730, 480, 'Amazon DynamoDB', 'Order details'],
    ],
    links: [
      ['M120 220H315', '1. HTTPS POST', 210, 200],
      ['M385 220H695', '2. StartExecution', 540, 200],
      ['M730 185V115H350V185', 'Workflow reference', 540, 95],
      ['M330 185V145H85V185', 'Initial reply', 165, 125],
      ['M765 220H875V480H765', '3. PutItem', 805, 365],
    ],
    headings: [[280, 420, 'Stored order'], [280, 620, '4. Check progress separately']],
    annotations: [
      [280, 452, 'After a successful write:'],
      [280, 485, 'orderId: EV-1042'],
      [280, 515, 'status: RECEIVED'],
      [280, 655, 'Use a separate status route (hidden).'],
      [280, 690, 'Started ≠ stored. RECEIVED ≠ CONFIRMED.'],
    ],
  },
  8: {
    title: 'Three compute choices: event-driven Lambda, containers with ECS and Fargate, or server control with EC2',
    height: 800, cloud: [40, 40, 880, 740],
    nodes: [
      ['lambda', 255, 185, 'AWS Lambda', 'Check order', 'check-order'],
      ['ecs', 155, 385, 'Amazon ECS', 'Manage containers'],
      ['fargate', 355, 385, 'AWS Fargate', 'Run containers'],
      ['ec2', 255, 585, 'Amazon EC2', 'Control the server'],
    ],
    links: [],
    headings: [[480, 150, 'Event-driven tasks'], [480, 350, 'Container workloads'],
      [480, 550, 'OS and software control']],
    annotations: [[480, 190, 'Best for: short, event-triggered tasks'],
      [480, 225, 'Standard Lambda: up to 15 min / run'],
      [480, 260, 'Team: code, permissions and settings'],
      [480, 390, 'Best for: longer-running services or jobs'],
      [480, 425, 'ECS: orchestrates container tasks'],
      [480, 460, 'Fargate: serverless compute'],
      [480, 590, 'Best for: custom OS or software needs'],
      [480, 625, 'Team: OS patches, capacity and scaling'],
      [480, 660, 'Also supports: ECS containers'],
      [85, 742, 'Choose per workload. Combine options where they fit.']],
  },
  9: {
    title: 'SQS buffers delivery events; Lambda polls and processes them, with repeated failures sent to a dead-letter queue',
    height: 800, cloud: [40, 40, 880, 740],
    nodes: [
      ['eventbridge', 180, 210, 'Amazon EventBridge', 'Delivery rule'],
      ['sqs', 480, 210, 'Amazon SQS', 'Waiting delivery updates', 'delivery-queue'],
      ['lambda', 780, 210, 'AWS Lambda', 'Plan delivery', 'plan-delivery'],
      ['sqs', 735, 535, 'Amazon SQS', 'Dead-letter queue', 'delivery-dlq'],
    ],
    links: [
      ['M215 210H445', 'Send event', 330, 190, 'event'],
      ['M515 210H745', 'Poll → invoke', 630, 190, 'event'],
      ['M480 310H525V535H700', 'Receive limit exceeded', 700, 360, 'event'],
    ],
    headings: [[100, 125, '1. Buffer incoming work'], [115, 425, '2. Process safely'],
      [590, 425, '3. Review failures']],
    annotations: [[115, 475, 'In progress'], [255, 475, 'Message hidden'],
      [115, 520, 'Success'], [255, 520, 'Message deleted'],
      [115, 565, 'Failure'], [255, 565, 'Available again'],
      [115, 645, 'Visibility timeout sets the retry window.'],
      [590, 650, 'Alert → inspect → fix → redrive'],
      [100, 735, 'Dashed = message flow · Lambda polls SQS; SQS does not push.']],
  },
  10: {
    title: 'One order update fans out through a Standard SNS topic to SMS, HTTPS and an optional SQS subscriber',
    height: 800, cloud: [50, 50, 600, 680],
    headings: [[100, 135, '1. Publish once'], [390, 135, '2. Fan out'], [710, 135, 'Subscribers']],
    nodes: [
      ['stepfunctions', 180, 270, 'AWS Step Functions', 'Order status update'],
      ['sns', 450, 270, 'Amazon SNS', 'Topic: order updates'],
      ['mobile', 820, 200, 'Buyer channel', 'SMS subscription'],
      ['internet', 820, 450, 'Support app', 'HTTPS subscription'],
      ['sqs', 450, 585, 'Amazon SQS', 'Optional subscriber', 'notification-queue'],
    ],
    links: [
      ['M215 270H415', 'Publish', 315, 248],
      ['M485 270H680V200H785', 'Copy', 730, 180, 'event'],
      ['M680 270V450H785', 'Copy', 730, 430, 'event'],
      ['M450 365V550', 'Copy to queue', 530, 465, 'event'],
    ],
    annotations: [[100, 705, 'One copy per matching subscription · Consumers run independently.'],
      [100, 770, 'Dashed = message flow · Queue consumers and delivery DLQs are hidden.']],
  },
  11: {
    title: 'Buyer app signs in with a Cognito user pool, sends an access token to a REST API Cognito authorizer, then workflow task code checks order ownership',
    height: 800, cloud: [240, 50, 690, 690],
    headings: [[285, 130, '1. Prove identity'], [285, 365, '2. Check API permission']],
    nodes: [
      ['mobile', 105, 300, 'Buyer app'],
      ['cognito', 445, 200, 'Amazon Cognito', 'User pool'],
      ['apigateway', 445, 440, 'Amazon API Gateway', 'REST · Cognito authorizer'],
      ['stepfunctions', 775, 440, 'AWS Step Functions', 'Same order workflow'],
    ],
    links: [
      ['M140 280H210V200H410', 'Sign in', 305, 178],
      ['M410 222H260V310H140', 'Access token to app', 345, 302],
      ['M105 380V440H410', 'HTTPS + access token', 260, 418],
      ['M480 440H740', 'Start workflow', 610, 418],
    ],
    annotations: [[70, 785, 'Request path shown · Replies, task calls and notifications hidden.']],
  },
  12: {
    title: 'Plan delivery: the function policy limits invocation; the execution role limits DynamoDB access',
    height: 800, cloud: [45, 40, 870, 720],
    headings: [[90, 135, 'Runtime · Direct trigger from slide 6']],
    nodes: [
      ['eventbridge', 200, 245, 'Amazon EventBridge', 'Delivery rule'],
      ['lambda', 490, 245, 'AWS Lambda', 'Plan delivery', 'plan-delivery'],
      ['dynamodb', 780, 245, 'Amazon DynamoDB', 'Orders table'],
      ['iam', 185, 580, 'AWS IAM', 'Execution role', 'delivery-role'],
    ],
    links: [
      ['M235 245H455', 'Invoke function', 345, 223, 'event'],
      ['M525 245H745', 'GetItem', 635, 223],
    ],
    annotations: [[90, 730, 'Arrows = runtime calls · Panels = permission settings · Replies hidden']],
  },
  13: {
    title: 'Step Functions sequences the same order tasks and follows configured error paths',
    height: 800, cloud: [40, 40, 880, 740],
    headings: [[410, 160, 'Tasks pass results to the next state']],
    nodes: [
      ['stepfunctions', 170, 160, 'AWS Step Functions', 'Controls this plan'],
      ['lambda', 210, 340, 'AWS Lambda', 'Check order', 'check-order'],
      ['lambda', 490, 340, 'AWS Lambda', 'Reserve stock', 'reserve-stock'],
      ['lambda', 780, 340, 'AWS Lambda', 'Charge payment', 'charge-payment'],
      ['eventbridge', 780, 610, 'Amazon EventBridge', 'OrderConfirmed'],
    ],
    taskBoxes: [[130, 565, 'Handle failure']],
    links: [
      ['M170 255V280H210V305', 'Start', 285, 280],
      ['M245 340H455', 'Pass', 350, 320],
      ['M525 340H745', 'Stock reserved', 635, 320],
      ['M490 435V525H272V565', 'Error after retry policy', 650, 505, 'failure'],
      ['M780 435V525H490', '', 0, 0, 'failure'],
      ['M815 340H875V610H815', 'After success', 780, 555, 'event'],
    ],
    annotations: [[410, 195, 'A Choice state can branch on a task result.'],
      [100, 735, 'Configure retries, idempotency and recovery.']],
  },
  14: {
    title: 'Scope access to order records, protect stored data, then review AWS actions and settings',
    height: 800, cloud: [40, 40, 880, 740],
    headings: [[115, 145, 'PROTECT ORDER DATA'], [115, 475, 'AUDIT ACTIONS + RESOURCE SETTINGS']],
    nodes: [
      ['iam', 175, 290, 'AWS IAM', 'Least privilege'],
      ['dynamodb', 475, 290, 'Amazon DynamoDB', 'Order records'],
      ['kms', 775, 290, 'AWS KMS', 'Manage keys'],
      ['cloudtrail', 325, 620, 'AWS CloudTrail', 'Record actions'],
      ['config', 655, 620, 'AWS Config', 'Check settings'],
    ],
    links: [
      ['M210 290H440', 'Scoped permissions', 325, 268],
      ['M510 290H740', 'Encryption key', 625, 268],
    ],
  },
  15: {
    title: 'Record logs, metrics and traces to investigate the same Charge payment task',
    height: 800, cloud: [40, 40, 660, 740],
    headings: [[100, 110, 'Follow Charge payment from the main workflow']],
    nodes: [
      ['stepfunctions', 190, 200, 'AWS Step Functions', 'Order workflow'],
      ['lambda', 530, 200, 'AWS Lambda', 'Charge payment', 'charge-payment'],
      ['internet', 835, 200, 'Payment provider', 'External service'],
      ['cloudwatch', 260, 570, 'Amazon CloudWatch', 'Logs + metrics'],
      ['xray', 560, 570, 'AWS X-Ray', 'Traces'],
    ],
    links: [
      ['M225 200H495', 'Call task', 360, 180],
      ['M565 200H800', 'Ask payment', 650, 180],
      ['M530 282V390H260V535', 'Logs + metrics', 355, 370],
      ['M550 282V430H560V535', 'Traces', 610, 480],
    ],
    annotations: [[100, 715, 'Include order IDs. Keep sensitive data out of logs.'],
      [100, 745, 'Traces show the calls we record.']],
  },
  16: {
    title: 'POC design to validate: the order workflow publishes a confirmed event for independent notification, fulfillment, and reporting',
    height: 800, cloud: [100, 40, 820, 740],
    headings: [[130, 110, 'ORDER ENTRY + WORKFLOW'], [130, 350, 'CONFIRMED ORDER ROUTING']],
    nodes: [
      ['mobile', 65, 210, 'Buyer app'],
      ['apigateway', 300, 200, 'Amazon API Gateway', 'Receive orders'],
      ['stepfunctions', 550, 200, 'AWS Step Functions', 'Order workflow'],
      ['dynamodb', 800, 200, 'Amazon DynamoDB', 'Order records'],
      ['sns', 300, 440, 'Amazon SNS', 'Customer updates'],
      ['eventbridge', 550, 440, 'Amazon EventBridge', 'OrderConfirmed'],
      ['sqs', 800, 440, 'Amazon SQS', 'Fulfillment queue', 'delivery-queue'],
      ['lambda', 550, 660, 'AWS Lambda', 'Update sales report', 'update-sales-report'],
      ['lambda', 800, 660, 'AWS Lambda', 'Plan delivery', 'plan-delivery'],
    ],
    links: [
      ['M90 210H265', 'Order', 185, 190],
      ['M340 200H515', 'Start workflow', 410, 180],
      ['M590 200H760', 'Read / write', 675, 180],
      ['M590 200H650V440H590', 'Publish after success', 760, 350],
      ['M510 440H340', 'Notification rule', 410, 420, 'event'],
      ['M590 440H760', 'Fulfillment rule', 730, 420, 'event'],
      ['M510 440H440V660H510', 'Report rule', 560, 610, 'event'],
      ['M840 440H875V660H840', 'Lambda polls', 735, 585, 'event'],
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
  return `<div class="diagram-container service-graph${slideId >= 2 ? ' graph-context' : ''}${slideId === 14 ? ' slide-14-graph' : ''}${slideId === 15 ? ' slide-15-graph' : ''}${slideId === 16 ? ' slide-16-graph' : ''}">
    <svg class="aws-stage-svg" viewBox="0 0 960 ${graph.height || 600}" role="img" aria-labelledby="graph-title-${slideId}">
      <title id="graph-title-${slideId}">${graph.title}</title>
      <defs>
        ${renderOpenArrowMarker(marker, slideId === 15 ? '#000000' : '#242f3e', slideId === 15 || slideId === 16 ? 4 : 6.5)}
        ${renderOpenArrowMarker(`${marker}-event`, '#242f3e', slideId === 16 ? 4 : 6.5)}
        ${renderOpenArrowMarker(`${marker}-failure`, '#b45309', slideId === 16 ? 4 : 6.5)}
        ${renderOpenArrowMarker(`${marker}-feedback`, '#167b55', slideId === 16 ? 4 : 6.5)}
      </defs>
      ${slideId === 2 ? '<text x="210" y="45" class="graph-group-label" fill="#232f3e">Proposed order-processing services</text>' : ''}
      ${renderAwsCloudBoundary(...graph.cloud, 'AWS Cloud', slideId >= 2, slideId === 15)}
      ${slideId === 6 ? `<g class="delivery-execution-surface comparison-note" aria-hidden="true">
        <rect x="400" y="365" width="490" height="245" rx="8" fill="#f8fafc" stroke="#d9e1e9" />
      </g>` : ''}
      ${slideId === 7 ? `<g class="order-state-surface comparison-note" aria-hidden="true">
        <rect x="250" y="385" width="370" height="155" rx="8" fill="#f8fafc" stroke="#d9e1e9" />
        <line x1="280" y1="465" x2="590" y2="465" stroke="#e2e8f0" />
        <rect x="250" y="585" width="630" height="145" rx="8" fill="#f8fafc" stroke="#d9e1e9" />
      </g>` : ''}
      ${slideId === 9 ? `<g class="queue-lifecycle-surface comparison-note" aria-hidden="true">
        <rect x="90" y="385" width="400" height="300" rx="8" fill="#f8fafc" stroke="#d9e1e9" />
        <rect x="565" y="385" width="310" height="300" rx="8" fill="#ffffff" stroke="#d9e1e9" />
        <path d="M115 443H465 M590 443H850 M115 490H465 M115 535H465 M115 600H465" fill="none" stroke="#e2e8f0" />
      </g>` : ''}
      ${slideId === 11 ? `<g class="access-record-check comparison-note" fill="#232f3e">
        <rect x="285" y="585" width="600" height="115" rx="8" fill="#ffffff" stroke="#d9e1e9" />
        <text x="310" y="617" font-weight="700">3. Check the record in task code</text>
        <text x="310" y="650">Verified buyer ID must match the order owner.</text>
        <text x="310" y="677">Deny access before returning or changing order data.</text>
      </g>` : ''}
      ${slideId === 12 ? `<g class="task-permissions comparison-note" fill="#232f3e">
        <g class="permission-panel">
        <rect x="90" y="380" width="780" height="115" rx="8" fill="#f8fafc" stroke="#d9e1e9" />
        <text x="115" y="412" font-weight="700">1. Who may invoke? · Lambda resource-based policy</text>
        <text x="115" y="445">Allow events.amazonaws.com → lambda:InvokeFunction</text>
        <text x="115" y="474">Only the delivery rule ARN · aws:SourceArn</text>
        </g>
        <g class="permission-panel">
        <rect x="90" y="520" width="780" height="170" rx="8" fill="#ffffff" stroke="#d9e1e9" />
        <text x="325" y="555" font-weight="700">2. What may the task do?</text>
        <text x="325" y="588">Allow dynamodb:GetItem</text>
        <text x="325" y="617">Resource: Orders table ARN only</text>
        <text x="325" y="646">3. No delete or payment permissions</text>
        </g>
      </g>` : ''}
      ${slideId === 8 ? [115, 315, 515].map(y => `<g class="compute-choice-surface comparison-note" aria-hidden="true">
        <rect x="75" y="${y}" width="810" height="180" rx="8" fill="#ffffff" stroke="#d9e1e9" />
        <rect x="76" y="${y + 1}" width="368" height="178" rx="7" fill="#f5f7fa" />
        <line x1="445" y1="${y}" x2="445" y2="${y + 180}" stroke="#d9e1e9" />
        <line x1="480" y1="${y + 49}" x2="850" y2="${y + 49}" stroke="#e6ebf0" />
      </g>`).join('') : ''}
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
        <rect class="node-rect" x="410" y="185" width="390" height="155" rx="${slideId === 6 ? 8 : 0}" fill="#f8fafc" stroke="#64748b" />
        ${slideId === 6 ? `<text x="430" y="215" font-weight="700">Order confirmed</text>
        <text x="430" y="248">Order ID: EV-1042</text>
        <text x="430" y="281">Status: confirmed</text>
        <text x="430" y="314">Event: OrderConfirmed</text>` : `<text x="430" y="215">source: apex.orders</text>
        <text x="430" y="245">type: OrderConfirmed</text>
        <text x="430" y="275">order ID: EV-1042</text>
        <text x="430" y="305">status: confirmed</text>
        <text x="430" y="328">type = event name (detail type)</text>`}
      </g>` : ''}
      ${(graph.rules || []).map(([key, x, y, title, lines]) => `<g class="routing-rule inspectable-node" data-node="rule" data-inspector="${key}" role="button" tabindex="0" aria-label="Inspect ${title}">
        <rect class="node-rect" x="${x}" y="${y}" width="230" height="110" rx="0" fill="#f8fafc" stroke="#64748b" />
        <text x="${x + 15}" y="${y + 25}" font-weight="700">${title}</text>
        ${lines.map((text, i) => `<text x="${x + 15}" y="${y + 50 + i * 23}">${text}</text>`).join('')}
      </g>`).join('')}
      ${slideId === 6 ? `<g class="delivery-handler comparison-note" fill="#232f3e">
        <rect x="80" y="365" width="295" height="245" rx="8" fill="#fff7ed" stroke="#fed7aa"/>
        <text x="100" y="395" font-weight="700">HANDLER · Our code</text>
        <text x="100" y="425">Entry point for the event</text>
        <text x="100" y="466" class="handler-code">id = event.detail.orderId</text>
        <text x="100" y="497" class="handler-code">order = findOrder(id)</text>
        <text x="100" y="528" class="handler-code">requestPlan(order)</text>
        <text x="100" y="555">Illustrative pseudocode</text>
        <line x1="100" y1="568" x2="355" y2="568" stroke="#fed7aa" />
        <text x="100" y="592">AWS runs and scales compute.</text>
      </g>` : ''}
      ${slideId === 6 ? `<g class="delivery-work comparison-note" fill="#232f3e" text-anchor="middle">
        <text x="645" y="587">Then request a delivery plan.</text>
      </g>` : ''}
      ${graph.outputCard ? `<g class="delivery-output inspectable-node" data-node="planning-request" data-inspector="planning-request" role="button" tabindex="0" aria-label="Inspect delivery system and planning request">
        <rect class="node-rect" x="410" y="650" width="390" height="100" rx="8" fill="#f8fafc" stroke="#64748b" />
        <text x="430" y="678" font-weight="700">(3)  DELIVERY SYSTEM</text>
        <text x="430" y="708">Receives planning request · EV-1042</text>
        <text x="430" y="738">Request received ≠ delivery completed</text>
      </g>` : ''}
      ${graph.links.map(([path, label, x, y, kind]) => `
        <g class="graph-link ${kind || ''}">
          <path d="${path}" marker-end="url(#${marker}${kind ? `-${kind}` : ''})"/>
          ${label ? `<text x="${x}" y="${y}" class="graph-link-label">${label}</text>` : ''}
        </g>`).join('')}
      ${graph.nodes.map(([key, x, y, label, caption, inspectorKey], index) => {
        const service = AWS_SERVICES[key];
        const inspectable = Boolean(SLIDE_INSPECTORS[slideId]?.[inspectorKey || key] || INSPECTOR_DATA[key]);
        const enlarged = slideId === 6 && inspectorKey === 'plan-delivery';
        const architectureIcon = slideId === 16 && AWS_SERVICES[key];
        return `<g class="graph-node${slideId === 6 && key === 'dynamodb' ? ' delivery-lookup' : ''}${inspectable ? ' inspectable-node' : ''}" ${inspectable ? `data-node="${key}" data-node-index="${index}" data-inspector="${inspectorKey || key}" role="button" tabindex="0" aria-label="Inspect ${label}${caption ? `: ${caption}` : ''}"` : ''} transform="translate(${x}, ${y})">
          <rect class="node-rect" x="-82" y="-45" width="164" height="${enlarged ? 145 : caption ? 122 : 100}" rx="8" fill="transparent" stroke="transparent"/>
          <image href="${service?.icon || EXTRA_ICONS[key]}" x="${enlarged ? -48 : architectureIcon ? -40 : -32}" y="${enlarged ? -48 : architectureIcon ? -40 : -32}" width="${enlarged ? 96 : architectureIcon ? 80 : 64}" height="${enlarged ? 96 : architectureIcon ? 80 : 64}"/>
          <text y="${enlarged ? 73 : architectureIcon ? 68 : 57}" class="graph-node-label">${label}</text>
          ${caption ? `<text y="${slideId === 14 ? 89 : enlarged ? 93 : architectureIcon ? 88 : 77}" class="graph-node-caption">${caption}</text>` : ''}
        </g>`;
      }).join('')}
    </svg>
  </div>`;
}


function renderSlide17() {
  const slide = SLIDES.find(item => item.id === 17);
  const recapServices = [
    ['/assets/09-general-resources/users.svg'],
    ['lambda', 'stepfunctions'],
    ['sqs', 'sns', 'eventbridge'],
    ['iam', 'kms'],
    ['cloudwatch', 'xray'],
  ];
  return `<section class="slide-closing-wrapper" lang="en" aria-label="Course recap and discussion">
    <div class="closing-hero-card">
      <div class="closing-copy">
        <div class="closing-eyebrow font-mono"><span class="badge-tag">${slide.act}</span><span class="badge-accent">AWS Skill Builder recap</span></div>
        <h1 class="closing-main-title font-serif">${slide.title}</h1>
        <p class="closing-summary font-sans">${slide.summary}</p>
        <section class="closing-challenge font-sans" aria-label="Design question">
          <span class="closing-challenge-label font-mono">TRY THE DESIGN</span>
          <p>A news team processes uploaded media. Which service buffers waiting jobs? Which service coordinates the processing steps?</p>
        </section>
      </div>
      <section class="closing-recap" aria-label="Five design principles">
        <div class="closing-recap-heading"><h2 class="font-serif">Five design principles</h2><p>Choose by responsibility, then prove the design with tests.</p></div>
        <div class="rules-five-grid font-sans">${slide.points.map((point, i) => `<article class="rule-box">
          <span class="rule-num font-mono">${String(i + 1).padStart(2, '0')}</span>
          <div class="rule-content"><h3 class="rule-title">${point.statement}</h3><p class="rule-desc">${point.description}</p></div>
          <span class="recap-service-icons" aria-hidden="true">${recapServices[i].map(key => {
            const src = key.startsWith('/') ? key : AWS_SERVICES[key].icon;
            return `<img src="${src}" alt="" width="48" height="48" />`;
          }).join('')}</span>
        </article>`).join('')}</div>
      </section>
      <div class="qa-stage-banner font-sans"><span class="qa-badge-live font-mono">Q&amp;A AND DISCUSSION</span>
        <span class="qa-presenter">Presented by <strong>Rayina Ilham</strong></span></div>
    </div>
  </section>`;
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
    if (options.skipAnimation) finish();
    else play();
    return () => {
      timeline?.kill();
      reduced.removeEventListener('change', onMotionChange);
      window.removeEventListener('resize', finish);
    };
  }

  if (options.skipAnimation || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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
