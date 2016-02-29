// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
// jscs:disable maximumLineLength
import React from 'react';
import { Link, History } from 'react-router';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/lib/raised-button';
import SubjectTextField from './SubjectTextField';
import SubjectOrgSelectField from './SubjectOrgSelectField';
import * as SubjectActions from '../../../actions/subject';
import * as Colors from 'material-ui/lib/styles/colors';
import ExternalIDs from './ExternalIds';
import LoadingGif from '../../LoadingGif';

class SubjectCardEdit extends React.Component{

  constructor(props) {
    super(props);
  }

  restoreSubject() {
    // Restores the current Subject view with server's subject state
    this.props.dispatch(SubjectActions.fetchSubject(this.props.protocol.activeProtocol.id,
      this.props.subject.activeSubject.id));
  }

  handleSaveClick(e) {
    const { dispatch } = this.props;
    var protocol = this.props.protocol.activeProtocol;
    var subject = this.props.subject.activeSubject;
    if (this.isValid()) {
      dispatch(SubjectActions.updateSubject(protocol, subject));
    } else {
      alert('form is invalid');
    }

    e.preventDefault();
  }

  handleCancelClick() {
    this.restoreSubject();
    this.context.history.goBack();
  }

  isValid() {

    // Validation checks for the Subject edit form
    var subject = this.props.subject.activeSubject;

    if (subject.first_name == '') {
      return false;
    }

    if (subject.last_name == '') {
      return false;
    }

    if (subject.dob == '') {
      return false;
    }

    if (subject.organization_subject_id != subject.organization_subject_id_validation) {
      return false;
    }

    return true;
  }

  render() {
    if (this.props.subject.activeSubject) {
      const subject = this.props.subject.activeSubject;
      const fullName = subject.first_name + ' ' + subject.last_name;
      const orgs = this.props.protocol.orgs;
      return (
          <div className="col-md-4 col-sm-6">
            <div className="card">
              <div className="more">
              </div>
              <div className="content">
                <form id="subject-form" onSubmit={this.handleSaveClick.bind(this)}>
                  <SubjectOrgSelectField value={subject.organization_id} />
                  <SubjectTextField label={'First Name'} value={subject.first_name} skey={'first_name'}/>
                  <SubjectTextField label={'Last Name'} value={subject.last_name} skey={'last_name'} />
                  <SubjectTextField label={'Organization ID'} value={subject.organization_subject_id} skey={'organization_subject_id'} />
                  <SubjectTextField label={'Organization ID'} value={subject.organization_subject_id_validation} skey={'organization_subject_id_validation'} />
                  <SubjectTextField label={'Date of Birth'} value={subject.dob} skey={'dob'} />
                <ExternalIDs externalIds={subject.external_ids} />
                { !this.props.savingSubject ?
                  <div className="subject-form-button-group">
                    <RaisedButton
                      labelColor={'#7AC29A'}
                      mini={true}
                      type="submit"
                      label={'Save'}
                    />
                    <RaisedButton
                      onClick={this.handleCancelClick.bind(this)}
                      labelColor={Colors.red400}
                      style={{ marginLeft:'10px' }}
                      mini={true} label={'Close'}
                    />
                  </div>
                  :
                  <LoadingGif/>
                }
                </form>
              </div>
            </div>
          </div>
      );
    } else {
      return <div/>;
    }
  }
};

// Provides History to the SubjectCardEdit component
SubjectCardEdit.contextTypes = {
  history: React.PropTypes.object,
};

function mapStateToProps(state) {
  return {
    protocol: {
      items: state.protocol.items,
      activeProtocol: state.protocol.activeProtocol,
      orgs: state.protocol.orgs,
    },
    subject: {
      items: state.subject.items,
      activeSubject: state.subject.activeSubject,
    },
    pds: {
      items: state.pds.items,
    },
    savingSubject: state.subject.isSaving,
    showInfoPanel: state.subject.showInfoPanel,
    showActionPanel: state.subject.showActionPanel,
  };
}

export default connect(mapStateToProps)(SubjectCardEdit);
