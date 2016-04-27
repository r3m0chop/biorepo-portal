import { Link } from 'react-router';
import React from 'react';

const Navbar = ({ activeProtocolId }) => {
  const brandStyle = {
    color: '#7a7a7a',
    marginTop: '0px',
  };
  const navbarStyle = {
    backgroundColor: '#E9F5FD',
    paddingRight: '20px',
    boxShadow: '0 3px 6px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.12)',
  };
  const protocol = activeProtocolId;

  let subjectUrl = null;

  if (protocol) {
    subjectUrl = `dataentry/protocol/${protocol}`;
  }
  return (
    <div
      style={navbarStyle}
      className="navbar navbar-ct-primary navbar-fixed-top"
      role="navigation"
    >
      <div className="navbar-header">
        <div className="navbar-brand">
          <Link style={brandStyle} className="navbar-text" to={'/'}>Biorepository Portal</Link>
        </div>
      </div>
      <div className="collapse navbar-collapse navbar-ex1-collapse">
        <ul className="nav navbar-nav navbar-right pull-right">
            {subjectUrl ?
              <li><Link to={subjectUrl}>Subjects</Link></li> :
              <div />
            }{
              protocol ?
                <li><Link to={'/'}>Projects</Link></li>
               :
              null
            }
          <li><a href="/logout">Logout</a></li>
        </ul>
      </div>
    </div>
  );
};

Navbar.propTypes = {
  activeProtocolId: React.PropTypes.number,
};

export default Navbar;
