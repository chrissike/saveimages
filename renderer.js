const app = require('electron').remote;
const fs = require('fs');
const path = require('path');
const hdfs = require('./webhdfs-client');
const webp = require('webp-converter');
const os = require('os');
var mapslice = require('mapslice');
const tilenol = require('tilenol');
const sharp = require('sharp');
const streamifier = require('streamifier');

const dialog = app.dialog;

const openBtn = document.getElementById('openFile');
const txtArea = document.getElementById('txtArea');

openBtn.addEventListener('click', () => {
  dialog.showOpenDialog(function(fileNames) {
    if (fileNames === undefined) {
      console.log('No file selected');
      return;
    }

    readFile(fileNames[0]);
  });
});

let uploads = (finishedUploads = 0);
function isUploadFinished() {
  if (uploads === finishedUploads) {
    alert('Upload finished');
    uploads = finishedUploads = 0;
  }
}

function readFile(filepath) {
  let ext = path.extname(filepath);
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
                isUploadFinished();
              });
            });
        }
      }
    });
  }
}
