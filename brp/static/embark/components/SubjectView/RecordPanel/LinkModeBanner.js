import React from 'react';
import { connect } from 'react-redux';
import * as SubjectActions from '../../../actions/subject';

class LinkModeBanner extends React.Component {
  constructor(props) {
    super(props);
  }

  dismissLinkMode() {
    const { dispatch } = this.props;
    dispatch(SubjectActions.setLinkMode(false));
  }

  render() {
    return (
      <div className="link-banner" data-notify="container">
        <span onClick={this.dismissLinkMode.bind(this)} className="link-close">
          <i className="ti-close"></i>
        </span>
        Currently linking records. Please select the second record you would like to link.
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    linkMode: state.subject.linkMode,
  };
}

export default connect(mapStateToProps)(LinkModeBanner);
