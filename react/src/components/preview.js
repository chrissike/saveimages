const React = require('react');

module.exports = class Preview extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <img
        id="previewImg"
        src={this.props.previewImg}
        alt={this.props.previewImgName}
      />
    );
  }
};
