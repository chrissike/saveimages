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
const Preview = require('./components/preview');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.getImages = this.getImages.bind(this);
    this.filterImages = this.filterImages.bind(this);
    this.filterEvent = this.filterEvent.bind(this);
    this.viewImage = this.viewImage.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
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
      upload(fileNames[0]).then(() => alert('upload done'));
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
    hdfs.readFile(
      '/tmp/' + item.pathSuffix + '/preview.webp',
      { namenoderpcaddress: 'localhost:8020', offset: 0 },
      (err, data) => {
        fs.writeFile('preview.webp', data, () =>
          this.setState({
            previewImg: 'preview.webp?' + new Date().getTime(),
            previewImgName: item.pathSuffix
          })
        );
      }
    );
  }

  filterImages(filter) {
    return this.state.files.filter(function(item) {
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
    remotefileStream.on('downloadFile', function() {
      const writable = hdfs.createWriteStream('./file.txt');
      var remoteFileStream = hdfs.createWriteStream(
        '/tmp/' + path.basename(filepath)
      );
    });
  }

  render() {
    const listitems = this.state.filteredfiles
      .filter(function(item) {
        let extname = path.extname(item.pathSuffix).toLowerCase();
        return (
          extname == '.jpg' ||
          extname == '.png' ||
          extname == '.dng' ||
          extname == '.webp'
        );
      })
      .map((item, index) => {
        return (
          <li
            className="list-group-item"
            onClick={() => this.viewImage(item)}
            key={index}
            style={{ cursor: 'pointer' }}
          >
            {item.pathSuffix}
          </li>
        );
      });

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-xs-4">

            <div>
              <button
                id="openFile"
                className="btn-md btn-success"
                onClick={this.uploadImage}
              >
                Upload image
              </button>
            </div>

            <div>
              <input
                type="text"
                onChange={this.filterEvent}
                ref={input => (this.filterString = input)}
              />
              <ul className="list-group">
                {listitems}
              </ul>

              <div className="row">
                <button
                  id="refreshBtn"
                  onClick={this.getImages}
                  className="btn-md btn-success"
                >
                  Refresh
                </button>
              </div>

            </div>
          </div>
          <div className="col-xs-8">
            <span>Bild</span>
            <div>
              <Preview
                previewImg={this.state.previewImg}
                previewImgName={this.state.previewImgName}
              />
            </div>
            <div>
              <button
                id="downloadFile"
                className="btn-md btn-default-md"
                onClick={() => {
                  if (this.state.previewImgName === '') {
                    alert('please select an image first');
                    return;
                  }
                  download(this.state.previewImgName);
                }}
              >
                Download image
              </button>
            </div>
          </div>

        </div>

      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
