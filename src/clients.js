const sg = require('@sendgrid/mail');

const db = require('knex')({
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  }
});

sg.setApiKey(process.env.SG_API_KEY);

module.exports = {
  db,
  sg
};
