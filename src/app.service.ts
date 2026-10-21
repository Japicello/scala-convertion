import { Injectable } from '@nestjs/common';

export interface HealthStatus {
  status: 'ok';
  name: string;
  version: string;
  timestamp: string;
}

@Injectable()
export class AppService {
  getHealth(): HealthStatus {
    return {
      status: 'ok',
      name: 'file-converter-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
