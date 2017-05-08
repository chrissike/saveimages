'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const hdfs = require('../../webhdfs-client');
const path = require('path');
const compression = require('compression');

class App extends React.Component {

    constructor(props) {
        super(props);
        this.getImages = this.getImages.bind(this);
        this.filterImages = this.filterImages.bind(this);
        this.filterEvent = this.filterEvent.bind(this);
        this.filterString = '';
        this.state = {
            files: [],
            filteredfiles: []
        };
    }

    getImages() {
        hdfs.readdir('/tmp/', function (err, files) {
            if (err) {
                alert("Could not read files from HDFS " + err.message);
                return;
            }

            this.setState({
                files: files
            });
            this.setState({
                filteredfiles: this.filterImages(this.filterString)
            });
            console.log(files);
            console.log(err);
        }.bind(this));
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
            let extname = path.extname(item.pathSuffix);
            return extname == '.jpg' || extname == '.png' || extname == '.dng';
        }).map(function (item, index) {
            return React.createElement(
                'li',
                { key: index },
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
                    { className: 'col-xs-3' },
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'button',
                            { id: 'openFile', className: 'btn btn-default' },
                            'Upload image'
                        )
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'button',
                            { id: 'downloadFile', className: 'btn btn-default' },
                            'Download image'
                        )
                    ),
                    React.createElement('div', null)
                ),
                React.createElement(
                    'div',
                    { className: 'col-xs-6' },
                    React.createElement('input', { type: 'text', onChange: this.filterEvent, ref: input => this.filterString = input }),
                    React.createElement(
                        'ul',
                        { className: 'list-group-item-info' },
                        listitems
                    ),
                    React.createElement(
                        'div',
                        { className: 'row' },
                        React.createElement(
                            'button',
                            { id: 'refreshBtn', onClick: this.getImages, className: 'btn btn-default' },
                            'Refresh'
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'col-xs-3' },
                    'Bild'
                )
            )
        );
    }
}

ReactDOM.render(React.createElement(App, null), document.getElementById('app'));