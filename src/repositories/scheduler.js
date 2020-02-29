const axios = require('axios');
const createError = require('http-errors');

const addScheduledApplet = async (expression, password, url) => {
  const {
    data: {
      code,
      message,
      data: { id }
    }
  } = await axios({
    method: 'POST',
    url: 'https://www.setcronjob.com/api/cron.add',
    data: {
      expression,
      url,
      httpMethod: 'POST',
      postData: `password=${password}`,
      token: process.env.SETCRONJOB_API_KEY
    }
  });
  if (code !== 0) {
    throw createError(code, message);
  }
  return id;
};

const deleteScheduledApplet = async id => {
  const {
    data: { code, message }
  } = await axios({
    method: 'DELETE',
    url: 'https://www.setcronjob.com/api/cron.delete',
    data: {
      id,
      token: process.env.SETCRONJOB_API_KEY
    }
  });
  if (code !== 0) {
    throw createError(code, message);
  }
};

module.exports = {
  addScheduledApplet,
  deleteScheduledApplet
};
