export const TRUST_CONFIG = {
  name: "AK Trust",
  foundedOn: "2024-10-05",
  memberCount: 21,
  monthlyMemberContribution: 300,
  contributionCycle: "One year per annual fundraising cycle",
  reportingDate: "2026-10-10",
  openingBalance: 89500,
  monthlyTarget: 21 * 300,
  timezone: "Asia/Kolkata",
  currency: "INR",
};

export type PaymentStatus = "Paid" | "Partially paid" | "Pending";

export interface MemberPayment {
  id: string;
  date: string;
  amount: number;
  reference: string;
  reversed: boolean;
  reversalReason?: string | null;
}

export interface MemberRecord {
  id: string;
  name: string;
  memberId?: string;
  fundraisingYear: number;
  expectedMonthlyContribution: number;
  payments: MemberPayment[];
}

export interface ExternalDonation {
  id: string;
  donorName: string;
  amount: number;
  donationDate: string;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  anonymous: boolean;
  reversed: boolean;
  reversalReason?: string | null;
}

export interface Disbursement {
  id: string;
  recipientName: string;
  amount: number;
  disbursementDate: string;
  purpose: string;
  paymentMethod: string;
  receiptUrl?: string;
  notesPrivate?: string;
  reversed: boolean;
  reversalReason?: string | null;
}

export interface FinanceOverview {
  openingBalance: number;
  memberContributions: number;
  externalDonations: number;
  disbursements: number;
  availableBalance: number;
  totalCollected: number;
  totalMembers: number;
  recordedExternalDonors: number;
  monthlyTarget: number;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: TRUST_CONFIG.timezone,
  }).format(new Date(value));
}

export function sumActivePayments(payments: MemberPayment[]): number {
  return payments
    .filter((payment) => !payment.reversed)
    .reduce((total, payment) => total + payment.amount, 0);
}

export function sumActiveDonations(donations: ExternalDonation[]): number {
  return donations
    .filter((donation) => !donation.reversed)
    .reduce((total, donation) => total + donation.amount, 0);
}

export function sumActiveDisbursements(disbursements: Disbursement[]): number {
  return disbursements
    .filter((entry) => !entry.reversed)
    .reduce((total, entry) => total + entry.amount, 0);
}

export function calculateMemberContributionBreakdown(memberRecords: MemberRecord[]): {
  expected: number;
  received: number;
  outstanding: number;
} {
  const expected = memberRecords.reduce(
    (total, member) => total + member.expectedMonthlyContribution,
    0,
  );
  const received = memberRecords.reduce(
    (total, member) => total + sumActivePayments(member.payments),
    0,
  );

  return {
    expected,
    received,
    outstanding: Math.max(expected - received, 0),
  };
}

export function calculateAvailableBalance(
  openingBalance: number,
  memberContributions: number,
  externalDonations: number,
  disbursements: number,
): number {
  return openingBalance + memberContributions + externalDonations - disbursements;
}

export function calculateMemberStatus(expected: number, paid: number): PaymentStatus {
  if (paid >= expected && expected > 0) return "Paid";
  if (paid > 0 && paid < expected) return "Partially paid";
  return "Pending";
}

export function calculateMemberSummary(member: MemberRecord): {
  paid: number;
  expected: number;
  outstanding: number;
  status: PaymentStatus;
} {
  const paid = sumActivePayments(member.payments);
  const expected = member.expectedMonthlyContribution;
  const outstanding = Math.max(expected - paid, 0);
  return {
    paid,
    expected,
    outstanding,
    status: calculateMemberStatus(expected, paid),
  };
}

export function calculatePublicOverview(
  openingBalance: number,
  memberRecords: MemberRecord[],
  donations: ExternalDonation[],
  disbursements: Disbursement[],
): FinanceOverview {
  const memberContributions = memberRecords.reduce(
    (total, member) => total + sumActivePayments(member.payments),
    0,
  );
  const externalDonations = sumActiveDonations(donations);
  const disbursementTotal = sumActiveDisbursements(disbursements);
  const availableBalance = calculateAvailableBalance(
    openingBalance,
    memberContributions,
    externalDonations,
    disbursementTotal,
  );

  return {
    openingBalance,
    memberContributions,
    externalDonations,
    disbursements: disbursementTotal,
    availableBalance,
    totalCollected: openingBalance + memberContributions + externalDonations,
    totalMembers: TRUST_CONFIG.memberCount,
    recordedExternalDonors: donations.filter((donation) => !donation.anonymous).length,
    monthlyTarget: TRUST_CONFIG.monthlyTarget,
  };
}

export function isFutureDate(dateString: string): boolean {
  return new Date(dateString) > new Date();
}

export function csvEscape(value: string | number | null | undefined): string {
  const normalized = String(value ?? "");
  return `"${normalized.replace(/"/g, '""')}"`;
}

export function computeMonthlyContributionTarget(): number {
  return TRUST_CONFIG.memberCount * TRUST_CONFIG.monthlyMemberContribution;
}

export function getPublicDonationList(donations: ExternalDonation[]) {
  return donations
    .filter((donation) => !donation.reversed)
    .map((donation) => ({
      ...donation,
      donorName: donation.anonymous ? "Anonymous donor" : donation.donorName,
    }));
}
