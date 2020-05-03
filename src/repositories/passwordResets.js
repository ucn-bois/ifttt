const createError = require('http-errors');
const { nanoid } = require('nanoid');

const { db, sg } = require('../clients');

const createPasswordReset = async ({ email, userId }) => {
  const identifier = nanoid(64);
  await db('passwordResets').insert({
    identifier,
    userId,
  });
  await sg.send({
    dynamic_template_data: { identifier },
    from: process.env.SG_FROM_EMAIL,
    templateId: 'd-e28f424c1e674799a5b155ad213d42e1',
    to: email,
  });
};

const findPasswordResetByIdentifier = async ({
  identifier,
  shouldThrow = true,
}) => {
  const verification = await db('passwordResets').where({ identifier }).first();
  if (shouldThrow && (!verification || !verification.pending)) {
    throw createError(
      404,
      `Password reset with identifier ${identifier} does not exist or is invalid.`
    );
  }
  return verification;
};

const invalidatePasswordReset = async (identifier) =>
  await db('passwordResets').where({ identifier }).update({ pending: false });

module.exports = {
  createPasswordReset,
  findPasswordResetByIdentifier,
  invalidatePasswordReset,
};
