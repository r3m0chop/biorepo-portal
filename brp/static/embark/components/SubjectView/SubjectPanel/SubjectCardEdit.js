// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
// jscs:disable maximumLineLength
import React from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/lib/raised-button';
import SubjectTextField from './SubjectTextField';
import SubjectOrgSelectField from './SubjectOrgSelectField';
import * as SubjectActions from '../../../actions/subject';
import * as Colors from 'material-ui/lib/styles/colors';
import ExternalIDs from './ExternalIds';
import LoadingGif from '../../LoadingGif';

class SubjectCardEdit extends React.Component {

  constructor(props) {
    super(props);
    this.handleCancelClick = this.handleCancelClick.bind(this);
    this.handleSaveClick = this.handleSaveClick.bind(this);
  }

  restoreSubject() {
    // Restores the current Subject view with server's subject state
    const { dispatch } = this.props;
    const activeProtocolId = this.props.protocol.activeProtocolId;
    const activeSubjectId = this.props.subject.activeSubject.id;
    dispatch(SubjectActions.fetchSubject(activeProtocolId, activeSubjectId));
  }

  handleSaveClick(e) {
    const { dispatch } = this.props;
    const protocolId = this.props.protocol.activeProtocolId;
    const subject = this.props.subject.activeSubject;
    if (this.isValid()) {
      dispatch(SubjectActions.updateSubject(protocolId, subject));
    } else {
      // TODO: Better user feedback than an alert.
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
    const subject = this.props.subject.activeSubject;
    if (subject.first_name === '') {
      return false;
    }
    if (subject.last_name === '') {
      return false;
    }
    if (subject.dob === '') {
      return false;
    }
    if (subject.organization_subject_id !== subject.organization_subject_id_validation) {
      return false;
    }
    return true;
  }

  render() {
    if (this.props.subject.activeSubject) {
      const subject = this.props.subject.activeSubject;
      return (
        <div className="col-md-4 col-sm-6">
          <div className="card">
            <div className="more">
            </div>
            <div className="content">
              <form id="subject-form" onSubmit={this.handleSaveClick}>
                <SubjectOrgSelectField value={subject.organization_id} />
                <SubjectTextField
                  label={'First Name'}
                  value={subject.first_name}
                  skey={'first_name'}
                />
                <SubjectTextField
                  label={'Last Name'}
                  value={subject.last_name}
                  skey={'last_name'}
                />
                <SubjectTextField
                  label={'Organization ID'}
                  value={subject.organization_subject_id}
                  skey={'organization_subject_id'}
                />
                <SubjectTextField
                  label={'Organization ID'}
                  value={subject.organization_subject_id_validation}
                  skey={'organization_subject_id_validation'}
                />
                <SubjectTextField
                  label={'Date of Birth'}
                  value={subject.dob}
                  skey={'dob'}
                />
                <ExternalIDs externalIds={subject.external_ids} />
              {!this.props.savingSubject ?
                <div className="subject-form-button-group">
                  <RaisedButton
                    labelColor={'#7AC29A'}
                    mini
                    type="submit"
                    label={'Save'}
                  />
                  <RaisedButton
                    onClick={this.handleCancelClick}
                    labelColor={Colors.red400}
                    style={{ marginLeft: '10px' }}
                    mini
                    label={'Close'}
                  />
                </div>
                :
                <LoadingGif />
              }
              </form>
            </div>
          </div>
        </div>
      );
    }
    return <div />;
  }
}

// Provides History to the SubjectCardEdit component
SubjectCardEdit.contextTypes = {
  history: React.PropTypes.object,
};

SubjectCardEdit.propTypes = {
  dispatch: React.PropTypes.func,
  protocol: React.PropTypes.object,
  subject: React.PropTypes.object,
  pds: React.PropTypes.object,
  savingSubject: React.PropTypes.bool,
};

function mapStateToProps(state) {
  return {
    protocol: {
      items: state.protocol.items,
      activeProtocolId: state.protocol.activeProtocolId,
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
  };
}

export default connect(mapStateToProps)(SubjectCardEdit);
