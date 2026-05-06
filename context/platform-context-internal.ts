import { createContext, useContext } from "react";
import {
  Role, Environment, OnboardingStage, Client, Transaction, ApiKey, Webhook,
  Dispute, Wallet, VirtualAccount, ReversalRequest, TransactionLimit,
  TransactionTier, BroadcastNotification,
  ComplianceProfile, BusinessInformation, BusinessRegistrationInformation,
  BusinessPerson, ClientDocument, ClientBankAccount,
  ComplianceSectionKey, DocumentReviewStatus,
  BusinessTypeCode,
} from "@/types/platform";

export interface PlatformState {
  role: Role;
  environment: Environment;
  clients: Client[];
  transactions: Transaction[];
  apiKeys: ApiKey[];
  webhooks: Webhook[];
  disputes: Dispute[];
  wallets: Wallet[];
  virtualAccounts: VirtualAccount[];
  reversals: ReversalRequest[];
  transactionLimits: TransactionLimit[];
  transactionTiers: TransactionTier[];
  notifications: BroadcastNotification[];
  currentClientId: string;
  complianceProfiles: ComplianceProfile[];
}

export interface PlatformContextType extends PlatformState {
  setRole: (role: Role) => void;
  setEnvironment: (env: Environment) => void;
  updateClientStage: (clientId: string, stage: OnboardingStage) => void;
  updateClient: (clientId: string, updates: Partial<Client>) => void;
  addApiKey: (key: ApiKey) => void;
  revokeApiKey: (keyId: string) => void;
  addWebhook: (wh: Webhook) => void;
  removeWebhook: (whId: string) => void;
  updateWebhook: (whId: string, updates: Partial<Webhook>) => void;
  updateTransaction: (txnId: string, updates: Partial<Transaction>) => void;
  updateDispute: (dspId: string, updates: Partial<Dispute>) => void;
  addDispute: (d: Dispute) => void;
  updateReversal: (revId: string, updates: Partial<ReversalRequest>) => void;
  updateTransactionLimit: (limId: string, updates: Partial<TransactionLimit>) => void;
  updateTransactionTier: (tierId: string, updates: Partial<TransactionTier>) => void;
  assignClientToTier: (clientId: string, tierId: string) => void;
  updateVirtualAccount: (vaId: string, updates: Partial<VirtualAccount>) => void;
  addNotification: (n: BroadcastNotification) => void;
  markNotificationRead: (nId: string) => void;
  currentClient: Client | undefined;
  isOnboardingComplete: boolean;
  canAccessLive: boolean;
  unreadNotificationCount: number;
  currentCompliance: ComplianceProfile | undefined;
  getCompliance: (clientId: string) => ComplianceProfile | undefined;
  updateBusinessInformation: (clientId: string, updates: Partial<BusinessInformation>) => void;
  updateRegistration: (clientId: string, updates: Partial<BusinessRegistrationInformation>) => void;
  upsertPerson: (clientId: string, person: BusinessPerson) => void;
  removePerson: (clientId: string, personId: string) => void;
  uploadDocument: (clientId: string, doc: ClientDocument) => void;
  removeDocument: (clientId: string, docId: string) => void;
  updateBankAccount: (clientId: string, updates: Partial<ClientBankAccount>) => void;
  acceptServiceAgreement: (clientId: string, acceptedBy: string) => void;
  setBusinessType: (clientId: string, code: BusinessTypeCode) => void;
  requestGoLive: (clientId: string, requestedBy: string) => void;
  reviewSection: (clientId: string, sectionKey: ComplianceSectionKey, decision: "approved" | "rejected", comment?: string) => void;
  reviewDocument: (clientId: string, docId: string, decision: DocumentReviewStatus, comment?: string) => void;
  reviewGoLive: (clientId: string, decision: "approved" | "rejected", comment?: string) => void;
}

export const PlatformContext = createContext<PlatformContextType | null>(null);

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used within PlatformProvider");
  return ctx;
}