const path = require('path');
const os = require('os');
const fs = require('fs');
const gm = require('gm');

const hdfs = require('../../webhdfs-client');
const imageSize = require('./size');
const quality = 85;

function addFileToImage(imageName, files) {
  return files.reduce((promise, file) => {
    return promise.then(() => {
      return new Promise((resolve, reject) => {
        console.log('/tmp/' + imageName + '/' + file.name);

        hdfs.readFile(
          '/tmp/' + imageName + '/' + file.name,
          { namenoderpcaddress: 'localhost:8020', offset: 0 },
          (err, data) => {
            if (err) {
              return reject(err);
            }
            if (!fs.existsSync('./server/tmp/' + imageName)) {
              fs.mkdirSync('./server/tmp/' + imageName);
            }
            if (!fs.existsSync('./server/tmp/' + imageName + '/' + file.name)) {
              fs.writeFileSync(
                './server/tmp/' + imageName + '/' + file.name,
                data
              );
              hdfs.unlink('/tmp/' + imageName + '/' + file.name);
            }
            resolve('');
          }
        );
      });
    });
  }, Promise.resolve());
}

function getPosition(filename) {
  const positions = path.basename(filename, path.extname(filename)).split('x');
  return { left: Number(positions[0]), top: Number(positions[1]) };
}

module.exports = function download(filename) {
  return new Promise((resolve, reject) => {
    hdfs.readdir('/tmp/' + filename, (err, files) => {
      if (err) {
        return reject('Could not read files from HDFS ' + err.message);
      }
      resolve();
      // remove preview image and only return the nedded data
      files = files
        .filter(
          item =>
            item.pathSuffix !== 'preview.webp' &&
            item.pathSuffix !== 'aggregated.jpg'
        )
        .map(item => {
          return {
            name: item.pathSuffix,
            position: getPosition(item.pathSuffix)
          };
        });
      // sort files by position
      files.sort((a, b) => {
        if (a.position.left === b.position.left) {
          return a.position.top - b.position.top;
        }
        return a.position.left - b.position.left;
      });
      addFileToImage(filename, files).then(saveName => {
        const tiles = fs.readdirSync('./server/tmp/' + filename);
        let aggregated = gm();
        tiles.forEach(tile => {
          const pos = getPosition(tile);
          console.log(tile, '+' + pos.left + '+' + pos.top);
          aggregated = aggregated
            .in('-page', '+' + pos.left + '+' + pos.top)
            .in('./server/tmp/' + filename + '/' + tile);
        });
        aggregated = aggregated.mosaic();
        aggregated.write(
          './server/tmp/' + filename + '/aggregated.jpg',
          err => {
            console.log(err);
            const readStream = fs.createReadStream(
              './server/tmp/' + filename + '/aggregated.jpg'
            );
            const hdfsWriteStream = hdfs.createWriteStream(
              '/tmp/' + filename + '/aggregated.jpg',
              undefined,
              undefined,
              process.env.NODE_ENV === 'production' ? 'hadoop' : 'localhost'
            );
            readStream.pipe(hdfsWriteStream);
            console.log('test', filename);

            hdfsWriteStream.on('error', function onError(err) {
              console.log(err);
            });

            // Handle finish event
            hdfsWriteStream.on('finish', function onFinish() {
              // remove files from tmp
              tiles.forEach(tile => {
                fs.unlinkSync('./server/tmp/' + filename + '/' + tile);
              });
              fs.unlinkSync('./server/tmp/' + filename + '/aggregated.jpg');
              fs.rmdirSync('./server/tmp/' + filename);

              console.log('finished');
            });
          }
        );
      });
    });
  });
};
