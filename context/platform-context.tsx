import React, { useState, useCallback } from "react";
import {
  Role, Environment, OnboardingStage, Client, Transaction, ApiKey, Webhook,
  Dispute, VirtualAccount, ReversalRequest, TransactionLimit,
  TransactionTier, BroadcastNotification,
  ComplianceProfile, BusinessInformation, BusinessRegistrationInformation,
  BusinessPerson, ClientDocument, ClientBankAccount, ComplianceSectionKey, SectionStatus, DocumentReviewStatus,
  BusinessTypeCode,
} from "@/types/platform";
import {
  mockClients, mockTransactions, mockApiKeys, mockWebhooks,
  mockDisputes, mockWallets, mockVirtualAccounts, mockReversals, mockTransactionLimits,
  mockTransactionTiers, mockBroadcastNotifications
} from "@/data/mock-data";
import { seedComplianceProfiles, getDocumentRequirements } from "@/data/compliance-data";
import { PlatformContext, PlatformState } from "./platform-context-internal";
export { usePlatform } from "./platform-context-internal";

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PlatformState>({
    role: "client",
    environment: "sandbox",
    clients: mockClients,
    transactions: mockTransactions,
    apiKeys: mockApiKeys,
    webhooks: mockWebhooks,
    disputes: mockDisputes,
    wallets: mockWallets,
    virtualAccounts: mockVirtualAccounts,
    reversals: mockReversals,
    transactionLimits: mockTransactionLimits,
    transactionTiers: mockTransactionTiers,
    notifications: mockBroadcastNotifications,
    currentClientId: "client-1",
    complianceProfiles: seedComplianceProfiles(mockClients.map(c => c.id)),
  });

  const setRole = useCallback((role: Role) => setState(s => ({ ...s, role })), []);
  const setEnvironment = useCallback((environment: Environment) => setState(s => ({ ...s, environment })), []);

  const updateClientStage = useCallback((clientId: string, stage: OnboardingStage) => {
    setState(s => ({
      ...s,
      clients: s.clients.map(c => c.id === clientId ? { ...c, onboardingStage: stage, updatedAt: new Date().toISOString() } : c)
    }));
  }, []);

  const updateClient = useCallback((clientId: string, updates: Partial<Client>) => {
    setState(s => ({
      ...s,
      clients: s.clients.map(c => c.id === clientId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)
    }));
  }, []);

  const addApiKey = useCallback((key: ApiKey) => {
    setState(s => ({ ...s, apiKeys: [...s.apiKeys, key] }));
  }, []);

  const revokeApiKey = useCallback((keyId: string) => {
    setState(s => ({ ...s, apiKeys: s.apiKeys.map(k => k.id === keyId ? { ...k, isActive: false } : k) }));
  }, []);

  const addWebhook = useCallback((wh: Webhook) => {
    setState(s => ({ ...s, webhooks: [...s.webhooks, wh] }));
  }, []);

  const removeWebhook = useCallback((whId: string) => {
    setState(s => ({ ...s, webhooks: s.webhooks.filter(w => w.id !== whId) }));
  }, []);

  const updateWebhook = useCallback((whId: string, updates: Partial<Webhook>) => {
    setState(s => ({ ...s, webhooks: s.webhooks.map(w => w.id === whId ? { ...w, ...updates } : w) }));
  }, []);

  const updateTransaction = useCallback((txnId: string, updates: Partial<Transaction>) => {
    setState(s => ({ ...s, transactions: s.transactions.map(t => t.id === txnId ? { ...t, ...updates } : t) }));
  }, []);

  const updateDispute = useCallback((dspId: string, updates: Partial<Dispute>) => {
    setState(s => ({ ...s, disputes: s.disputes.map(d => d.id === dspId ? { ...d, ...updates } : d) }));
  }, []);

  const addDispute = useCallback((d: Dispute) => {
    setState(s => ({ ...s, disputes: [...s.disputes, d] }));
  }, []);

  const updateReversal = useCallback((revId: string, updates: Partial<ReversalRequest>) => {
    setState(s => ({ ...s, reversals: s.reversals.map(r => r.id === revId ? { ...r, ...updates } : r) }));
  }, []);

  const updateTransactionLimit = useCallback((limId: string, updates: Partial<TransactionLimit>) => {
    setState(s => ({ ...s, transactionLimits: s.transactionLimits.map(l => l.id === limId ? { ...l, ...updates } : l) }));
  }, []);

  const updateTransactionTier = useCallback((tierId: string, updates: Partial<TransactionTier>) => {
    setState(s => ({ ...s, transactionTiers: s.transactionTiers.map(t => t.id === tierId ? { ...t, ...updates } : t) }));
  }, []);

  const assignClientToTier = useCallback((clientId: string, tierId: string) => {
    setState(s => {
      const tier = s.transactionTiers.find(t => t.id === tierId);
      if (!tier) return s;
      const client = s.clients.find(c => c.id === clientId);
      if (!client) return s;
      return {
        ...s,
        transactionLimits: s.transactionLimits.some(l => l.clientId === clientId)
          ? s.transactionLimits.map(l => l.clientId === clientId ? { ...l, tierId, dailyLimit: tier.dailyLimit, transactionLimit: tier.transactionLimit, monthlyLimit: tier.monthlyLimit } : l)
          : [...s.transactionLimits, { id: `lim-${clientId}`, clientId, clientName: client.businessName, tierId, dailyLimit: tier.dailyLimit, transactionLimit: tier.transactionLimit, monthlyLimit: tier.monthlyLimit, currency: "NGN" }],
      };
    });
  }, []);

  const updateVirtualAccount = useCallback((vaId: string, updates: Partial<VirtualAccount>) => {
    setState(s => ({ ...s, virtualAccounts: s.virtualAccounts.map(va => va.id === vaId ? { ...va, ...updates } : va) }));
  }, []);

  const addNotification = useCallback((n: BroadcastNotification) => {
    setState(s => ({ ...s, notifications: [n, ...s.notifications] }));
  }, []);

  const markNotificationRead = useCallback((nId: string) => {
    setState(s => ({ ...s, notifications: s.notifications.map(n => n.id === nId ? { ...n, read: true } : n) }));
  }, []);

  /* ------------------------ Compliance helpers ------------------------ */

  const recomputeProfile = (p: ComplianceProfile): ComplianceProfile => {
    const reqs = getDocumentRequirements(p.businessTypeCode).filter(r => r.isRequired);
    const totalRequired = reqs.length + 5; // business, registration, people, account, agreement
    const sectionStatuses: SectionStatus[] = [
      p.businessInformation.status,
      p.registration.status,
      p.people[0]?.status || "not_started",
      p.bankAccount.verificationStatus === "verified" ? "approved"
        : p.bankAccount.accountNumber ? "submitted" : "not_started",
      p.serviceAgreement.status === "accepted" ? "approved" : "not_started",
    ];
    const completedSections = sectionStatuses.filter(s => s !== "not_started").length;
    const approvedSections = sectionStatuses.filter(s => s === "approved").length;
    const completedDocs = p.documents.filter(d =>
      reqs.some(r => r.id === d.requirementId) && d.status !== "replaced"
    ).length;
    const approvedDocs = p.documents.filter(d =>
      reqs.some(r => r.id === d.requirementId) && d.status === "approved"
    ).length;

    const completionPercentage = Math.min(100, Math.round(((completedDocs + completedSections) / totalRequired) * 100));
    const approvedPercentage = Math.min(100, Math.round(((approvedDocs + approvedSections) / totalRequired) * 100));
    const goLiveEligible = approvedPercentage >= 100;
    const overallStatus = completionPercentage === 0 ? "not_started"
      : goLiveEligible ? "approved"
      : completionPercentage >= 100 ? "submitted"
      : "in_progress";
    return {
      ...p, completionPercentage, approvedPercentage, goLiveEligible,
      overallStatus, updatedAt: new Date().toISOString(),
    };
  };

  const updateProfile = (clientId: string, mutator: (p: ComplianceProfile) => ComplianceProfile) => {
    setState(s => ({
      ...s,
      complianceProfiles: s.complianceProfiles.map(p =>
        p.clientId === clientId ? recomputeProfile(mutator(p)) : p
      ),
    }));
  };

  const getCompliance = useCallback(
    (clientId: string) => state.complianceProfiles.find(p => p.clientId === clientId),
    [state.complianceProfiles]
  );

  const updateBusinessInformation = useCallback((clientId: string, updates: Partial<BusinessInformation>) => {
    updateProfile(clientId, p => ({
      ...p,
      businessInformation: { ...p.businessInformation, ...updates, status: updates.status || (p.businessInformation.status === "approved" ? "in_progress" : "in_progress") },
    }));
  }, []);

  const updateRegistration = useCallback((clientId: string, updates: Partial<BusinessRegistrationInformation>) => {
    updateProfile(clientId, p => ({
      ...p,
      registration: { ...p.registration, ...updates, status: updates.status || "in_progress" },
    }));
  }, []);

  const upsertPerson = useCallback((clientId: string, person: BusinessPerson) => {
    updateProfile(clientId, p => {
      const exists = p.people.some(x => x.id === person.id);
      const people = exists ? p.people.map(x => x.id === person.id ? person : x) : [...p.people, person];
      return { ...p, people };
    });
  }, []);

  const removePerson = useCallback((clientId: string, personId: string) => {
    updateProfile(clientId, p => ({ ...p, people: p.people.filter(x => x.id !== personId) }));
  }, []);

  const uploadDocument = useCallback((clientId: string, doc: ClientDocument) => {
    updateProfile(clientId, p => {
      // Mark previous doc for the same requirement as replaced
      const documents = p.documents.map(d =>
        d.requirementId === doc.requirementId && d.status !== "replaced"
          ? { ...d, status: "replaced" as DocumentReviewStatus } : d
      );
      return { ...p, documents: [...documents, doc] };
    });
  }, []);

  const removeDocument = useCallback((clientId: string, docId: string) => {
    updateProfile(clientId, p => ({ ...p, documents: p.documents.filter(d => d.id !== docId) }));
  }, []);

  const updateBankAccount = useCallback((clientId: string, updates: Partial<ClientBankAccount>) => {
    updateProfile(clientId, p => ({ ...p, bankAccount: { ...p.bankAccount, ...updates } }));
  }, []);

  const acceptServiceAgreement = useCallback((clientId: string, acceptedBy: string) => {
    updateProfile(clientId, p => ({
      ...p,
      serviceAgreement: {
        agreementVersion: p.serviceAgreement.agreementVersion,
        status: "accepted",
        acceptedAt: new Date().toISOString(),
        acceptedBy,
      },
    }));
  }, []);

  const setBusinessType = useCallback((clientId: string, code: BusinessTypeCode) => {
    updateProfile(clientId, p => ({ ...p, businessTypeCode: code, documents: [] }));
  }, []);

  const requestGoLive = useCallback((clientId: string, requestedBy: string) => {
    updateProfile(clientId, p => ({
      ...p,
      goLiveRequests: [
        ...p.goLiveRequests,
        { id: `glr-${Date.now()}`, status: "pending", requestedBy, requestedAt: new Date().toISOString() },
      ],
    }));
  }, []);

  const reviewSection = useCallback((clientId: string, sectionKey: ComplianceSectionKey, decision: "approved" | "rejected", comment?: string) => {
    updateProfile(clientId, p => {
      const next = { ...p };
      const status: SectionStatus = decision;
      const reviewedAt = new Date().toISOString();
      if (sectionKey === "business") next.businessInformation = { ...p.businessInformation, status, reviewerComment: comment };
      if (sectionKey === "registration") next.registration = { ...p.registration, status, reviewerComment: comment };
      if (sectionKey === "people") next.people = p.people.map(person => ({ ...person, status, reviewerComment: comment }));
      if (sectionKey === "account") next.bankAccount = { ...p.bankAccount, verificationStatus: decision === "approved" ? "verified" : "failed", reviewerComment: comment };
      next.sections = p.sections.map(s => s.key === sectionKey ? { ...s, status, reviewerComment: comment, reviewedAt } : s);
      return next;
    });
  }, []);

  const reviewDocument = useCallback((clientId: string, docId: string, decision: DocumentReviewStatus, comment?: string) => {
    updateProfile(clientId, p => ({
      ...p,
      documents: p.documents.map(d =>
        d.id === docId ? { ...d, status: decision, reviewerComment: comment, reviewedAt: new Date().toISOString(), reviewedBy: "Rex MFB Reviewer" } : d
      ),
    }));
  }, []);

  const reviewGoLive = useCallback((clientId: string, decision: "approved" | "rejected", comment?: string) => {
    updateProfile(clientId, p => {
      const goLiveRequests = p.goLiveRequests.length > 0
        ? p.goLiveRequests.map((r, i) =>
            i === p.goLiveRequests.length - 1
              ? { ...r, status: decision as any, reviewedBy: "Rex MFB Reviewer", reviewedAt: new Date().toISOString(), reviewComment: comment }
              : r
          )
        : p.goLiveRequests;
      return { ...p, goLiveRequests };
    });
    // Mirror to client onboarding stage for env switching
    if (decision === "approved") {
      setState(s => ({
        ...s,
        clients: s.clients.map(c => c.id === clientId ? { ...c, onboardingStage: "live-approved", onboardingCompletedSteps: [0,1,2,3,4,5,6] } : c),
      }));
    }
  }, []);

  const currentClient = state.clients.find(c => c.id === state.currentClientId);
  const currentCompliance = state.complianceProfiles.find(p => p.clientId === state.currentClientId);

  const isOnboardingComplete = currentCompliance
    ? currentCompliance.goLiveEligible
    : false;

  const canAccessLive = currentClient
    ? (currentCompliance?.goLiveEligible &&
       currentCompliance.goLiveRequests.some(r => r.status === "approved")) ||
      !currentClient.onboardingRequiredForLive
    : false;

  const unreadNotificationCount = state.notifications.filter(n => !n.read).length;

  return (
    <PlatformContext.Provider value={{
      ...state,
      setRole, setEnvironment, updateClientStage, updateClient,
      addApiKey, revokeApiKey, addWebhook, removeWebhook, updateWebhook,
      updateTransaction, updateDispute, addDispute,
      updateReversal, updateTransactionLimit, updateTransactionTier,
      assignClientToTier, updateVirtualAccount,
      addNotification, markNotificationRead,
      currentClient, isOnboardingComplete, canAccessLive, unreadNotificationCount,
      currentCompliance, getCompliance,
      updateBusinessInformation, updateRegistration,
      upsertPerson, removePerson,
      uploadDocument, removeDocument,
      updateBankAccount, acceptServiceAgreement, setBusinessType,
      requestGoLive, reviewSection, reviewDocument, reviewGoLive,
    }}>
      {children}
    </PlatformContext.Provider>
  );
}
