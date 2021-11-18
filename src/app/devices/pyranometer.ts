import ModbusRTU from 'modbus-serial';
import moment from 'moment';
import {truncateFloat} from '../utils';
import {BaseDevice, DeviceData} from './base';

export class Pyranometer extends BaseDevice {
  protected readonly MODBUS_QUERIES = [
    async (client: ModbusRTU): Promise<DeviceData> => {
      const {buffer} = await client.readInputRegisters(2, 5);

      return {
        [`${ this.type }_TC${ this.dataSuffix }`]: truncateFloat(buffer.readInt32BE(0) * 0.01, 6),
        [`${ this.type }${ this.dataSuffix }`]: truncateFloat(buffer.readInt32BE(4) * 0.01, 6),
        [`${ this.type }_Temp${ this.dataSuffix }`]: truncateFloat(buffer.readInt16BE(8) * 0.01, 6),
      };
    },

    async (client: ModbusRTU): Promise<DeviceData> => {
      const {buffer} = await client.readInputRegisters(10, 2);

      return {
        [`${ this.type }_mV${ this.dataSuffix }`]: this.scaleVoltage(buffer.readInt32BE(0)),
      };
    },

    async (client: ModbusRTU): Promise<DeviceData> => {
      const {buffer} = await client.readInputRegisters(194, 3);

      return {
        [`${ this.type }_Tilt${ this.dataSuffix }`]: truncateFloat(buffer.readUInt16BE(0) * 0.01, 6),
        [`${ this.type }_FanSpeed${ this.dataSuffix }`]: buffer.readUInt16BE(4),
      };
    },

    async (client: ModbusRTU): Promise<DeviceData> => {
      const {buffer} = await client.readInputRegisters(198, 1);

      return {
        [`${ this.type }_HeatCurrent${ this.dataSuffix }`]: buffer.readUInt16BE(0),
      };
    },

    async (client: ModbusRTU): Promise<DeviceData> => {
      const {buffer} = await client.readInputRegisters(98, 2);

      return {
        [`${ this.type }_Humidity${ this.dataSuffix }`]: truncateFloat(buffer.readUInt16BE(0) * 0.01, 6),
        [`${ this.type }_HumidityTemp${ this.dataSuffix }`]: truncateFloat(buffer.readInt16BE(2) * 0.01, 6),
      };
    },

    async (client: ModbusRTU): Promise<DeviceData> => {
      const {buffer} = await client.readInputRegisters(137, 1);

      return {
        [`${ this.type }_Pressure${ this.dataSuffix }`]: this.scalePressure(buffer.readUInt16BE(0)),
      };
    },

    async (client: ModbusRTU): Promise<DeviceData> => {
      const {buffer} = await client.readInputRegisters(40, 3);

      return {
        [`${ this.type }_SN${ this.dataSuffix }`]: buffer.readUInt16BE(0),
        [`${ this.type }_Cal${ this.dataSuffix }`]: truncateFloat(buffer.readFloatBE(2), 6),
      };
    },

    async (client: ModbusRTU): Promise<DeviceData> => {
      const {buffer} = await client.readInputRegisters(46, 2);

      return {
        [`${ this.type }_CalDate${ this.dataSuffix }`]: this.parseDate(buffer.readUInt32BE(0)),
      };
    },
  ];

  public get type(): string {
    return this.config.pyranometer_type || 'GHI';
  }

  private scaleVoltage(raw: number): number {
    return truncateFloat(raw * 0.000001, 6);
  }

  private scalePressure(raw: number): number {
    return truncateFloat(raw / 32, 6);
  }

  private parseDate(raw: number): string {
    return moment.utc(raw, 'YYYYMMDD').format('YYYY-MM-DD');
  }
}
