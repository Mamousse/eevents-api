import dotenv from 'dotenv';
// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

import {ApplicationConfig, EEventsAppApplication} from './application';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new EEventsAppApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT || 3000),
      host: process.env.HOST || '127.0.0.1',
      gracePeriodForClose: 5000,
      openApiSpec: {
        setServersFromRequest: true,
      },
    },
  };
  console.log('Environment variables:');
  console.log('PORT:', process.env.PORT);
  console.log('HOST:', process.env.HOST);
  console.log('MONGO_URL:', process.env.MONGO_URL ? 'set' : 'not set');
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
