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

// Stable task identities let the closer view deepen the same job from slide 5.
export const SLIDE_6_INSPECTORS = {
  eventbridge: {
    service: "Amazon EventBridge — Delivery rule",
    role: "The same event channel and delivery rule from slide 5. They send the order update to Plan delivery.",
    sections: [
      ["What starts it?", "After the required order steps succeed, Step Functions publishes OrderConfirmed. The main order workflow is still there, but is hidden in this closer view."],
      ["What data comes in?", "The event has source apex.orders, type OrderConfirmed, order ID EV-1042, and status confirmed. Type means the event name. The graph shows a short summary; the source and field names are explained here."],
      ["What does it do?", "On the same event bus, the delivery rule checks type OrderConfirmed and status confirmed. Both match. The rule is summarized under the EventBridge icon."],
      ["Where does it go?", "EventBridge calls the same Plan delivery function with a copy of this event. A dashed arrow shows event delivery, not the order of workflow steps."],
      ["Why keep it?", "It starts the delivery task after confirmation. The separate sales report rule still sends its own copy to Update sales report. That branch is hidden for focus."],
      ["What is its limit?", "EventBridge selects and sends messages. It does not find order details or plan delivery. The team must grant access to the target and handle failed delivery. These event names and conditions are example choices."]
    ]
  },
  'order-event': {
    service: "OrderConfirmed — Event data",
    role: "A message about the confirmed order. This is data for the task, not another AWS service.",
    sections: [
      ["What creates it?", "A configured step in the main Step Functions workflow publishes this message after the required order steps succeed."],
      ["What does it contain?", "Source apex.orders names the sender. Type OrderConfirmed names what happened. Order ID EV-1042 identifies the order. Status confirmed gives its current state in this message."],
      ["Where does it go?", "The delivery rule matches the type and status. EventBridge sends a copy to Plan delivery. The same sales report branch from slide 5 still gets its own copy, but is hidden here."],
      ["Why is the order ID useful?", "The task can use it to find more details. We do not need to put every delivery detail in the event."],
      ["What is its limit?", "Confirmed does not mean delivered. The message does not run code or contain a full delivery plan. Event fields are simplified for this example. In AWS, type is called detail-type; order ID and status sit in the event details."]
    ]
  },
  'plan-delivery': {
    service: "AWS Lambda — Plan delivery",
    role: "The same delivery task from slides 4 and 5, enlarged. A function is a small program. Lambda is the AWS service that runs it.",
    sections: [
      ["What starts it?", "EventBridge calls this function after the delivery rule matches OrderConfirmed with status confirmed. This call starts the program; it is the trigger."],
      ["What data comes in?", "It receives the full event summarized above, including order ID EV-1042. Lambda passes the JSON event to the handler, the entry point in our code. The order ID is available as event.detail.orderId. The program uses this ID to find the other order details it needs. The solid arrow to DynamoDB shows this lookup."],
      ["What does our code do?", "Our team writes the program that finds the order details and asks the delivery system to start planning. The team also sets access permissions and handles errors. Lambda does not invent these business steps."],
      ["What does AWS do?", "AWS provides and maintains the computing resources that run the program. The team can focus on the task. Lambda runs and automatically scales the function to process incoming events. Our team still chooses the runtime and configures permissions. The pseudocode uses illustrative helper names, not built-in Lambda APIs."],
      ["Where does the result go?", "A planning request goes to the delivery system shown below the AWS Cloud boundary. The solid arrow shows a request to another system. It is not another OrderConfirmed event or a reply to Step Functions."],
      ["How does it fit the order workflow?", "It reacts after confirmation, outside the main workflow. It does not check the order, reserve stock, or charge payment again. It does not wait for Update sales report."],
      ["What is its limit?", "Sending a request does not mean planning succeeded or the vehicle was delivered. Our code must handle errors and avoid a second planning request if the event repeats. The task and its planning request are illustrative."]
    ]
  },
  dynamodb: {
    service: "Amazon DynamoDB — Order details",
    role: "The order data store already introduced in the architecture. Plan delivery reads the details needed for planning.",
    sections: [
      ["What is read?", "The handler uses order ID EV-1042 from event.detail.orderId to read the order details. The exact fields and table design are illustrative."],
      ["Why read the database?", "The event identifies the order without carrying every delivery detail. DynamoDB supplies the stored data; our code decides what to send to the delivery system."],
      ["What permission is needed?", "The Lambda execution role needs permission to read the relevant order data. Reading data does not confirm a delivery plan or complete a delivery."]
    ]
  },
  'planning-request': {
    service: "Delivery system — Planning request",
    role: "The delivery system receives a planning request from Plan delivery. It is an integration partner, not a new AWS service.",
    sections: [
      ["What creates it?", "The Plan delivery program creates this request after receiving the event and finding the details it needs for order EV-1042."],
      ["What data goes out?", "The request identifies order EV-1042 and includes the delivery details needed by the receiving system. Only the order ID is shown. The exact fields are an example design choice."],
      ["Where does it go?", "It goes to the delivery system to ask it to start planning. The system is drawn outside the AWS Cloud boundary; its hosting and response are unspecified."],
      ["How does it fit the workflow?", "This is work after order confirmation. It is not returned to Step Functions, and it does not replace the order database, notifications, or sales report."],
      ["Why show it?", "Receiving an event is only the start. The task must do useful work. Here, its useful output is a request for a delivery plan."],
      ["What is its limit?", "A sent request is not proof of a completed plan or delivery. The task code must check failures and avoid duplicate requests. The delivery system owns the planning work."]
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

// Contextual explanations for the remainder of the course. Task keys describe
// responsibilities, never a node's position in the drawing.
const API_ORDER_INSPECTORS = {
  mobile: {
    service: 'Buyer app',
    role: 'Sends an order and checks its progress separately.',
    sections: [
      ['What starts it?', 'The buyer chooses a vehicle. The app sends HTTPS POST /orders with order details and a stable order or request ID.'],
      ['What comes back?', 'The initial reply carries a workflow reference. It means execution started; the database write may still be pending or may fail.'],
      ['How is storage checked?', 'A separate authenticated status route can read the order record. RECEIVED means that the record was written successfully. It does not prove stock reservation, payment or order confirmation. The route is hidden in this diagram.']
    ]
  },
  apigateway: {
    service: 'Amazon API Gateway',
    role: 'The same order entry point shown on slide 2.',
    sections: [
      ['What happens here?', 'A REST API route maps POST /orders to Step Functions StartExecution using a configured IAM execution role. API Gateway returns a workflow reference without waiting for the workflow to finish.'],
      ['What belongs in the API?', 'Configure authentication, authorization, request limits and CloudWatch monitoring. A separate status route must check that the caller can access the requested order. Access checks do not verify vehicle availability or payment.'],
      ['Which API type?', 'This example uses a REST API with an AWS service integration. HTTP APIs support a different feature set; WebSocket APIs support two-way updates. This design does not need all three.'],
      ['What does a successful reply prove?', 'It proves StartExecution succeeded, not that DynamoDB stored the order. The team maps success and errors into API responses. API Gateway does not perform the business workflow or save the record itself.']
    ]
  },
  stepfunctions: {
    service: 'AWS Step Functions',
    role: 'Starts the order workflow and runs an early task that saves the order.',
    sections: [
      ['What comes in?', 'API Gateway calls StartExecution with order details and a stable order or request ID. StartExecution returns an execution ARN and start time, not a saved order or completed business result.'],
      ['How does it save?', 'An early Task state uses the direct DynamoDB PutItem integration to write orderId EV-1042 and status RECEIVED. Step Functions waits for that task response before progressing. A Lambda function is not required just to make this database call.'],
      ['What follows?', 'Only after a successful write does the workflow continue to the existing Check order, Reserve stock and Charge payment tasks. Later success can update the order to CONFIRMED and publish OrderConfirmed, as shown on earlier slides. Those later steps are hidden here.'],
      ['What if something fails?', 'A successful StartExecution reply can arrive before PutItem finishes. Configure task permissions, error handling and safe retries. A failed write must not be presented as a stored order. Use a stable order ID and a conditional write to avoid overwriting an existing order on a repeated request.']
    ]
  },
  dynamodb: {
    service: 'Amazon DynamoDB',
    role: 'Stores the order record with the initial business status RECEIVED.',
    sections: [
      ['What is written?', 'Example item: orderId = EV-1042, status = RECEIVED, plus the order details needed by later tasks. RECEIVED is an application-defined value, not a built-in DynamoDB status.'],
      ['When is it received?', 'Only a successful PutItem response means the write succeeded. Starting the workflow is a separate event and does not guarantee this write. The initial API reply is therefore labelled as a workflow reference.'],
      ['How do retries stay safe?', 'Use a stable order or request ID and a condition such as attribute_not_exists(orderId) when creating the item. Repeated submissions must not overwrite an existing order or repeat payment. The application decides how to return an existing result.'],
      ['How is progress read?', 'A separate authenticated status endpoint can read the record by order ID. If immediate visibility is required, use a strongly consistent GetItem read on the base table. An eventually consistent read may briefly miss a new item. The status route and read integration are omitted for focus.'],
      ['What comes next?', 'The workflow advances the business status after its checks succeed. RECEIVED is not CONFIRMED, PAID or DELIVERED. This is the same order data service shown on slide 6; the diagram now shows how its record begins.']
    ]
  }
};

const DELIVERY_QUEUE_INSPECTORS = {
  eventbridge: {
    service: 'Amazon EventBridge',
    role: 'Uses the same delivery rule, now with an SQS queue as its target.',
    sections: [
      ['What comes in?', 'The main workflow publishes OrderConfirmed after the required order steps succeed. The event still carries source apex.orders, order ID EV-1042 and status confirmed.'],
      ['What changes from slide 6?', 'The delivery rule still checks event type and status. Here its target is the delivery queue, rather than calling Plan delivery directly. The sales report rule still exists and is hidden.'],
      ['Where does the result go?', 'A matching update goes to SQS to wait for processing. EventBridge does not wait for a delivery plan. The team must also handle a failure to send the event to the queue.'],
      ['Why add this?', 'Routing still chooses the receiver. The queue adds a place for waiting work. This is an illustrative design change, not a new responsibility for EventBridge.']
    ]
  },
  'delivery-queue': {
    service: 'Amazon SQS — Delivery queue',
    role: 'A queue holds delivery updates until a task can process them.',
    sections: [
      ['What comes in?', 'The EventBridge delivery rule sends the same OrderConfirmed message with order ID EV-1042 and status confirmed.'],
      ['How does work start?', 'A configured Lambda event source mapping reads messages from SQS and calls Plan delivery with them. This mapping is the connection between the queue and the function. The arrow shows data flow; SQS does not push a direct function call.'],
      ['What happens after processing?', 'After successful processing, the Lambda integration removes the messages. A failed message can become available again after a configured hiding period, called the visibility timeout. By default, a failed batch can cause successful records to be retried too. Configure ReportBatchItemFailures and return failed message IDs to retry only failed records. Set visibility timeout to at least six times the function timeout, plus any batch window.'],
      ['Why is it here?', 'Delivery work can wait during a burst. The main workflow does not wait for the queue to empty. Set message retention, processing capacity, failure handling and alerts. Storage is time-limited.'],
      ['What about repeats and order?', 'Standard queues may repeat messages or change their order. FIFO means first in, first out; it adds ordered message groups and deduplication. Either choice still needs safe task code. Use the order ID to avoid asking for the same plan twice.']
    ]
  },
  'plan-delivery': {
    service: 'AWS Lambda — Plan delivery',
    role: 'The same program from slide 6. Only its incoming path has changed.',
    sections: [
      ['What starts it now?', 'The Lambda service reads waiting messages from SQS through a configured connection. The function receives the queued OrderConfirmed event, including order ID EV-1042.'],
      ['What does it do?', 'The program finds the needed order details and asks the delivery system for a plan. The lookup, planning request and outside system are hidden here.'],
      ['Where does the result go?', 'The planning request goes to the delivery system. A successful function result lets the SQS integration remove the message. It is not a delivery confirmation or a reply to the main order workflow.'],
      ['Why keep the same task?', 'A queue changes when work starts, not the task responsibility. Plan delivery still does not reserve stock, charge payment or update the sales report.'],
      ['What needs care?', 'The same message may be processed again. Record and check the order reference so retries do not create duplicate planning requests. A failure needs a retry or review path.']
    ]
  },
  'delivery-dlq': {
    service: 'Amazon SQS — Delivery dead-letter queue',
    role: 'A separate queue for messages that repeatedly fail processing.',
    sections: [
      ['What sends a message here?', 'A redrive policy on the source queue defines how many receives are allowed before moving a failed message here. The policy must be configured.'],
      ['What data comes in?', 'The failed delivery message is kept for investigation, including its order reference. The team can find the related function logs.'],
      ['What happens next?', 'An alert should tell the team to review the error, fix the cause and decide whether to process the message again. This queue does not fix or retry the work by itself.'],
      ['Why is it here?', 'A bad message should be visible for review rather than repeatedly blocking useful work. Set retention and alerts. It is not a promise of no data loss and does not mean the order was delivered.']
    ]
  }
};

const NOTIFICATION_INSPECTORS = {
  stepfunctions: {
    service: 'AWS Step Functions',
    role: 'The same workflow publishes an order status notification to SNS.',
    sections: [
      ['What starts this action?', 'A configured step runs when the workflow has an order status to share. The message contains the order reference and status.'],
      ['Where does it go?', 'The step publishes to the SNS topic. It waits for that service call result, not for the buyer to read a message. The separate OrderConfirmed event still goes to EventBridge for delivery planning and reporting.'],
      ['Why is it here?', 'This expands the notification connection from slide 2. Sending one update to SNS avoids contacting each notification receiver from the workflow. Publishing failures still need handling.']
    ]
  },
  sns: {
    service: 'Amazon Simple Notification Service (Amazon SNS)',
    role: 'Shares an order update through a topic, a named notification channel.',
    sections: [
      ['What comes in?', 'The order workflow publishes a status message, such as the order ID and its new status, to a configured topic.'],
      ['What does SNS do?', 'SNS sends a copy to each matching subscription. A subscription connects a receiver to the topic. Filters can limit which messages that receiver gets. Here the receivers are a buyer SMS channel, a support HTTPS application and an optional SQS queue. This diagram uses a Standard topic.'],
      ['Where do results go?', 'Each receiver handles its copy separately. SNS does not collect their business results for the workflow. More receivers can be added, including separate SQS queues. This copying pattern is called fan-out.'],
      ['How is it different?', 'SQS holds waiting work for processing. EventBridge routes events using rules and many event integrations. SNS shares notifications with subscribers. These services can be combined; they are not compulsory replacements for one another.'],
      ['What is its limit?', 'Standard topics can deliver duplicates or messages out of order. Make consumers idempotent. Retry policies depend on the endpoint protocol; attach an SQS dead-letter queue to each applicable subscription to retain undelivered messages. Configure topic and queue policies. Sent does not mean read; delivered messages cannot be recalled.']
    ]
  },
  'notification-queue': {
    service: 'Amazon Simple Queue Service (Amazon SQS)',
    role: 'An optional SNS subscriber buffers a separate copy for an independent consumer.',
    sections: [
      ['What arrives?', 'SNS pushes a copy of each matching update into this subscribed Standard queue. The queue policy must allow the intended SNS topic to send messages.'],
      ['What happens next?', 'A consumer polls this queue at its own pace. Each additional processing application can have its own queue and subscription; consumers sharing one queue compete for its messages.'],
      ['Is it the delivery queue or a DLQ?', 'Neither. This is a separate notification subscriber. Slide 9’s EventBridge delivery queue stays unchanged. A subscription DLQ is another queue for failed SNS deliveries, not this normal message path.']
    ]
  },
  mobile: {
    service: 'Buyer notification channel',
    role: 'An example receiver of order updates, such as SMS.',
    sections: [
      ['What starts it?', 'An SNS message is routed to the configured buyer notification channel. The exact addressing and subscription setup are hidden.'],
      ['What data arrives?', 'The order reference and a suitable status message. Send only the personal data needed for that channel.'],
      ['What happens next?', 'The notification informs the buyer. It does not charge a payment or prove that the buyer read it. The app still needs a status-check route. This is an illustrative receiver outside the order workflow.']
    ]
  },
  internet: {
    service: 'Support notification app',
    role: 'An example HTTPS subscriber for the support team.',
    sections: [
      ['What starts it?', 'SNS sends an order status message to a subscribed HTTPS endpoint, an app address reached over an encrypted web connection.'],
      ['What does it do?', 'The support app uses the reference and status to inform its staff. Its internal storage and display are not drawn.'],
      ['Why is it separate?', 'Support receives its own copy without changing the order tasks. This is a notification example, not the Update sales report Lambda. Delivery errors and repeated messages need handling in the receiver.']
    ]
  }
};

const DELIVERY_ACCESS_INSPECTORS = {
  eventbridge: {
    service: 'Amazon EventBridge',
    role: 'The configured event source allowed to start Plan delivery in this direct-trigger view.',
    sections: [
      ['What comes in?', 'The same OrderConfirmed event arrives from the order workflow. A matching delivery rule sends its order data to Plan delivery.'],
      ['Which permission matters?', 'In this resource-based policy example, allow events.amazonaws.com to use lambda:InvokeFunction on this function, with aws:SourceArn restricted to the delivery rule ARN. This is separate from the execution role.'],
      ['Why this view?', 'It returns to the direct path on slide 6 so the two permission questions are easier to compare. The SQS alternative on slide 9 needs its own queue and integration permissions. Neither path is automatically safe without configuration.']
    ]
  },
  'plan-delivery': {
    service: 'AWS Lambda — Plan delivery',
    role: 'The same task, shown with limited access to saved order details.',
    sections: [
      ['What starts it?', 'The configured EventBridge rule calls the function with the OrderConfirmed event and order ID EV-1042. This drawing uses the direct path from slide 6.'],
      ['What data does it need?', 'Its code reads the order details needed for planning from DynamoDB. This illustrates one possible source for the lookup that slide 6 hid. The data returns to the task; reply arrows are hidden.'],
      ['What does it do next?', 'It asks the delivery system for a plan. That system and the request are hidden. This does not change the main order workflow or repeat a charge.'],
      ['What permissions should it have?', 'Give its IAM execution role only the needed data actions. The example lookup is read-only. Do not grant order deletion or payment actions just because other tasks need them. Restrict which order data can be read where the design allows.'],
      ['What remains our work?', 'Validate input, protect secrets, update code dependencies and handle failures and repeated events. Secrets Manager can store and rotate supported secrets; a private network alone does not grant or limit service permissions.']
    ]
  },
  dynamodb: {
    service: 'Amazon DynamoDB — Order details',
    role: 'Provides saved order details to Plan delivery in this example.',
    sections: [
      ['What starts the lookup?', 'Plan delivery sends a read request with an order reference using its own task permissions.'],
      ['What happens here?', 'DynamoDB checks the access rules and returns the matching record or an error. The response is hidden. It does not arrange delivery itself.'],
      ['Why is it here?', 'It makes the task access boundary visible. Read access must not silently include write or delete access. A signed-in buyer and a Lambda execution role are different identities with different permissions.']
    ]
  },
  'delivery-role': {
    service: 'AWS Identity and Access Management (IAM) — Delivery role',
    role: 'The permissions Plan delivery uses when it calls AWS services.',
    sections: [
      ['When is it used?', 'Lambda uses the configured execution role while running the task. This role is a permission setting, not another order-processing step.'],
      ['What does it allow here?', 'Lambda assumes this role using temporary credentials; its trust policy allows lambda.amazonaws.com. The illustrative data policy allows dynamodb:GetItem on the Orders table ARN only. Logging and any other required actions need their own scoped permissions. Give each task its own role.'],
      ['Where does the result go?', 'AWS checks these permissions when the task calls a service. The service returns data or an access error to the task. The role does not receive an order event.'],
      ['What does it not do?', 'It does not decide who may start the function, prove a buyer owns an order, or replace encryption. Policies controlling the caller, the task and the data need to work together.']
    ]
  }
};

const WORKFLOW_INSPECTORS = {
  stepfunctions: {
    service: 'AWS Step Functions',
    role: 'Runs the same order plan and follows the chosen success and error paths.',
    sections: [
      ['What starts it?', 'API Gateway starts one workflow run with the order data. The entry service and data access are hidden here.'],
      ['What is a state machine?', 'It is a plan of steps and decisions. A Task step does work. A Choice step selects a path. Wait pauses the plan. Parallel starts separate branches. This drawing focuses on the task sequence and error paths.'],
      ['What does this plan do?', 'Call Check order, then Reserve stock, then Charge payment. Pass the needed input and results between steps. After required success, a configured step publishes OrderConfirmed to EventBridge. The connecting arrows are workflow sequence, not Lambda functions calling one another.'],
      ['How are failures handled?', 'Configure Retry for selected errors and Catch for an error path. In this example the error path handles a failure for review or recovery. It must also handle a rejected order or unavailable stock. Undoing a reservation or refunding payment requires explicit work; Step Functions does not invent a rollback.'],
      ['Which workflow type?', 'Standard suits durable business workflows with a recorded history. Express suits short, high-volume event work. Choose by duration, history and execution needs. Retrying or restarting a payment still needs protection against double charges.'],
      ['What is its limit?', 'A step result means what that integration reports. A completed Lambda call can return its result, but an accepted request to an outside system may only mean work was started. Choose a wait or callback pattern when the plan needs later completion. Delivery and report targets remain independent of this order workflow.']
    ]
  },
  ...Object.fromEntries(Object.entries(ORDER_TASK_INSPECTORS).map(([key, data]) => [key, {
    ...data,
    sections: data.sections.map(([heading, text]) => [heading, text.replace('The solid branches show calls, not three tasks running at once.', 'The solid arrows here show the sequence chosen by Step Functions.')])
  }])),
  eventbridge: {
    service: 'Amazon EventBridge',
    role: 'Receives OrderConfirmed only on the configured success path.',
    sections: [
      ['What starts it?', 'After the required order tasks succeed, a workflow step publishes the event. The drawing line follows the success path; it does not mean Charge payment independently publishes the event.'],
      ['What data arrives?', 'The same OrderConfirmed event carries source apex.orders, order ID EV-1042 and status confirmed. The task names, event fields and publish point are choices for this teaching example.'],
      ['Where does it go?', 'Matching rules route the event to delivery planning and sales reporting. Those targets are hidden. EventBridge does not decide the earlier task order.'],
      ['What remains to do?', 'The team must handle failed publishing and keep saved order state and its published event consistent. A successful publish does not mean the downstream tasks have finished.']
    ]
  }
};

const DATA_CONTROL_INSPECTORS = {
  dynamodb: {
    service: 'Amazon DynamoDB',
    role: 'The managed database for saved order records.',
    sections: [
      ['What comes in?', 'Authorized workflow steps or task code send order records or lookup requests. These business calls are hidden because this slide focuses on data controls.'],
      ['What does it do?', 'It saves and returns data such as an order ID and status. A global secondary index is an extra lookup structure for a different question, such as finding orders by status. Choose keys and indexes for the access patterns the app needs.'],
      ['Why is it here?', 'Order records outlive one function run. DynamoDB encrypts stored data using encryption keys managed through AWS KMS. The team still chooses access rules and protects sensitive information.'],
      ['What is its limit?', 'It does not set workflow steps or send the OrderConfirmed event in this design. A single-table layout is an optional modeling choice, not a course requirement. This drawing promises neither unlimited load nor a fixed response time.']
    ]
  },
  kms: {
    service: 'AWS Key Management Service (AWS KMS)',
    role: 'Manages encryption keys used to protect data.',
    sections: [
      ['When is it used?', 'A service such as DynamoDB uses configured encryption keys when protecting stored data. The team chooses the key option and the permissions that apply.'],
      ['What does it protect?', 'Encryption makes stored data unreadable without the right key. Use encrypted connections as well. KMS is shown as a control beside storage, not a new order task or a network gateway.'],
      ['What is its limit?', 'A key does not decide whether a buyer may see an order. Access rules, key permissions and safe code still matter. Audit and retention settings need configuration; this is not a promise of permanent records of every action.']
    ]
  },
  cloudtrail: {
    service: 'AWS CloudTrail',
    role: 'Records AWS API activity for audit: who did what and when.',
    sections: [
      ['What starts a record?', 'An AWS API action covered by the configured event collection produces an activity record. For example, an administrator changes a resource setting.'],
      ['What data is recorded?', 'Records can identify the caller, action, resource, time and result. Configure the required event types, storage and retention. Not every data operation is automatically part of the same default collection.'],
      ['Where does it go?', 'The team reviews the activity history or configured log destination to investigate changes. This sits beside the business workflow, rather than receiving order events as its next step.'],
      ['Why use it?', 'It supports investigation and audit. It does not prove an order was delivered or replace application logs. An audit record alone does not prevent an unsafe action.']
    ]
  },
  config: {
    service: 'AWS Config',
    role: 'Records supported resource settings and checks them against chosen rules.',
    sections: [
      ['What starts it?', 'Configured recording collects resource settings and changes. Rules evaluate the supported resources according to the chosen triggers.'],
      ['What does it check?', 'For example, the team can check whether a resource meets a required access setting. The exact rule and resource support must match the requirement.'],
      ['Where does the result go?', 'The team receives compliance results and can set up a response. A response action must be configured; Config does not repair every problem by itself.'],
      ['Why is it here?', 'CloudTrail explains actions. Config helps explain settings and rule compliance. Neither service performs the order workflow or guarantees that the application meets every regulation.']
    ]
  }
};

const OBSERVABILITY_INSPECTORS = {
  stepfunctions: {
    service: 'AWS Step Functions',
    role: 'The same order workflow calls Charge payment in this enlarged view.',
    sections: [
      ['What comes in?', 'The order has passed the earlier checks and stock reservation in our example sequence. The workflow passes the order and payment reference to the task.'],
      ['What happens next?', 'The task returns its result and the workflow chooses the next step. Results and the other steps are hidden. Logs and workflow history help the team find where the order stopped.'],
      ['Why is it here?', 'It connects the payment investigation to the main order plan. Monitoring evidence does not change task order or automatically repair a failed payment.']
    ]
  },
  'charge-payment': {
    service: 'AWS Lambda — Charge payment',
    role: 'The same payment task, now shown with its monitoring evidence.',
    sections: [
      ['What starts it?', 'Step Functions calls the task with the order and payment reference after stock is reserved in our example.'],
      ['What does it do?', 'Its code asks the outside payment provider to process the charge. The result returns to the workflow. Reply arrows are hidden. A lost reply is not proof that no charge happened.'],
      ['What evidence does it send?', 'With suitable permissions and setup, task logs and measurements go to CloudWatch. Configured tracing sends request timing information to X-Ray. The team records the needed calls and carries a safe order reference across messages.'],
      ['Why is it here?', 'It shows how evidence can distinguish a code error from a slow partner call. Avoid recording full payment details or secrets. Sampling and missing records can limit a trace.'],
      ['What is its limit?', 'It still does only the payment task. Evidence collection is not instant diagnosis. The code must prevent repeat charges and check uncertain payment results before retrying.']
    ]
  },
  internet: {
    service: 'External payment provider',
    role: 'The outside service asked to process the charge.',
    sections: [
      ['What starts it?', 'Charge payment sends an authorized payment request with a payment reference. Full card data is not shown.'],
      ['Where does the result go?', 'The reply goes back to the task and then to Step Functions. The outside provider owns its payment processing, not the Lambda service. Reply arrows are hidden.'],
      ['Why show it?', 'A delay can happen outside our code. Recorded call timing helps investigate it. A trace of our request does not reveal all of the provider internals or guarantee payment success.']
    ]
  },
  cloudwatch: {
    service: 'Amazon CloudWatch',
    role: 'Collects logs and measurements so the team can understand app behavior.',
    sections: [
      ['What comes in?', 'Configured services and task code send logs and metrics. Logs are records of what happened. Metrics are numbers over time, such as errors, queue age and completed orders. Only the payment task evidence is drawn here.'],
      ['What can the team do?', 'Use Logs Insights to search records, view dashboards and create alarms for chosen thresholds. Alerts can go through SNS. The team must select the measurements and responses.'],
      ['Where does this fit?', 'It sits beside the order workflow. Blue lines carry evidence, not orders or instructions to run the next task.'],
      ['Why is it needed?', 'A small team needs to know whether orders finish and where problems appear. Enable the required logs, permissions, alarms and retention. Do not expect every business event to appear without adding it to the code.']
    ]
  },
  xray: {
    service: 'AWS X-Ray',
    role: 'Combines recorded parts of a request into a trace of its journey.',
    sections: [
      ['What comes in?', 'With tracing enabled and the needed code instrumentation, services send timing and result information. Instrumentation means adding the setup or code that records an operation.'],
      ['What does it show?', 'A trace can show which recorded call took time, such as a payment-provider request. Open the details and compare them with logs and metrics.'],
      ['Where does it fit?', 'It is investigation evidence beside the workflow. It does not process a payment or set the order steps.'],
      ['What is its limit?', 'Only recorded and collected operations are visible. Sampling can leave some requests out, and message paths need suitable linking. Carry order IDs for investigation across events. A trace does not guarantee immediate root-cause detection.']
    ]
  }
};

export const SLIDE_INSPECTORS = {
  2: SLIDE_2_INSPECTORS,
  3: SLIDE_3_INSPECTORS,
  4: SLIDE_4_INSPECTORS,
  5: SLIDE_5_INSPECTORS,
  6: SLIDE_6_INSPECTORS,
  7: API_ORDER_INSPECTORS,
  8: {
    'check-order': {
      ...ORDER_TASK_INSPECTORS['check-order'],
      role: 'An example short task already used in our order workflow.',
      sections: [
        ['Why choose Lambda here?', 'Check order starts when the workflow needs it and returns a result. AWS runs the code and manages the servers. The standard Lambda compute used here has a maximum of 15 minutes per invocation, so it is not an always-running application. Lambda Managed Instances has separate timeout rules and is outside this example. The order workflow is hidden in this comparison.'],
        ['What goes in and out?', 'Step Functions sends order details. Check order checks the required details and returns a pass or a problem. The workflow decides the next step. The workflow is hidden in this comparison.'],
        ['What does the team own?', 'The task program, its settings, permissions and error handling. Costs depend on use and configuration. This comparison does not replace Check order or claim that every job should use Lambda.']
      ]
    },
    ecs: {
      service: 'Amazon Elastic Container Service (Amazon ECS)',
      role: 'Manages container tasks and services. A container bundles a program and what it needs.',
      sections: [
        ['What starts work?', 'The team defines which packaged program to run and whether it should keep running or start for a job. ECS manages those container tasks. Amazon Elastic Kubernetes Service (Amazon EKS) is another orchestrator when Kubernetes is required.'],
        ['Where does it run?', 'The team can choose Fargate managed capacity or EC2 servers. The drawing shows choices, not a sequence of calls.'],
        ['Why choose it?', 'Containers can give programs a consistent package and suit longer-running services. The program still decides what data to read and where results go. ECS does not replace our order workflow by default.']
      ]
    },
    fargate: {
      service: 'AWS Fargate',
      role: 'Runs containers without the team managing the underlying servers.',
      sections: [
        ['What starts it?', 'A configured ECS task can request Fargate capacity for a container. The container image contains the program and what it needs.'],
        ['What does it do?', 'Fargate provides the running resources. The program handles its input, work and output. This comparison does not add a container job to the EV workflow.'],
        ['Why choose it?', 'It can suit longer-running packaged programs with less server maintenance. The team still owns the program, resource choices, permissions and cost. Fargate and ECS have different roles, not competing steps in a ladder.']
      ]
    },
    ec2: {
      service: 'Amazon Elastic Compute Cloud (Amazon EC2)',
      role: 'Rented server capacity with more control over server software and settings.',
      sections: [
        ['What runs here?', 'The team chooses a program and operating system, the software that manages the computer. The program decides what starts work, which data it uses and where results go.'],
        ['Why choose it?', 'Some jobs need specific server settings or long-running processes. EC2 can also run containers and separate services. It is not restricted to old applications.'],
        ['What does the team own?', 'More capacity planning, server software updates and recovery work. These choices can be combined with Lambda and containers. The graph is a comparison, not a change to the EV order design.']
      ]
    }
  },
  9: DELIVERY_QUEUE_INSPECTORS,
  10: NOTIFICATION_INSPECTORS,
  11: {
    mobile: {
      service: 'Buyer app',
      role: 'Signs in first, then sends the token with its API request.',
      sections: [
        ['What starts it?', 'The buyer signs in through Cognito. After successful sign-in, the app receives a signed token with an expiry. A token is proof the API can check.'],
        ['Where does the data go?', 'The app sends the token with an order or status request to API Gateway over an encrypted connection. Sign-in replies and business replies are simplified.'],
        ['Why is it here?', 'It makes the identity path clear: the token returns to the app before the app calls the API. It is not a direct order request from Cognito to the workflow. The app should not receive broad AWS service permissions just to use this API.']
      ]
    },
    cognito: {
      service: 'Amazon Cognito',
      role: 'Handles user sign-in and supplies signed tokens the app can present.',
      sections: [
        ['What starts it?', 'The buyer app sends a sign-in request. A user pool keeps user identities and can connect to other sign-in providers.'],
        ['What comes out?', 'After successful sign-in, the app receives ID, access and refresh tokens. This example sends the access token with the HTTPS API request. A signed JWT is not encrypted: do not put secrets in its readable claims.'],
        ['User pool or identity pool?', 'A user pool supports sign-in and tokens. An identity pool can provide temporary AWS credentials when direct access to AWS resources is needed. It is not required for this token-to-API example.'],
        ['What is its limit?', 'Cognito proves identity; it does not decide that a buyer owns every requested order. The app still needs access rules, secure data handling and code checks. AWS operates the service; the team owns its configuration.']
      ]
    },
    apigateway: {
      service: 'Amazon API Gateway',
      role: 'Checks the app token and configured API permissions before starting order work.',
      sections: [
        ['What comes in?', 'The app sends an API request with order data and a token it obtained from Cognito. Authentication checks identity; authorization checks what that identity may do.'],
        ['What happens here?', 'This is a REST API with a Cognito user pool authorizer. It validates the token signature and expiry. Configure OAuth scopes on each protected method to use access tokens and require a matching scope. Rejected requests do not start the workflow. An HTTP API uses a JWT authorizer instead.'],
        ['What remains in code?', 'Pass verified authorizer claims such as sub to the backend using the integration mapping. Task code compares that trusted buyer identity with the order owner before returning or changing order data. Never use a caller-supplied buyer ID as proof. API permission alone does not grant access to every record.'],
        ['Why is it here?', 'It protects the shared front door. Rate limits and WAF rules can add protection against unwanted traffic, but do not replace identity, task permissions or safe code. Error responses and extra protection layers are hidden.']
      ]
    },
    stepfunctions: {
      service: 'AWS Step Functions',
      role: 'The same order workflow receives requests that passed the configured API checks.',
      sections: [
        ['What comes in?', 'API Gateway starts a run with allowed order input. The app and task code still need checks for the intended buyer and order.'],
        ['What happens next?', 'The workflow runs the existing order tasks and follows their results. Its task calls and storage are hidden on this access-focused slide.'],
        ['What is its limit?', 'It is not a sign-in service. The team must restrict who may start it and what each step may access. AWS operating the service does not remove those responsibilities.']
      ]
    }
  },
  12: DELIVERY_ACCESS_INSPECTORS,
  13: WORKFLOW_INSPECTORS,
  14: DATA_CONTROL_INSPECTORS,
  15: OBSERVABILITY_INSPECTORS,
  16: {
    mobile: API_ORDER_INSPECTORS.mobile,
    apigateway: API_ORDER_INSPECTORS.apigateway,
    stepfunctions: {
      service: 'AWS Step Functions',
      role: 'The same Check order, Reserve stock and Charge payment workflow, summarized as one node.',
      sections: [
        ['What starts it?', 'API Gateway passes the order request to start the workflow. The plan calls the same three task programs; their icons are hidden inside this summary.'],
        ['Where does data go?', 'The workflow uses DynamoDB for saved order data and SNS for status notifications. After required success it publishes OrderConfirmed to EventBridge. These service connections do not mean all steps run in parallel.'],
        ['What happens after publishing?', 'EventBridge sends a copy through the delivery queue to Plan delivery and another copy directly to Update sales report. Their business results do not return to this main workflow.'],
        ['What must the POC prove?', 'Test task sequence, error handling, access and safe repeated work. Recovery actions and the consistency between saved orders and published events need an explicit design. This graph is a proposal, not evidence of a successful launch.']
      ]
    },
    dynamodb: SLIDE_2_INSPECTORS.dynamodb,
    sns: {
      ...NOTIFICATION_INSPECTORS.sns,
      role: 'The same order notification topic from slides 2 and 10. Its subscribers are hidden here.',
      sections: [
        ['What comes in?', 'The order workflow publishes a status notification with the order reference and suitable status data.'],
        ['Where does it go?', 'SNS sends copies to configured subscribers, such as buyer and support channels. Those receivers are not drawn in this summary. Filters and access rules must be configured.'],
        ['Why is it still here?', 'It shares notifications while EventBridge routes OrderConfirmed to the independent task branches. SNS does not replace the workflow or database. A sent message is not proof it was read.']
      ]
    },
    eventbridge: {
      ...DELIVERY_QUEUE_INSPECTORS.eventbridge,
      sections: [
        ['What comes in?', 'The workflow publishes OrderConfirmed after required success. The same illustrative event carries source apex.orders, order ID EV-1042 and status confirmed.'],
        ['What happens here?', 'The delivery rule checks the event type and status and sends a copy to the delivery SQS queue. The sales report rule checks the type and sends a separate copy directly to Update sales report. Both rules belong to the same bus.'],
        ['Why is it here?', 'It routes independent reactions without setting the main order sequence. These tasks do not have a fixed order between them. Handle failed delivery and repeated messages; routing success does not mean business work is finished.']
      ]
    },
    'delivery-queue': DELIVERY_QUEUE_INSPECTORS['delivery-queue'],
    'plan-delivery': DELIVERY_QUEUE_INSPECTORS['plan-delivery'],
    'update-sales-report': SLIDE_4_INSPECTORS['update-sales-report']
  }
};
