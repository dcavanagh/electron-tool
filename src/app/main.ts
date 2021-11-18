import {NestFactory} from '@nestjs/core';
import {AppModule} from '.';

async function bootstrap(): Promise<void> {
  const appContext = await NestFactory.createApplicationContext(AppModule, {});

  appContext.enableShutdownHooks();
}

bootstrap();
