// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import React from 'react';
import PDSRecordGroup from './PDSRecordGroup';
import SkyLight from 'react-skylight';
import * as SubjectActions from '../../actions/subject';
import * as RecordActions from '../../actions/record';
import { connect } from 'react-redux';

class SubjectRecords extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(SubjectActions.setActiveSubject(this.props.subject));
  }

  dismissLinkMode() {
    const { dispatch } = this.props;
    dispatch(SubjectActions.setLinkMode(false));
  }

  renderLinkModeBanner() {
    if (this.props.linkMode) {
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

  render() {
    const dispatch = this.props.dispatch;
    const pds = this.props.pds.items;
    const records = this.props.subject.external_records;
    const linkMode = this.props.linkMode;
    const linkModeBanner = this.renderLinkModeBanner();
    if (pds) {
      var pdsNodes = pds.map(function (pds, i) {
        var pds_records = records.filter(function (record) {
          if (pds.id == record.pds) {
            return record;
          }
        });

        return (
          <PDSRecordGroup key={i} pds={pds} records={pds_records}/>
        );

      }, this);
    }

    return (
      <div className="col-md-8 col-sm-2">
        <div className="card">
          <div className="content">
            { linkModeBanner }
            <h5 className="category">Subject Records</h5>
            { pdsNodes }
          </div>
        </div>
        { this.props.children }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    protocol: {
      items: state.protocol.items,
      activeProtocol: state.protocol.activeProtocol,
    },
    pds: {
      items: state.pds.items,
    },
    showInfoPanel: state.subject.showInfoPanel,
    showActionPanel: state.subject.showActionPanel,
    activeRecord: state.record.activeRecord,
    linkMode: state.subject.linkMode,
    selectedLabel: state.record.selectedLabel,
  };
}

export default connect(mapStateToProps)(SubjectRecords);
