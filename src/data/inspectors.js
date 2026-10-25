// Plain-English explanations for the proposed EV design, scoped by slide and task.
export const SLIDE_2_INSPECTORS = {
  apigateway: {
    service: "Amazon API Gateway",
    role: "The front door where the website and mobile app send an order.",
    sections: [
      ["What comes in?", "The buyer presses Place order. The app sends the order details through a secure web connection, shown as HTTPS."],
      ["What happens here?", "API Gateway receives the request. It passes the order details to Step Functions to start the order process."],
      ["Why is it here?", "Both apps use one entry point. AWS runs this service, so the small team has less server work."],
      ["What happens next?", "Step Functions manages the order steps. Accepting the request does not mean the order is finished. The team still needs to check who can send requests and give the buyer a way to check progress."]
    ]
  },
  stepfunctions: {
    service: "AWS Step Functions",
    role: "Runs the planned steps needed to process an order. These steps form a workflow.",
    sections: [
      ["What starts it?", "API Gateway sends a new order and starts this workflow."],
      ["What happens here?", "The workflow can save order data in DynamoDB and send an update to SNS. The team chooses which step runs first and what to do if a step fails."],
      ["Why is it here?", "An order needs several steps. Keeping the plan in one place makes it easier to follow and handle errors."],
      ["Read the graph", "The two branches show service connections. They do not mean both actions happen at once. Saving the order, then sending its status, is one possible plan. A finance partner still decides whether to approve credit."]
    ]
  },
  dynamodb: {
    service: "Amazon DynamoDB",
    role: "A database: the place where this design saves order details and status.",
    sections: [
      ["What comes in?", "A Step Functions task sends order details to save, or an order ID to find a saved order."],
      ["What happens here?", "DynamoDB saves, finds, or updates the record. It sends the data or the operation result back to the workflow."],
      ["Why is it here?", "The app needs to remember orders and find them later. AWS runs the database servers."],
      ["What does it not do?", "It does not decide the next order step or send an SNS update in this drawing. The team still sets access rules and prevents two orders from reserving the same stock."]
    ]
  },
  sns: {
    service: "Amazon Simple Notification Service (Amazon SNS)",
    role: "Shares an order update with receivers that have signed up for it.",
    sections: [
      ["What comes in?", "A Step Functions task sends an order update, such as a change in order status."],
      ["What happens here?", "SNS sends a copy to each receiver set up for that message channel. In SNS, the channel is called a topic. The receivers are not drawn here."],
      ["Why is it here?", "The workflow sends one update to SNS instead of contacting every receiver itself."],
      ["What does it not do?", "SNS does not store order history or track the vehicle. Sending an update does not mean the buyer has read it. The team must choose the receivers and handle missed or repeated messages."]
    ]
  }
};

// These are the same three tasks on slides 3 and 4, not three copies of one function.
const ORDER_TASK_INSPECTORS = {
  'check-order': {
    service: "AWS Lambda — Check order",
    role: "Check order: a small program that checks the buyer's order details.",
    sections: [
      ["What starts this Lambda?", "Step Functions calls this function with the order details. Lambda is the AWS service that runs the program's code."],
      ["What does it do?", "It checks the details the team requires, such as the chosen vehicle and buyer information. These checks are examples for this proposed design."],
      ["Where does the result go?", "It returns a pass or a problem to Step Functions. In a simple plan, a valid order can move on to Reserve stock. An invalid order needs correction."],
      ["Why is it here?", "Check the order before reserving a vehicle or taking payment. The team can change these checks without releasing the other task programs."],
      ["What is its limit?", "It does not reserve stock or charge the buyer. Step Functions decides the next step. The solid branches show calls, not three tasks running at once."]
    ]
  },
  'reserve-stock': {
    service: "AWS Lambda — Reserve stock",
    role: "Reserve stock: a small program that tries to hold a vehicle for this order.",
    sections: [
      ["What starts this Lambda?", "Step Functions calls this function with the order ID and chosen vehicle. In our example plan, it runs after Check order passes."],
      ["What does it do?", "Its code asks the stock system to reserve the vehicle. That system and its storage are not drawn here."],
      ["Where does the result go?", "It returns a reservation result to Step Functions. If stock is available, the plan can continue to Charge payment. If not, the workflow handles that result."],
      ["Why is it here?", "Find out whether the vehicle can be reserved before requesting payment. Keeping this task separate lets the team change stock rules on their own."],
      ["What is its limit?", "It does not take payment or arrange delivery. Its code must stop two buyers from reserving the same stock. Repeating a failed call must not create a second reservation."]
    ]
  },
  'charge-payment': {
    service: "AWS Lambda — Charge payment",
    role: "Charge payment: a small program that asks the payment provider to charge the buyer.",
    sections: [
      ["What starts this Lambda?", "Step Functions calls it with the order and a payment reference. In our example plan, it runs after Reserve stock succeeds."],
      ["What does it do?", "Its code sends a payment request to a payment provider. The provider processes the charge. That outside service is not drawn here."],
      ["Where does the result go?", "It returns the payment result to Step Functions. The workflow decides whether to continue, handle a failure, or check an uncertain result."],
      ["Why is it here?", "Payment has its own rules and outside connection. A separate function lets the team change that code without changing the order checks or stock code."],
      ["What is its limit?", "Calling Lambda does not mean payment succeeded. If a reply is lost, the code must check the payment before trying again. It must not charge twice. Releasing reserved stock after failure also needs a plan."]
    ]
  }
};

export const SLIDE_3_INSPECTORS = {
  ec2: {
    service: "Amazon Elastic Compute Cloud (Amazon EC2)",
    role: "A rented computer in AWS running one application in the top example.",
    sections: [
      ["What comes in?", "The customer sends an order request to the application on this server."],
      ["What happens here?", "One application checks the order, reserves stock, and requests payment. It reads and saves its data in Amazon RDS. The replies are not drawn."],
      ["Why is it in this comparison?", "One application can be simple to build at first. Its tasks are released together. AWS runs the physical computer; the team updates the server software and application."],
      ["Keep in mind", "EC2 can also run separate services. One application is our example, not a rule about EC2. The team still plans capacity and recovery after failures."]
    ]
  },
  rds: {
    service: "Amazon Relational Database Service (Amazon RDS)",
    role: "The top application's database. It keeps related records in tables.",
    sections: [
      ["What comes in?", "The application asks to save or find data, such as a buyer and their order."],
      ["What happens here?", "RDS stores the records and returns data or the result of saving it. AWS handles many database server tasks."],
      ["Why is it here?", "It gives the one-application example a place to keep its data. Tables can work well when records need to be linked."],
      ["Keep in mind", "RDS is an example for this comparison, not a requirement of the EV case. The team still chooses access rules, backups, and how data is organized. Lambda can also work with a relational database."]
    ]
  },
  apigateway: {
    service: "Amazon API Gateway",
    role: "The same front door for order requests shown in slide 2.",
    sections: [
      ["What comes in?", "The customer app sends order details through a secure web connection, shown as HTTPS."],
      ["What happens next?", "API Gateway starts Step Functions with those details. The workflow then calls the separate Lambda tasks."],
      ["Why is it still here?", "We split the work behind the front door. The customer still needs a place to send an order. AWS runs the entry service; the team sets its access and request rules."],
      ["Keep in mind", "An accepted request is not a finished order. A way to check order progress is still needed. Login and response arrows are left out of this drawing."]
    ]
  },
  stepfunctions: {
    service: "AWS Step Functions",
    role: "The same order coordinator from slide 2. Here we show the three task programs it calls.",
    sections: [
      ["What starts it?", "API Gateway sends the order details and starts the planned steps, called a workflow."],
      ["What does it do?", "One example plan is Check order, then Reserve stock, then Charge payment. Each Lambda returns a result. Step Functions uses that result to choose the next step."],
      ["Why is it here?", "Separate task programs still need a shared plan. The team defines the order and what to do after an error, such as trying a task again."],
      ["Read the graph", "The branches show which tasks it calls. They do not mean the tasks start together. DynamoDB and SNS from slide 2 are hidden for focus. Handling failed payments and undoing a stock reservation still need rules."]
    ]
  },
  ...ORDER_TASK_INSPECTORS,
};

export const SLIDE_4_INSPECTORS = {
  apigateway: {
    service: "Amazon API Gateway",
    role: "The same front door for orders from slides 2 and 3.",
    sections: [
      ["What comes in?", "The customer app sends an order through a secure web connection, shown as HTTPS."],
      ["What happens next?", "API Gateway passes the order details to Step Functions. Step Functions starts the order workflow."],
      ["Why is it still here?", "Events share news inside the system. The customer still needs this front door to place an order."],
      ["What is its limit?", "It receives requests; it does not do the order tasks. Accepting the request does not mean payment or delivery is complete. Replies and progress checks are not drawn."]
    ]
  },
  stepfunctions: {
    service: "AWS Step Functions",
    role: "Keeps the order steps in the planned order. It now also sends an update after they succeed.",
    sections: [
      ["What starts it?", "API Gateway starts the workflow with the order details. The same three Lambda tasks check the order, reserve stock, and request payment."],
      ["What is new here?", "After the required tasks succeed, a configured step sends OrderConfirmed to EventBridge. This event means the order was confirmed. It includes an order ID and status."],
      ["Why use both services?", "Step Functions manages the order steps. EventBridge passes the news to other services. Delivery planning and sales reports are separate reactions, outside this workflow."],
      ["What does it wait for?", "It waits for the result of sending the event. It does not wait for delivery planning or the sales report to finish. Reply arrows are not drawn."],
      ["What still needs care?", "The team must handle failed publishing and make sure a saved order gets its event. DynamoDB and SNS remain in the wider design. Publishing after success is our example choice."]
    ]
  },
  eventbridge: {
    service: "Amazon EventBridge",
    role: "Receives news about an order and sends it to the services that need it.",
    sections: [
      ["What comes in?", "Step Functions sends OrderConfirmed, with the order ID and status. An event is a message about something that happened."],
      ["What happens here?", "The message enters an event bus: a shared channel for events. Rules check which messages each service needs. Here, matching rules send the event to two Lambda functions."],
      ["Why is it here?", "The order workflow sends the news once. It does not need to call every receiver. We can add another receiver without changing the workflow if the event has the data it needs."],
      ["Read the dashed lines", "One copy goes to Plan delivery. Another goes to Update sales report. They need not start in a fixed order or at the same time. Their results do not go straight back to the order workflow."],
      ["What is its limit?", "EventBridge passes messages; Lambda runs the task code. It does not replace the order database or SNS notifications. The team must handle failed delivery and repeated events."]
    ]
  },
  ...ORDER_TASK_INSPECTORS,
  'plan-delivery': {
    service: "AWS Lambda — Plan delivery",
    role: "Plan delivery: a small program that starts delivery planning for a confirmed order.",
    sections: [
      ["What starts this Lambda?", "EventBridge receives OrderConfirmed. A rule matches that event and calls this function with its order ID and status."],
      ["What does it do?", "Its code uses the order ID to get any other details it needs. It asks a delivery system to start planning. That system is not drawn here."],
      ["Where does the result go?", "The planning request goes to the delivery system. It is not a reply to the order workflow. The sales report can update separately."],
      ["Why is it here?", "It shows a new reaction to a confirmed order. Planning can change without changing the order tasks. It does not replace Reserve stock or Charge payment."],
      ["What is its limit?", "Starting planning does not mean the vehicle was delivered. The code must handle errors and avoid creating two planning requests if the same event arrives again. This task is illustrative."]
    ]
  },
  'update-sales-report': {
    service: "AWS Lambda — Update sales report",
    role: "Update sales report: a small program that adds a confirmed order to a report.",
    sections: [
      ["What starts this Lambda?", "EventBridge receives the same OrderConfirmed event. A matching rule calls this function with the order ID and status."],
      ["What does it do?", "Its code updates the sales report for the confirmed order. The place where that report is saved is not drawn here."],
      ["Where does the result go?", "The report is updated for the business to read later. No report is sent back to the order workflow. This function does not wait for delivery planning."],
      ["Why is it here?", "It shows that the same news can serve another purpose. Reporting can change without changing how orders or delivery planning work."],
      ["What is its limit?", "The report may update later than the order. The code must handle errors and avoid counting one order twice if an event repeats. The report is not the order database. This task is illustrative."]
    ]
  }
};

// Stable task and rule identities: never infer a responsibility from node position.
export const SLIDE_5_INSPECTORS = {
  stepfunctions: {
    service: "AWS Step Functions",
    role: "The same order workflow from slides 2–4. It still sets the task order.",
    sections: [
      ["What starts it?", "API Gateway starts it with the customer's order. That front door is hidden here."],
      ["What does it do?", "Lambda tasks check the order, reserve stock, and request payment. After the required steps succeed, a configured step sends OrderConfirmed to EventBridge."],
      ["What goes out?", "The event includes the order ID and status. Here we also show its source, apex.orders. That means our order application."],
      ["Why keep it?", "The order still needs managed steps and error handling. EventBridge chooses receivers; it does not take over those steps."],
      ["What is its limit?", "It waits for the result of sending the event, not for the delivery plan or report. Failed publishing and repeated events still need handling. Task order and event fields are example choices."]
    ]
  },
  eventbridge: {
    service: "Amazon EventBridge",
    role: "The same event service from slide 4. We now show its rules separately.",
    sections: [
      ["What comes in?", "Step Functions sends OrderConfirmed after the required order tasks succeed. The event carries order ID EV-1042 and status confirmed."],
      ["What does it do?", "An event bus is a channel that receives events. The two rules belong to this same bus. Each rule checks event fields and sends a copy to its target when they match."],
      ["Where does it send this event?", "Both rules match. Plan delivery gets one copy; Update sales report gets another. These Lambda tasks are outside the main order workflow, with no fixed order between them."],
      ["Why is it here?", "The workflow shares one update without calling every receiver. A new receiver can use that event without changing the workflow if the message has the data it needs."],
      ["What is its limit?", "It checks fields and delivers events; it does not run the delivery or report code. It does not replace DynamoDB or SNS. The team sets target permissions and handles failed delivery and repeated events."]
    ]
  },
  'order-event': {
    service: "OrderConfirmed — the event",
    role: "A message about a confirmed order. This card shows data, not another AWS service.",
    sections: [
      ["What creates it?", "A configured step in Step Functions sends it after the required order tasks succeed."],
      ["What data does it carry?", "Source apex.orders names our order application. Type OrderConfirmed names what happened. The order ID is EV-1042 and the status is confirmed. Type is a short display label for EventBridge's detail type; the order ID and status are in its details."],
      ["Where does it go?", "It enters the EventBridge bus. The delivery rule checks its type and status. The sales report rule checks its type. Both match, so each target receives a copy."],
      ["Why use this message?", "Each receiver learns what happened without asking the order workflow to do its work. An order ID lets a task find other details it needs."],
      ["What is its limit?", "Confirmed does not mean delivered. This is a readable field summary, not the full event format. The event name, source, order ID, status, and rules are illustrative, not a course blueprint."]
    ]
  },
  'delivery-rule': {
    service: "EventBridge rule — Delivery",
    role: "A test on event data inside EventBridge. It is not a separate service or a workflow step.",
    sections: [
      ["What starts the check?", "An event arrives on this rule's bus. It reads the event type and the status in its details."],
      ["Why does this event match?", "This rule needs type OrderConfirmed AND status confirmed. The event shown has both values."],
      ["Where does the result go?", "On a match, EventBridge sends the event to the Lambda task Plan delivery. A different type or status would not be sent to that target by this rule."],
      ["Why is it here?", "Delivery planning only needs the order news we chose. The rule keeps this choice outside the main order workflow."],
      ["What is its limit?", "Matching does not reserve a delivery slot or run payment again. Lambda does the task. The team chooses these conditions and grants permission to call the target. This rule is illustrative."]
    ]
  },
  'report-rule': {
    service: "EventBridge rule — Sales report",
    role: "A second, independent test on the same event bus.",
    sections: [
      ["What starts the check?", "An event arrives on the same bus. This rule reads its type."],
      ["Why does this event match?", "It needs type OrderConfirmed. The event shown has that type. This rule does not check status; the delivery rule does."],
      ["Where does the result go?", "On a match, EventBridge sends the event to the Lambda task Update sales report. A different event type would not reach that target through this rule."],
      ["Why a separate rule?", "Reporting can choose the news it needs separately from delivery planning. Both rules can match one message; the first match does not stop the next check."],
      ["What is its limit?", "The rule selects messages; it does not calculate or save report totals. It is outside the order workflow and sets no order between the two tasks. These conditions are an example choice."]
    ]
  },
  'plan-delivery': {
    service: "AWS Lambda — Plan delivery",
    role: "The same delivery task from slide 4. Lambda runs this small program when called.",
    sections: [
      ["What starts it?", "EventBridge calls it when the delivery rule matches type OrderConfirmed and status confirmed. It receives the event, including order ID EV-1042."],
      ["What does it do?", "It uses the order ID to find any other details it needs, then asks a delivery system to start planning. That system is hidden here."],
      ["Where does its work go?", "The planning request goes to the delivery system. It is not a result sent back to the main order workflow. The sales report task can run separately."],
      ["Why is it separate?", "Delivery planning can change without changing the order tasks. This reaction starts after confirmation; it does not replace Reserve stock or Charge payment."],
      ["What is its limit?", "Starting a plan does not mean the vehicle was delivered. Its code must handle errors and avoid duplicate planning requests if the event repeats. This task is illustrative."]
    ]
  },
  'update-sales-report': {
    service: "AWS Lambda — Update sales report",
    role: "The same reporting task from slide 4. It adds a confirmed order to a sales report.",
    sections: [
      ["What starts it?", "EventBridge calls it when the sales report rule matches type OrderConfirmed. It receives the same event, including order ID EV-1042 and status confirmed."],
      ["What does it do?", "It uses the order ID to update the sales report. The place where that report is saved is hidden here."],
      ["Where does its work go?", "The updated report is available for the business to read later. No report is returned to the main order workflow. It does not wait for delivery planning."],
      ["Why is it separate?", "The same news can help another team. Reporting can change without changing how orders or delivery planning work."],
      ["What is its limit?", "The report may update later than the order. Its code must handle errors and avoid counting an order twice if the event repeats. The report does not replace the order database. This task is illustrative."]
    ]
  }
};

export const INSPECTOR_DATA = {
  "eventbridge": {
    service: "Amazon EventBridge",
    category: "Integration & Messaging",
    sla: "99.99% Availability",
    role: "Central nervous system routing events based on declarative JSON content filtering rules.",
    codeType: "json",
    title: "Event Payload Schema: OrderPlaced (v1.0)",
    code: JSON.stringify({
      "version": "0",
      "id": "e6789a1b-2c3d-4e5f-a6b7-8c9d0e1f2a3b",
      "detail-type": "OrderPlaced",
      "source": "ev.order.service",
      "account": "123456789012",
      "time": "2026-10-25T17:00:00Z",
      "region": "ap-southeast-1",
      "resources": [],
      "detail": {
        "orderId": "ORD-2026-EV-9901",
        "customer": {
          "id": "CUST-8812",
          "tier": "PRIORITY_PREORDER",
          "email": "rayin@futureguide.id"
        },
        "vehicle": {
          "model": "Apex-GT",
          "trim": "Dual-Motor AWD",
          "batteryPackKWh": 95,
          "colorHex": "#0f172a",
          "autopilotTier": "LEVEL_3"
        },
        "payment": {
          "status": "AUTHORIZED",
          "downPaymentAmount": 150000000,
          "currency": "IDR",
          "reference": "TXN-BCA-992144"
        }
      }
    }, null, 2)
  },

  "lambda": {
    service: "AWS Lambda",
    category: "Serverless Compute",
    sla: "99.95% Availability",
    role: "Stateless event execution in sub-millisecond Firecracker MicroVM sandbox with 1ms billing granularity.",
    codeType: "javascript",
    title: "Node.js 20.x ESM Order Processor Handler",
    code: `import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'ap-southeast-1' }));

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const { orderId, vehicle, customer } = event.detail;

  // 1. Idempotent Write to DynamoDB
  const timestamp = new Date().toISOString();
  await docClient.send(new PutCommand({
    TableName: process.env.ORDERS_TABLE,
    Item: {
      PK: \`ORDER#\${orderId}\`,
      SK: 'METADATA',
      customerId: customer.id,
      model: vehicle.model,
      trim: vehicle.trim,
      status: 'ALLOCATING_VIN',
      createdAt: timestamp
    },
    ConditionExpression: 'attribute_not_exists(PK)'
  }));

  return {
    statusCode: 200,
    body: { orderId, status: 'PROCESSED', allocatedRegion: 'ap-southeast-1a' }
  };
};`
  },

  "apigateway": {
    service: "Amazon API Gateway",
    category: "Front-Door Ingress",
    sla: "99.95% Availability",
    role: "Traffic throttling (Token Bucket algorithm), OpenAPI schema validation, and direct AWS service integration.",
    codeType: "json",
    title: "Throttling & Direct SQS Proxy Config",
    code: JSON.stringify({
      "ThrottlingSettings": {
        "RateLimit": 10000,
        "BurstLimit": 20000,
        "Algorithm": "Token Bucket",
        "HeaderKey": "x-api-key"
      },
      "RequestValidation": {
        "ValidateRequestBody": true,
        "ValidateRequestParameters": true,
        "SchemaModel": "EVOrderInputModel.json"
      },
      "DirectIntegration": {
        "Type": "AWS_PROXY",
        "TargetService": "arn:aws:sqs:ap-southeast-1:123456789012:ev-order-ingress.fifo",
        "IAMRole": "arn:aws:iam::123456789012:role/ApiGwDirectSqsRole",
        "ZeroComputeOverhead": true
      }
    }, null, 2)
  },

  "stepfunctions": {
    service: "AWS Step Functions",
    category: "Workflow Orchestration",
    sla: "99.99% Availability",
    role: "Distributed Saga coordinator executing multi-stage transactions with automatic compensating rollbacks.",
    codeType: "json",
    title: "Amazon States Language (ASL) Saga Workflow",
    code: JSON.stringify({
      "Comment": "EV Purchase Saga Orchestrator with Compensating Rollbacks",
      "StartAt": "AuthorizeCredit",
      "States": {
        "AuthorizeCredit": {
          "Type": "Task",
          "Resource": "arn:aws:states:::lambda:invoke",
          "Parameters": { "FunctionName": "creditCheckService" },
          "Catch": [{
            "ErrorEquals": ["CreditDeniedException"],
            "Next": "NotifyCustomerFailure"
          }],
          "Next": "ChargeDownPayment"
        },
        "ChargeDownPayment": {
          "Type": "Task",
          "Resource": "arn:aws:states:::lambda:invoke",
          "Parameters": { "FunctionName": "paymentGatewayService" },
          "Catch": [{
            "ErrorEquals": ["PaymentFailedException"],
            "Next": "RollbackCreditAuthorization"
          }],
          "Next": "AllocateVIN"
        },
        "RollbackCreditAuthorization": {
          "Type": "Task",
          "Resource": "arn:aws:states:::lambda:invoke",
          "Parameters": { "FunctionName": "creditCheckService:rollback" },
          "Next": "NotifyCustomerFailure"
        },
        "AllocateVIN": {
          "Type": "Task",
          "Resource": "arn:aws:states:::lambda:invoke",
          "Parameters": { "FunctionName": "factoryVinService" },
          "End": true
        },
        "NotifyCustomerFailure": {
          "Type": "Task",
          "Resource": "arn:aws:states:::sns:publish",
          "Parameters": { "TopicArn": "arn:aws:sns:ap-southeast-1:123456789012:order-failed" },
          "End": true
        }
      }
    }, null, 2)
  },

  "dynamodb": {
    service: "Amazon DynamoDB",
    category: "NoSQL Persistence",
    sla: "99.999% Availability (Global Tables)",
    role: "Single-table design supporting millions of transactions with predictable single-digit millisecond latency.",
    codeType: "json",
    title: "Single-Table Partitioning & GSI Definition",
    code: JSON.stringify({
      "TableName": "EV_Core_Production",
      "BillingMode": "PAY_PER_REQUEST",
      "KeySchema": [
        { "AttributeName": "PK", "KeyType": "HASH" },
        { "AttributeName": "SK", "KeyType": "RANGE" }
      ],
      "SampleItems": [
        {
          "PK": "ORDER#ORD-2026-EV-9901",
          "SK": "METADATA",
          "customerId": "CUST-8812",
          "vin": "MH1EV2026APEX00991",
          "status": "PAID_CONFIRMED",
          "totalAmount": 850000000,
          "GSI1_PK": "CUSTOMER#CUST-8812",
          "GSI1_SK": "ORDER#2026-10-25"
        },
        {
          "PK": "ORDER#ORD-2026-EV-9901",
          "SK": "ITEM#BATTERY_95KWH",
          "serial": "BAT-95KWH-2026-881A",
          "warrantyMonths": 96
        }
      ],
      "StreamSpecification": {
        "StreamEnabled": true,
        "StreamViewType": "NEW_AND_OLD_IMAGES"
      }
    }, null, 2)
  },

  "cognito": {
    service: "Amazon Cognito & AWS WAF",
    category: "Identity & Perimeter Security",
    sla: "99.9% Availability",
    role: "Zero-Trust front door: WAF Layer 7 inspection + Cognito JWT OIDC Authorizer stopping 401 unauthenticated requests.",
    codeType: "json",
    title: "Decoded JWT Token Claims & WAF Ruleset",
    code: JSON.stringify({
      "WAF_Perimeter": {
        "WebACL": "EV-Public-Shield-WAF",
        "Action": "BLOCK_SQLi_AND_XSS",
        "RateBasedRule": { "Limit": 2000, "WindowSec": 300 }
      },
      "Cognito_JWT_Claims": {
        "sub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        "iss": "https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_xyz123",
        "cognito:groups": ["Verified_EV_Buyers"],
        "token_use": "id",
        "auth_time": 1792921800,
        "email": "customer@futureguide.id",
        "email_verified": true,
        "exp": 1792925400
      }
    }, null, 2)
  },

  "sqs": {
    service: "Amazon SQS (FIFO & Standard)",
    category: "Message Buffering",
    sla: "99.9% Availability",
    role: "Shock absorber & load leveling queue decoupling spiky client requests with zero data loss guarantee.",
    codeType: "json",
    title: "SQS Dead-Letter Queue (DLQ) Redrive Policy",
    code: JSON.stringify({
      "QueueName": "ev-orders-processing.fifo",
      "Attributes": {
        "FifoQueue": "true",
        "ContentBasedDeduplication": "true",
        "VisibilityTimeout": "300",
        "MessageRetentionPeriod": "1209600",
        "RedrivePolicy": JSON.stringify({
          "deadLetterTargetArn": "arn:aws:sqs:ap-southeast-1:123456789012:ev-orders-dlq.fifo",
          "maxReceiveCount": 3
        })
      }
    }, null, 2)
  },

  "sns": {
    service: "Amazon SNS",
    category: "Pub/Sub Messaging",
    sla: "99.9% Availability",
    role: "High-throughput Pub/Sub topic fan-out broadcasting event messages to multiple parallel subscribers simultaneously.",
    codeType: "json",
    title: "SNS Fan-Out Subscription Filter Policy",
    code: JSON.stringify({
      "TopicArn": "arn:aws:sns:ap-southeast-1:123456789012:ev-order-events.fifo",
      "SubscriptionFilterPolicy": {
        "eventType": ["OrderPlaced", "OrderUpdated"],
        "customerTier": ["PRIORITY_PREORDER", "VIP"],
        "totalAmount": [{ "numeric": [">=", 100000000] }]
      },
      "DeliveryPolicy": {
        "healthyRetryPolicy": {
          "numRetries": 5,
          "backoffFunction": "exponential"
        }
      }
    }, null, 2)
  },

  "waf": {
    service: "AWS WAF (Web Application Firewall)",
    category: "Security & Edge Filtering",
    sla: "99.95% Availability",
    role: "Edge traffic inspection blocking SQL injection, cross-site scripting, bot scanners, and Layer 7 DDoS attacks.",
    codeType: "json",
    title: "AWS WAF Core Rule Set & Rate Limit",
    code: JSON.stringify({
      "Rules": [
        {
          "Name": "AWSManagedRulesCommonRuleSet",
          "Priority": 1,
          "Action": { "Block": {} }
        },
        {
          "Name": "AWSManagedRulesKnownBadInputsRuleSet",
          "Priority": 2,
          "Action": { "Block": {} }
        },
        {
          "Name": "PerIPRateLimitRule",
          "Priority": 3,
          "Statement": {
            "RateBasedStatement": {
              "Limit": 2000,
              "AggregateKeyType": "IP"
            }
          },
          "Action": { "Block": {} }
        }
      ]
    }, null, 2)
  },

  "kms": {
    service: "AWS Key Management Service (KMS)",
    category: "Security & Encryption",
    sla: "99.999% Availability",
    role: "Hardware Security Module (FIPS 140-2 Level 3) managing customer envelope encryption keys for DynamoDB and S3.",
    codeType: "json",
    title: "KMS Customer Managed Key (CMK) Policy",
    code: JSON.stringify({
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "AllowLambdaToDecryptOrderSecrets",
          "Effect": "Allow",
          "Principal": {
            "AWS": "arn:aws:iam::123456789012:role/EVOrderWorkerRole"
          },
          "Action": [
            "kms:Decrypt",
            "kms:GenerateDataKey"
          ],
          "Resource": "*",
          "Condition": {
            "StringEquals": {
              "kms:EncryptionContext:Service": "EV-Orders-Core"
            }
          }
        }
      ]
    }, null, 2)
  },

  "privatelink": {
    service: "AWS PrivateLink & VPC Endpoints",
    category: "Network Isolation",
    sla: "99.99% Availability",
    role: "Direct ENI connections to AWS services inside private subnets without traversing the public internet.",
    codeType: "json",
    title: "VPC Interface Endpoint Configuration",
    code: JSON.stringify({
      "VpcEndpointType": "Interface",
      "ServiceName": "com.amazonaws.ap-southeast-1.dynamodb",
      "PrivateDnsEnabled": true,
      "SubnetIds": ["subnet-01privateA", "subnet-02privateB"],
      "SecurityGroupIds": ["sg-0a8b9c1d2e3f"],
      "PolicyDocument": {
        "Statement": [{
          "Effect": "Allow",
          "Principal": "*",
          "Action": "dynamodb:*",
          "Resource": "arn:aws:dynamodb:ap-southeast-1:123456789012:table/EV_Core_Production"
        }]
      }
    }, null, 2)
  },

  "xray": {
    service: "AWS X-Ray",
    category: "Observability & Tracing",
    sla: "99.9% Availability",
    role: "Distributed trace propagation assigning unique Trace IDs across every API, microservice, and external bank call.",
    codeType: "json",
    title: "X-Ray Trace Segment & Latency Breakdown",
    code: JSON.stringify({
      "trace_id": "1-69fd1234-9ab8c7d6e5f4a3b2c1d0e9f8",
      "duration_ms": 894,
      "segments": [
        { "name": "API Gateway Ingress", "duration_ms": 18, "status": "200 OK" },
        { "name": "Cognito JWT Validation", "duration_ms": 12, "status": "AUTHORIZED" },
        { "name": "AWS Lambda Order Worker", "duration_ms": 32, "status": "SUCCESS" },
        { "name": "DynamoDB PutItem", "duration_ms": 12, "status": "SUCCESS" },
        { "name": "External Bank Leasing Partner API", "duration_ms": 820, "status": "BOTTLENECK_DETECTED" }
      ]
    }, null, 2)
  },

  "cloudwatch": {
    service: "Amazon CloudWatch & EMF",
    category: "Telemetry & Alarms",
    sla: "99.9% Availability",
    role: "Embedded Metric Format (EMF) logs, real-time dashboard widgets, and anomaly detection alarms.",
    codeType: "json",
    title: "CloudWatch Embedded Metric Format (EMF)",
    code: JSON.stringify({
      "_aws": {
        "Timestamp": 1792921800000,
        "CloudWatchMetrics": [{
          "Namespace": "EV/OrderProcessing",
          "Dimensions": [["Environment", "Operation"]],
          "Metrics": [
            { "Name": "OrderProcessingDuration", "Unit": "Milliseconds" },
            { "Name": "SuccessfulOrders", "Unit": "Count" }
          ]
        }]
      },
      "Environment": "Production",
      "Operation": "AllocateVIN",
      "OrderProcessingDuration": 34.5,
      "SuccessfulOrders": 1
    }, null, 2)
  },

  "sam": {
    service: "AWS SAM (Serverless Application Model)",
    category: "DevOps & Infrastructure as Code",
    sla: "99.95% Availability (CloudFormation Engine)",
    role: "Declarative serverless IaC specification transpiled into AWS CloudFormation change sets.",
    codeType: "yaml",
    title: "AWS SAM template.yaml Definition",
    code: `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Production Serverless EV Order Infrastructure

Globals:
  Function:
    Timeout: 10
    MemorySize: 512
    Runtime: nodejs20.x
    Architectures: [arm64]

Resources:
  OrderPlacedFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/handlers/orderPlaced/
      Handler: index.handler
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref EVOrdersTable
      Events:
        EventBridgeRule:
          Type: EventBridgeRule
          Properties:
            Pattern:
              source: ['ev.order.service']
              detail-type: ['OrderPlaced']`
  },

  "fargate": {
    service: "AWS Fargate",
    category: "Serverless Container Compute",
    sla: "99.99% Availability",
    role: "Serverless container compute engine without managing EC2 instances, ideal for heavy batch and long tasks.",
    codeType: "json",
    title: "ECS Task Definition with Fargate Launch Type",
    code: JSON.stringify({
      "family": "ev-3d-car-rendering-engine",
      "requiresCompatibilities": ["FARGATE"],
      "networkMode": "awsvpc",
      "cpu": "2048",
      "memory": "8192",
      "containerDefinitions": [{
        "name": "blender-renderer",
        "image": "123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/blender-cycles:v3",
        "essential": true,
        "logConfiguration": {
          "logDriver": "awslogs",
          "options": {
            "awslogs-group": "/ecs/ev-rendering-job",
            "awslogs-region": "ap-southeast-1"
          }
        }
      }]
    }, null, 2)
  },

  "ec2": {
    service: "Amazon EC2 (Monolith Legacy)",
    category: "Virtual Server IaaS",
    sla: "99.99% Availability",
    role: "Virtual machine requiring OS patching, manual auto-scaling, and idle pay, vulnerable to SPOF during flash sales.",
    codeType: "json",
    title: "Legacy EC2 Incident Post-Mortem Analysis",
    code: JSON.stringify({
      "IncidentReport": "INC-2026-FLASH-SALE-CRASH",
      "RootCause": "Monolithic Application Server CPU Starvation",
      "MetricsAtCrash": {
        "EC2_Instance_Type": "c6i.4xlarge (16 vCPU, 32 GB RAM)",
        "CPUUtilization": "99.8%",
        "PostgresConnectionPoolExhausted": true,
        "ActiveThreadCount": 1024,
        "QueuedHttpRequests": 14500,
        "DowntimeMinutes": 48,
        "LostRevenueEstimate": "IDR 4.2 Billion"
      },
      "Recommendation": "Decompose monolith into Event-Driven Serverless architecture"
    }, null, 2)
  },

  "cloudfront": {
    service: "Amazon CloudFront & S3",
    category: "Global Content Delivery",
    sla: "99.9% Availability",
    role: "Global CDN caching frontend SPA at edge locations with sub-10ms response times and DDoS shielding.",
    codeType: "json",
    title: "CloudFront Distribution Cache Behavior",
    code: JSON.stringify({
      "DistributionConfig": {
        "Origins": [{
          "Id": "S3-ev-web-spa-origin",
          "DomainName": "ev-web-spa.s3.ap-southeast-1.amazonaws.com",
          "OriginAccessControlId": "E2XYZ1234ABCD"
        }],
        "DefaultCacheBehavior": {
          "TargetOriginId": "S3-ev-web-spa-origin",
          "ViewerProtocolPolicy": "redirect-to-https",
          "AllowedMethods": ["GET", "HEAD", "OPTIONS"],
          "Compress": true,
          "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6"
        }
      }
    }, null, 2)
  },

  "grand-topology": {
    service: "Production Architecture Topology",
    category: "All Systems Operational",
    sla: "99.99% End-to-End Enterprise SLA",
    role: "Complete production-grade serverless event-driven architecture with zero single points of failure.",
    codeType: "json",
    title: "Production System Health & Operational Metrics",
    code: JSON.stringify({
      "ArchitectureStatus": "ALL SYSTEMS GO",
      "OperationalMetrics": {
        "PeakThroughput": "45,000 requests/sec",
        "P99_Latency": "184ms",
        "P50_Latency": "42ms",
        "AvailabilityLast90Days": "99.994%",
        "CostPerTransaction": "IDR 12.80",
        "IdleCost": "IDR 0 (Zero Infrastructure Idle Fee)",
        "TCO_Reduction": "74% vs Legacy VM Cluster",
        "RPO": "< 1 second (Multi-AZ Replication)",
        "RTO": "< 10 seconds (Automated Failover)"
      }
    }, null, 2)
  }
};
