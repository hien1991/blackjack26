import React, { useState, useEffect, useRef } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';

import classes from './Chat.module.css';

import InfoBar from '../../components/InfoBar/InfoBar';
import Input from '../../components/Input/Input';
import Messages from '../../components/Messages/Messages';
import TextContainer from '../../components/TextContainer/TextContainer';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

const Chat = ({ location }) => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState('');

    const socket = useRef(null);
    const ENDPOINT = '/';

    useEffect(() => {
        const { name, room } = queryString.parse(location.search);

        socket.current = io.connect(ENDPOINT);

        setName(name);
        setRoom(room);

        socket.current.emit('join', { name, room }, () => {});

        return () => {
            socket.current.emit('disconnect');
            socket.current.off();
        };
    }, [ENDPOINT, location.search]);

    useEffect(() => {
        socket.current.on('message', (message) => {
            receivedMessage(message);
        });

        socket.current.on('roomData', ({ users }) => {
            setUsers(users);
        });
    }, []);

    // Function for sending messages

    const receivedMessage = (message) => {
        setMessages((oldMessages) => [...oldMessages, message]);
    };

    const sendMessage = (e) => {
        e.preventDefault();

        if (message) {
            socket.current.emit('sendMessage', message, () => {
                setMessage('');
            });
        }
    };

    return (
        <div className={classes.outerContainer}>
            <Header />
            <TextContainer users={users} />
            <div className={classes.container}>
                <InfoBar room={room} />
                <Messages messages={messages} name={name} />
                <Input
                    message={message}
                    setMessage={setMessage}
                    sendMessage={sendMessage}
                />
            </div>
            <Footer />
        </div>
    );
};

export default Chat;
