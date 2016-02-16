import React from 'react';

class SubjectInfoPanel extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        const display = (this.props.display ? "block" : "none");
        var divStyle = {
            display: display
        }
        return (
            <div style={divStyle} className="subject-info-panel">
                Actions
            </div>
        )
    }
}

export default SubjectInfoPanel;
