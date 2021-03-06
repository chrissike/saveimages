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
const isAllowedDownloadFileName = require('../../utils/validate')
  .isAllowedDownloadFileName;
const Preview = require('./components/preview');
const Loading = require('./components/loading');

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
      previewImgName: '',
      loading: false
    };
  }

  uploadImage() {
    dialog.showOpenDialog(fileNames => {
      this.setState({ loading: true });
      if (fileNames === undefined) {
        console.log('No file selected');
        return;
      }
      upload(fileNames[0]).then(() => {
        this.setState({ loading: false });
        this.getImages();
        alert('upload done');
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
    hdfs.readFile(
      '/tmp/' + item.pathSuffix + '/preview.webp',
      { namenoderpcaddress: 'localhost:8020', offset: 0 },
      (err, data) => {
        fs.writeFile(os.tmpdir() + '/' + 'preview.webp', data, () =>
          this.setState({
            previewImg:
              os.tmpdir() + '/' + 'preview.webp?' + new Date().getTime(),
            previewImgName: item.pathSuffix
          })
        );
      }
    );
  }

  deleteImage(item) {
    if (
      confirm(
        'Are you sure you want to delete image "' +
          item.pathSuffix +
          '" from your collection of images?'
      )
    ) {
      hdfs.unlink('/tmp/' + item.pathSuffix, true, () => {
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

  downloadImage(name) {
    if (!name) name = this.state.previewImgName;
    // check if file exists in hdfs already
    hdfs.exists('/tmp/' + name + '/aggregated.jpg', exists => {
      if (exists) {
        dialog.showSaveDialog({ defaultPath: name }, fileName => {
          if (!isAllowedDownloadFileName(fileName)) {
            fileName += '.jpg';
          }
          download(name, fileName);
        });
      } else {
        alert(
          'The requested file is currently comprimized. Please try again later.'
        );
      }
    });
  }

  render() {
    const listitems = this.state.filteredfiles
      .filter(item => isAllowedExtName(item.pathSuffix))
      .map((item, index) => {
        return (
          <li
            className="list-group-item"
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>
              {item.pathSuffix}
            </span>
            <div
              className="pull-right"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '60px'
              }}
            >
              <i
                className="fa fa-eye"
                onClick={() => this.viewImage(item)}
                style={{ cursor: 'pointer' }}
              />
              <i
                className="fa fa-download"
                onClick={() => {
                  this.downloadImage(item.pathSuffix);
                }}
                style={{ cursor: 'pointer' }}
              />
              <i
                className="fa fa-trash-o"
                onClick={() => this.deleteImage(item)}
                style={{ cursor: 'pointer' }}
              />
            </div>
          </li>
        );
      });

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-xs-4">
            <div style={{ marginBottom: '10px', textAlign: 'center' }}>
              <button
                id="openFile"
                className="btn-md btn-success"
                onClick={this.uploadImage}
              >
                <i className="fa fa-cloud-upload" />
                <span style={{ marginLeft: '10px' }}>Upload Image</span>
              </button>
            </div>
            <hr />
            <div>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ marginRight: '10px' }}>Search:</span>
                <input
                  type="text"
                  onChange={this.filterEvent}
                  ref={input => (this.filterString = input)}
                />
              </div>
              <ul className="list-group">
                {listitems}
              </ul>
            </div>
          </div>
          <div className="col-xs-8">
            <div className="container-fluid">
              <div className="row">
                <span>
                  Preview of <b>{this.state.previewImgName}</b>:
                </span>
              </div>
              <div className="row">
                <Preview
                  previewImg={this.state.previewImg}
                  previewImgName={this.state.previewImgName}
                />
              </div>
            </div>
          </div>
        </div>
        <Loading loading={this.state.loading} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
