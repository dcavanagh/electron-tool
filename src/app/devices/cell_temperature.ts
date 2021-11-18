import ModbusRTU from 'modbus-serial';
import {truncateFloat} from '../utils';
import {BaseDevice, DeviceData} from './base';

export class CellTemperature extends BaseDevice {
  protected readonly MODBUS_QUERIES = [
    async (client: ModbusRTU): Promise<DeviceData> => {
      const {buffer} = await client.readInputRegisters(0, 10);

      return {
        [`BOM_SN${ this.dataSuffix }`]: buffer.readFloatBE(0),
        [`BOM_Temp${ this.dataSuffix }`]: truncateFloat(buffer.readFloatBE(4), 6),
        [`BOM_Counter${ this.dataSuffix }`]: buffer.readFloatBE(8),
        [`BOM_Status${ this.dataSuffix }`]: buffer.readFloatBE(12),
        [`BOM_RangeCheck${ this.dataSuffix }`]: buffer.readFloatBE(16),
      };
    },
  ];
}
