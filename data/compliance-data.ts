import {
  BusinessTypeCode, ComplianceProfile, ComplianceSection, DocumentRequirement,
  COMPLIANCE_SECTION_LABELS,
} from "@/types/platform";

/* ------------------------ Document Requirements ------------------------ */

const DOC_DEFAULTS = {
  allowedFileTypes: ["pdf", "jpg", "jpeg", "png"],
  maxFileSizeMb: 5,
};

function req(
  businessTypeCode: BusinessTypeCode,
  sectionKey: DocumentRequirement["sectionKey"],
  documentKey: string,
  documentName: string,
  isRequired = true,
  extras: Partial<DocumentRequirement> = {}
): DocumentRequirement {
  return {
    id: `${businessTypeCode}-${documentKey}`,
    businessTypeCode,
    sectionKey,
    documentKey,
    documentName,
    isRequired,
    requiresExpiryDate: false,
    ...DOC_DEFAULTS,
    ...extras,
  };
}

export const DOCUMENT_REQUIREMENTS: DocumentRequirement[] = [
  // 1. Business Name Registration
  req("BNR", "registration", "application_for_registration", "Application for Registration"),
  req("BNR", "registration", "cac_certificate", "CAC Certificate"),
  req("BNR", "registration", "utility_bill", "Utility Bill", true, { maxAgeMonths: 3 }),

  // 2. Limited Liability Company
  req("LLC", "registration", "memorandum_and_articles", "Memorandum and Articles of Association"),
  req("LLC", "registration", "cac_certificate_of_registration", "CAC Certificate of Registration"),
  req("LLC", "registration", "utility_bill", "Utility Bill", true, { maxAgeMonths: 3 }),
  req("LLC", "registration", "form_co2_allotment_of_shares", "Form CO2: Allotment of Shares"),
  req("LLC", "registration", "form_co7_particulars_of_directors_or_status_report", "Form CO7: Particulars of Directors or Status Report"),
  req("LLC", "registration", "memorandum_of_association", "Memorandum of Association"),
  req("LLC", "registration", "board_resolution", "Board Resolution"),

  // 3. Cooperative Society
  req("COOP", "registration", "certificate_of_registration", "Certificate of Registration / CAC Registration Certificate"),
  req("COOP", "registration", "cooperative_license", "Cooperative License", true, { requiresExpiryDate: true }),
  req("COOP", "registration", "constitution_of_society", "Copy of Constitution of the Society"),
  req("COOP", "account", "account_opening_resolution", "Signed Resolution / Letter Authorizing Account Opening and Mandate"),
  // Per-signatory documents (people section)
  req("COOP", "people", "signatory_passport_photographs", "Two to Three Recent Passport Photographs per Signatory"),
  req("COOP", "people", "signatory_valid_id", "Valid ID for Signatories (National ID / Passport / Driver's License)", true, { requiresExpiryDate: true }),
  req("COOP", "people", "signatory_utility_bill", "Recent Utility Bill per Signatory", true, { maxAgeMonths: 3 }),
  req("COOP", "people", "signatory_bvn", "BVN of All Signatories", true, {
    inputType: "text",
    textPlaceholder: "Enter each 11-digit BVN, one per line (one per signatory)",
  }),
  req("COOP", "people", "director_names", "Director / Executive Names", true, {
    inputType: "text",
    textPlaceholder: "Enter each director / executive name, one per line",
  }),
];

export function getDocumentRequirements(code: BusinessTypeCode): DocumentRequirement[] {
  return DOCUMENT_REQUIREMENTS.filter(d => d.businessTypeCode === code);
}

/* ------------------------ Default Sections ------------------------ */

export const SECTION_KEYS: ComplianceSection["key"][] = [
  "documents", "business", "registration", "people", "account", "service_agreement", "summary",
];

function buildSections(code: BusinessTypeCode): ComplianceSection[] {
  const docReqs = getDocumentRequirements(code);
  const required = (key: ComplianceSection["key"]) =>
    docReqs.filter(r => r.sectionKey === key && r.isRequired).length;

  return SECTION_KEYS.map(key => ({
    key,
    name: COMPLIANCE_SECTION_LABELS[key],
    status: "not_started",
    requiredItemCount: key === "documents" ? required("documents")
      : key === "people" ? 1
      : key === "summary" ? 0 : 1,
    completedItemCount: 0,
    approvedItemCount: 0,
  }));
}

/* ------------------------ Empty profile factory ------------------------ */

export function createEmptyComplianceProfile(
  clientId: string,
  businessTypeCode: BusinessTypeCode = "LLC"
): ComplianceProfile {
  const now = new Date().toISOString();
  return {
    id: `cp-${clientId}`,
    clientId,
    businessTypeCode,
    overallStatus: "not_started",
    completionPercentage: 0,
    approvedPercentage: 0,
    goLiveEligible: false,
    sections: buildSections(businessTypeCode),
    businessInformation: {
      tradingName: "", legalBusinessName: "", businessDescription: "",
      industry: "", category: "", businessEmail: "",
      businessPhoneCode: "+234", businessPhoneNumber: "",
      addressLine1: "", city: "", state: "", country: "Nigeria",
      status: "not_started",
    },
    registration: {
      registrationNumber: "", taxIdentificationNumber: "",
      registrationCountry: "Nigeria", status: "not_started",
    },
    people: [],
    documents: [],
    bankAccount: {
      bankName: "", accountNumber: "",
      verificationStatus: "pending", isSkipped: false,
    },
    serviceAgreement: { agreementVersion: "v1.0", status: "pending" },
    goLiveRequests: [],
    createdAt: now,
    updatedAt: now,
  };
}

/* ------------------------ Mock seeded profiles ------------------------ */

const TYPE_CYCLE: BusinessTypeCode[] = ["BNR", "LLC", "COOP"];

function seedSampleDocs(code: BusinessTypeCode, completion: "none" | "partial" | "full") {
  const reqs = getDocumentRequirements(code);
  if (completion === "none") return [];
  const limit = completion === "partial" ? Math.ceil(reqs.length / 2) : reqs.length;
  return reqs.slice(0, limit).map((r, idx) => ({
    id: `cd-${code}-${idx}`,
    requirementId: r.id,
    fileName: `${r.documentKey}.pdf`,
    fileType: "pdf",
    fileSizeMb: 1.2,
    status: completion === "full" && idx % 4 !== 3 ? "approved"
      : idx === 1 ? "rejected"
      : "pending_review" as const,
    reviewerComment: idx === 1 ? "Document is blurry, please re-upload a clearer version." : undefined,
    uploadedAt: new Date(Date.now() - idx * 86400000).toISOString(),
  }));
}

export function seedComplianceProfiles(clientIds: string[]): ComplianceProfile[] {
  return clientIds.map((id, i) => {
    const code = TYPE_CYCLE[i % 3];
    const completion: "none" | "partial" | "full" = i === 0 ? "none"
      : i % 3 === 1 ? "partial" : "full";
    const profile = createEmptyComplianceProfile(id, code);
    profile.documents = seedSampleDocs(code, completion) as any;

    if (completion !== "none") {
      profile.businessInformation = {
        ...profile.businessInformation,
        tradingName: `Client ${i + 1}`,
        legalBusinessName: `Client ${i + 1} Limited`,
        businessDescription: "We provide modern financial infrastructure tailored to small and medium businesses across Africa.",
        industry: "Fintech", category: "Payments",
        businessEmail: `business${i + 1}@example.ng`,
        businessPhoneNumber: `80${1000000 + i}`,
        addressLine1: `${i + 5} Marina Road`, city: "Lagos", state: "Lagos",
        status: completion === "full" ? "approved" : "in_progress",
      };
      profile.registration = {
        ...profile.registration,
        registrationNumber: `RC${1000000 + i * 17}`,
        taxIdentificationNumber: `TIN-${2000000 + i}`,
        status: completion === "full" ? "approved" : "in_progress",
      };
      profile.people = [{
        id: `bp-${id}-1`, firstName: "Ada", lastName: "Eze",
        dateOfBirth: "1985-03-12", nationality: "Nigerian",
        role: code === "LLC" ? "director" : code === "COOP" ? "signatory" : "owner",
        isPrimaryRepresentative: true, bvnConsentGiven: true, bvnVerified: completion === "full",
        status: completion === "full" ? "approved" : "in_progress",
      }];
      profile.bankAccount = {
        bankName: "Rex MFB", accountNumber: "0123456789", accountName: `Client ${i + 1}`,
        verificationStatus: completion === "full" ? "verified" : "pending", isSkipped: false,
      };
      profile.serviceAgreement = {
        agreementVersion: "v1.0",
        status: completion === "full" ? "accepted" : "pending",
        acceptedAt: completion === "full" ? new Date().toISOString() : undefined,
        acceptedBy: completion === "full" ? "Owner" : undefined,
      };
    }

    // Recompute counts
    const totalRequired = getDocumentRequirements(code).filter(r => r.isRequired).length + 5; // 5 = business, registration, people, account, agreement
    const approvedDocs = profile.documents.filter(d => d.status === "approved").length;
    const completedDocs = profile.documents.length;
    const sectionsCompleted = [
      profile.businessInformation.status,
      profile.registration.status,
      profile.people[0]?.status || "not_started",
      profile.bankAccount.verificationStatus === "verified" ? "approved" : "in_progress",
      profile.serviceAgreement.status === "accepted" ? "approved" : "in_progress",
    ].filter(s => s === "approved" || s === "submitted" || s === "in_progress").length;
    const sectionsApproved = [
      profile.businessInformation.status,
      profile.registration.status,
      profile.people[0]?.status,
      profile.bankAccount.verificationStatus === "verified" ? "approved" : "pending",
      profile.serviceAgreement.status === "accepted" ? "approved" : "pending",
    ].filter(s => s === "approved").length;

    profile.completionPercentage = Math.round(((completedDocs + sectionsCompleted) / totalRequired) * 100);
    profile.approvedPercentage = Math.round(((approvedDocs + sectionsApproved) / totalRequired) * 100);
    profile.goLiveEligible = profile.approvedPercentage >= 100;
    profile.overallStatus =
      completion === "none" ? "not_started"
      : profile.goLiveEligible ? "approved"
      : completion === "full" ? "submitted" : "in_progress";

    if (completion === "full" && i % 4 === 0) {
      profile.goLiveRequests = [{
        id: `glr-${id}`, status: profile.goLiveEligible ? "approved" : "pending",
        requestedBy: "Owner", requestedAt: new Date().toISOString(),
      }];
    }

    return profile;
  });
}