'use strict';

const React = require('react');

module.exports = class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.options = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center'
    };
  }

  render() {
    let style = {};
    if (this.props.loading) {
      style = Object.assign({}, this.options, { display: 'flex' });
    } else {
      style = Object.assign({}, this.options, { display: 'none' });
    }
    return React.createElement(
      'div',
      { style: Object.assign(style) },
      React.createElement('i', {
        className: 'fa fa-spinner fa-spin',
        style: { fontSize: '24px', color: 'black' }
      })
    );
  }
};