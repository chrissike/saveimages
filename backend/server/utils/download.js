const path = require('path');
const os = require('os');
const fs = require('fs');
const sharp = require('sharp');
const streamifier = require('streamifier');

const hdfs = require('../../webhdfs-client');
const imageSize = require('./size');
const downloadName = './test.webp';
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
            newImage = sharp(downloadName)
              .overlayWith(data, {
                left: file.position.left,
                top: file.position.top
              })
              .webp({ quality: quality })
              .toFile('./' + downloadName, (err, info) => {
                if (err) {
                  return reject(err);
                }
                console.log('Added file ' + file.name, info);
                // now delete the file in hdfs
                //hdfs.unlink('/tmp/' + imageName + '/' + file.name);
                resolve(downloadName);
              });
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
    const downloadName = 'test.webp';
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
            item.pathSuffix !== 'aggregated.webp'
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
        // create new empty image with the size of the full image
        sharp('./server/utils/1px.png')
          .resize(
            lastPos.left + dimension.width,
            lastPos.top + dimension.height
          )
          .webp({ quality: quality })
          .toFile(downloadName)
          .then(() => {
            addFileToImage(filename, files, downloadName).then(saveName => {
              sharp(saveName).toBuffer().then(buffer => {
                const readable = streamifier.createReadStream(buffer);
                const hdfsWriteStream = hdfs.createWriteStream(
                  '/tmp/' + filename + '/aggregated.webp'
                );
                readable.pipe(hdfsWriteStream);
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
