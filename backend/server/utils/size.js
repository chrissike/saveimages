const sharp = require('sharp');
const streamifier = require('streamifier');

const hdfs = require('../../webhdfs-client');

module.exports = function size(path) {
  return new Promise((resolve, reject) => {
    hdfs.readFile(
      path,
      { namenoderpcaddress: 'localhost:8020', offset: 0 },
      (err, data) => {
        if (err) {
          return reject(err);
        }
        sharp(data).metadata().then(metadata => {
          resolve({ width: metadata.width, height: metadata.height });
        });
      }
    );
  });
};
