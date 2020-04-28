const axios = require('axios');
const createError = require('http-errors');

const createCronJob = async (additionalData) => {
  const response = await axios({
    data: {
      ...additionalData,
      token: process.env.SETCRONJOB_API_KEY,
    },
    method: 'POST',
    url: 'https://www.setcronjob.com/api/cron.add',
  });
  const { data, message } = response.data;
  if (message) {
    throw createError(400, message);
  }
  return data.id;
};

const deleteCronJobById = async (cronJobId) => {
  const response = await axios({
    data: {
      id: cronJobId,
      token: process.env.SETCRONJOB_API_KEY,
    },
    method: 'DELETE',
    url: 'https://www.setcronjob.com/api/cron.delete',
  });
  const { message } = response.data;
  if (message) {
    throw createError(400, message);
  }
};

module.exports = {
  createCronJob,
  deleteCronJobById,
};
