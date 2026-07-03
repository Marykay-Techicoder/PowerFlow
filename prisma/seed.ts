import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Realistic Nigerian Demo Data ───────────────────────────

const CUSTOMERS = [
  { name: "Chioma Okafor", email: "chioma.okafor@gmail.com", phone: "+234 810 234 5678", address: "12 Admiralty Way, Lekki Phase 1, Lagos" },
  { name: "Emeka Nwankwo", email: "emeka.nwankwo@yahoo.com", phone: "+234 803 456 7890", address: "45 Adeola Odeku St, Victoria Island, Lagos" },
  { name: "Aisha Bello", email: "aisha.bello@hotmail.com", phone: "+234 816 789 0123", address: "8 Aminu Kano Crescent, Wuse 2, Abuja" },
  { name: "Oluwaseun Adeyemi", email: "seun.adeyemi@gmail.com", phone: "+234 708 123 4567", address: "23 Ring Road, GRA, Benin City" },
  { name: "Fatima Abdullahi", email: "fatima.a@gmail.com", phone: "+234 809 345 6789", address: "15 IBB Way, Maitama, Abuja" },
  { name: "Chinedu Eze", email: "chinedu.eze@outlook.com", phone: "+234 812 567 8901", address: "7 Allen Avenue, Ikeja, Lagos" },
  { name: "Ngozi Obi", email: "ngozi.obi@gmail.com", phone: "+234 805 678 9012", address: "31 Awolowo Road, Ikoyi, Lagos" },
  { name: "Ibrahim Musa", email: "ibrahim.musa@gmail.com", phone: "+234 818 890 1234", address: "4 Sultan Road, Kaduna" },
  { name: "Blessing Onyekachi", email: "blessing.o@yahoo.com", phone: "+234 706 012 3456", address: "19 Trans Amadi, Port Harcourt" },
  { name: "Tunde Bakare", email: "tunde.bakare@gmail.com", phone: "+234 811 234 5670", address: "56 Ogunlana Drive, Surulere, Lagos" },
  { name: "Halima Yusuf", email: "halima.yusuf@gmail.com", phone: "+234 807 456 7891", address: "22 Nnamdi Azikiwe Bypass, Abuja" },
  { name: "David Okonkwo", email: "david.okonkwo@gmail.com", phone: "+234 814 678 9013", address: "10 Stadium Road, GRA, Port Harcourt" },
];

const PLANS = [
  {
    name: "Solar Basic",
    description: "Essential solar power for small households. Covers lighting, phone charging, and fans.",
    type: "solar",
    amount: 25000,
    features: JSON.stringify(["Lights", "Phone Charger", "Ceiling Fan"]),
    gracePolicy: JSON.stringify({ allowed: ["Lights", "Phone Charger"], disabled: ["Ceiling Fan"] }),
  },
  {
    name: "Solar Standard",
    description: "Full home solar coverage. Includes all basic appliances plus TV and refrigerator.",
    type: "solar",
    amount: 45000,
    features: JSON.stringify(["Lights", "Phone Charger", "Ceiling Fan", "Television", "Refrigerator"]),
    gracePolicy: JSON.stringify({ allowed: ["Lights", "Phone Charger", "Ceiling Fan"], disabled: ["Television", "Refrigerator"] }),
  },
  {
    name: "Solar Premium",
    description: "Complete solar power solution. Powers everything including AC and water heater.",
    type: "solar",
    amount: 75000,
    features: JSON.stringify(["Lights", "Phone Charger", "Ceiling Fan", "Television", "Refrigerator", "Air Conditioner", "Water Heater", "Microwave"]),
    gracePolicy: JSON.stringify({ allowed: ["Lights", "Phone Charger", "Ceiling Fan"], disabled: ["Television", "Refrigerator", "Air Conditioner", "Water Heater", "Microwave"] }),
  },
  {
    name: "Estate Electricity Basic",
    description: "Managed electricity billing for residential estates. Basic household coverage.",
    type: "electricity",
    amount: 35000,
    features: JSON.stringify(["Lighting", "Power Outlets", "Water Pump"]),
    gracePolicy: JSON.stringify({ allowed: ["Lighting"], disabled: ["Power Outlets", "Water Pump"] }),
  },
  {
    name: "Water Standard",
    description: "Managed water supply subscription for estates and communities.",
    type: "water",
    amount: 15000,
    features: JSON.stringify(["Drinking Water", "Bathing", "Laundry", "Garden"]),
    gracePolicy: JSON.stringify({ allowed: ["Drinking Water", "Bathing"], disabled: ["Laundry", "Garden"] }),
  },
  {
    name: "Internet Fibre",
    description: "High-speed fibre internet with managed billing.",
    type: "internet",
    amount: 20000,
    features: JSON.stringify(["50 Mbps Download", "20 Mbps Upload", "Unlimited Data"]),
    gracePolicy: JSON.stringify({ allowed: ["5 Mbps Download", "2 Mbps Upload", "Limited Data (2GB/day)"], disabled: ["Full Speed", "Unlimited Data"] }),
  },
];

async function main() {
  console.log("🌱 Seeding PowerFlow database...\n");

  // Clear existing data
  await prisma.webhookEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.subscriptionEvent.deleteMany();
  await prisma.retryAttempt.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.utilityPlan.deleteMany();

  console.log("  ✓ Cleared existing data");

  // Seed plans
  const plans = [];
  for (const plan of PLANS) {
    const created = await prisma.utilityPlan.create({ data: plan });
    plans.push(created);
  }
  console.log(`  ✓ Created ${plans.length} utility plans`);

  // Seed customers with varied health scores
  const healthConfigs = [
    { healthScore: 95, healthGrade: "excellent" },
    { healthScore: 88, healthGrade: "excellent" },
    { healthScore: 72, healthGrade: "good" },
    { healthScore: 65, healthGrade: "good" },
    { healthScore: 55, healthGrade: "at_risk" },
    { healthScore: 45, healthGrade: "at_risk" },
    { healthScore: 92, healthGrade: "excellent" },
    { healthScore: 30, healthGrade: "critical" },
    { healthScore: 78, healthGrade: "good" },
    { healthScore: 85, healthGrade: "excellent" },
    { healthScore: 60, healthGrade: "good" },
    { healthScore: 35, healthGrade: "critical" },
  ];

  const customers = [];
  for (let i = 0; i < CUSTOMERS.length; i++) {
    const created = await prisma.customer.create({
      data: {
        ...CUSTOMERS[i],
        tokenKey: `MOCK-TOKEN-${1000 + i}`,
        healthScore: healthConfigs[i].healthScore,
        healthGrade: healthConfigs[i].healthGrade,
      },
    });
    customers.push(created);
  }
  console.log(`  ✓ Created ${customers.length} customers`);

  // Seed subscriptions with varied statuses
  const statusConfigs: Array<{
    status: string;
    serviceLevel: number;
    planIndex: number;
  }> = [
    { status: "active", serviceLevel: 100, planIndex: 1 },
    { status: "active", serviceLevel: 100, planIndex: 2 },
    { status: "grace", serviceLevel: 50, planIndex: 1 },
    { status: "active", serviceLevel: 100, planIndex: 0 },
    { status: "retry_scheduled", serviceLevel: 50, planIndex: 1 },
    { status: "suspended", serviceLevel: 0, planIndex: 2 },
    { status: "active", serviceLevel: 100, planIndex: 3 },
    { status: "grace", serviceLevel: 50, planIndex: 4 },
    { status: "restored", serviceLevel: 100, planIndex: 0 },
    { status: "active", serviceLevel: 100, planIndex: 5 },
    { status: "active", serviceLevel: 100, planIndex: 1 },
    { status: "retry_scheduled", serviceLevel: 50, planIndex: 2 },
  ];

  const now = new Date();
  const subscriptions = [];
  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    const config = statusConfigs[i];
    const nextBilling = new Date(now);
    nextBilling.setDate(nextBilling.getDate() + Math.floor(Math.random() * 28) + 1);

    const graceStartedAt = config.status === "grace" || config.status === "retry_scheduled"
      ? new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      : null;

    const graceExpiresAt = graceStartedAt
      ? new Date(graceStartedAt.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days from grace start
      : null;

    const created = await prisma.subscription.create({
      data: {
        customerId: customer.id,
        planId: plans[config.planIndex].id,
        status: config.status,
        serviceLevel: config.serviceLevel,
        nextBillingDate: nextBilling,
        graceStartedAt,
        graceExpiresAt,
        retryCount: config.status === "retry_scheduled" ? 1 : config.status === "suspended" ? 3 : 0,
      },
    });
    subscriptions.push(created);
  }
  console.log(`  ✓ Created ${subscriptions.length} subscriptions`);

  // Seed payment history
  const paymentStatuses = ["success", "success", "success", "failed", "success", "failed", "success", "success", "success", "success", "success", "failed"];
  const failureReasons = [null, null, null, "insufficient_funds", null, "gateway_timeout", null, null, null, null, null, "bank_decline"];

  let paymentCount = 0;
  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    // Create 3 months of payment history per customer
    for (let month = 0; month < 3; month++) {
      const paymentDate = new Date(now);
      paymentDate.setMonth(paymentDate.getMonth() - month);
      paymentDate.setDate(1 + Math.floor(Math.random() * 5));

      const status = month === 0 ? paymentStatuses[i] : "success";
      const reason = month === 0 ? failureReasons[i] : null;

      await prisma.payment.create({
        data: {
          customerId: customer.id,
          subscriptionId: subscriptions[i].id,
          amount: plans[statusConfigs[i].planIndex].amount,
          status,
          failureReason: reason,
          orderReference: `PF-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}-${i}-${month}`.toUpperCase(),
          createdAt: paymentDate,
        },
      });
      paymentCount++;
    }
  }
  console.log(`  ✓ Created ${paymentCount} payment records`);

  // Seed retry attempts for customers in grace/retry states
  const retryCustomerIndices = [2, 4, 5, 7, 11]; // Indices with grace/retry/suspended
  for (const idx of retryCustomerIndices) {
    const retryCount = statusConfigs[idx].status === "suspended" ? 3 : statusConfigs[idx].status === "retry_scheduled" ? 1 : 1;

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      const scheduledAt = new Date(now);
      scheduledAt.setDate(scheduledAt.getDate() - (retryCount - attempt) * 2);

      const strategies = ["immediate", "salary_cycle", "final_recovery"] as const;
      const reasonings = [
        "Immediate retry — temporary issues often resolve within hours",
        "Scheduled for typical Nigerian salary deposit cycle (25th-27th)",
        "Final recovery attempt — customer notified via WhatsApp and SMS",
      ];

      await prisma.retryAttempt.create({
        data: {
          subscriptionId: subscriptions[idx].id,
          attemptNumber: attempt,
          scheduledAt,
          executedAt: attempt < retryCount ? scheduledAt : null,
          status: attempt < retryCount ? "failed" : "scheduled",
          failureReason: attempt < retryCount ? "insufficient_funds" : null,
          strategy: strategies[attempt - 1],
          reasoning: reasonings[attempt - 1],
          amount: plans[statusConfigs[idx].planIndex].amount,
        },
      });
    }
  }
  console.log("  ✓ Created retry attempts");

  // Seed subscription events
  for (let i = 0; i < customers.length; i++) {
    const events: any[] = [
      {
        subscriptionId: subscriptions[i].id,
        type: "status_change",
        fromStatus: null,
        toStatus: "active",
        description: "Subscription activated",
        createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      },
    ];

    if (statusConfigs[i].status === "grace" || statusConfigs[i].status === "retry_scheduled") {
      events.push({
        subscriptionId: subscriptions[i].id,
        type: "payment_failed",
        fromStatus: "active",
        toStatus: "grace",
        description: "Payment failed — entered Grace Mode",
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      });
    }

    if (statusConfigs[i].status === "suspended") {
      events.push(
        {
          subscriptionId: subscriptions[i].id,
          type: "grace_entered",
          fromStatus: "active",
          toStatus: "grace",
          description: "Payment failed — entered Grace Mode",
          createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        },
        {
          subscriptionId: subscriptions[i].id,
          type: "service_suspended",
          fromStatus: "grace",
          toStatus: "suspended",
          description: "All retry attempts exhausted — service suspended",
          createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        }
      );
    }

    if (statusConfigs[i].status === "restored") {
      events.push(
        {
          subscriptionId: subscriptions[i].id,
          type: "grace_entered",
          fromStatus: "active",
          toStatus: "grace",
          description: "Payment failed — entered Grace Mode",
          createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          subscriptionId: subscriptions[i].id,
          type: "service_restored",
          fromStatus: "grace",
          toStatus: "restored",
          description: "Payment successful on retry — service fully restored",
          createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        }
      );
    }

    await prisma.subscriptionEvent.createMany({ data: events });
  }
  console.log("  ✓ Created subscription events");

  // Seed some notifications
  const notificationTemplates = [
    { channel: "whatsapp", type: "grace_warning", title: "Service Notice", message: "Hi {name}, your {plan} payment of ₦{amount} was not successful. Your essential services will continue for {days} days while we retry your payment." },
    { channel: "email", type: "payment_reminder", title: "Payment Reminder", message: "Dear {name}, your next {plan} payment of ₦{amount} is due on {date}. Please ensure your card has sufficient funds." },
    { channel: "sms", type: "retry_alert", title: "Payment Retry", message: "{name}, we'll retry your ₦{amount} payment today. Please ensure funds are available." },
    { channel: "whatsapp", type: "service_restored", title: "Service Restored! 🎉", message: "Great news, {name}! Your payment was successful and your full {plan} service has been restored." },
  ];

  for (const idx of [2, 4, 5, 7, 11]) {
    for (const template of notificationTemplates.slice(0, idx === 5 ? 3 : 2)) {
      const plan = plans[statusConfigs[idx].planIndex];
      await prisma.notification.create({
        data: {
          customerId: customers[idx].id,
          channel: template.channel,
          type: template.type,
          title: template.title,
          message: template.message
            .replace("{name}", customers[idx].name.split(" ")[0])
            .replace("{plan}", plan.name)
            .replace("{amount}", plan.amount.toLocaleString())
            .replace("{days}", "5")
            .replace("{date}", "July 1, 2026"),
        },
      });
    }
  }
  console.log("  ✓ Created notifications");

  // Seed webhook events
  const webhookEvents = [
    { eventType: "payment_success", payload: JSON.stringify({ transactionRef: "MOCK-TXN-001", amount: 45000, status: "success" }) },
    { eventType: "payment_failed", payload: JSON.stringify({ transactionRef: "MOCK-TXN-002", amount: 45000, status: "failed", reason: "insufficient_funds" }) },
    { eventType: "token_created", payload: JSON.stringify({ tokenKey: "MOCK-TOKEN-1003", customerEmail: "chioma.okafor@gmail.com" }) },
    { eventType: "payment_success", payload: JSON.stringify({ transactionRef: "MOCK-TXN-003", amount: 75000, status: "success" }) },
    { eventType: "payment_failed", payload: JSON.stringify({ transactionRef: "MOCK-TXN-004", amount: 25000, status: "failed", reason: "gateway_timeout" }) },
  ];

  await prisma.webhookEvent.createMany({ data: webhookEvents });
  console.log("  ✓ Created webhook events");

  console.log("\n✅ Database seeded successfully!");
  console.log(`   ${customers.length} customers`);
  console.log(`   ${plans.length} utility plans`);
  console.log(`   ${subscriptions.length} subscriptions`);
  console.log(`   ${paymentCount} payments`);
  console.log(`   Various retry attempts, events, and notifications`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
