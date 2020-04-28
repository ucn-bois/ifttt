const createError = require('http-errors');
const { nanoid } = require('nanoid');

const { db, sg } = require('../clients');

const createUserVerification = async ({ email, userId }) => {
  const identifier = nanoid(64);
  await db('userVerifications').insert({
    identifier,
    userId,
  });
  await sg.send({
    dynamic_template_data: { identifier },
    from: process.env.SG_FROM_EMAIL,
    templateId: 'd-20c4415293cc41db90ebe330b42fe312',
    to: email,
  });
};

const findUserVerificationByIdentifier = async (identifier) => {
  const verification = await db('userVerifications')
    .where({ identifier })
    .first();
  if (!verification || !verification.pending) {
    throw createError(
      404,
      `User verification with identifier ${identifier} does not exist or is invalid.`
    );
  }
  return verification;
};

const invalidateUserVerification = async (identifier) =>
  await db('userVerifications')
    .where({ identifier })
    .update({ pending: false });

module.exports = {
  createUserVerification,
  findUserVerificationByIdentifier,
  invalidateUserVerification,
};
