import { DataSource, DataSourceOptions } from 'typeorm';
import EnvVars from '../constants/EnvVars';

export const baseDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: EnvVars.DATABASE_URL,
  synchronize: true,
  migrationsRun: true,
  migrations: [],
  logging: ['migration'],
  extra: {
    ssl: {
      require: true,
      /// note setting this to false opens us to Man In the middle attacks
      /// To really solve this problem we need to set up proper SSL cert on Heroku
      /// Easiest way to do this is to move from eco to basic plan and enable ACM [https://devcenter.heroku.com/articles/automated-certificate-management]
      rejectUnauthorized: false,
    },
  },
};

export default new DataSource({
  ...baseDataSourceOptions,
  migrations: [],
});
