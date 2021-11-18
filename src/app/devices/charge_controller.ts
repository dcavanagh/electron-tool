import ModbusRTU from 'modbus-serial';
import {truncateFloat} from '../utils';
import {BaseDevice, DeviceData} from './base';

export class ChargeController extends BaseDevice {
  protected readonly MODBUS_QUERIES = [
    async (client: ModbusRTU): Promise<DeviceData> => {
      const {buffer} = await client.readHoldingRegisters(8, 45);

      return {
        [`Batt_Voltage${ this.dataSuffix }`]: this.scaleVoltage(buffer.readUInt16BE(0)),
        [`Input_Voltage${ this.dataSuffix }`]: this.scaleVoltage(buffer.readUInt16BE(2)),
        [`Load_Voltage${ this.dataSuffix }`]: this.scaleVoltage(buffer.readUInt16BE(4)),
        [`Input_Current${ this.dataSuffix }`]: this.scaleCurrent(buffer.readUInt16BE(6)),
        [`Load_Current${ this.dataSuffix }`]: this.scaleCurrent(buffer.readUInt16BE(8)),
        [`MPPT_Temp${ this.dataSuffix }`]: buffer.readUInt16BE(10),
        [`MPPT_Ambient_Temp${ this.dataSuffix }`]: buffer.readUInt16BE(14),
        [`Charge_State${ this.dataSuffix }`]: buffer.readUInt16BE(18),
        [`Charge_LoadState${ this.dataSuffix }`]: buffer.readUInt16BE(36),
        [`MPPT_Load_Fault${ this.dataSuffix }`]: buffer.readUInt16BE(38),
        [`MPPT_Output_Power${ this.dataSuffix }`]: this.scalePower(buffer.readUInt16BE(62)),
        [`MPPT_Vmp_Sweep${ this.dataSuffix }`]: this.scaleVoltage(buffer.readUInt16BE(64)),
        [`MPPT_Pmax_Sweep${ this.dataSuffix }`]: this.scalePower(buffer.readUInt16BE(66)),
        [`MPPT_Voc_Sweep${ this.dataSuffix }`]: this.scaleVoltage(buffer.readUInt16BE(68)),
        [`MPPT_Vb_Min_Daily${ this.dataSuffix }`]: this.scaleVoltage(buffer.readUInt16BE(70)),
        [`MPPT_Vb_Max_Daily${ this.dataSuffix }`]: this.scaleVoltage(buffer.readUInt16BE(72)),
        [`MPPT_AhC_Daily${ this.dataSuffix }`]: this.scaleAmpHour(buffer.readUInt16BE(74)),
        [`MPPT_AhL_Daily${ this.dataSuffix }`]: this.scaleAmpHour(buffer.readUInt16BE(76)),
        [`MPPT_Vb_Min${ this.dataSuffix }`]: this.scaleVoltage(buffer.readUInt16BE(86)),
        [`MPPT_Vb_Max${ this.dataSuffix }`]: this.scaleVoltage(buffer.readUInt16BE(88)),
      };
    },
  ];

  private scaleVoltage(raw: number): number {
    return truncateFloat(raw * 0.003051757813, 6);
  }

  private scaleCurrent(raw: number): number {
    return truncateFloat(raw * 0.002415771484, 6);
  }

  private scalePower(raw: number): number {
    return truncateFloat(raw * 0.01509857178, 6);
  }

  private scaleAmpHour(raw: number): number {
    return truncateFloat(raw * 0.1, 6);
  }
}
