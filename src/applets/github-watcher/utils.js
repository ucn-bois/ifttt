const axios = require('axios');
const createError = require('http-errors');

const { sg } = require('../../clients');

const userAppletRepo = require('../../repositories/userApplets');
const userRepo = require('../../repositories/users');

const APPLET_ID = 3;
const SCOPES = 'repo';
const CLIENT_ID = process.env.APPLET_GITHUB_WATCHER_APP_ID;
const CLIENT_SECRET = process.env.APPLET_GITHUB_WATCHER_APP_SECRET;
const REDIRECT_URI = process.env.APPLET_GITHUB_WATCHER_REDIRECT_URI;
const WEBHOOK_URI = process.env.APPLET_GITHUB_WATCHER_WEBHOOK_URI;
const AUTH_URL = [
  'https://github.com/login/oauth/authorize/',
  `?client_id=${CLIENT_ID}`,
  `&scope=${SCOPES}`,
  `&redirect_uri=${REDIRECT_URI}`,
].join('');

const exchangeCodeForAccessToken = async (code) => {
  let response;
  try {
    response = await axios.post(
      'https://github.com/login/oauth/access_token',
      undefined,
      {
        headers: {
          Accept: 'application/json',
        },
        params: {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: code,
          redirect_uri: REDIRECT_URI,
        },
      }
    );
  } catch (err) {
    throw createError(500, err);
  }
  return response.data;
};

const createWebhook = async ({ accessToken, identifier, repository }) => {
  let response;
  try {
    response = await axios.post(
      `https://api.github.com/repos/${repository}/hooks`,
      {
        active: true,
        config: {
          content_type: 'json',
          insecure_ssl: '0',
          url: `${WEBHOOK_URI}/${identifier}`,
        },
        events: ['push'],
        name: 'web',
      },
      {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      }
    );
  } catch (err) {
    throw createError(500, err);
  }
  return response.data;
};

const removeWebhook = async ({ accessToken, hookId, repository }) => {
  try {
    await axios.delete(
      `https://api.github.com/repos/${repository}/hooks/${hookId}`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      }
    );
  } catch (err) {
    throw createError(500, err);
  }
};

const validateRepoName = (repoName) => {
  const pattern = /\u002F/g; // searches for '/' in a string
  const match = repoName.match(pattern); // returns an array of matched characters -> "owner/repo" = ["/"]; "owner/repo/hook" = ["/", "/"]; "owner+repo" = null
  console.log(match);
  if (match == null || match.length !== 1) {
    throw createError(500, 'Invalid repository name format');
  }
};

const sendMail = async ({ body, identifier }) => {
  const userApplet = await userAppletRepo.findUserAppletByIdentifier(
    identifier
  );
  const user = await userRepo.findUserById(userApplet.userId);
  if (body.head_commit !== undefined) {
    await sg.send({
      dynamic_template_data: {
        committer: body.head_commit.committer.username,
        head_commit_link: body.head_commit.url,
        repository: body.repository.full_name,
        repository_url: body.repository.html_url,
      },
      from: process.env.SG_FROM_EMAIL,
      templateId: 'd-a451c67c185f447eb905fe85055dc003',
      to: user.email,
    });
  } else {
    // here comes the ping from github to confirm webhook creation
  }
};

module.exports = {
  APPLET_ID,
  AUTH_URL,
  createWebhook,
  exchangeCodeForAccessToken,
  removeWebhook,
  sendMail,
  validateRepoName,
};
