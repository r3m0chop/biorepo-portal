import React from 'react';

class LoadingGif extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        return (<center><img src="static/img/loader.gif"/></center>)
    }
}

export default LoadingGif;
