const path = require('path');
const os = require('os');
const sharp = require('sharp');
const streamifier = require('streamifier');

const hdfs = require('../webhdfs-client');

let uploads = (finishedUploads = 0);
function isUploadFinished() {
  if (uploads === finishedUploads) {
    uploads = finishedUploads = 0;
    return true;
  }
  return false;
}

module.exports = function upload(filepath) {
  return new Promise((resolve, reject) => {
    let ext = path.extname(filepath).toLowerCase();
    console.log(ext);
    console.log(filepath);
    if (ext == '.png' || ext == '.jpg' || ext == '.dng' || ext == '.txt') {
      const tmpdir = os.tmpdir();

      const image = sharp(filepath);
      const previewImg = sharp(filepath);
      previewImg.resize(500).webp({ quality: 80 }).toBuffer().then(buffer => {
        const readable = streamifier.createReadStream(buffer);
        const previewFileStream = hdfs.createWriteStream(
          '/tmp/' + path.basename(filepath) + '/preview.webp'
        );
        readable.pipe(previewFileStream);
      });

      image.metadata().then(function(metadata) {
        const tileSize = 512;

        const widthTiles = Math.ceil((metadata.width - 1) / tileSize);
        const heightTiles = Math.ceil((metadata.height - 1) / tileSize);
        // calculate how many uploads have to be done
        uploads = widthTiles * heightTiles;

        for (let l = 0; l < widthTiles; l++) {
          const left = l * tileSize;
          const width = l == widthTiles - 1 ? metadata.width - left : tileSize;

          for (let t = 0; t < heightTiles; t++) {
            const top = t * tileSize;
            const height = t == heightTiles - 1
              ? metadata.height - top
              : tileSize;

            const extractOptions = {
              left: left,
              top: top,
              width: width,
              height: height
            };

            const outputfile = left + 'x' + top + '.webp';
            image
              .extract(extractOptions)
              .webp({ quality: 80 })
              .toBuffer()
              .then(buffer => {
                const readable = streamifier.createReadStream(buffer);
                const sliceWriteStream = hdfs.createWriteStream(
                  '/tmp/' + path.basename(filepath) + '/' + outputfile
                );
                readable.pipe(sliceWriteStream);

                // Handle finish event
                sliceWriteStream.on('finish', function onFinish() {
                  finishedUploads++;
                  if (isUploadFinished()) {
                    console.log('finished upload');
                    resolve();
                  }
                });
              });
          }
        }
      });
    }
  });
};
