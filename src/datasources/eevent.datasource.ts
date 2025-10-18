import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

// const config = {
//   name: 'comparateurDb',
//   connector: 'mongodb',
//   url: process.env.MONGO_URL ?? '',
//   // url: 'mongodb://10.20.1.68:30017',
//   // url: 'mongodb://artp:PmoDdo%402024%23@10.10.0.215:27017/artp-comparateur-db?authSource=artp-admin_db',

//   database: 'eevent',
//   useNewUrlParser: true
// };
const config = {
  name: 'eevent',
  connector: 'mongodb',
  url: process.env.MONGO_URL,
  // Optionnel si pas dans l’URL
  // database: 'eevent',
  useUnifiedTopology: true, // utile pour éviter des warnings
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class EeventDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'eevent';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.eevent', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
