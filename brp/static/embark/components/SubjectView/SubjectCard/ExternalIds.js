import React from 'react';
import { Link, History } from 'react-router';
import { connect } from 'react-redux';
import * as SubjectActions from '../../../actions/subject';

class ExternalIDs extends React.Component {
    constructor(props){
        super(props);
    }

    renderExternalIds(){
        var nodes = null
        if (this.props.externalIds) {
            nodes = this.props.externalIds.map(function(id, i){
                return (
                    <li key={i}>{ id.label_desc }: {id.record_id}</li>
                )
            }, this)
        }
        return (
            <ul className="externalIds">
                { nodes }
            </ul>
        )
    }

    render(){
        return (
            <div>
                <h6 className="category">External Identifiers</h6>
                { this.renderExternalIds() }
            </div>
        )
    }
}

export default connect()(ExternalIDs);
