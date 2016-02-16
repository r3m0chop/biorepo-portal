import React from 'react';
import * as ProtocolActions from '../../actions/protocol';
import * as SubjectActions from '../../actions/subject';
import SubjectOrgSelectField from '../SubjectView/SubjectCard/SubjectOrgSelectField'
import SubjectTextField from '../SubjectView/SubjectCard/SubjectTextField'
import { connect } from 'react-redux';

class NewSubjectForm extends React.Component{
    constructor(props){
        super(props);
    }

    handleSaveClick(e){
        const protocol = this.props.protocol.activeProtocol
        const subject = this.props.subject.newSubject;
        const { dispatch } = this.props
        dispatch(SubjectActions.addSubject(protocol, subject));
        e.preventDefault()
    }
    handleCloseClick(){
        const { dispatch } = this.props
        dispatch(ProtocolActions.setAddSubjectMode());
    }

    render(){
        const orgs = this.props.orgs
        return (
            <div className="col-md-12 col-sm-12">
            <div className="col-md-4 col-sm-4 new-subject-form">
                <div className="card">
                    <h6 className="category">Add New Subject</h6>
                    <div className="more">
                    <a type="button" onClick={this.handleCloseClick.bind(this)} className="btn btn-simple btn-icon btn-danger"><i className="ti-close"></i></a>
                    </div>
                    <div className="content">
                    <form id="subject-form" onSubmit={this.handleSaveClick.bind(this)}>
                        <SubjectOrgSelectField new={true} value={null} />
                        <SubjectTextField new={true} label={"First Name"} value={null} skey={"first_name"}/>
                        <SubjectTextField new={true} label={"Last Name"} value={null} skey={"last_name"} />
                        <SubjectTextField new={true} label={"Organization ID"} value={null} skey={"organization_subject_id"} />
                        <SubjectTextField new={true} label={"Organization ID"} value={null} skey={"organization_subject_id_validation"} />
                        <SubjectTextField new={true} label={"Date of Birth"} value={null} skey={"dob"} />
                       <button className="btn btn-success new-subject-button">Add Subject</button>
                    </form>
                    </div>
                </div>
            </div>
            </div>
        )

    }
}

function mapStateToProps(state){
    return {
      protocol: {
        items: state.protocol.items,
        activeProtocol: state.protocol.activeProtocol,
        orgs: state.protocol.orgs
      },
      subject: {
        items: state.subject.items,
        activeSubject: state.subject.activeSubject,
        newSubject: state.subject.newSubject
      },
      pds: {
        items: state.pds.items
      },
      savingSubject: state.subject.isSaving,
      showInfoPanel: state.subject.showInfoPanel,
      showActionPanel: state.subject.showActionPanel

    };
}

export default connect(mapStateToProps)(NewSubjectForm)