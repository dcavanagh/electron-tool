import {Injectable} from '@nestjs/common';
import {Config} from './interfaces';

@Injectable()
export class ConfigService {
  private config: Config = {
    collection_interval: 10,
    devices: [
      {
        port: '127.0.0.1',
        address: 10,
        model: 'sr30-d1',
        enabled: true,
      },
    ],
  };

  public async getConfig(): Promise<Config> {
    return this.config;
  }
}
