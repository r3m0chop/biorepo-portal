import { Link } from 'react-router';
import React from 'react';
import { connect } from 'react-redux';

export default class Navbar extends React.Component {

  render() {
    const brandStyle = {
      color: 'white',
      marginTop: '0px',
    };
    const protocol = this.props.protocols.activeProtocol;

    if (protocol) {
      var subjectUrl = 'dataentry/protocol/' + protocol.id;
    }

    return (
        <div className="navbar navbar-ct-primary navbar-fixed-top" role="navigation">
          <div className="navbar-header">
            <div className="navbar-brand">
              <Link style={brandStyle} className="navbar-text" to={'/'}>Biorepository Portal</Link>
            </div>
          </div>
          <div className="collapse navbar-collapse navbar-ex1-collapse">
            <ul className="nav navbar-nav navbar-right pull-right">
                { subjectUrl ?
                  <li><Link to={subjectUrl}>Subjects</Link></li> :
                  <div/>
                }
                  <li><Link to={'/'}>Projects</Link></li>
                  <li><a href="/logout">Logout</a></li>
            </ul>
          </div>
        </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    protocols: state.protocol,
  };
}

export default connect(mapStateToProps)(Navbar);
