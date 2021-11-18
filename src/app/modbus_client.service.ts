import {Injectable, Logger, OnModuleDestroy} from '@nestjs/common';
import ModbusRTU from 'modbus-serial';

@Injectable()
export class ModbusClientService implements OnModuleDestroy {
  private readonly logger = new Logger(ModbusClientService.name);
  private readonly clients: {[key: string]: ModbusRTU} = {};

  public async onModuleDestroy(): Promise<void> {
    const ports = Object.keys(this.clients);

    await Promise.all(ports.map(port => this.destroyClient(port)));
  }

  public async getClient(port: string): Promise<ModbusRTU> {
    let client = this.clients[port];

    if (!client) {
      client = new ModbusRTU();
      this.clients[port] = client;
    }

    if (!client.isOpen) {
      if (port.includes('.')) {
        this.logger.log(`Connecting TCP to ${ port }`);

        await client.connectTCP(port, {port: 8502});
      } else {
        const comPort = process.env[`${ port.toUpperCase() }_COM_PORT`] || 'DISABLE';
        const baudRate = parseInt(process.env[`${ port.toUpperCase() }_BAUD_RATE`] || '38400', 10);

        if (comPort.toUpperCase() === 'DISABLE') {
          throw new Error(`Modbus port ${ port } is disabled`);
        }

        this.logger.log(`Connecting port "${ port }" to ${ comPort } at ${ baudRate } baud`);

        await client.connectRTUBuffered(comPort, {
          baudRate,
          dataBits: 8,
          stopBits: 1,
          parity: 'none',
        });
      }
    }

    return client;
  }

  public async destroyClient(port: string): Promise<void> {
    const client = this.clients[port];

    if (client && client.isOpen) {
      this.logger.log(`Closing port "${ port }"`);

      await new Promise<void>(resolve => {
        client.close(() => {
          resolve();
        });
      });
    }

    delete this.clients[port];
  }
}
