const path = require('path');
const os = require('os');
const sharp = require('sharp');
const streamifier = require('streamifier');

const hdfs = require('../webhdfs-client');

function addFileToImage(imageName, files) {
  const file = files.shift();
  hdfs.readFile(
    '/tmp/' + imageName + '/' + file.name,
    { namenoderpcaddress: 'localhost:8020', offset: 0 },
    (err, data) => {
      if (err) {
        console.log(err);
        return err;
      }
      newImage = sharp('./out.webp')
        .overlayWith(data, {
          left: file.position.left,
          top: file.position.top
        })
        .webp()
        .toFile('out.webp', (err, info) => {
          if (err) return err;
          console.log('Added file ' + file.name);
          addFileToImage(imageName, files);
        });
    }
  );
}

function getPosition(filename) {
  const positions = path.basename(filename, path.extname(filename)).split('x');
  return { left: Number(positions[0]), top: Number(positions[1]) };
}

module.exports = function download(filename) {
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
      .webp()
      .toFile('out.webp');
    addFileToImage(filename, files);
  });
  console.log(filename);
  // let newImage = sharp('./utils/1px.png').resize(512, 1024).overlayWith('./utils/1px.png').webp().toFile(';
  /*
  const files = ['0x0.webp', '0x512.webp'];
  // for (file of files) {
  const imgPosition = getPosition(files[0]);
  const imgPosition1 = getPosition(files[1]);
  newImage
    .overlayWith('./utils/' + files[0], {
      left: imgPosition.left,
      top: imgPosition.top
    })
    .webp()
    .toFile('out.webp');
  newImage = sharp('out.webp')
    .overlayWith('./utils/' + files[1], {
      left: imgPosition1.left,
      top: imgPosition1.top
    })
    .webp()
    .toFile('./out.webp', (err, info) => {
      console.log(err);
      console.log(info);
    });*/
  // }
};
