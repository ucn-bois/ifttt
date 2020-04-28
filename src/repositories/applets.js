const { db } = require('../clients');

const getApplets = async (userId) =>
  await db('applets')
    .leftJoin('userApplets', function () {
      this.on('applets.id', 'userApplets.appletId').on(
        'userApplets.userId',
        userId
      );
    })
    .select(
      'applets.id',
      'applets.name',
      'applets.description',
      'applets.homepage',
      db.raw(`case when userApplets.userId then 1 else 0 end as subscribed`)
    );

module.exports = {
  getApplets,
};
