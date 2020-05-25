const moment = require('moment-timezone');

const convertTimeToUTC = ({ hour, minute, timezone }) => {
  const time = moment.tz(`${hour}:${minute}`, 'HH:mm', timezone);
  const hours = time.tz('UTC').format('HH');
  const minutes = time.tz('UTC').format('mm');
  return { hours, minutes };
};

module.exports = { convertTimeToUTC };
