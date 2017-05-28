'use strict';

const React = require('react');

module.exports = class Preview extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log(this.props.previewImgName);
    return React.createElement('img', {
      src: this.props.previewImg,
      alt: this.props.previewImgName,
      style: { maxWidth: '300px' }
    });
  }
};