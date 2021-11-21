import React from 'react';

import classes from './InfoBar.module.css';
import closeIcon from '../../icons/closeIcon.png';
import onlineIcon from '../../icons/onlineIcon.png';

const InfoBar = ({ room }) => {
    return (
        <div className={classes.infoBar}>
            <div className={classes.leftInnerContainer}>
                <h2>Room:</h2>
                <img
                    className={classes.onlineIcon}
                    src={onlineIcon}
                    alt="Online"
                />
                <h3>{room}</h3>
            </div>
            <div className={classes.rightInnerContainer}>
                <a href="/">
                    <img src={closeIcon} alt="Close" />
                </a>
            </div>
        </div>
    );
};

export default InfoBar;
