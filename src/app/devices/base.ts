import {EventEmitter} from 'events';
import ModbusRTU from 'modbus-serial';
import {DeviceConfig} from '../interfaces';

export type DeviceData = {[key: string]: number | string};

export class BaseDevice extends EventEmitter {
  protected readonly MODBUS_QUERIES: Array<(client: ModbusRTU) => Promise<DeviceData>> = [];
  protected dataSuffix = '_1';

  constructor(
    public readonly config: DeviceConfig,
    protected readonly timeout = 500,
  ) {
    super();
  }

  public get address(): number {
    return this.config.address;
  }

  public get model(): string {
    return this.config.model;
  }

  public get type(): string {
    return '';
  }

  public setDataSuffix(suffix: string): void {
    this.dataSuffix = suffix;
  }

  public async collectModbusData(client: ModbusRTU, timestamp: string): Promise<void> {
    try {
      client.setID(this.address);
      client.setTimeout(this.timeout);

      const data = await this.MODBUS_QUERIES.reduce(async (accumulator, fn) => (
        Object.assign(await accumulator, await fn.call(this, client))
      ), Promise.resolve({} as DeviceData));

      this.emit('data', {data, timestamp});
    } catch (err) {
      this.emit('error', err);
    }
  }
}
