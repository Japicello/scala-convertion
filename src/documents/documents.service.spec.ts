import { DocumentsService } from './documents.service';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let mockAuditRepo: any;

  beforeEach(() => {
    mockAuditRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
      count: jest.fn().mockResolvedValue(5),
    };
    service = new DocumentsService(mockAuditRepo);
  });

  it('returns default documents when database is empty', async () => {
    const docs = await service.getRecentDocuments();
    expect(docs.length).toBeGreaterThan(0);
    expect(docs[0].filename).toContain('Kardex');
  });

  it('returns engine stats matching stitch specs', async () => {
    const stats = await service.getEngineStats();
    expect(stats.latencyMs).toBe(142);
    expect(stats.ocrAccuracy).toBe('99.4%');
    expect(stats.storageTotalGb).toBe(100);
  });
});
