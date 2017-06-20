'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const hdfs = require('../../webhdfs-client');
const path = require('path');
const fs = require('fs');
const os = require('os');
const compression = require('compression');
const dialog = require('electron').remote.dialog;

const download = require('../../utils/download');
const upload = require('../../utils/upload');
const isAllowedExtName = require('../../utils/validate').isAllowedExtName;
const isAllowedDownloadFileName = require('../../utils/validate').isAllowedDownloadFileName;
const Preview = require('./components/preview');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.getImages = this.getImages.bind(this);
    this.filterImages = this.filterImages.bind(this);
    this.filterEvent = this.filterEvent.bind(this);
    this.viewImage = this.viewImage.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.deleteImage = this.deleteImage.bind(this);
    this.filterString = '';
    this.state = {
      files: [],
      filteredfiles: [],
      previewImg: '',
      previewImgName: ''
    };
  }

  uploadImage() {
    dialog.showOpenDialog(fileNames => {
      if (fileNames === undefined) {
        console.log('No file selected');
        return;
      }
      upload(fileNames[0]).then(() => {
        alert('upload done');
        this.getImages();
      });
    });
  }

  getImages() {
    hdfs.readdir('/tmp/', (err, files) => {
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
    });
  }

  viewImage(item) {
    hdfs.readFile('/tmp/' + item.pathSuffix + '/preview.webp', { namenoderpcaddress: 'localhost:8020', offset: 0 }, (err, data) => {
      fs.writeFile('preview.webp', data, () => this.setState({
        previewImg: 'preview.webp?' + new Date().getTime(),
        previewImgName: item.pathSuffix
      }));
    });
  }

  deleteImage(item) {
    if (confirm('Are you sure you want to delete image "' + item.pathSuffix + '" from your collection of images?')) {
      hdfs.unlink('/tmp/' + item.pathSuffix, true, () => {
        console.log('done');
        this.getImages();
        if (item.pathSuffix === this.state.previewImgName) {
          this.setState({
            previewImg: '',
            previewImgName: ''
          });
        }
      });
    }
  }

  filterImages(filter) {
    return this.state.files.filter(function (item) {
      if (filter == '') {
        return true;
      }
      let index = item.pathSuffix.search(filter);
      return index > -1;
    });
  }

  filterEvent(event) {
    this.setState({
      filteredfiles: this.filterImages(event.target.value)
    });
  }

  componentDidMount() {
    this.getImages();
  }

  downloadImage() {
    dialog.showSaveDialog(fileName => {
      if (!isAllowedDownloadFileName(fileName)) {
        fileName + '.webp';
      }
      download(this.state.previewImgName, fileName);
    });
  }

  render() {
    const listitems = this.state.filteredfiles.filter(item => isAllowedExtName(item.pathSuffix)).map((item, index) => {
      return React.createElement(
        'li',
        {
          className: 'list-group-item',
          key: index,
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        },
        React.createElement(
          'span',
          null,
          item.pathSuffix
        ),
        React.createElement(
          'div',
          {
            className: 'pull-right',
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '40px'
            }
          },
          React.createElement('i', {
            className: 'fa fa-eye',
            onClick: () => this.viewImage(item),
            style: { cursor: 'pointer' }
          }),
          React.createElement('i', {
            className: 'fa fa-trash-o',
            onClick: () => this.deleteImage(item),
            style: { cursor: 'pointer' }
          })
        )
      );
    });

    return React.createElement(
      'div',
      { className: 'container-fluid' },
      React.createElement(
        'div',
        { className: 'row' },
        React.createElement(
          'div',
          { className: 'col-xs-4' },
          React.createElement(
            'div',
            null,
            React.createElement(
              'button',
              {
                id: 'openFile',
                className: 'btn-md btn-success',
                onClick: this.uploadImage
              },
              'Upload image'
            )
          ),
          React.createElement(
            'div',
            null,
            React.createElement('input', {
              type: 'text',
              onChange: this.filterEvent,
              ref: input => this.filterString = input
            }),
            React.createElement(
              'ul',
              { className: 'list-group' },
              listitems
            ),
            React.createElement(
              'div',
              { className: 'row' },
              React.createElement(
                'button',
                {
                  id: 'refreshBtn',
                  onClick: this.getImages,
                  className: 'btn-md btn-success'
                },
                'Refresh'
              )
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'col-xs-8' },
          React.createElement(
            'span',
            null,
            'Bild'
          ),
          React.createElement(
            'div',
            null,
            React.createElement(Preview, {
              previewImg: this.state.previewImg,
              previewImgName: this.state.previewImgName
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement(
              'button',
              {
                id: 'downloadFile',
                className: 'btn-md btn-default-md',
                onClick: () => {
                  if (this.state.previewImgName === '') {
                    alert('please select an image first');
                    return;
                  }
                  this.downloadImage();
                }
              },
              'Download image'
            )
          )
        )
      )
    );
  }
}

ReactDOM.render(React.createElement(App, null), document.getElementById('app'));