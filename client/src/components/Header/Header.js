import React from 'react';

import classes from './Header.module.css';

export default function Header() {
    return (
        <header className={classes.Header}>
            <div className={classes.HeaderWrap}>
                <h1 className={classes.HeaderTitle}>
                    <span className={classes.Logo}>
                        <img
                            className={classes.LogoImage}
                            src="/images/logo.svg"
                            alt="Logo"
                        />
                    </span>
                    SAY.OK
                </h1>
            </div>
        </header>
    );
}
