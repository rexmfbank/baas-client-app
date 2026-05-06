export type Role =
  | "client"
  | "rex-mfb";

export type Environment = "sandbox" | "live";

export type PortalType = "client" | "admin";

export type OnboardingStage =
  | "draft"
  | "submitted"
  | "under-review"
  | "more-info-required"
  | "compliance-review"
  
  | "approved-sandbox"
  | "sandbox-active"
  | "go-live-requested"
  | "live-approved"
  | "active"
  | "suspended"
  | "rejected";

export type TransactionStatus = "pending" | "successful" | "failed" | "reversed";
export type DisputeStatus = "open" | "under-review" | "resolved" | "rejected";
export type DocumentStatus = "uploaded" | "under-review" | "accepted" | "rejected";
export type ServiceStatus = "active" | "degraded" | "down";


export interface Client {
  id: string;
  businessName: string;
  rcNumber: string;
  businessType: string;
  registeredAddress: string;
  supportEmail: string;
  phoneNumber: string;
  useCase: string;
  expectedVolume: string;
  expectedValue: string;
  targetUsers: string;
  requestedProducts: string[];
  onboardingStage: OnboardingStage;
  onboardingSkipped: boolean;
  onboardingCompletedSteps: number[];
  createdAt: string;
  updatedAt: string;
  assignedReviewer?: string;
  
  documents: ComplianceDocument[];
  contacts: Contact[];
  notes: ReviewNote[];
  // Branding
  brandColor?: string;
  displayName?: string;
  logoUrl?: string;
  // Team
  teamMembers: TeamMember[];
  // Settings
  onboardingRequiredForLive: boolean;
  webhookAlertsEnabled: boolean;
  transactionAlertsEnabled: boolean;
  ipWhitelist: string[];
  webhookRetryCount: number;
  rateLimitPerMinute: number;
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: "Admin" | "Developer" | "Viewer";
  joinedAt: string;
}

export interface ComplianceDocument {
  id: string;
  name: string;
  type: string;
  status: DocumentStatus;
  uploadedAt: string;
  reviewNote?: string;
}

export interface Contact {
  type: "business" | "compliance" | "technical";
  name: string;
  email: string;
  phone: string;
}

export interface ReviewNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  clientId: string;
  clientName: string;
  type: "credit" | "debit" | "transfer";
  amount: number;
  currency: string;
  status: TransactionStatus;
  senderName: string;
  senderBank: string;
  recipientName: string;
  recipientBank: string;
  reference: string;
  narration: string;
  createdAt: string;
  completedAt?: string;
  environment: Environment;
  virtualAccountId?: string;
}

export interface ApiKey {
  id: string;
  clientId: string;
  name: string;
  key: string;
  environment: Environment;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

export interface Webhook {
  id: string;
  clientId: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  lastDelivery?: string;
  successRate: number;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  status: "delivered" | "failed" | "pending";
  statusCode?: number;
  attemptedAt: string;
  responseTime?: number;
}

export interface Dispute {
  id: string;
  transactionId: string;
  clientId: string;
  clientName: string;
  reason: string;
  status: DisputeStatus;
  amount: number;
  currency: string;
  createdAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  evidence?: string[];
}

export interface Wallet {
  id: string;
  clientId: string;
  customerName: string;
  accountNumber: string;
  bankName: string;
  balance: number;
  currency: string;
  status: "active" | "frozen" | "closed";
  createdAt: string;
}

export interface VirtualAccount {
  id: string;
  clientId: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  balance: number;
  currency: string;
  walletReference: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  type: string;
  status: ServiceStatus;
  uptime: number;
  lastChecked: string;
  responseTime: number;
}

export interface ReversalRequest {
  id: string;
  transactionId: string;
  clientName: string;
  amount: number;
  currency: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface TransactionTier {
  id: string;
  name: string;
  level: number; // 1-7
  dailyLimit: number;
  transactionLimit: number;
  monthlyLimit: number;
  currency: string;
}

export interface TransactionLimit {
  id: string;
  clientId: string;
  clientName: string;
  tierId: string;
  dailyLimit: number;
  transactionLimit: number;
  monthlyLimit: number;
  currency: string;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  author: string;
  read: boolean;
}

export const ROLE_LABELS: Record<Role, string> = {
  "client": "Client",
  "rex-mfb": "Rex MFB",
};

export const ROLE_PORTAL: Record<Role, PortalType> = {
  "client": "client",
  "rex-mfb": "admin",
};

export const ONBOARDING_STAGE_LABELS: Record<OnboardingStage, string> = {
  draft: "Draft",
  submitted: "Submitted",
  "under-review": "Under Review",
  "more-info-required": "More Info Required",
  "compliance-review": "Compliance Review",
  
  "approved-sandbox": "Approved (Sandbox)",
  "sandbox-active": "Sandbox Active",
  "go-live-requested": "Go-Live Requested",
  "live-approved": "Live Approved",
  active: "Active",
  suspended: "Suspended",
  rejected: "Rejected",
};

/* ───────────────────────── Compliance Module ───────────────────────── */

export type BusinessTypeCode = "BNR" | "LLC" | "COOP";

export type ComplianceOverallStatus =
  | "not_started" | "in_progress" | "submitted" | "approved" | "rejected";

export type SectionStatus =
  | "not_started" | "in_progress" | "submitted" | "approved" | "rejected";

export type DocumentReviewStatus =
  | "pending_review" | "approved" | "rejected" | "replaced";

export type GoLiveRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export type ComplianceSectionKey =
  | "documents" | "business" | "registration" | "people"
  | "account" | "service_agreement" | "summary";

export interface DocumentRequirement {
  id: string;
  businessTypeCode: BusinessTypeCode;
  sectionKey: Exclude<ComplianceSectionKey, "summary" | "service_agreement" | "business">;
  documentKey: string;
  documentName: string;
  description?: string;
  isRequired: boolean;
  allowedFileTypes: string[];
  maxFileSizeMb: number;
  maxAgeMonths?: number;
  requiresExpiryDate: boolean;
  inputType?: "file" | "text";
  textPlaceholder?: string;
}

export interface ClientDocument {
  id: string;
  requirementId: string;
  fileName: string;
  fileType: string;
  fileSizeMb: number;
  documentExpiryDate?: string;
  status: DocumentReviewStatus;
  reviewerComment?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  uploadedAt: string;
}

export interface BusinessInformation {
  tradingName: string;
  legalBusinessName: string;
  businessDescription: string;
  industry: string;
  category: string;
  staffSize?: string;
  annualProjectedSalesVolume?: number;
  businessEmail: string;
  businessPhoneCode: string;
  businessPhoneNumber: string;
  hasSocialMedia?: boolean;
  socialMediaLinks?: { website?: string; linkedin?: string; instagram?: string; x?: string };
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  lga?: string;
  country: string;
  officeSameAsRegistered?: boolean;
  status: SectionStatus;
  reviewerComment?: string;
}

export interface BusinessRegistrationInformation {
  registrationNumber: string;
  taxIdentificationNumber: string;
  nepzaNumber?: string;
  registrationCountry: string;
  registrationState?: string;
  status: SectionStatus;
  reviewerComment?: string;
}

export type PersonRole = "owner" | "director" | "shareholder" | "authorized_representative" | "signatory";

export interface BusinessPerson {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  role: PersonRole;
  ownershipPercentage?: number;
  isPrimaryRepresentative: boolean;
  idDocumentType?: "national_id" | "passport" | "drivers_license" | "voters_card";
  idDocumentFileName?: string;
  bvnConsentGiven: boolean;
  bvnVerified: boolean;
  addressLine1?: string;
  city?: string;
  state?: string;
  country?: string;
  proofOfAddressFileName?: string;
  status: SectionStatus;
  reviewerComment?: string;
}

export interface ClientBankAccount {
  bankName: string;
  bankCode?: string;
  accountNumber: string;
  accountName?: string;
  verificationStatus: "pending" | "verified" | "failed";
  isSkipped: boolean;
  reviewerComment?: string;
}

export interface ServiceAgreementAcceptance {
  agreementVersion: string;
  acceptedAt?: string;
  acceptedBy?: string;
  status: "pending" | "accepted" | "revoked";
}

export interface ComplianceSection {
  key: ComplianceSectionKey;
  name: string;
  status: SectionStatus;
  requiredItemCount: number;
  completedItemCount: number;
  approvedItemCount: number;
  reviewerComment?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface GoLiveRequest {
  id: string;
  status: GoLiveRequestStatus;
  requestedBy: string;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
}

export interface ComplianceProfile {
  id: string;
  clientId: string;
  businessTypeCode: BusinessTypeCode;
  overallStatus: ComplianceOverallStatus;
  completionPercentage: number;
  approvedPercentage: number;
  goLiveEligible: boolean;
  sections: ComplianceSection[];
  businessInformation: BusinessInformation;
  registration: BusinessRegistrationInformation;
  people: BusinessPerson[];
  documents: ClientDocument[];
  bankAccount: ClientBankAccount;
  serviceAgreement: ServiceAgreementAcceptance;
  goLiveRequests: GoLiveRequest[];
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const BUSINESS_TYPE_LABELS: Record<BusinessTypeCode, string> = {
  BNR: "Business Name Registration",
  LLC: "Limited Liability Company",
  COOP: "Cooperative Society",
};

export const COMPLIANCE_SECTION_LABELS: Record<ComplianceSectionKey, string> = {
  documents: "Documents Checklist",
  business: "Business Information",
  registration: "Business Registration",
  people: "People",
  account: "Corporate Bank Account",
  service_agreement: "Service Agreement",
  summary: "Summary",
};
