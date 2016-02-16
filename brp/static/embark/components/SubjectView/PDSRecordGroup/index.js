import React from 'react';
import { connect } from 'react-redux';
import SkyLight from 'react-skylight';
import * as SubjectActions from '../../../actions/subject';
import * as RecordActions from '../../../actions/record';

class PDSRecordGroup extends React.Component {
    constructor(props){
        super(props);
    }

    addRecord(){
        var url = '/portal/dataentry/protocoldatasource/26/subject/5016/create/?label_id='
        var url = '/dataentry/protocoldatasource/' + this.props.pds.id + '/subject/' + this.props.subject.id + '/create/'

    }

    handleRecordClick(record){
        const dispatch = this.props.dispatch
        if (this.props.linkMode) {
            alert('linking '+ this.props.activeRecord.id + ' with ' + record.id)
            dispatch(SubjectActions.setLinkMode())
        } else {
            dispatch(SubjectActions.showActionPanel());
            dispatch(RecordActions.setActiveRecord(record));
        }
    }

    handleRecordLabelSelect(e){
        const { dispatch } = this.props
        dispatch(RecordActions.setSelectedLabel(e.target.value))
    }

    handleNewRecordClick(){
        var url = '/dataentry/protocoldatasource/'
        url += this.props.pds.id
        url += '/subject/'
        url += this.props.subject.id
        url += '/create/?label_id='
        url += this.props.selectedLabel
        // this.context.history.go(url)
        window.location.href=url
    }

    renderLabelSelect(){
        const labels = this.props.pds.driver_configuration.labels
        var selectStyle = {
            marginLeft: "10px"
        }
        var buttonStyle = {
            width:"auto",
            marginTop:"20px",
            marginLeft: "25%"
        }
        return (
            <div>
                <div>
                    <span>Select label for {this.props.pds.display_label} Record:</span>
                    <select onChange={this.handleRecordLabelSelect.bind(this)} style={selectStyle}>
                            <option>---</option>
                        { labels.map(function(label, i){
                            return <option key={i} value={label[0]}>{label[1]}</option>
                        })}
                    </select>
                </div>
                <div>
                    <button style={buttonStyle} onClick={this.handleNewRecordClick.bind(this)} className="btn btn-success">Create New</button>
                </div>
            </div>
        )
    }

    render(){
        var modalStyles = {
            width: '25%',
            height: '200px',
            position: 'fixed',
            top: '50%',
            left: '65%',
            marginTop: '-200px',
            marginLeft: '-25%',
            backgroundColor: '#fff',
            borderRadius: '15px',
            zIndex: 100,
            padding: '15px',
            boxShadow: '0 0 4px rgba(0,0,0,.14),0 4px 8px rgba(0,0,0,.28)'
        }
        var exRecStyle = {
            cursor: "pointer",
            backgroundColor: "#ddecf9"
        }
        var pinStyle = {
            color: "coral"
        }
        if (this.props.records.length != 0){
            var recordNodes = this.props.records.map(function(record, i){
                if (this.props.activeRecord != null && (this.props.activeRecord.id == record.id)){
                    return <tr key={i} onClick={this.handleRecordClick.bind(this, record)} style={exRecStyle} ><td><i style={pinStyle} className="ti-pin2"></i> {record.label_desc}</td><td>{record.created}</td><td>{record.modified}</td></tr>
                } else {
                    return <tr key={i} onClick={this.handleRecordClick.bind(this, record)} className="ExternalRecord" ><td>{record.label_desc}</td><td>{record.created}</td><td>{record.modified}</td></tr>
                }
            }, this)
        } else {
            recordNodes = null
        }

        var addButtonStyle = {
            "marginLeft":"10px",
            "cursor": "pointer"
        }
        return (
            <div>
            <SkyLight ref="addRecordModal" dialogStyles={modalStyles}>

                 { this.renderLabelSelect() }
                <div>

                </div>
            </SkyLight>
            <h6 className="category">{this.props.pds.display_label}<span onClick={() => this.refs.addRecordModal.show()} className="label label-icon label-success" style={addButtonStyle}><i className="ti-plus add-record"></i></span></h6>

                <div className="PDSRecords">
                { recordNodes ?
                    <table className="table table-striped">
                        <thead>
                            <tr><th>Record</th><th>Created</th><th>Modified</th></tr>
                        </thead>
                        <tbody>
                            { recordNodes }
                        </tbody>
                    </table> : <div>No Records</div>
                }
                </div>
            </div>
        )
    }
}

PDSRecordGroup.contextTypes = {
    history: React.PropTypes.object
}

function mapStateToProps(state) {
  return {
    protocol: {
      items: state.protocol.items,
      activeProtocol: state.protocol.activeProtocol
    },
    subject: state.subject.activeSubject,
    activeRecord: state.record.activeRecord,
    linkMode: state.subject.linkMode,
    selectedLabel: state.record.selectedLabel

  };
}

export default connect(mapStateToProps)(PDSRecordGroup)
