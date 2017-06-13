const fs = require('fs');
const download = require('../utils/download');

module.exports = function(Image) {
  //define init method
  Image.prepare = (filename, callback) => {
    download(filename).then(callback).catch(callback);
  };

  Image.remoteMethod('prepare', {
    http: {
      path: '/prepare',
      verb: 'get'
    },
    accepts: [{ arg: 'filename', type: 'string' }],
    returns: {
      arg: 'ok',
      type: 'bool'
    }
  });

  // disable normal methods
  Image.disableRemoteMethodByName('create');
  Image.disableRemoteMethodByName('upsert');
  Image.disableRemoteMethodByName('updateAll');
  Image.disableRemoteMethodByName('updateAttributes');

  Image.disableRemoteMethodByName('findById');
  Image.disableRemoteMethodByName('findOne');
  Image.disableRemoteMethodByName('deleteById');

  Image.disableRemoteMethodByName('confirm');
  Image.disableRemoteMethodByName('changePassword');
  Image.disableRemoteMethodByName('count');
  Image.disableRemoteMethodByName('exists');
  Image.disableRemoteMethodByName('resetPassword');
  Image.disableRemoteMethodByName('createChangeStream');
  Image.disableRemoteMethodByName('replaceById');
  Image.disableRemoteMethodByName('replaceOrCreate');
  Image.disableRemoteMethodByName('setPassword');
  Image.disableRemoteMethodByName('upsertWithWhere');

  Image.disableRemoteMethodByName('prototype.updateAttributes');
  Image.disableRemoteMethodByName('prototype.verify');
  Image.disableRemoteMethodByName('prototype.__count__accessTokens');
  Image.disableRemoteMethodByName('prototype.__create__accessTokens');
  Image.disableRemoteMethodByName('prototype.__delete__accessTokens');
  Image.disableRemoteMethodByName('prototype.__destroyById__accessTokens');
  Image.disableRemoteMethodByName('prototype.__findById__accessTokens');
  Image.disableRemoteMethodByName('prototype.__get__accessTokens');
  Image.disableRemoteMethodByName('prototype.__updateById__accessTokens');
};
