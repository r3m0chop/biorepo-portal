import React from 'react';
import { History } from 'react-router';
import { connect } from 'react-redux';

class BackButton extends React.Component {
  constructor(props) {
    super(props);
  }

  handleClick() {
    this.context.history.goBack();
  }

  render() {
    var divStyle = {
      backgroundColor: 'white',
      opacity: '0.7',
      width: '75px',
      position: 'fixed',
      zIndex: 99,
      left: '90px',
      bottom: '10px',
      height: '75px',
      textAlign: 'center',
      borderRadius: '50%',
      boxShadow: '4px 4px 4px rgba(204, 197, 185, 0.4)',
      cursor: 'pointer',
    };
    var arrowStyle = {
      marginTop: '10px',
      fontSize: '2em',
      color: '#7AC29A',
      position: 'relative',
      top: '20px',
    };
    return (
      <div onClick={this.handleClick.bind(this)} style={divStyle}>
        <i style={arrowStyle} className="ti-arrow-left"></i>
      </div>
    );
  }
}

BackButton.contextTypes = {
  history: React.PropTypes.object,
};

export default connect()(BackButton);
