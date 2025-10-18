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
// Utiliser MONGO_URL depuis les variables d'environnement ou une valeur par défaut locale
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/';

if (!process.env.MONGO_URL) {
  console.warn('⚠️  MONGO_URL non définie, utilisation de la base de données locale par défaut: mongodb://localhost:27017/e-events');
}

const config = {
  name: 'eevent',
  connector: 'mongodb',
  url: mongoUrl,
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

console.log('🔵 Configuration MongoDB:', {
  url: mongoUrl.replace(/\/\/.*:.*@/, '//***:***@'), // Masquer les credentials dans les logs
});

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
