const axios = require('axios');
const createError = require('http-errors');
const { nanoid } = require('nanoid');

const createCronJob = async (additionalData) => {
  const response = await axios({
    data: {
      ...additionalData,
      token: process.env.SETCRONJOB_API_KEY,
    },
    httpMethod: 'POST',
    url: 'https://www.setcronjob.com/api/cron.add',
  });
  const { data, message } = response.data;
  if (message) {
    throw createError(400, message);
  }
  return data.id;
};

const createLocalCronJob = ({ timeExpression, url }) => {
  const cronJobId = nanoid(64);
  const { exec } = require('child_process');
  exec(`add-cron-job ${cronJobId} "${timeExpression}" ${url}`, (err) => {
    if (err) {
      console.error(err);
    }
  });
  return cronJobId;
};

const removeLocalCronJob = (cronJobId) => {
  const { exec } = require('child_process');
  exec(`remove-cron-job ${cronJobId}`, (err) => {
    if (err) {
      console.error(err);
      return -1;
    } else {
      return cronJobId;
    }
  });
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
  createLocalCronJob,
  deleteCronJobById,
  removeLocalCronJob,
};
