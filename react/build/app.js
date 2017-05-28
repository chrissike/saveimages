'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const hdfs = require('../../webhdfs-client');
const path = require('path');
const fs = require('fs');
const os = require('os');
const compression = require('compression');

const Preview = require('./components/preview');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.getImages = this.getImages.bind(this);
    this.filterImages = this.filterImages.bind(this);
    this.filterEvent = this.filterEvent.bind(this);
    this.viewImage = this.viewImage.bind(this);
    this.filterString = '';
    this.state = {
      files: [],
      filteredfiles: [],
      previewImg: '',
      previewImgName: ''
    };
  }

  getImages() {
    hdfs.readdir('/tmp/', function (err, files) {
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
    }.bind(this));
  }

  viewImage(item) {
    hdfs.readFile('/tmp/' + item.pathSuffix, { namenoderpcaddress: 'localhost:8020', offset: 0 }, (err, data) => {
      fs.writeFile('preview' + path.extname(item.pathSuffix), data, () => this.setState({
        previewImg: 'preview' + path.extname(item.pathSuffix) + '?' + new Date().getTime(),
        previewImgName: item.pathSuffix
      }));
    });
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
    remotefileStream.on('downloadFile', function () {
      const writable = hdfs.createWriteStream('./file.txt');
      var remoteFileStream = hdfs.createWriteStream('/tmp/' + path.basename(filepath));
    });
  }

  render() {
    const listitems = this.state.filteredfiles.filter(function (item) {
      let extname = path.extname(item.pathSuffix).toLowerCase();
      return extname == '.jpg' || extname == '.png' || extname == '.dng' || extname == '.webp';
    }).map((item, index) => {
      return React.createElement(
        'li',
        {
          className: 'list-group-item',
          onClick: () => this.viewImage(item),
          key: index,
          style: { cursor: 'pointer' }
        },
        item.pathSuffix
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
              { id: 'openFile', className: 'btn-md btn-success' },
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
              { id: 'downloadFile', className: 'btn-md btn-default-md' },
              'Download image'
            )
          )
        )
      )
    );
  }
}

ReactDOM.render(React.createElement(App, null), document.getElementById('app'));