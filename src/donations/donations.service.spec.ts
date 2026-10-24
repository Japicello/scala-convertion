import { DonationsService } from './donations.service';

describe('DonationsService', () => {
  let service: DonationsService;
  let mockDonationRepo: any;

  beforeEach(() => {
    mockDonationRepo = {
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'don-1', ...d })),
    };
    service = new DonationsService(mockDonationRepo);
  });

  it('returns valid donation config with tiers and channels', () => {
    const config = service.getConfig();
    expect(config.tiers.length).toBeGreaterThanOrEqual(3);
    expect(config.channels.paypal).toBeDefined();
    expect(config.goal.percentage).toBeDefined();
  });

  it('creates a donation intent correctly', async () => {
    const res = await service.registerIntent({
      supporterName: 'Carlos',
      amount: 5,
      currency: 'USD',
      platform: 'PAYPAL',
      note: 'Genial app',
    });

    expect(res.donationId).toBe('don-1');
    expect(res.paymentUrl).toContain('paypal');
  });
});
