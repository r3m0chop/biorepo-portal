import React from 'react';
import Griddle from 'griddle-react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import RaisedButton from 'material-ui/lib/raised-button';
import BackButton from '../BackButton';
import NewSubjectForm from './NewSubjectForm';
import LoadingGif from '../LoadingGif';
import * as ProtocolActions from '../../actions/protocol';
import * as SubjectActions from '../../actions/subject';

class SubjectSelect extends React.Component {

  constructor(props) {
    super(props);
    var manageExternalIDs = false
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(ProtocolActions.setActiveProtocol(this.props.params.id))
    // Check to see if subjects are loaded, if not fetch them
    if (
      (!this.props.subject.items || this.props.subject.items.length == 0) &&
        this.props.subject.isFetching == false
    ) {
      dispatch(SubjectActions.fetchSubjects(this.props.params.id));
    }
  }

  handleClick(row) {
    const subject = row.props.data.subject;
    const { dispatch } = this.props;

    // Push to the correct pathname (and therefore view)
    this.props.history.push({
      pathname: 'dataentry/protocol/' +
        this.props.protocol.activeProtocol.id +
        '/subject/' +
        subject.id,
    });
  }

  handleNewSubject() {
    const { dispatch } = this.props;
    dispatch(SubjectActions.setAddSubjectMode(true));
    dispatch(ProtocolActions.setActiveProtocol(this.props.protocol.activeProtocolId));
  }

  getActiveProtocol() {
    if (this.props.protocol.items){
      var activeProtocol = {};
      this.props.protocol.items.forEach(function(protocol){
        if (protocol.id == parseInt(this.props.protocol.activeProtocolId)){
          activeProtocol = protocol
        }
      }, this)
    }
    return activeProtocol
  }

    render() {
      // If this view is navigated to directly. Get active protocol based on param
      const subjects = this.props.subject.items;
      const protocol = this.getActiveProtocol();

      if (protocol){
        if (this.props.params.id == parseInt(protocol.id)) {
          this.props.protocol.activeProtocol = protocol;
          protocol.data_sources.forEach(function(ds){
            // HACK obtains datasource Id
            var pdsId = parseInt(ds.slice(ds.length-2,ds.length-1))
            if (pdsId == 3) {
              this.manageExternalIDs = true
            }
          }, this)
        }
      }
      var columns = ['Organization', 'MRN', 'First Name', 'Last Name', 'Birth Date']
      if (this.manageExternalIDs) {
        columns.push('External IDs')
      }
      // Transform subjects into Griddle friendly format
      // jscs:disable
      var subs = [];
      if (subjects) {
        var subs = subjects.map(function (sub) {
          var external_ids = ''
          sub.external_ids.forEach(function(exId){
            external_ids += exId.label_desc + ': ' + exId.record_id + '\n'
          }, this)
          return {
            'Organization': sub.organization_name,
            'MRN': sub.organization_subject_id,
            'First Name': sub.first_name,
            'Last Name': sub.last_name,
            'Birth Date': sub.dob,
            'External IDs': external_ids,
            'subject': sub
          };
        });
      }

      // jscs:enable
      return (
        protocol ?
          <div>
            { this.props.subject.addSubjectMode ?
              <NewSubjectForm orgs={this.props.protocol.orgs}/> :
              <div/>
            }
            { !this.props.subject.addSubjectMode ?
              <BackButton/> :
              <div/>
            }
            <h3>Project: {protocol.name}</h3>
            <div id="toolbar">
              <ul className="list-unstyled">
                <li>
                  <RaisedButton
                    mini={true}
                    labelColor={'#7AC29A'}
                    onClick={this.handleNewSubject.bind(this)}
                    label={'New Subject'}
                  />
                </li>
              </ul>
            </div>
            <div className="subject-table">
              <Griddle
                showFilter={true}
                onRowClick={this.handleClick.bind(this)}
                resultsPerPage={10}
                results={subs}
                columns={columns}
                tableClassName={'subject-table'}
                useGriddleStyles={false}
                customNoDataComponent={LoadingGif}
              />
            </div>
          </div> :
          <div/>
      );
    }
}

function mapStateToProps(state) {
  return {
    protocol: {
      items: state.protocol.items,
      activeProtocolId: state.protocol.activeProtocolId,
      orgs: state.protocol.orgs,
    },
    subject: {
      items: state.subject.items,
      addSubjectMode: state.subject.addSubjectMode,
      isFetching: state.subject.isFetching,
    },
  };
}

export default connect(mapStateToProps)(SubjectSelect);
