import {Module} from '@nestjs/common';
import {ModbusClientService} from './modbus_client.service';
import {ModbusCollectionService} from './modbus_collection.service';
import {DataService} from './data.service';
import {ConfigService} from './config.service';

@Module({
  imports: [
  ],
  providers: [
    ConfigService,
    DataService,
    ModbusClientService,
    ModbusCollectionService,
  ],
})
class AppModule {}

export {
  AppModule,
  ModbusClientService,
  ModbusCollectionService,
};
