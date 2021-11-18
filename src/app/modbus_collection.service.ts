import {
  Injectable, OnModuleInit, OnModuleDestroy, Logger,
} from '@nestjs/common';
import {CronJob} from 'cron';
import moment from 'moment';
import {ConfigService} from './config.service';
import {Device, createDevice} from './devices';
import {Config, DeviceConfig} from './interfaces';
import {ModbusClientService} from './modbus_client.service';
import {formatTimestamp, roundToInterval} from './utils';
import {DataService} from './data.service';

@Injectable()
export class ModbusCollectionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ModbusCollectionService.name);
  private readonly lastCollection: {[key: string]: moment.Moment} = {};
  private job: CronJob | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly dataService: DataService,
    private readonly modbusClientService: ModbusClientService,
  ) {}

  public async onModuleInit(): Promise<void> {
    let running = false;

    this.job = new CronJob({
      cronTime: '0 * * * * *',
      onTick: async () => {
        if (!running) {
          running = true;

          try {
            await this.collectData();
          } catch (err) {
            this.logger.error(err);
          }

          running = false;
        }
      },
    });

    this.job.start();
  }

  public async onModuleDestroy(): Promise<void> {
    if (this.job) {
      this.job.stop();
      this.job = null;
    }
  }

  private async collectData(): Promise<void> {
    const start = moment.utc();
    const timestamp = formatTimestamp(start);

    const config = await this.configService.getConfig();

    const collectionInterval = config.collection_interval || 0;
    const collectionKey = 'devices';

    if (this.shouldCollect(start, collectionInterval, collectionKey)) {
      const devices = this.getDevicesForCollection(config);

      for (const device of devices) {
        try {
          await this.collectDeviceData(device, timestamp);
        } catch (err) {
          this.logger.error(err);
        }
      }

      this.lastCollection[collectionKey] = start;
    }
  }

  private shouldCollect(start: moment.Moment, interval: number, key: string): boolean {
    let lastCollection = this.lastCollection[key];

    if (!lastCollection) {
      lastCollection = start;
      this.lastCollection[key] = lastCollection;
    }

    if (interval > 0) {
      const next = roundToInterval(lastCollection, interval);
      return next.isSameOrBefore(start);
    }

    return false;
  }

  private getDevicesForCollection(config: Config): Array<Device> {
    const devices: Array<Device> = [];

    if (config.devices?.length) {
      const deviceCounts: {[key: string]: number} = {};

      for (const deviceConfig of config.devices) {
        if (deviceConfig.enabled) {
          try {
            const device = this.createDevice(deviceConfig);
            const countKey = device.type || device.model;

            deviceCounts[countKey] = (deviceCounts[countKey] || 0) + 1;
            device.setDataSuffix(`_${ deviceCounts[countKey] }`);

            devices.push(device);
          } catch (err) {
            this.logger.error(err);
          }
        }
      }
    }

    return devices;
  }

  private createDevice(config: DeviceConfig): Device {
    const device = createDevice(config);

    device.on('data', async ({timestamp, data}) => {
      this.logger.debug(`Received data on port "${ device.config.port }" from address ${ device.address }`);

      try {
        await this.dataService.addDataPoints({
          timestamp,
          data,
        });
      } catch (err) {
        this.logger.error(err);
      }
    });

    device.on('error', err => {
      if (err.errno === 'ETIMEDOUT') {
        this.logger.debug(`Timed out waiting for response on port "${ device.config.port }" from address ${ device.address }`);
      } else {
        this.logger.error(err);
      }
    });

    return device;
  }

  private async collectDeviceData(device: Device, timestamp: string): Promise<void> {
    const client = await this.modbusClientService.getClient(device.config.port);

    this.logger.debug(`Collecting data on port "${ device.config.port }" from address ${ device.address }`);

    await device.collectModbusData(client, timestamp);
  }
}
