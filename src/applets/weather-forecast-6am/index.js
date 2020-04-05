const { sg } = require('../../clients');

module.exports = {
  run: async ({ location }, email) => {
    await sg.send({
      to: email,
      from: process.env.SG_FROM_EMAIL,
      templateId: 'd-303a306488b34f92b9d55b7496bf7e22',
      dynamic_template_data: { location }
    });
  },
  subscribe: (userId, config) =>
    console.log(
      `Weather forecast subscribed! User: ${userId} Config: ${config}`
    ),
  unsubscribe: userId =>
    console.log(`Weather forecast unsubscribed! User ${userId}`)
};
