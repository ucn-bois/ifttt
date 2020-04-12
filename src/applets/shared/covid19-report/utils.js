const axios = require('axios');
const createError = require('http-errors');

const fetchAndProcessCovid19Data = async country => {
  const response = await axios.get(
    'https://pomber.github.io/covid19/timeseries.json'
  );
  if (!response.data[country]) {
    throw createError(400, 'No such country.');
  }
  return response.data[country].pop();
};

module.exports = {
  fetchAndProcessCovid19Data
};
