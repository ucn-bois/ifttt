const axios = require('axios');
const createError = require('http-errors');

const fetchAndProcessCovid19Data = country => {
  const response = axios.get(
    'https://pomber.github.io/covid19/timeseries.json'
  );
  if (!response.data[country]) {
    throw createError(400, 'No such country.');
  }
  return response.data[country].reduce(
    (acc, { confirmed, deaths, recovered }) => {
      acc.confirmed += confirmed;
      acc.deaths += deaths;
      acc.recovered += recovered;
      return acc;
    },
    { confirmed: 0, deaths: 0, recovered: 0 }
  );
};

module.exports = {
  fetchAndProcessCovid19Data
};
