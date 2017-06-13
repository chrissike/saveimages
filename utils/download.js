const path = require('path');
const os = require('os');
const sharp = require('sharp');
const streamifier = require('streamifier');

const hdfs = require('../webhdfs-client');

function addFileToImage(imageName, files, downloadName) {
  return new Promise((resolve, reject) => {
    if (files.length === 0) {
      resolve(saveName);
    }
    const saveName = downloadName.slice(-1) === '~'
      ? downloadName.slice(0, -1)
      : downloadName + '~';
    const file = files.shift();
    hdfs.readFile(
      '/tmp/' + imageName + '/' + file.name,
      { namenoderpcaddress: 'localhost:8020', offset: 0 },
      (err, data) => {
        if (err) {
          reject(err);
        }
        newImage = sharp(downloadName)
          .overlayWith(data, {
            left: file.position.left,
            top: file.position.top
          })
          .webp({ lossless: true })
          .toFile(saveName, (err, info) => {
            if (err) {
              reject(err);
            }
            console.log('Added file ' + file.name);
            addFileToImage(imageName, files, saveName)
              .then(resolve)
              .catch(reject);
          });
      }
    );
  });
}

function getPosition(filename) {
  const positions = path.basename(filename, path.extname(filename)).split('x');
  return { left: Number(positions[0]), top: Number(positions[1]) };
}

module.exports = function download(filename) {
  const downloadName = './' + filename;
  hdfs.readdir('/tmp/' + filename, (err, files) => {
    if (err) {
      alert('Could not read files from HDFS ' + err.message);
      return;
    }
    // remove preview image and only return the nedded data
    files = files
      .filter(item => item.pathSuffix !== 'preview.webp')
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
    console.log(files);
    // get last file to get the full image size
    const lastFile = [...files].pop();
    const lastPos = lastFile.position;
    // create new empty image with the size of the full image
    newImage = sharp('./utils/1px.png')
      .resize(lastPos.left + 512, lastPos.top + 512)
      .webp({ lossless: true })
      .toFile(downloadName);
    addFileToImage(filename, files, downloadName)
      .then(saveName => {
        //move slice image to normal image
        if (saveName.slice(-1) === '~') {
        }
      })
      .catch(console.log);
  });
};
