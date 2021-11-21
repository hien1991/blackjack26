import React from 'react';

import classes from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={classes.Footer}>
            <p>
                © 2020 | SAY.OK | Created by Dmitriy Zatulovskiy |{' '}
                <a
                    href="https://github.com/GrafSoul/webrtc-video-chat"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub
                </a>
            </p>
        </footer>
    );
};

export default Footer;
