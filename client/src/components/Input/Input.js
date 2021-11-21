import React from 'react';

import classes from './Input.module.css';

const Input = ({ message, setMessage, sendMessage }) => {
    return (
        <form className={classes.Form}>
            <input
                type="text"
                className={classes.Input}
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => (e.key === 'Enter' ? sendMessage(e) : null)}
            />
            <button
                className={classes.SendButton}
                onClick={(e) => sendMessage(e)}
            >
                Send
            </button>
        </form>
    );
};

export default Input;
