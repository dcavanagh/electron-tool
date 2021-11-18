import ModbusRTU from 'modbus-serial';
import {truncateFloat} from '../utils';
import {BaseDevice, DeviceData} from './base';

// Data Source: https://support.atonometrics.com/support/home
// RC18 Services PV Reverence Cell User's Guide, Document Number 88058 Rev. B, May 2021
// Table 4-1: Modbus map
// Register    Register    Parameter             Units    Data    Bytes
// Start       End         Name                           Format
// --------------------------------------------------------------------
//   1           2         Irradiance            W/m2     Float32   4
//   3           4         Short-Circuit Current A        Float32   4
//   5           6         PV Temperature        deg C    Float32   4
// 104         107         Serial Number         n/a      Char x2   8
// --------------------------------------------------------------------
export class ReferenceCell extends BaseDevice {
  protected readonly MODBUS_QUERIES = [
    async (client: ModbusRTU): Promise<DeviceData> => {
      const {buffer} = await client.readInputRegisters(1, 6);

      return {
        [`RefCell${ this.dataSuffix }`]: truncateFloat(buffer.readInt32BE(0), 6),
        [`RefCell_Isc${ this.dataSuffix }`]: truncateFloat(buffer.readInt32BE(2), 6),
        [`RefCell_Temp${ this.dataSuffix }`]: truncateFloat(buffer.readInt32BE(4), 6),
      };
    },

    async (client: ModbusRTU): Promise<DeviceData> => {
      const {buffer} = await client.readInputRegisters(104, 4);

      return {
        [`RefCell_SN${ this.dataSuffix }`]: buffer.toString(),
      };
    },
  ];
}
