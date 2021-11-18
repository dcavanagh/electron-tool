export interface DataPoints {
  timestamp: string;
  data: {
    [key: string]: any;
  };
}

export interface DeviceConfig {
  address: number;
  model: string;
  pyranometer_type?: string;
  enabled: boolean;
  port: string;
}

export interface Config {
  collection_interval: number;
  devices?: Array<DeviceConfig>;
}
