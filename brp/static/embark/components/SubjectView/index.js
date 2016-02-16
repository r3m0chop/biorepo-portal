import React from 'react';
import { connect } from 'react-redux';
import BackButton from '../BackButton';
import LoadingGif from '../LoadingGif';
import SubjectCard from './SubjectCard';
import SubjectRecords from './SubjectRecords';
import SubjectActionPanel from './Panels/SubjectActionPanel';
import SubjectInfoPanel from './Panels/SubjectInfoPanel';
import EditLabelModal from './Modals/EditLabel';
import * as ProtocolActions from '../../actions/protocol';
import * as SubjectActions from '../../actions/subject';
import * as PDSActions from '../../actions/pds';



class SubjectView extends React.Component {

    constructor(props){
        super(props);
    }

    getActiveProtocol(){
        // If this view is navigated to directly. Get active protocol based on param
        if (this.props.protocol.activeProtocol == null ) {
            // Iterate over loaded protocols to find current activeProtocol
            this.props.protocol.items.forEach(function(protocol){
                // Normalize datatypes
                if (this.props.params.prot_id == parseInt(protocol.id)) {
                    this.props.protocol.activeProtocol = protocol
                }
            }, this)
        }
    }

    getActiveSubject(){
        // If this view is navigated to directly. Get active subject based on param
        if (this.props.subject.activeSubject == null ) {
            // Iterate over loaded protocols to find current activeSubject
            this.props.subject.items.forEach(function(subject){
                // Normalize datatypes
                if (this.props.params.sub_id == parseInt(subject.id)) {
                    this.props.subject.activeSubject = subject;
                }
            }, this)
        }
    }

    componentWillReceiveProps(){
        const { dispatch } = this.props
        if (this.props.protocol.activeProtocol == null && this.props.protocol.items){
            this.props.protocol.items.forEach(function(protocol){
                // Normalize datatypes
                if (this.props.params.prot_id == parseInt(protocol.id)) {
                    dispatch(ProtocolActions.setActiveProtocol(protocol));
                }
            }, this)
        }
    }

    componentDidMount() {
        const { dispatch } = this.props
        // Check to see if subjects are loaded, if not fetch them
        if(this.props.subject.items.length == 0){
            dispatch(SubjectActions.fetchSubjects(this.props.params.prot_id))
            this.getActiveSubject()
            dispatch(SubjectActions.setActiveSubject(this.props.subject))
        }
        if(this.props.pds.items.length == 0){
            dispatch(PDSActions.fetchPDS(this.props.params.prot_id))
        }
    }

    renderEditLabel(){
        if(this.props.editLabelMode){
            return <EditLabelModal/>
        }
    }

    render(){
        // Checks for empty subject state and updates it if necessary
        this.getActiveSubject()
        const protocol = this.props.protocol.activeProtocol;
        const subject = this.props.subject.activeSubject;
        const path = this.props.location.pathname;
        const editLabelModal = this.renderEditLabel()
        return (
                subject ?
                <div className="subject-view">
                    <BackButton/>
                    <SubjectCard subject={subject} edit={this.props.params.edit} path={path}/>
                    { editLabelModal }
                    <SubjectRecords subject={subject} />
                    <SubjectInfoPanel display={this.props.showInfoPanel} />
                    <SubjectActionPanel display={this.props.showActionPanel} />
                    { this.props.children }
                </div>
                : <LoadingGif/>

        )
    }
}

function mapStateToProps(state) {
  return {
    protocol: {
      items: state.protocol.items,
      activeProtocol: state.protocol.activeProtocol
    },
    subject: {
      items: state.subject.items
    },
    pds: {
      items: state.pds.items
    },
    showInfoPanel: state.subject.showInfoPanel,
    showActionPanel: state.subject.showActionPanel,
    editLabelMode: state.record.editLabelMode

  };
}

export default connect(mapStateToProps)(SubjectView);
