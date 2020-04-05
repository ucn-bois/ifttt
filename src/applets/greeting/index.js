module.exports = {
  run: ({ greeting }) => console.log(greeting),
  subscribe: (userId, config) =>
    console.log(`Greetings subscribed! User: ${userId} Config: ${config}`),
  unsubscribe: userId => console.log(`Greetings unsubscribed! User ${userId}`)
};
