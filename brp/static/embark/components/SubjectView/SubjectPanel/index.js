import React from 'react';
import SubjectCardEdit from './SubjectCardEdit';
import SubjectCardView from './SubjectCardView';

const SubjectPanel = (props) => {
  const path = props.path;
  if (props.edit) {
    return <SubjectCardEdit path={path} />;
  }
  return <SubjectCardView path={path} />;
};

SubjectPanel.propTypes = {
  edit: React.PropTypes.string,
  path: React.PropTypes.string,
};
export default SubjectPanel;
