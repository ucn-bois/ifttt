const axios = require('axios');
const createError = require('http-errors');
const { check, body, validationResult } = require('express-validator');

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
  `&redirect_uri=${REDIRECT_URI}`
].join('');

const createWebhook = async ({ repository, accessToken, identifier }) => {
  let response;
  try {
    response = await axios.post(
      `https://api.github.com/repos/${repository}/hooks`,
      {
        name: 'web',
        active: true,
        events: ['push'],
        config: {
          url: `${WEBHOOK_URI}/${identifier}`,
          content_type: 'json',
          insecure_ssl: '0'
        }
      },
      {
        headers: {
          Authorization: `token ${accessToken}`
        }
      }
    );
  } catch (err) {
    throw createError(500, err);
  }
  return response.data;
};

const exchangeCodeForAccessToken = async code => {
  let response;
  try {
    response = await axios.post(
      'https://github.com/login/oauth/access_token',
      undefined,
      {
        params: {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: code,
          redirect_uri: REDIRECT_URI
        },
        headers: {
          Accept: 'application/json'
        }
      }
    );
  } catch (err) {
    throw createError(500, err);
  }
  return response.data;
};

const removeWebhook = async ({ repository, hookId, accessToken }) => {
  try {
    await axios.delete(
      `https://api.github.com/repos/${repository}/hooks/${hookId}`,
      {
        headers: {
          Authorization: `token ${accessToken}`
        }
      }
    );
  } catch (err) {
    throw createError(500, err);
  }
};

const sendMail = async ({ identifier, body }) => {
  const userApplet = await userAppletRepo.findUserAppletByIdentifier(
    identifier
  );
  const user = await userRepo.findUserById(userApplet.userId);
  if (body.head_commit !== undefined) {
    await sg.send({
      to: user.email,
      from: process.env.SG_FROM_EMAIL,
      templateId: 'd-a451c67c185f447eb905fe85055dc003',
      dynamic_template_data: {
        committer: body.head_commit.committer.username,
        repository: body.repository.full_name,
        repository_url: body.repository.html_url,
        head_commit_link: body.head_commit.url
      }
    });
  } else {
    // here comes the ping from github to confirm webhook creation
  }
};

const validationResults = req => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = errors.array({ onlyFirstError: true })['0'].msg;
    throw createError(400, error);
  }
};

// const validateRepoName = repoName => {
//   const pattern = /\u002F/g; // searches for '/' in a string
//   const match = repoName.match(pattern); // returns an array of matched characters -> "owner/repo" = ["/"]; "owner/repo/hook" = ["/", "/"]; "owner+repo" = null
//   console.log(match);
//   if (match == null || match.length !== 1) {
//     throw createError(500, 'Invalid repository name format');
//   }
// };
// TODO test validation, fix if not working, validate dropbox as well
// repo name validation: max chars - 100, '-' and '_' allowed from special characters, numbers allowed
const validateRepoName = check('repository')
  .isLength({ max: 100 })
  .withMessage('Repository name is too long. (Maximum 100 characters allowed)')
  .matches('^([A-Za-z0-9-_])+')
  .withMessage('Repository name contains illegal characters.');

// user name validation: max chars - 39,only '-' allowed from special characters, numbers allowed
const validateRepoOwnerName = check('repositoryOwner')
  .isLength({ max: 39 })
  .withMessage(
    'The repository owner name is too long. (Maximum 39 characters allowed)'
  )
  .matches('^([A-Za-z0-9-])+')
  .withMessage('Repository owner name contains illegal characters.');

module.exports = {
  APPLET_ID,
  AUTH_URL,
  createWebhook,
  exchangeCodeForAccessToken,
  removeWebhook,
  sendMail,
  validationResults,
  validateRepoName,
  validateRepoOwnerName
};
