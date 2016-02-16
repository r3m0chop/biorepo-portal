import React from 'react';
import { connect } from 'react-redux';
import * as SubjectActions from '../../../actions/subject';

class SubjectTextField extends React.Component{
    constructor(props){
        super(props);
    }
    onChange(e){
        // Check to see if we're editing an existing subject
        if (!this.props.new) {
            // Changing the input fields should update the state of the active subject
            var sub = this.props.subject
            sub[this.props.skey] = e.target.value
            this.props.dispatch(SubjectActions.setActiveSubject(sub));
        } else {
            var sub = this.props.newSubject
            sub[this.props.skey] = e.target.value
            // this.props.dispatch(SubjectActions.setActiveSubject(sub));
        }
    }
    render(){
        return (
            <div className="input-group input-group-sm border-input">
                <span className="input-group-addon" id="basic-addon1">{this.props.label}</span>
                <input type="text" onChange={this.onChange.bind(this)} value={this.props.value} className="form-control border-input" aria-describedby="basic-addon1" />
            </div>
        )
    }
}


function mapStateToProps(state){
    return {
        subject: state.subject.activeSubject,
        newSubject: state.subject.newSubject
    }
}

export default connect(mapStateToProps)(SubjectTextField)
