// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import React from 'react';
import * as SubjectActions from '../../../actions/subject';
import * as RecordActions from '../../../actions/record';
import { connect } from 'react-redux';

class LinkedRecords extends React.Component {
  constructor(props) {
    super(props);
  }

  removeLink(activeRecord, linkId){
    // Should display confirmation modal
    const { dispatch } = this.props
    dispatch(RecordActions.deleteRecordLink(activeRecord, linkId))
  }

  render(){
    const activeRecord = this.props.activeRecord;
    const removeLinkStyle = {
      fontSize: '.8em',
      paddingLeft: '7px',
      cursor: 'pointer'
    }
    return (
        <div className="col-md-8 col-sm-2 col-md-offset-4">
          <div className="card">
            <div className="content">
                <h5 className="category">Linked Records</h5>
                {
                  this.props.activeLinks.map(function(link, i) {
                    return (
                      <div key={i}>
                        Active record {activeRecord.id} is related to {link.external_record.id } as {link.description} <span style={removeLinkStyle}><a onClick={this.removeLink.bind(this, activeRecord, link.id)}>remove link</a></span>
                      </div>
                    )
                  }, this)
                }
            </div>
          </div>
        </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    activeRecord: state.record.activeRecord,
    activeLinks: state.record.activeLinks,
  }
}

export default connect(mapStateToProps)(LinkedRecords);
