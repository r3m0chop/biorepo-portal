import React from 'react';
import Griddle from 'griddle-react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import BackButton from '../BackButton';
import NewSubjectForm from './NewSubjectForm';
import LoadingGif from '../LoadingGif';
import * as ProtocolActions from '../../actions/protocol';
import * as SubjectActions from '../../actions/subject';

class SubjectMenu extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { dispatch } = this.props;

    // Check to see if subjects are loaded, if not fetch them
    if (this.props.subject.items.length == 0) {
      dispatch(SubjectActions.fetchSubjects(this.props.params.id));
    }
  }

  handleClick(row) {
    const subject = row.props.data.subject;
    const { dispatch } = this.props;

    // Update state with new active subject
    dispatch(SubjectActions.setActiveSubject(subject));

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
      dispatch(ProtocolActions.setAddSubjectMode(true));
      dispatch(ProtocolActions.setActiveProtocol(this.props.protocol.activeProtocol));
    }

    render() {

      // If this view is navigated to directly. Get active protocol based on param
      if (this.props.protocol.activeProtocol == null) {

        // Iterate over loaded protocols to find current activeProtocol
        this.props.protocol.items.forEach(function (protocol) {

          // Normalize datatypes
          if (this.props.params.id == parseInt(protocol.id)) {
            this.props.protocol.activeProtocol = protocol;
          }
        }, this);
      }

      const subjects = this.props.subject.items;
      const protocol = this.props.protocol.activeProtocol;

      // Transform subjects into Griddle friendly format
      // jscs:disable
      var subs = subjects.map(function (sub) {
        return {
          'Organization': sub.organization_name,
          'MRN': sub.organization_subject_id,
          'First Name': sub.first_name,
          'Last Name': sub.last_name,
          'Birth Date': sub.dob,
          'subject': sub
        };
      });
      // jscs:enable
      return (
        protocol ?
          <div>
            { this.props.protocol.addSubjectMode ?
              <NewSubjectForm orgs={this.props.protocol.orgs}/> :
              <div/>
            }
            { !this.props.protocol.addSubjectMode ?
              <BackButton/> :
              <div/>
            }
            <h3>Project: {protocol.name}</h3>
            <div id="toolbar">
              <ul className="list-unstyled">
                <li>
                  <input
                    className="btn btn-success"
                    onClick={this.handleNewSubject.bind(this)}
                    type="button"
                    value="New Subject"
                    onclick="location.href='/portal/dataentry/protocol/20/newsubject/'"
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
                columns={['Organization', 'MRN', 'First Name', 'Last Name', 'Birth Date']}
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
      activeProtocol: state.protocol.activeProtocol,
      addSubjectMode: state.protocol.addSubjectMode,
      orgs: state.protocol.orgs,
    },
    subject: {
      items: state.subject.items,
    },
  };
}

export default connect(mapStateToProps)(SubjectMenu);
