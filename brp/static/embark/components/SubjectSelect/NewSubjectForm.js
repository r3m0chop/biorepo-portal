// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import React from 'react';
import * as SubjectActions from '../../actions/subject';
import RaisedButton from 'material-ui/lib/raised-button';
import Divider from 'material-ui/lib/divider';
import * as Colors from 'material-ui/lib/styles/colors';
import SubjectOrgSelectField from '../SubjectView/SubjectPanel/SubjectOrgSelectField';
import SubjectTextField from '../SubjectView/SubjectPanel/SubjectTextField';
import { connect } from 'react-redux';

class NewSubjectForm extends React.Component{

  constructor(props) {
    super(props);
  }

  handleSaveClick(e) {
    e.preventDefault();
    const protocol = this.props.protocol.activeProtocol;
    const subject = this.props.subject.newSubject;
    const { dispatch } = this.props;
    if (this.isValid()) {
      dispatch(SubjectActions.addSubject(protocol, subject));
    }
  }

  handleCloseClick() {
    const { dispatch } = this.props;
    dispatch(SubjectActions.setAddSubjectMode());
  }

  isValid() {
    const subject = this.props.subject.newSubject;

    if (Object.keys(subject).length == 0) {
      return false;
    }

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

  renderErrors() {
    const errors = this.props.newFormErrors;
    const style = {
      fontSize: '12px',
      marginTop: '15px',
    };

    if (errors) {
      return (
        errors.map(function (error, i) {
          return (
            <div key={i} style={style} className="alert alert-danger">
              <div className="container">
                {error}
              </div>
            </div>
          );
        })
      );
    }
  }

  render() {
    const orgs = this.props.orgs;
    const newSub = this.props.subject.newSubject;

    // jscs:disable
    return (
      <div className="col-md-12 col-sm-12">
      <div className="col-md-4 col-sm-4 new-subject-form">
        <div className="card">
          <h6 className="category">Add New Subject</h6>
          <div className="more">
          </div>
          <div className="content">
          <form id="subject-form" onSubmit={this.handleSaveClick.bind(this)}>
            <SubjectOrgSelectField new={true} value={newSub.organization} />
            <SubjectTextField new={true} label={'First Name'} value={null} skey={'first_name'}/>
            <SubjectTextField new={true} label={'Last Name'} value={null} skey={'last_name'} />
            <SubjectTextField new={true} label={'Organization ID'} value={null} skey={'organization_subject_id'} />
            <SubjectTextField new={true} label={'Organization ID'} value={null} skey={'organization_subject_id_validation'} />
            <SubjectTextField new={true} label={'Date of Birth'} value={null} skey={'dob'} />
            <RaisedButton label={'Add Subject'} labelColor={'#7AC29A'} type="submit" style={{width:'100%'}}/>
            <Divider />
            <RaisedButton label={'Cancel'} labelColor={Colors.red400} onClick={this.handleCloseClick.bind(this)} style={{width:'100%'}}/>
          </form>
          {this.renderErrors()}
          </div>
        </div>
      </div>
      </div>
    );
  }
  // jscs:enable
}

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
      newSubject: state.subject.newSubject,
    },
    pds: {
      items: state.pds.items,
    },
    savingSubject: state.subject.isSaving,
    showInfoPanel: state.subject.showInfoPanel,
    showActionPanel: state.subject.showActionPanel,
    newFormErrors: state.subject.newFormErrors,
  };
}

export default connect(mapStateToProps)(NewSubjectForm);
