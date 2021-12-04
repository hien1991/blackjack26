require('dotenv').config();
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');
const PORT = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);
let socketConnections = new Map();
let currentDeck = [];
let curentCardSlots = [];
let currentGameText = '';
let currentTurn = 0;


if (process.env.PROD) {
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
} else {
    app.use(express.static(path.join(__dirname, '/')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });
}

io.on('connect', (socket) => {
    console.log('We have a new connection!');

    //currently counting # of connections in the game room, not connections in top level
    socket.on('blackjackJoin', ({}, callback) => {
        console.log('New player joined Blackjack! socket ID is: ' + socket.id);
        socketConnections.set(socket.id, 'player1/2/3/4');

        //count # of collections & emit back to game room
        console.log("Number of connections: " + socketConnections.size);
        io.emit('blackjackConnections', {
            connectionSize: socketConnections.size
        });

        //Syncs newly connected players to current game session cards if any session data saved
        if(currentDeck.length > 0 && curentCardSlots.length > 0){
            socket.emit('cardsDealt', {
                newCardSlots: curentCardSlots,
                gameDeck: currentDeck,
                gameText: currentGameText,
                currentGameTurn: currentTurn
            });
        }

        callback();
    });

    socket.on('gameTextUpdate', (data) => {
        console.log('gameTextUpdate io received! data: ');
        console.log(data);
        currentGameText = data.gameText;
        currentTurn = data.turn;
        console.log(currentGameText);
        //broadcast cards to all except sender since it came from them
        socket.broadcast.emit('gameTextTransmit', {
            currentGameText: currentGameText,
            currentGameTurn: currentTurn
        });
        //callback();
    });

    socket.on('dealtCards', ({newCardSlots, gameDeck}, callback) => {
        console.log("dealtCards io received!")
        console.log(newCardSlots);
        console.log(gameDeck);
        curentCardSlots = newCardSlots;
        currentDeck = gameDeck;
        //broadcast cards to all except sender since it came from them
        socket.broadcast.emit('cardsDealt', {
            newCardSlots: newCardSlots, 
            gameDeck: gameDeck,
            gameText: currentGameText,
            currentGameTurn: currentTurn
        });
        callback();
    });

    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if (error) return callback(error);

        socket.emit('message', {
            user: 'admin',
            text: `${user.name}, Welcome to the room ${user.room}!`,
        });

        socket.broadcast.to(user.room).emit('message', {
            user: 'admin',
            text: `${user.name} has Joined.`,
        });

        socket.join(user.room);

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room),
        });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', { user: user.name, text: message });

        callback();
    });

    socket.on('disconnect', () => {
        socketConnections.delete(socket.id);
        console.log('user disconnected. socket.id is: ' + socket.id);
        console.log('connected users: ' + socketConnections.size);

        io.emit('blackjackConnections', {
            connectionSize: socketConnections.size
        });

        //Not used anymore, was used in original chatroom code
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', {
                user: 'admin',
                text: `${user.name} has left.`,
            });
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }
    });
});

server.listen(PORT, () => {
    console.log(`**************************************`);
    console.log(`Server is running on port: ${PORT}`);
    console.log(`URL address: http://localhost:${PORT}`);
    console.log(`**************************************`);
});
