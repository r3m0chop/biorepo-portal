import React from 'react';
import { Link, History } from 'react-router';
import { connect } from 'react-redux';
import * as SubjectActions from '../../../actions/subject';
import SubjectCardEdit from './SubjectCardEdit';
import SubjectCardView from './SubjectCardView';

class SubjectCard extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const path = this.props.path;
    if (this.props.edit) {
      return <SubjectCardEdit path={path}/>;
    } else {
      return <SubjectCardView path={path}/>;
    }
  }
}

export default connect()(SubjectCard);
