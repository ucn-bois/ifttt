const LocalStrategy = require('passport-local').Strategy;

const authRepo = require('./auth');
const usersRepo = require('./users');

const deserializeUser = async (userId, done) => {
  try {
    const user = await usersRepo.findUserById(userId);
    done(null, user);
  } catch (err) {
    done(err);
  }
};

const PassportLocalStrategy = new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await usersRepo.findUserByUsername(username);
      await authRepo.compareHashedPasswordWithPlainPassword({
        hashedPassword: user.password,
        plainPassword: password,
      });
      done(null, user);
    } catch (err) {
      done(err);
    }
  }
);

const serializeUser = (user, done) => done(null, user.id);

module.exports = {
  deserializeUser,
  PassportLocalStrategy,
  serializeUser,
};
