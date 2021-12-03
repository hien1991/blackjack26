
import React from 'react';
import "./StatsDisplay.css"
import PropTypes from "prop-types";
//import io from 'socket.io-client';


export default class StatsDisplay extends React.Component {

    static propTypes = {
        connectionsCount: PropTypes.any,
        playerCardValues: PropTypes.array
    };

    render() {
        //console.log("rendering! playerCardValues is: " + this.props.playerCardValues);
        return <div className='gameStats'>
            <div>Online: {this.props.connectionsCount}</div>
            <div>Player1: {this.props.playerCardValues[0] | 0}</div>
            <div>Player2: {this.props.playerCardValues[1] | 0}</div>
            <div>Player3: {this.props.playerCardValues[2] | 0}</div>
            <div>Dealer: ???</div>
        </div>;
    }
}