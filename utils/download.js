const path = require('path');
const os = require('os');
const sharp = require('sharp');
const streamifier = require('streamifier');

const hdfs = require('../webhdfs-client');

module.exports = function download(filename) {
  hdfs.readdir('/tmp/' + filename, (err, files) => {
    if (err) {
      alert('Could not read files from HDFS ' + err.message);
      return;
    }

    console.log(files);
  });
};
