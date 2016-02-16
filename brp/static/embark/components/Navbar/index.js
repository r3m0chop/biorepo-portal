import Link from 'react-router';
import React from 'react';

export default class Navbar extends React.Component {
    render() {
        return (
            <div className="navbar navbar-ct-primary navbar-fixed-top" role="navigation">
                    <div className="navbar-header">
                        <div className="navbar-brand">
                            <p className="navbar-text">Subject List</p>
                        </div>
                    </div>
                    <div className="collapse navbar-collapse navbar-ex1-collapse">
                        <ul className="nav navbar-nav navbar-right pull-right">
                            <li><a href="/welcome">Projects</a></li>
                            <li><a href="/logout">Logout</a></li>
                        </ul>
                    </div>
            </div>
        )
    }
}
