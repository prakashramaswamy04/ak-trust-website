import { describe, expect, it } from 'vitest';
import {
  calculateAvailableBalance,
  calculateMemberStatus,
  calculatePublicOverview,
  computeMonthlyContributionTarget,
  formatCurrency,
  sumActivePayments,
} from './finance';

describe('AK Trust finance utilities', () => {
  it('formats values in INR without decimals', () => {
    expect(formatCurrency(89500)).toBe('₹89,500');
  });

  it('calculates the monthly contribution target from the configured trust membership', () => {
    expect(computeMonthlyContributionTarget()).toBe(6300);
  });

  it('marks members as paid when they meet the expected contribution', () => {
    expect(calculateMemberStatus(300, 300)).toBe('Paid');
    expect(calculateMemberStatus(300, 150)).toBe('Partially paid');
    expect(calculateMemberStatus(300, 0)).toBe('Pending');
  });

  it('sumActivePayments ignores reversed entries', () => {
    const payments = [
      { id: 'p1', date: '2026-10-01', amount: 300, reference: 'A', reversed: false },
      { id: 'p2', date: '2026-10-02', amount: 300, reference: 'B', reversed: true },
      { id: 'p3', date: '2026-10-03', amount: 150, reference: 'C', reversed: false },
    ];

    expect(sumActivePayments(payments)).toBe(450);
  });

  it('keeps the opening balance as part of available cash while excluding reversed transactions', () => {
    expect(
      calculateAvailableBalance(89500, 600, 2000, 1500),
    ).toBe(90600);
  });

  it('calculates the public overview using the configured opening balance and current ledger totals', () => {
    const overview = calculatePublicOverview(
      89500,
      [
        {
          id: 'm1',
          name: 'Member One',
          fundraisingYear: 2026,
          expectedMonthlyContribution: 300,
          payments: [
            { id: 'p1', date: '2026-10-01', amount: 300, reference: 'ref-1', reversed: false },
          ],
        },
      ],
      [
        {
          id: 'd1',
          donorName: 'Donor One',
          amount: 2500,
          donationDate: '2026-10-02',
          paymentMethod: 'bank',
          anonymous: false,
          reversed: false,
        },
      ],
      [
        {
          id: 'dis1',
          recipientName: 'Recipient One',
          amount: 1500,
          disbursementDate: '2026-10-03',
          purpose: 'Relief support',
          paymentMethod: 'bank',
          reversed: false,
        },
      ],
    );

    expect(overview.openingBalance).toBe(89500);
    expect(overview.memberContributions).toBe(300);
    expect(overview.externalDonations).toBe(2500);
    expect(overview.disbursements).toBe(1500);
    expect(overview.availableBalance).toBe(90800);
    expect(overview.totalCollected).toBe(92300);
  });
});
