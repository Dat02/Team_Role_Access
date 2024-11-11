// Update with your config settings.
require("dotenv").config();
const pg = require("pg");

module.exports = {

  development: {
    client: "pg",
    useNullAsDefault: true,
    connection: {
      host: process.env.POSTGRES_DEV_HOST,
      port: process.env.POSTGRES_DEV_PORT,
      user: process.env.POSTGRES_DEV_USER,
      password: process.env.POSTGRES_DEV_PASSWORD,
      database: process.env.POSTGRES_DEV_DATABASE
    },
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 10000
    },
    migrations: {
      directory: "./database/migrations"
    },
    seeds: {
      directory: "./database/seeds"
    }
  },

};
