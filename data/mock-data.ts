import {
  Client, Transaction, ApiKey, Webhook, WebhookDelivery, Dispute, Wallet,
  VirtualAccount, AuditLog, ServiceProvider, ReversalRequest, TransactionLimit,
  TransactionTier, BroadcastNotification,
  OnboardingStage, TransactionStatus, Environment, TeamMember
} from "@/types/platform";

const NIGERIAN_BANKS = [
  "Access Bank", "GTBank", "First Bank", "UBA", "Zenith Bank",
  "Stanbic IBTC", "Fidelity Bank", "Sterling Bank", "Wema Bank",
  "Union Bank", "Polaris Bank", "Ecobank", "FCMB", "Keystone Bank"
];

const BUSINESS_TYPES = [
  "Business Name Registration", "Limited Liability Company", "Cooperative Society"
];

const PRODUCTS = [
  "Virtual Accounts", "Transfers", "Collections", "Wallets",
  "Bill Payments", "Card Issuance", "KYC/Identity", "Lending API"
];

function randomId() { return Math.random().toString(36).substring(2, 10); }
function randomDate(daysBack: number) { const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * daysBack)); return d.toISOString(); }
function randomAmount() { return Math.floor(Math.random() * 5000000) + 1000; }
function randomEl<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const NAMES = [
  "Adebayo Ogunlesi", "Chioma Nwosu", "Emeka Okafor", "Fatima Abdullahi",
  "Ibrahim Musa", "Kemi Adekunle", "Oluwaseun Bakare", "Ngozi Eze",
  "Tunde Alabi", "Yetunde Coker", "Amara Nnamdi", "Dayo Fashola",
  "Bola Tinubu", "Chiamaka Igwe", "Femi Otedola", "Grace Obi",
  "Hassan Danjuma", "Ifeoma Chukwu", "Jide Sanwo", "Lola Balogun"
];

const stages: OnboardingStage[] = [
  "draft", "submitted", "under-review", "compliance-review",
  "approved-sandbox", "sandbox-active", "go-live-requested", "active", "active",
  "active", "suspended", "rejected", "more-info-required", "live-approved",
  "sandbox-active"
];

const defaultTeam = (i: number): TeamMember[] => [
  { id: `tm-${i}-1`, email: `admin@client${i + 1}.ng`, name: NAMES[i % NAMES.length], role: "Admin", joinedAt: randomDate(90) },
  { id: `tm-${i}-2`, email: `dev@client${i + 1}.ng`, name: NAMES[(i + 3) % NAMES.length], role: "Developer", joinedAt: randomDate(60) },
];

export const mockClients: Client[] = Array.from({ length: 16 }, (_, i) => ({
  id: `client-${i + 1}`,
  businessName: [
    "PayFast Nigeria", "QuickCredit Ltd", "EazyPay Solutions", "AfriWallet Tech",
    "NairaFlow Inc", "VaultPay Africa", "TransactNG", "CashBridge Ltd",
    "PayStack Clone", "MonoAPI Ltd", "KudaPay Tech", "OPayments NG",
    "PalmPay Ltd", "Flutterwave Jr", "Carbon Finance", "FairMoney NG"
  ][i],
  rcNumber: `RC${1000000 + i * 37}`,
  businessType: BUSINESS_TYPES[i % BUSINESS_TYPES.length],
  registeredAddress: `${i + 10} Victoria Island, Lagos, Nigeria`,
  supportEmail: `support@${["payfast", "quickcredit", "eazypay", "afriwallet", "nairaflow", "vaultpay", "transactng", "cashbridge", "paystackclone", "monoapi", "kudapay", "opayments", "palmpay", "flutterjr", "carbon", "fairmoney"][i]}.ng`,
  phoneNumber: `+234${800 + i}${Math.floor(Math.random() * 9000000 + 1000000)}`,
  useCase: [
    "Payment processing for e-commerce", "Micro-lending platform", "Payroll disbursement",
    "Digital wallet services", "Bill payment aggregation", "Savings & investments",
    "Cross-border remittance", "Insurance premium collection", "School fee payments",
    "Logistics payment solution", "Subscription billing", "Marketplace payments",
    "POS terminal integration", "Mobile money services", "BNPL solution", "Salary advances"
  ][i],
  expectedVolume: `${(i + 1) * 5000} transactions/month`,
  expectedValue: `₦${((i + 1) * 50)}M/month`,
  targetUsers: `${(i + 1) * 1000} users`,
  requestedProducts: PRODUCTS.slice(0, (i % 4) + 2),
  onboardingStage: stages[i],
  onboardingSkipped: i === 0,
  onboardingCompletedSteps: i === 0 ? [] : i < 5 ? [0, 1, 2] : [0, 1, 2, 3, 4, 5, 6],
  createdAt: randomDate(90),
  updatedAt: randomDate(10),
  assignedReviewer: i % 3 === 0 ? randomEl(NAMES) : undefined,
  
  documents: [
    { id: `doc-${i}-1`, name: "Certificate of Incorporation", type: "incorporation", status: i < 5 ? "accepted" : "uploaded", uploadedAt: randomDate(60) },
    { id: `doc-${i}-2`, name: "CAC Form", type: "cac", status: i < 3 ? "accepted" : "under-review", uploadedAt: randomDate(55) },
    { id: `doc-${i}-3`, name: "Board Resolution", type: "board-resolution", status: i < 2 ? "accepted" : "uploaded", uploadedAt: randomDate(50) },
    { id: `doc-${i}-4`, name: "AML Policy Document", type: "aml-policy", status: i < 4 ? "accepted" : i === 12 ? "rejected" : "under-review", uploadedAt: randomDate(45), reviewNote: i === 12 ? "Document expired" : undefined },
  ],
  contacts: [
    { type: "business", name: NAMES[i % NAMES.length], email: `business@client${i + 1}.ng`, phone: `+2348${i}1234567` },
    { type: "compliance", name: NAMES[(i + 5) % NAMES.length], email: `compliance@client${i + 1}.ng`, phone: `+2348${i}2345678` },
    { type: "technical", name: NAMES[(i + 10) % NAMES.length], email: `tech@client${i + 1}.ng`, phone: `+2348${i}3456789` },
  ],
  notes: i % 4 === 0
    ? [{ id: `note-${i}-1`, author: "Admin", content: "Initial review completed", createdAt: randomDate(20) }]
    : [],
  teamMembers: defaultTeam(i),
  onboardingRequiredForLive: true,
  webhookAlertsEnabled: true,
  transactionAlertsEnabled: true,
  ipWhitelist: [],
  webhookRetryCount: 3,
  rateLimitPerMinute: 100,
  brandColor: "#6C5CE7",
  displayName: "",
  logoUrl: "",
}));

const TX_STATUSES: TransactionStatus[] = ["successful", "successful", "successful", "pending", "failed", "reversed"];

export const mockTransactions: Transaction[] = Array.from({ length: 120 }, (_, i) => {
  const client = mockClients[i % mockClients.length];
  const status = TX_STATUSES[i % TX_STATUSES.length];
  return {
    id: `txn-${randomId()}`,
    clientId: client.id,
    clientName: client.businessName,
    type: (["credit", "debit", "transfer"] as const)[i % 3],
    amount: randomAmount(),
    currency: "NGN",
    status,
    senderName: randomEl(NAMES),
    senderBank: randomEl(NIGERIAN_BANKS),
    recipientName: randomEl(NAMES),
    recipientBank: randomEl(NIGERIAN_BANKS),
    reference: `REF-${Date.now()}-${randomId()}`,
    narration: ["Payment for services", "Salary credit", "Transfer", "Bill payment", "Refund", "Subscription"][i % 6],
    createdAt: randomDate(30),
    completedAt: status === "successful" ? randomDate(29) : undefined,
    environment: (i % 5 === 0 ? "sandbox" : "live") as Environment,
  };
});

export const mockApiKeys: ApiKey[] = mockClients.slice(0, 8).flatMap((c) => [
  {
    id: `key-${c.id}-sbx-secret`,
    clientId: c.id,
    name: "Sandbox Secret Key",
    key: `sk_test_${randomId()}${randomId()}`,
    environment: "sandbox" as Environment,
    createdAt: c.createdAt,
    lastUsed: randomDate(2),
    isActive: true,
  },
  {
    id: `key-${c.id}-sbx-pub`,
    clientId: c.id,
    name: "Sandbox Public Key",
    key: `pk_test_${randomId()}${randomId()}`,
    environment: "sandbox" as Environment,
    createdAt: c.createdAt,
    lastUsed: randomDate(1),
    isActive: true,
  },
]);

export const mockWebhooks: Webhook[] = mockClients.slice(0, 6).map((c, i) => ({
  id: `wh-${c.id}`,
  clientId: c.id,
  url: `https://api.${c.businessName.toLowerCase().replace(/\s+/g, '')}.ng/webhooks`,
  events: ["transaction.successful", "transaction.failed", "transfer.completed"].slice(0, i % 3 + 1),
  isActive: i !== 4,
  createdAt: randomDate(45),
  lastDelivery: randomDate(1),
  successRate: 85 + Math.random() * 15,
}));

export const mockWebhookDeliveries: WebhookDelivery[] = mockWebhooks.flatMap(wh =>
  Array.from({ length: 5 }, (_, i) => ({
    id: `whd-${wh.id}-${i}`,
    webhookId: wh.id,
    event: randomEl(["transaction.successful", "transaction.failed", "transfer.completed"]),
    status: (["delivered", "delivered", "delivered", "failed", "pending"] as const)[i],
    statusCode: i < 3 ? 200 : i === 3 ? 500 : undefined,
    attemptedAt: randomDate(5),
    responseTime: Math.floor(Math.random() * 500) + 50,
  }))
);

export const mockDisputes: Dispute[] = Array.from({ length: 12 }, (_, i) => {
  const client = mockClients[i % mockClients.length];
  return {
    id: `dsp-${randomId()}`,
    transactionId: mockTransactions[i].id,
    clientId: client.id,
    clientName: client.businessName,
    reason: ["Unauthorized transaction", "Double charge", "Service not delivered", "Wrong amount", "Fraudulent activity", "Chargeback"][i % 6],
    status: (["open", "under-review", "resolved", "rejected"] as const)[i % 4],
    amount: randomAmount(),
    currency: "NGN",
    createdAt: randomDate(20),
    resolvedAt: i % 4 === 2 ? randomDate(5) : undefined,
    assignedTo: i % 3 === 0 ? randomEl(NAMES) : undefined,
  };
});

export const mockWallets: Wallet[] = Array.from({ length: 25 }, (_, i) => ({
  id: `wal-${randomId()}`,
  clientId: mockClients[i % mockClients.length].id,
  customerName: NAMES[i % NAMES.length],
  accountNumber: `${2000000000 + i * 13}`,
  bankName: randomEl(NIGERIAN_BANKS),
  balance: randomAmount(),
  currency: "NGN",
  status: (["active", "active", "active", "frozen", "closed"] as const)[i % 5],
  createdAt: randomDate(60),
}));

export const mockVirtualAccounts: VirtualAccount[] = Array.from({ length: 12 }, (_, i) => ({
  id: `va-${randomId()}`,
  clientId: mockClients[i % mockClients.length].id,
  accountName: `Rex VA - ${mockClients[i % mockClients.length].businessName}`,
  accountNumber: `${7700000000 + i * 17}`,
  bankName: "Rex MFB",
  balance: Math.floor(Math.random() * 15000000) + 50000,
  currency: "NGN",
  walletReference: `REX-WAL-${randomId()}`,
  status: (["active", "active", "active", "inactive"] as const)[i % 4],
  createdAt: randomDate(45),
}));

export const mockAuditLogs: AuditLog[] = Array.from({ length: 50 }, (_, i) => ({
  id: `audit-${randomId()}`,
  actor: randomEl(NAMES),
  action: randomEl(["login", "api_key_generated", "application_approved", "document_uploaded", "transfer_initiated", "webhook_created", "role_changed", "limit_updated", "dispute_resolved", "client_suspended"]),
  resource: randomEl(["client", "transaction", "api_key", "webhook", "document", "dispute", "wallet"]),
  details: `Action performed on ${randomEl(mockClients).businessName}`,
  ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  createdAt: randomDate(30),
}));

export const mockServiceProviders: ServiceProvider[] = [
  { id: "sp-1", name: "NIBSS", type: "Settlement", status: "active", uptime: 99.95, lastChecked: randomDate(0), responseTime: 120 },
  { id: "sp-2", name: "Rex Payment Gateway", type: "Payment Gateway", status: "active", uptime: 99.9, lastChecked: randomDate(0), responseTime: 85 },
  { id: "sp-3", name: "Rex MFB", type: "Virtual Account", status: "active", uptime: 99.8, lastChecked: randomDate(0), responseTime: 150 },
  { id: "sp-4", name: "Flutterwave", type: "Payment Gateway", status: "degraded", uptime: 98.5, lastChecked: randomDate(0), responseTime: 350 },
  { id: "sp-5", name: "Providus Bank", type: "Settlement", status: "active", uptime: 99.7, lastChecked: randomDate(0), responseTime: 200 },
  { id: "sp-6", name: "VerifyMe", type: "Identity", status: "down", uptime: 95.2, lastChecked: randomDate(0), responseTime: 0 },
  { id: "sp-7", name: "Smile Identity", type: "Identity", status: "active", uptime: 99.6, lastChecked: randomDate(0), responseTime: 180 },
];

export const mockReversals: ReversalRequest[] = Array.from({ length: 8 }, (_, i) => ({
  id: `rev-${randomId()}`,
  transactionId: mockTransactions[i * 3].id,
  clientName: mockTransactions[i * 3].clientName,
  amount: mockTransactions[i * 3].amount,
  currency: "NGN",
  reason: randomEl(["Customer request", "Failed delivery", "Duplicate transaction", "System error"]),
  status: (["pending", "pending", "approved", "rejected"] as const)[i % 4],
  createdAt: randomDate(10),
}));

export const mockTransactionTiers: TransactionTier[] = Array.from({ length: 7 }, (_, i) => ({
  id: `tier-${i + 1}`,
  name: `Tier ${i + 1}`,
  level: i + 1,
  dailyLimit: (i + 1) * 5000000,
  transactionLimit: (i + 1) * 500000,
  monthlyLimit: (i + 1) * 100000000,
  currency: "NGN",
}));

export const mockTransactionLimits: TransactionLimit[] = mockClients.slice(0, 8).map((c, i) => ({
  id: `lim-${c.id}`,
  clientId: c.id,
  clientName: c.businessName,
  tierId: `tier-${(i % 7) + 1}`,
  dailyLimit: ((i % 7) + 1) * 5000000,
  transactionLimit: ((i % 7) + 1) * 500000,
  monthlyLimit: ((i % 7) + 1) * 100000000,
  currency: "NGN",
}));

export const mockBroadcastNotifications: BroadcastNotification[] = [
  { id: "notif-1", title: "Scheduled Maintenance", message: "System maintenance scheduled for Sunday 2am-4am WAT.", createdAt: randomDate(2), author: "Rex MFB Admin", read: false },
  { id: "notif-2", title: "New API Version Released", message: "API v2.1 is now available with improved transfer speeds.", createdAt: randomDate(5), author: "Rex MFB Admin", read: false },
  { id: "notif-3", title: "Compliance Update", message: "New KYC requirements effective from next month.", createdAt: randomDate(10), author: "Rex MFB Admin", read: true },
];

export const API_ENDPOINTS = [
  { method: "POST", path: "/v1/transfers", name: "Initiate Transfer", description: "Send money to a bank account" },
  { method: "GET", path: "/v1/transfers/:id", name: "Get Transfer", description: "Retrieve transfer details" },
  { method: "POST", path: "/v1/virtual-accounts", name: "Create Rex Virtual Account", description: "Create a new Rex virtual account" },
  { method: "GET", path: "/v1/virtual-accounts", name: "List Rex Virtual Accounts", description: "List all Rex virtual accounts" },
  { method: "POST", path: "/v1/wallets", name: "Create Wallet", description: "Create a new wallet" },
  { method: "GET", path: "/v1/wallets/:id/balance", name: "Get Wallet Balance", description: "Check wallet balance" },
  { method: "POST", path: "/v1/collections", name: "Initialize Collection", description: "Create a payment collection" },
  { method: "GET", path: "/v1/transactions", name: "List Transactions", description: "Retrieve all transactions" },
  { method: "POST", path: "/v1/identity/verify-bvn", name: "Verify BVN", description: "Verify Bank Verification Number" },
  { method: "POST", path: "/v1/webhooks", name: "Create Webhook", description: "Register a webhook endpoint" },
];
