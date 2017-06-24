const fs = require('fs');

const hdfs = require('../webhdfs-client');

module.exports = function download(filename, saveName) {
  hdfs.readFile(
    '/tmp/' + filename + '/aggregated.jpg',
    { namenoderpcaddress: 'localhost:8020', offset: 0 },
    (err, data) => {
      fs.writeFile(saveName, data, () => alert('download done'));
    }
  );
};
