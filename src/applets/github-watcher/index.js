const axios = require('axios');

const providersRepository = require('../../repositories/providers');
const providerBasedAppletsRepository = require('../../repositories/applets/provider-based');

const GITHUB_PROVIDER_ID = 2;

module.exports = {
  run: (payload, token) => console.log(payload, token),
  subscribe: async (userId, config, token) => {
    const githubToken = providersRepository.getTokenByUserIdAndProviderId(
      userId,
      GITHUB_PROVIDER_ID
    );
    const response = await axios.post(
      `https://api.github.com/repos/${config.owner}/${config.repository}/hooks`,
      {
        name: 'web',
        active: true,
        events: ['push'],
        config: {
          url: `https://ifttt.merys.eu/providers/github/webhook/${token}`,
          content_type: 'json',
          insecure_ssl: '0'
        }
      },
      {
        headers: {
          Authorization: `token ${githubToken}`
        }
      }
    );
    const { id: hookId } = response.data;
    await providerBasedAppletsRepository.changeProviderBasedUserAppletConfigByToken(
      token,
      { ...config, hookId }
    );
  },
  unsubscribe: userId =>
    console.log(`Github watcher unsubscribed! User ${userId}`)
};
