const app = require('electron').remote;
const fs = require('fs');
const path = require('path');
const hdfs = require('./webhdfs-client');
const os = require('os');
const sharp = require('sharp');
const streamifier = require('streamifier');

const dialog = app.dialog;

/*downloadBtn.addEventListener('click', () => {
  const imgName = previewImg.getAttribute('alt');
  if (imgName === undefined || imgName === '') {
    alert('Please select an image first');
    return;
  }
  hdfs.readdir(
    '/tmp/',
    function(err, files) {
      if (err) {
        alert('Could not read files from HDFS ' + err.message);
        return;
      }

      this.setState({
        files: files
      });
      this.setState({
        filteredfiles: this.filterImages(this.filterString)
      });
    }.bind(this)
  );
  // const filepath = dialog.showSaveDialog({ defaultPath: imgName });
});
*/
