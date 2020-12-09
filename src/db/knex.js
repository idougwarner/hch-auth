import knex from 'knex';
import { knexSnakeCaseMappers } from 'objection';

import config from '../config';

const dbConfig = {
  client: 'pg',
  connection: {
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    password: config.db.password,
    user: config.db.user
  },
  pool: {
    min: parseInt(config.db.minPool || 2, 10),
    max: parseInt(config.db.maxPool || 10, 10)
  }
};

export default knex({
  ...dbConfig,
  ...knexSnakeCaseMappers()
});
