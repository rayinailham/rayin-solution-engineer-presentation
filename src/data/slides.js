export const AWS_SERVICES = {
  apigateway: {
    name: "Amazon API Gateway",
    nodeKey: "apigateway",
    icon: "/assets/03-core-services/03-amazon-api-gateway/Amazon-API-Gateway.svg"
  },
  fargate: {
    name: "AWS Fargate",
    nodeKey: "fargate",
    icon: "/assets/04-compute-and-container-comparison/05-aws-fargate/AWS-Fargate.svg"
  },
  stepfunctions: {
    name: "AWS Step Functions",
    nodeKey: "stepfunctions",
    icon: "/assets/03-core-services/06-aws-step-functions/AWS-Step-Functions.svg"
  },
  dynamodb: {
    name: "Amazon DynamoDB",
    nodeKey: "dynamodb",
    icon: "/assets/03-core-services/10-amazon-dynamodb/Amazon-DynamoDB.svg"
  },
  sns: {
    name: "Amazon SNS",
    nodeKey: "sns",
    icon: "/assets/03-core-services/05-amazon-sns/Amazon-SNS.svg"
  },
  sqs: {
    name: "Amazon SQS",
    nodeKey: "sqs",
    icon: "/assets/03-core-services/04-amazon-sqs/Amazon-SQS.svg"
  },
  ec2: {
    name: "Amazon EC2",
    nodeKey: "ec2",
    icon: "/assets/04-compute-and-container-comparison/01-amazon-ec2/Amazon-EC2.svg"
  },
  eventbridge: {
    name: "Amazon EventBridge",
    nodeKey: "eventbridge",
    icon: "/assets/03-core-services/01-amazon-eventbridge/Amazon-EventBridge.svg"
  },
  lambda: {
    name: "AWS Lambda",
    nodeKey: "lambda",
    icon: "/assets/03-core-services/02-aws-lambda/AWS-Lambda.svg"
  },
  ecs: {
    name: "Amazon ECS",
    nodeKey: "ecs",
    icon: "/assets/04-compute-and-container-comparison/02-amazon-ecs/Amazon-ECS.svg"
  },
  sam: {
    name: "AWS SAM",
    nodeKey: "sam",
    icon: "/assets/03-core-services/18-aws-cloudformation/AWS-CloudFormation.svg"
  },
  waf: {
    name: "AWS WAF",
    nodeKey: "waf",
    icon: "/assets/05-network-and-security/05-aws-waf/AWS-WAF.svg"
  },
  cognito: {
    name: "Amazon Cognito",
    nodeKey: "cognito",
    icon: "/assets/03-core-services/07-amazon-cognito/Amazon-Cognito.svg"
  },
  kms: {
    name: "AWS KMS",
    nodeKey: "kms",
    icon: "/assets/03-core-services/13-aws-kms/AWS-KMS.svg"
  },
  vpc: {
    name: "Amazon VPC",
    nodeKey: "vpc",
    icon: "/assets/05-network-and-security/01-amazon-vpc/Amazon-VPC.svg"
  },
  privatelink: {
    name: "AWS PrivateLink",
    nodeKey: "privatelink",
    icon: "/assets/05-network-and-security/03-vpc-endpoints-privatelink/VPC-Endpoints-PrivateLink.svg"
  },
  s3: {
    name: "Amazon S3",
    nodeKey: "s3",
    icon: "/assets/03-core-services/09-amazon-s3/Amazon-S3.svg"
  },
  cloudfront: {
    name: "Amazon CloudFront",
    nodeKey: "cloudfront",
    icon: "/assets/03-core-services/17-amazon-cloudfront/Amazon-CloudFront.svg"
  },
  xray: {
    name: "AWS X-Ray",
    nodeKey: "xray",
    icon: "/assets/03-core-services/12-aws-xray/AWS-X-Ray.svg"
  },
  cloudwatch: {
    name: "Amazon CloudWatch",
    nodeKey: "cloudwatch",
    icon: "/assets/03-core-services/11-amazon-cloudwatch/Amazon-CloudWatch.svg"
  }
};

export const SLIDES = [
  {
    id: 1,
    act: "ACT I: INTRODUCTION & CHALLENGES",
    section: "KEYNOTE COVER",
    type: "OPENING",
    title: "Designing a Serverless Architecture with Event-Driven Microservices",
    subtitle: "Enterprise Production Blueprint: Massive Scalability, Zero Idle Cost & High Resilience",
    presenter: "Rayina Ilham",
    role: "IT Operation Intern at AnterAja",
    summary: "A production-grade architectural guide transitioning from monolithic virtual servers to a modern, decoupled, event-driven serverless paradigm.",
    services: ["eventbridge", "lambda", "apigateway", "dynamodb"]
  },
  {
    id: 2,
    act: "PART I: CONTEXT AND CHALLENGES",
    section: "SECTION 02",
    type: "Case Study and Context",
    title: "Apex Mobility: Six Months to Launch",
    pills: ["Example EV Startup", "Launch in 6 Months", "Small Team"],
    services: ["apigateway", "stepfunctions", "dynamodb", "sns"],
    summary: "Apex Mobility is a made-up name for this EV startup case. A small team has six months to launch online vehicle configuration, financing, orders, and delivery tracking from scratch, with less infrastructure work.\nChallenges: thousands of concurrent users; configuration responses under one second; credit processing in seconds; real-time orders and inventory; secure payments and customer data; compliance, role-based access, and audit trails.\nThe platform needs auto-scaling, automatic recovery, consistent data, and metrics for order completion, configuration speed, popular options, regional sales, and conversion. Rollout starts in three US states, then expands nationwide.",
    points: [
      { statement: "Accept web and mobile orders → API Gateway", description: "One entry point for orders from the website and mobile app." },
      { statement: "Manage each step of an order → Step Functions", description: "Run order steps in sequence and handle errors." },
      { statement: "Save and find order data → DynamoDB", description: "Save, find, and update order details and status." },
      { statement: "Share order status updates → SNS", description: "Send order updates to connected notification channels." }
    ],
    graphContext: "These goals guide this proposed design. Lines show service connections; workflow rules determine the order of tasks.",
    metadata: "Proposed order-processing design • Click an AWS service to learn more"
  },
  {
    id: 3,
    act: "PART I: DESIGN TRADE-OFFS",
    section: "SECTION 03",
    type: "Architecture Trade-offs",
    title: "Why Consider Serverless?",
    pills: ["Less Server Work", "Separate Tasks", "Small Team"],
    services: ["ec2", "apigateway", "stepfunctions", "lambda"],
    summary: "Apex starts from scratch. We are comparing two ways to build its platform. One large application can be easy to build at first. As it grows, a small team may find it harder to change and run.",
    points: [
      { statement: "1. Reduce server work", description: "Top: the team maintains the server software. Bottom: AWS runs the servers for the managed services." },
      { statement: "2. Change one task at a time", description: "Top: order, stock, and payment code ship together. Bottom: update one Lambda function without releasing the whole application." },
      { statement: "3. Decide what happens after an error", description: "Top: an error can interrupt the shared process. Bottom: workflow rules can retry a failed task. Payment code must still prevent double charges." }
    ],
    graphContextTitle: "Read the comparison",
    graphContext: "Match points 1–3 to the same numbers in the graph. The bottom row expands slide 2's workflow; DynamoDB and SNS are left out. Branches show task calls, not parallel execution. EC2 can also run separate services.",
    metadata: "Design comparison • Click a service to explore responsibilities"
  },
  {
    id: 4,
    act: "PART I: CONNECTING TASKS",
    section: "SECTION 04",
    type: "Principle",
    title: "How Do Separate Tasks Share Updates?",
    pills: ["Events", "Independent Reactions", "Same Workflow"],
    services: ["apigateway", "stepfunctions", "lambda", "eventbridge"],
    summary: "Slide 3 split the work into tasks. Now, how can other services learn that an order is confirmed? Share an event: a message about something that happened.",
    points: [
      { statement: "1. Keep the order workflow", description: "Step Functions still sets the order of the Lambda tasks." },
      { statement: "2. Publish what happened", description: "After success, publish OrderConfirmed. EventBridge uses rules to send it to interested services." },
      { statement: "3. Let each service react", description: "Delivery planning and sales reports run separately. The workflow does not wait for their results." }
    ],
    graphContextTitle: "Workflow + events",
    graphContext: "Solid = service calls, not parallel steps. Dashed = event delivery, with no fixed order. DynamoDB and SNS remain in the design; hidden here for focus.",
    metadata: "Proposed EV example • Event name and reactions are illustrative"
  },
  {
    id: 5,
    act: "PART I: CHOOSING RECEIVERS",
    section: "SECTION 05",
    type: "Core EDA",
    title: "Who Gets the Order Update?",
    pills: ["One Event", "Matching Rules", "Separate Targets"],
    services: ["stepfunctions", "eventbridge", "lambda"],
    summary: "Slide 4 shared the news. Now look inside EventBridge: how does it choose who gets that news?",
    points: [
      { statement: "1. Read the event", description: "OrderConfirmed means the order is confirmed. The message carries the order ID and status." },
      { statement: "2. Check each rule", description: "A rule is a test on event data. Both rules shown match this message." },
      { statement: "3. Send a copy to each target", description: "A target is a receiver. Each matching rule sends the event to its own Lambda task." }
    ],
    graphContextTitle: "A closer look at slide 4",
    graphContext: "Dashed arrows carry events, not task order. The order workflow stays. API Gateway, its three Lambda tasks, DynamoDB, and SNS are hidden for focus.",
    metadata: "EV example • Event fields and rules are illustrative"
  },
  {
    id: 6,
    act: "ACT II: BUILDING THE SERVERLESS ENGINE",
    section: "SECTION 06",
    type: "Compute",
    title: "Compute Muscle: AWS Lambda & Firecracker MicroVM Execution",
    pills: ["AWS Lambda", "Firecracker MicroVM", "Stateless Compute"],
    services: ["lambda"],
    summary: "Stateless event execution within ultra-lightweight Firecracker microVM sandboxes, scaling instantly from zero to thousands of instances in milliseconds.",
    points: [
      "VM-level security isolation combined with container-level execution speed.",
      "Lifecycle optimization: Init phase, handler invocation, and warm reuse.",
      "Pure pay-for-value economics: Exactly zero cost when no transactions run."
    ],
    metadata: "Compute Specification • Execution Granularity 1ms"
  },
  {
    id: 7,
    act: "ACT II: BUILDING THE SERVERLESS ENGINE",
    section: "SECTION 07",
    type: "Ingress",
    title: "Front-Door Gatekeeper: Amazon API Gateway & Ingress Management",
    pills: ["Amazon API Gateway", "Throttling", "Direct Service Integration"],
    services: ["apigateway", "sqs"],
    summary: "Fully managed ingress gateway controlling incoming traffic with token bucket algorithms, validating JSON request schemas, and proxying directly to AWS queues.",
    points: [
      "Traffic shaping & rate limiting protect backend workers from load spikes.",
      "Edge payload validation filters malformed requests without incurring compute costs.",
      "Direct AWS Service Integration enqueues messages to SQS/EventBridge with zero compute code."
    ],
    metadata: "API Management • Ingress SLA 99.95%"
  },
  {
    id: 8,
    act: "ACT II: BUILDING THE SERVERLESS ENGINE",
    section: "SECTION 08",
    type: "Trade-off",
    title: "Strategic Compute Matrix: The Spectrum from FaaS to IaaS",
    pills: ["Lambda", "AWS Fargate", "Amazon ECS", "Amazon EC2"],
    services: ["lambda", "fargate", "ecs", "ec2"],
    summary: "Selecting compute engines based on clear architectural trade-offs: operational burden, control granularity, execution duration limits, and cost structure.",
    points: [
      "AWS Lambda for event-driven, short-duration tasks under 15 minutes.",
      "AWS Fargate for containerized, long-running batch jobs and 3D rendering pipelines.",
      "Amazon EC2 reserved strictly for legacy workloads requiring low-level OS kernel control."
    ],
    metadata: "Compute Spectrum Decision Matrix • Cost vs Control"
  },
  {
    id: 9,
    act: "ACT II: BUILDING THE SERVERLESS ENGINE",
    section: "SECTION 09",
    type: "Messaging",
    title: "Shock Absorbers & Broadcast: Amazon SQS & SNS (Fan-Out & Buffering)",
    pills: ["Amazon SNS", "Amazon SQS", "DLQ", "Fan-Out Pattern"],
    services: ["sns", "sqs", "lambda"],
    summary: "The gold standard of asynchronous messaging: SNS broadcasts a single order event in parallel to multiple SQS queues for load leveling and failure isolation.",
    points: [
      "Fan-Out pattern cleanly separates payment, factory VIN reservation, and notification workers.",
      "SQS queues buffer extreme traffic bursts, enabling smooth downstream consumption.",
      "Dead-Letter Queues (DLQ) ensure zero transaction data is ever dropped on failure."
    ],
    metadata: "Asynchronous Messaging • Message Retention up to 14 Days"
  },
  {
    id: 10,
    act: "ACT II: BUILDING THE SERVERLESS ENGINE",
    section: "SECTION 10",
    type: "DevOps/IaC",
    title: "Release Automation: AWS SAM & GitHub Actions CI/CD Pipeline",
    pills: ["AWS SAM", "CloudFormation", "GitHub Actions", "No ClickOps"],
    services: ["sam", "lambda"],
    summary: "Eliminating manual console configurations. Infrastructure is defined declaratively in code (YAML), validated locally, and deployed automatically with zero downtime.",
    points: [
      "Infrastructure as Code (IaC) guarantees identical dev, staging, and production environments.",
      "Automated linting, SAM schema validation, and unit tests run on every pull request.",
      "Canary deployments shift traffic progressively with automated rollback alarms."
    ],
    metadata: "DevOps Maturity • CloudFormation Engine"
  },
  {
    id: 11,
    act: "ACT III: SECURITY, ORCHESTRATION, DATA & OBSERVABILITY",
    section: "SECTION 11",
    type: "Security",
    title: "Digital Identity Checkpoint: Amazon Cognito & AWS WAF (Zero-Trust)",
    pills: ["AWS WAF", "Amazon Cognito", "JWT Validation", "Zero-Trust Ingress"],
    services: ["waf", "cognito", "apigateway", "kms"],
    summary: "Layered perimeter defense at the edge: AWS WAF filters Layer 7 threats (SQLi/XSS), while Cognito validates JWT tokens at API Gateway before hitting application logic.",
    points: [
      "AWS WAF managed rule sets block malicious bots and rate-based DDoS at edge locations.",
      "API Gateway Cognito Authorizer drops unauthorized requests with an immediate 401 response.",
      "Cryptographically verified user claims (roles, permissions) are safely forwarded downstream."
    ],
    metadata: "Zero-Trust Security • OIDC / OAuth 2.0 Standard"
  },
  {
    id: 12,
    act: "ACT III: SECURITY, ORCHESTRATION, DATA & OBSERVABILITY",
    section: "SECTION 12",
    type: "Network",
    title: "Deep Defense: VPC PrivateLink & AWS KMS Encryption",
    pills: ["AWS VPC", "AWS PrivateLink", "AWS KMS", "Zero Public IP"],
    services: ["vpc", "privatelink", "kms", "dynamodb", "s3"],
    summary: "Isolating data processing microservices inside private subnets without public IPs or Internet Gateways. Service access flows through PrivateLink with hardware KMS encryption.",
    points: [
      "VPC Interface Endpoints connect Lambda to DynamoDB and S3 without crossing public internet.",
      "AWS KMS Customer Managed Keys (CMK) provide automated envelope encryption at rest.",
      "Every cryptographic operation is permanently recorded in AWS CloudTrail audit logs."
    ],
    metadata: "Network Hardening • FIPS 140-2 Level 3 KMS HSM"
  },
  {
    id: 13,
    act: "ACT III: SECURITY, ORCHESTRATION, DATA & OBSERVABILITY",
    section: "SECTION 13",
    type: "Workflow",
    title: "Distributed Transaction Orchestration: AWS Step Functions Saga",
    pills: ["AWS Step Functions", "Saga Pattern", "Compensating Transactions"],
    services: ["stepfunctions", "lambda", "dynamodb"],
    summary: "Coordinating multi-service vehicle purchasing workflows across banking, billing, and factory systems. If any step fails, the state machine triggers automatic compensating rollbacks.",
    points: [
      "Visual state machine tracks long-running transaction progression deterministically.",
      "Eliminates fragile distributed two-phase commits and complex database locking.",
      "Built-in error handling with exponential backoff retries and automated compensating fallback."
    ],
    metadata: "Distributed Saga Workflow • Amazon States Language (ASL)"
  },
  {
    id: 14,
    act: "ACT III: SECURITY, ORCHESTRATION, DATA & OBSERVABILITY",
    section: "SECTION 14",
    type: "Database",
    title: "Modern Web Blueprint: DynamoDB Single-Table Persistence",
    pills: ["Amazon DynamoDB", "Single-Table Design", "DynamoDB Streams"],
    services: ["dynamodb", "cloudfront", "apigateway", "lambda"],
    summary: "Bypassing slow SQL joins at scale. All transactional entities are modeled within a single table delivering single-digit millisecond latency via composite keys and CDC Streams.",
    points: [
      "Predictable single-digit millisecond read/write latency at arbitrary request volumes.",
      "Global Secondary Indexes (GSI) support flexible dual access patterns without data duplication.",
      "DynamoDB Streams capture real-time change data to trigger downstream microservices."
    ],
    metadata: "NoSQL Data Modeling • Single-Digit Millisecond SLA"
  },
  {
    id: 15,
    act: "ACT III: SECURITY, ORCHESTRATION, DATA & OBSERVABILITY",
    section: "SECTION 15",
    type: "Telemetry",
    title: "Eagle-Eye Telemetry: Observability with AWS X-Ray & CloudWatch",
    pills: ["AWS X-Ray", "Amazon CloudWatch", "Distributed Tracing"],
    services: ["xray", "cloudwatch", "apigateway", "lambda"],
    summary: "Eliminating cross-team blame during operational incidents. A unique Trace ID tracks the entire request journey from browser ingress through microservices and third-party APIs.",
    points: [
      "Distributed Tracing isolates latency bottlenecks across each individual microservice hop.",
      "CloudWatch Embedded Metric Format (EMF) outputs high-cardinality metrics asynchronously.",
      "Instant root-cause analysis clearly distinguishes internal code performance from external bank delays."
    ],
    metadata: "Observability Suite • End-to-End Trace Correlation"
  },
  {
    id: 16,
    act: "ACT IV: ARCHITECTURAL VICTORY & SUMMARY",
    section: "SECTION 16",
    type: "GRAND TOPOLOGY",
    title: "The Startup Victory: End-to-End Production Architecture (All Systems Go)",
    pills: ["Production Live", "Zero Physical Servers", "TCO -74%", "100% Serverless"],
    services: ["eventbridge", "lambda", "apigateway", "stepfunctions", "dynamodb", "sqs", "waf", "kms", "cloudwatch"],
    summary: "Assembling the complete architectural blueprint: Ingress, Auth, Event Bus, Microservices, Workflows, Persistence, and Observability into an active, resilient production topology.",
    points: [
      "6-Month go-live milestone achieved with a lean, agile engineering team.",
      "Automated multi-AZ resilience with zero operating system maintenance or manual patching.",
      "Proven financial efficiency: Total Cost of Ownership (TCO) reduced by 74% compared to static clusters."
    ],
    metadata: "Production Status: ALL SYSTEMS OPERATIONAL • Zero Critical Vulnerabilities"
  },
  {
    id: 17,
    act: "ACT IV: ARCHITECTURAL VICTORY & SUMMARY",
    section: "SECTION 17",
    type: "CLOSING",
    title: "Executive Summary: 5 Golden Rules of Serverless & Q&A",
    pills: ["Executive Takeaways", "5 Golden Rules", "Q&A Session"],
    services: ["eventbridge", "lambda", "apigateway", "dynamodb", "stepfunctions"],
    summary: "Five essential architectural principles for resilient high-scale serverless systems, go-live production scorecard, and an open interactive question & answer session.",
    points: [
      "1. Make events small and purpose-specific (Event Choreography).",
      "2. Embrace eventual consistency using distributed Saga rollbacks.",
      "3. Offload queue buffering and rate limiting directly to managed cloud services.",
      "4. Adopt Single-Table DynamoDB persistence for predictable low latency and cost.",
      "5. Observability first: Correlated Trace IDs are the lifeblood of distributed systems."
    ],
    metadata: "Keynote Delivery Complete • Presenter: Rayina Ilham • Q&A Open"
  }
];
