const bcrypt = require('bcrypt');
const createError = require('http-errors');

const compareHashedPasswordWithPlainPassword = async ({
  hashedPassword,
  plainPassword,
  shouldThrow = true,
}) => {
  const match = await bcrypt.compare(plainPassword, hashedPassword);
  if (shouldThrow && !match) {
    throw createError(403, 'Provided password is incorrect.');
  }
  return match;
};

const comparePlainPasswords = ({ plainPassword, repeatedPlainPassword }) => {
  if (plainPassword !== repeatedPlainPassword) {
    throw createError(400, 'Passwords do not match.');
  }
};

const hashPassword = async (password) => await bcrypt.hash(password, 6);

module.exports = {
  compareHashedPasswordWithPlainPassword,
  comparePlainPasswords,
  hashPassword,
};
