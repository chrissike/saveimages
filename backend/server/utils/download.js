const path = require('path');
const os = require('os');
const fs = require('fs');
const sharp = require('sharp');
const streamifier = require('streamifier');
const gm = require('gm');

const hdfs = require('../../webhdfs-client');
const imageSize = require('./size');
const downloadName = './test.jpg';
const quality = 85;

function addFileToImage(imageName, files, downloadName) {
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
    const downloadName = 'test.jpg';
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
      // get last file to get the full image size
      const lastFile = [...files].pop();
      imageSize('/tmp/' + filename + '/' + lastFile.name).then(dimension => {
        const lastPos = lastFile.position;
        console.log(dimension);
        // create new empty image with the size of the full image
        sharp('./server/utils/1px.png')
          .resize(
            lastPos.left + dimension.width,
            lastPos.top + dimension.height
          )
          .jpeg()
          .toFile(downloadName)
          .then(res => {
            console.log(res);

            addFileToImage(filename, files, downloadName).then(saveName => {
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
              aggregated.write('aggregated.jpg', err => {
                const readStream = fs.createReadStream('aggregated.jpg');
                const hdfsWriteStream = hdfs.createWriteStream(
                  '/tmp/' + filename + '/aggregated.jpg'
                );
                readStream.pipe(hdfsWriteStream);
                console.log('test', filename);

                hdfsWriteStream.on('error', function onError(err) {
                  console.log(err);
                });

                // Handle finish event
                hdfsWriteStream.on('finish', function onFinish() {
                  console.log('finished');
                });
              });
            });
          })
          .catch(err => {
            console.log(err);
            reject(err);
          });
      });
    });
  });
};
