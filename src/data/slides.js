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
  iam: {
    name: "AWS Identity and Access Management (IAM)",
    nodeKey: "iam",
    icon: "/assets/03-core-services/08-aws-iam/AWS-IAM.svg"
  },
  cloudtrail: {
    name: "AWS CloudTrail",
    nodeKey: "cloudtrail",
    icon: "/assets/03-core-services/15-aws-cloudtrail/AWS-CloudTrail.svg"
  },
  config: {
    name: "AWS Config",
    nodeKey: "config",
    icon: "/assets/03-core-services/16-aws-config/AWS-Config.svg"
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
    summary: "A small EV team has six months to launch. Buyers need to configure a vehicle, request finance, place an order and track delivery.\nThousands may use it at once. Configuration must stay fast, stock must stay current, and customer data must stay safe. The team wants less server work. Apex Mobility is our made-up name for this case.",
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
    summary: "Serverless means AWS manages the computers that run these services. Our team still writes code and sets access rules. One large application can be simpler at first; separate tasks take more setup.",
    points: [
      { statement: "1. Reduce server work", description: "Top: the team maintains the server software. Bottom: AWS runs the servers for the managed services." },
      { statement: "2. Change one task at a time", description: "Top: order, stock, and payment code change together. Bottom: update one task program without changing all three." },
      { statement: "3. Decide what happens after an error", description: "Top: an error can interrupt the shared process. Bottom: workflow rules can retry a failed task. Payment code must still prevent double charges." }
    ],
    graphContextTitle: "Read the comparison",
    graphContext: "Match points 1–3 to the graph. AWS adds capacity as work grows. Usage and configuration affect the bill. Bottom branches show calls, not parallel tasks. DynamoDB and SNS are hidden. EC2 can also run separate services.",
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
    summary: "Delivery and reporting need to know when an order is confirmed. They can react to a status-change event instead of a direct API request from the order service.",
    points: [
      { statement: "1. Keep the order workflow", description: "Step Functions still sets the order of the Lambda tasks." },
      { statement: "2. Publish what happened", description: "When the order status becomes confirmed, publish OrderConfirmed: a message about what happened. EventBridge routes it to interested services." },
      { statement: "3. Let each service react", description: "For example, OrderConfirmed starts delivery planning and updates sales reports. Each reacts separately; the workflow does not wait for their results." }
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
    act: "PART II: RUNNING A TASK",
    section: "SECTION 06",
    type: "Compute",
    title: "What Does Plan Delivery Do?",
    pills: ["Trigger", "Handler", "Task Output"],
    services: ["eventbridge", "lambda", "dynamodb"],
    summary: "Slide 5 chose the receiver. Now follow one event through a Lambda function: input → code → useful work.",
    points: [
      { statement: "1. Trigger: receive the event", description: "The delivery rule matches. EventBridge invokes Plan delivery with the OrderConfirmed event." },
      { statement: "2. Handler: run our business logic", description: "The handler is the code entry point. Using order ID EV-1042, it reads delivery details from DynamoDB." },
      { statement: "3. Output: request a delivery plan", description: "Our code asks the delivery system to start planning. A sent request is not a completed plan or delivery." }
    ],
    graphContextTitle: "Same pattern, another task",
    graphContext: "Course demo: S3 image upload → Lambda resizes the image → thumbnail saved in S3. The trigger and code change; the pattern stays.",
    metadata: "Source: Lambda module • EV task and handler are illustrative"
  },
  {
    "id": 7,
    "act": "PART II: RECEIVING REQUESTS",
    "section": "SECTION 07",
    "type": "API",
    "title": "How Does an Order Enter the App?",
    "pills": ["Receive", "Save as RECEIVED", "Check Progress"],
    "services": ["apigateway", "stepfunctions", "dynamodb"],
    "summary": "An API lets programs ask each other to do work. Follow the buyer’s request from the app’s front door to a stored order.",
    "points": [
      {
        "statement": "1. Receive the request",
        "description": "The buyer sends HTTPS POST /orders. API Gateway applies configured access checks and request limits."
      },
      {
        "statement": "2. Start the order workflow",
        "description": "A REST API route calls Step Functions StartExecution. The workflow runs asynchronously and returns a reference."
      },
      {
        "statement": "3. Save the received order",
        "description": "An early workflow task calls DynamoDB PutItem: orderId EV-1042, status RECEIVED. A successful write means stored."
      },
      {
        "statement": "4. Check progress separately",
        "description": "The initial reply does not prove storage. A separate status route reads progress. RECEIVED is not CONFIRMED: stock and payment checks remain."
      }
    ],
    "graphContextTitle": "Started → stored → confirmed",
    "graphContext": "RECEIVED is our example business status. Status reads, later tasks and error paths are hidden. Configure IAM, retries and duplicate protection.",
    "metadata": "Course: API Gateway • Example REST API + workflow + order record"
  },
  {
    "id": 8,
    "act": "PART II: CHOOSING COMPUTE",
    "section": "SECTION 08",
    "type": "Compute choices",
    "title": "Does Every Job Need Lambda?",
    "pills": [
      "Short Tasks",
      "Containers",
      "Server Control"
    ],
    "services": [
      "lambda",
      "ecs",
      "fargate",
      "ec2"
    ],
    "summary": "Our order tasks use Lambda. Other jobs may need a different way to run code. Choose for the job, not for a maturity level.",
    "points": [
      {
        "statement": "1. Lambda: respond to an event",
        "description": "For event-driven tasks such as Check order. Standard Lambda: up to 15 minutes per run; AWS manages servers and scaling. Pay per request and execution time."
      },
      {
        "statement": "2. Containers: package a program",
        "description": "Package code and dependencies for consistent environments or longer-running services. Amazon Elastic Container Service (Amazon ECS) manages tasks; AWS Fargate supplies serverless compute."
      },
      {
        "statement": "3. EC2: control the server",
        "description": "Choose the OS, custom software and server settings. With self-managed EC2, our team handles OS patching, capacity and scaling."
      }
    ],
    "graphContextTitle": "Choices, not an upgrade path",
    "graphContext": "Mix options by workload. ECS can use Fargate or EC2. Fargate is also serverless. Compare runtime, control and cost: running EC2 instances and Fargate tasks incur charges while idle.",
    "metadata": "Course: compute Tech Talk • No change to our EV workflow"
  },
  {
    "id": 9,
    "act": "PART II: HOLDING WORK",
    "section": "SECTION 09",
    "type": "Queues",
    "title": "What If Delivery Work Arrives Too Fast?",
    "pills": [
      "Amazon SQS",
      "Waiting Work",
      "Safe Retries"
    ],
    "services": [
      "eventbridge",
      "sqs",
      "lambda"
    ],
    "summary": "Slide 6 sent events straight to Plan delivery. If work arrives faster than it can run, add a queue: a place where messages wait.",
    "points": [
      {
        "statement": "1. Put the update in SQS",
        "description": "The delivery rule sends OrderConfirmed to an Amazon Simple Queue Service (Amazon SQS) queue. Waiting work buffers demand spikes."
      },
      {
        "statement": "2. Run the same delivery task",
        "description": "Lambda polls SQS through an event source mapping and runs Plan delivery. Messages are hidden during the visibility timeout; success removes them."
      },
      {
        "statement": "3. Plan for failed attempts",
        "description": "After the visibility timeout, failed messages can be read again. A redrive policy moves repeated failures to a dead-letter queue (DLQ). Alert the team and review."
      }
    ],
    "graphContextTitle": "One change to the delivery branch",
    "graphContext": "Standard queues can duplicate or reorder messages. Use the order ID to prevent duplicate work. FIFO adds ordering per message group and deduplication. Other branches and output are hidden.",
    "metadata": "EV example • Set retention, visibility timeout, consumer capacity and DLQ alerts"
  },
  {
    "id": 10,
    "act": "PART II: SHARING NOTIFICATIONS",
    "section": "SECTION 10",
    "type": "Notifications",
    "title": "How Can One Update Reach Many People?",
    "pills": [
      "Amazon SNS",
      "Push + Fan-out",
      "Independent Receivers"
    ],
    "services": [
      "stepfunctions",
      "sns",
      "sqs"
    ],
    "summary": "SQS holds waiting work. Amazon Simple Notification Service (Amazon SNS) shares updates with subscribers. Now expand the notification branch from slide 2.",
    "points": [
      {
        "statement": "1. Publish to a topic",
        "description": "A topic is a named message channel. The workflow publishes one order update; it does not contact each receiver."
      },
      {
        "statement": "2. Send a copy to each receiver",
        "description": "SNS pushes a copy to each matching subscription: fan-out. Filters select updates; an SQS subscriber can buffer work for its own consumer."
      },
      {
        "statement": "3. Handle delivery failures",
        "description": "Standard topics can duplicate or reorder messages. Make consumers safe to retry. Delivery retries depend on the protocol; configure a subscription DLQ for undelivered messages."
      }
    ],
    "graphContextTitle": "Different jobs, used together",
    "graphContext": "SNS shares updates; SQS buffers work; EventBridge routes events by rules. Dashed arrows = messages. The optional queue is a separate subscriber, not slide 9’s delivery queue.",
    "metadata": "Standard SNS topic • Sent ≠ read • Delivered messages cannot be recalled"
  },
  {
    "id": 11,
    "act": "PART III: CHECKING ACCESS",
    "section": "SECTION 11",
    "type": "Identity and security",
    "title": "Who May See This Order?",
    "pills": [
      "Sign In",
      "Check Permission",
      "Shared Responsibility"
    ],
    "services": [
      "cognito",
      "apigateway",
      "stepfunctions"
    ],
    "summary": "Notifications share updates. Access checks decide who may act on an order. AWS secures the managed infrastructure; our team protects code, data and access settings.",
    "points": [
      {
        "statement": "1. Prove who the buyer is",
        "description": "Authentication checks identity. A Cognito user pool signs the buyer in and issues tokens. The app sends an access token over HTTPS."
      },
      {
        "statement": "2. Check what they may do",
        "description": "Authorization checks permission. A REST API Cognito authorizer validates the token, including signature and expiry. Configure method scopes to check allowed actions."
      },
      {
        "statement": "3. Check the order owner too",
        "description": "Task code compares the verified buyer identity with the order owner before returning or changing data. Reject unauthorized access; never trust a buyer ID from the request body."
      }
    ],
    "graphContextTitle": "One layer of a wider security design",
    "graphContext": "This view protects the order entry path. WAF and rate limits add traffic protection. Task IAM, encryption and auditing follow on slides 12–15.",
    "metadata": "REST API + Cognito user pool • Signed token ≠ encrypted data"
  },
  {
    "id": 12,
    "act": "PART III: LIMITING TASK ACCESS",
    "section": "SECTION 12",
    "type": "Function permissions",
    "title": "What May Each Task Access?",
    "pills": [
      "AWS IAM",
      "One Task",
      "Only Needed Access"
    ],
    "services": [
      "eventbridge",
      "lambda",
      "dynamodb",
      "iam"
    ],
    "summary": "The buyer has an identity. Each task also needs its own permissions. Use Plan delivery from slide 6 to see the difference.",
    "points": [
      {
        "statement": "1. Limit who may start the task",
        "description": "For this direct trigger, the Lambda resource-based policy allows events.amazonaws.com to invoke this function. Restrict aws:SourceArn to the delivery rule."
      },
      {
        "statement": "2. Limit what the task may do",
        "description": "Lambda assumes an IAM execution role using temporary credentials. Allow dynamodb:GetItem on the Orders table for this lookup; give each task its own role."
      },
      {
        "statement": "3. Keep other powers separate",
        "description": "A read lookup needs no delete or payment access. Store secrets in Secrets Manager or Parameter Store SecureString; grant only the required access."
      }
    ],
    "graphContextTitle": "Permissions are separate from data flow",
    "graphContext": "Direct trigger from slide 6; slide 9 uses SQS. A VPC enables private connectivity, not IAM permission. Input validation, patching and retry-safe code remain our work; encryption and auditing follow.",
    "metadata": "Course: Lambda security • Read-only order lookup is an illustrative policy"
  },
  {
    "id": 13,
    "act": "PART III: PLANNING THE STEPS",
    "section": "SECTION 13",
    "type": "Workflow",
    "title": "What Happens When an Order Step Fails?",
    "pills": [
      "AWS Step Functions",
      "Task Results",
      "Error Paths"
    ],
    "services": [
      "stepfunctions",
      "lambda",
      "eventbridge"
    ],
    "summary": "Now expand the order workflow from slides 3–5. Step Functions follows a plan of steps and decisions. This plan is called a state machine.",
    "points": [
      {
        "statement": "1. Pass results to the next step",
        "description": "Check order, then Reserve stock, then Charge payment. Step Functions tracks the current step and its data."
      },
      {
        "statement": "2. Define what to do after failure",
        "description": "Retry selected errors or take another path. Repeating a payment must not charge the buyer twice."
      },
      {
        "statement": "3. Publish only after success",
        "description": "Our plan publishes OrderConfirmed after the required steps pass. Undoing earlier work needs explicit tasks."
      }
    ],
    "graphContextTitle": "Sequence belongs to the workflow",
    "graphContext": "Solid = workflow sequence. Orange = configured error paths. Dark dashed = event delivery after success. Some error paths, data access and notification steps are hidden.",
    "metadata": "Course: Step Functions • Error handling and recovery must be configured"
  },
  {
    "id": 14,
    "act": "PART III: PROTECTING DATA",
    "section": "SECTION 14",
    "type": "Data and audit",
    "title": "How Do We Protect and Review Order Data?",
    "pills": [
      "Amazon DynamoDB",
      "Encryption",
      "Audit Records"
    ],
    "services": [
      "dynamodb",
      "kms",
      "cloudtrail",
      "config"
    ],
    "summary": "The workflow needs saved order records. Data protection and a record of changes matter as much as the task code.",
    "points": [
      {
        "statement": "1. Store data for the questions we ask",
        "description": "DynamoDB keeps order details. An extra index gives another way to find orders, such as by status."
      },
      {
        "statement": "2. Protect data and its keys",
        "description": "Use encrypted connections and storage. Encryption makes data unreadable without the right key. Access rules still matter."
      },
      {
        "statement": "3. Review actions and settings",
        "description": "CloudTrail records AWS API activity. AWS Config checks recorded resource settings against chosen rules."
      }
    ],
    "graphContextTitle": "Data controls, not more order steps",
    "graphContext": "These panels show separate controls. DynamoDB encrypts stored data. AWS KMS manages keys. Audit collection, retention and Config rules need setup.",
    "metadata": "Course: data stores and auditing • No single-table design or latency guarantee required"
  },
  {
    "id": 15,
    "act": "PART IV: UNDERSTANDING THE APP",
    "section": "SECTION 15",
    "type": "Observability",
    "title": "How Do We Find a Slow or Failed Order?",
    "pills": [
      "Logs",
      "Metrics",
      "Traces"
    ],
    "services": [
      "lambda",
      "cloudwatch",
      "xray"
    ],
    "summary": "When an order is slow, which task needs attention? Observability means using recorded evidence to understand what the app is doing.",
    "points": [
      {
        "statement": "1. Logs: what happened?",
        "description": "Record task results and order IDs. CloudWatch Logs lets the team search those records."
      },
      {
        "statement": "2. Metrics: how often or how long?",
        "description": "CloudWatch tracks numbers such as errors, queue age and completed orders. Set alarms for problems."
      },
      {
        "statement": "3. Traces: where was time spent?",
        "description": "X-Ray joins recorded parts of a request. Trace details can show a slow call to a payment partner."
      }
    ],
    "graphContextTitle": "Evidence sits beside the order flow",
    "graphContext": "Blue lines carry monitoring data, not orders. Enable logging and tracing. Carry order IDs across messages. Do not log passwords or full payment data.",
    "metadata": "Course: CloudWatch and X-Ray • Evidence helps investigation; it is not an instant diagnosis"
  },
  {
    "id": 16,
    "act": "PART IV: TESTING THE DESIGN",
    "section": "SECTION 16",
    "type": "POC recap",
    "title": "Does This Design Meet the Startup Needs?",
    "pills": [
      "Same EV Example",
      "Proof of Concept",
      "Measure the Results"
    ],
    "services": [
      "apigateway",
      "stepfunctions",
      "dynamodb",
      "sns",
      "eventbridge",
      "sqs",
      "lambda"
    ],
    "summary": "Bring the pieces together. A proof of concept is a small working version used to test a design. A diagram alone does not prove readiness.",
    "points": [
      {
        "statement": "1. Test the buyer journey",
        "description": "Test configuration, finance, orders and status. Check that each buyer can access only their own orders."
      },
      {
        "statement": "2. Test busy and failed conditions",
        "description": "Simulate a launch spike, repeated messages and a failed payment. Check recovery and waiting work."
      },
      {
        "statement": "3. Measure before making claims",
        "description": "Measure configuration against the under-one-second goal. Track completed orders, errors, alerts and cost."
      }
    ],
    "graphContextTitle": "A proposed design, not a production result",
    "graphContext": "Solid = service calls. Dashed = events and messages. The same tasks sit inside the workflow. This is the order view; configuration, finance and status routes are hidden, along with security and monitoring.",
    "metadata": "Course: delivering the POC • Test results and production savings are not yet shown"
  },
  {
    "id": 17,
    "act": "PART IV: RECAP AND DISCUSSION",
    "section": "SECTION 17",
    "type": "CLOSING",
    "title": "Choose Services by the Job",
    "pills": [
      "Course Recap",
      "Design Questions",
      "Q&A"
    ],
    "services": [],
    "summary": "Start with the business need. Choose services for each job. Then test how they work together.",
    "points": [
      {
        "statement": "Start with the need",
        "description": "What must the buyer do? What must the small team operate?"
      },
      {
        "statement": "Separate tasks and share updates",
        "description": "Lambda runs code. Step Functions sets steps. Events share what happened."
      },
      {
        "statement": "Use the right message tool",
        "description": "SQS holds work. SNS shares notifications. EventBridge chooses event targets."
      },
      {
        "statement": "Protect each path and record",
        "description": "Check identity and permissions. Limit task access. Encrypt sensitive data."
      },
      {
        "statement": "Collect evidence and test",
        "description": "Use logs, metrics and traces. Test errors and repeated messages before launch."
      }
    ],
    "metadata": "Discussion: Which service holds work? Which service decides the order of steps?"
  },
];

// Source map for the teaching content after the opening. Paths are course notes,
// not evidence that our illustrative EV topology has been deployed.
export const SLIDE_SOURCES = {
  2: ['materi/01-studi-kasus-dan-requirements.md'],
  3: ['materi/02-serverless-dan-aplikasi-modern.md'],
  4: ['materi/03-event-driven-architecture-dan-eventbridge.md'],
  5: ['materi/03-event-driven-architecture-dan-eventbridge.md'],
  6: ['materi/04-aws-lambda.md'],
  7: ['materi/05-amazon-api-gateway.md'],
  8: ['materi/06-techtalk-ec2-vs-container-vs-serverless.md'],
  9: ['materi/07-amazon-sqs.md'],
  10: ['materi/08-amazon-sns.md'],
  11: ['materi/09-keamanan-serverless-dasar.md', 'materi/10-cognito-dan-keamanan-api-gateway.md'],
  12: ['materi/11-keamanan-lambda-data-dan-auditing.md'],
  13: ['materi/12-aws-step-functions.md'],
  14: ['materi/01-studi-kasus-dan-requirements.md', 'materi/11-keamanan-lambda-data-dan-auditing.md'],
  15: ['materi/14-observability-cloudwatch-xray.md'],
  16: ['materi/13-techtalk-desain-arsitektur-serverless.md', 'materi/15-poc-recap-dan-latihan-soal.md'],
  17: ['materi/15-poc-recap-dan-latihan-soal.md'],
};
