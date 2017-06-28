'use strict';

const React = require('react');

module.exports = class Preview extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const style = {};
    if (this.props.previewImgName) {
      style.width = '100%';
    }

    return React.createElement('img', {
      id: 'previewImg',
      style: style,
      src: this.props.previewImg,
      alt: this.props.previewImgName
    });
  }
};