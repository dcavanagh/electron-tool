import {DeviceConfig} from '../interfaces';
import {BaseDevice, DeviceData} from './base';
import {CellTemperature} from './cell_temperature';
import {ChargeController} from './charge_controller';
import {Pyranometer} from './pyranometer';
import {ReferenceCell} from './reference_cell';

export {
  DeviceData,
  CellTemperature,
  ChargeController,
  Pyranometer,
  ReferenceCell,
};

export type Device = BaseDevice;

export function createDevice(config: DeviceConfig): Device {
  switch (config.model.toLowerCase()) {
    case 'sr30-d1':
      return new Pyranometer(config);

    case 'rc18':
      return new ReferenceCell(config);

    case 'cs240dm':
      return new CellTemperature(config);

    case 'ss-mppt':
      return new ChargeController(config);

    default:
      throw new Error(`Unknown device model "${ config.model }"`);
  }
}
