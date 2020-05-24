const chai = require('chai');
chai.use(require('chai-http'));
chai.use(require('chai-as-promised'));

const expect = chai.expect;

require('../app');

const { db } = require('../src/clients');

const {
  changeEmail,
  changePassword,
  createUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  unverifyUser,
  verifyUser,
} = require('../src/repositories/users');

describe("user's repository", () => {
  const user = {
    email: 'test@test.xyz',
    hashedPassword: 'password',
    id: null,
    newEmail: 'testNewEmail@test.xyz',
    newHashedPassword: 'passwordNew',
    username: 'test',
  };

  const deleteUser = async () =>
    db('users').where({ email: user.newEmail }).del();

  before(deleteUser);
  after(deleteUser);

  it('create test user', async () =>
    await expect(createUser(user)).to.not.be.rejected);

  it('find test user by email', async () => {
    const { id } = await expect(
      findUserByEmail({
        email: user.email,
      })
    ).to.not.be.rejectedWith(`User with email ${user.email} does not exist`);
    user.id = id;
  });

  it('find test user by username', async () =>
    await expect(
      findUserByUsername({
        username: user.username,
      })
    ).to.not.be.rejectedWith(
      `User with username ${user.username} does not exist`
    ));

  it('find test user by id', async () =>
    await expect(findUserById(user.id)).to.not.be.rejectedWith(
      `User with id ${user.id} does not exist.`
    ));

  it('change email', async () =>
    await expect(
      changeEmail({
        newEmail: user.newEmail,
        userId: user.id,
      })
    ).to.not.be.rejected);

  it('change password', async () =>
    await expect(
      changePassword({
        newHashedPassword: user.newEmail,
        userId: user.id,
      })
    ).to.not.be.rejected);

  it('verify user', async () => {
    await expect(verifyUser(user.id)).to.not.be.rejected;
    const { isVerified } = await findUserById(user.id);
    expect(isVerified).equals(1);
  });

  it('unverify user', async () => {
    await expect(unverifyUser(user.id)).to.not.be.rejected;
    const { isVerified } = await findUserById(user.id);
    expect(isVerified).equals(0);
  });
});
