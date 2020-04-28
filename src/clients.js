const sg = require('@sendgrid/mail');

const db = require('knex')({
  client: 'mysql',
  connection: {
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
  },
});

sg.setApiKey(process.env.SG_API_KEY);

module.exports = {
  db,
  sg,
};
