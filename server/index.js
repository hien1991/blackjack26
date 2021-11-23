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


/*
    To-do:
        - remove original authors git/info on package.json & everywhere else
        - Add sass support, this time try deleting lock & node_modules in client folder
        - rename project
        - make cards a separate component- it could be reused later. Or maybe make a playerHand a separate one
          so I don't have to make 4 copy/paste
        - Make function that assigns player1/2/3/spectate to socketConnection map based on current size
        - Make select character screen: it says "select your character" as a top header, and then has a list of
          "available" and "taken". Then add an extra "spectate" button that will make user go into game without being
          any character in case all players are taken.
        - Reconnection logic: if you reconnect, it doesn't send the 'blackjackjoin' signal again... not sure about 'connect'.
          But either way, the online status won't update, but the reconnected player can still make moves which might 
          contradict the game if it thinks the player is disconnected & already re-adjusted its logic.

        - Bookmark: make the hit/stand show up after dealing and hide deal button, have the game go through each turn with 
          displayed text stating which player to go. For now just make hit/stand available to everyone as there's no assigned 
          players. For now, make both hit/stand just proceed to next player's turn. For now just treat dealer like another 
          player. After a complete round of hit/stand, update text to say "??? won! Waiting on players..." and make deal button 
          available again.
            - After, make it so that when it sees 0 players online, it goes back to back-card state with deal button available.


        - Change the chat logo & the SayOk thing to my own custom thing.
        - Can comment out the join component stuff with all the user/room emits
        - I think it disconnects you if you push browser aside on web or multitask on mobile. May need to find a way
          to reconnect... but then again I feel like most web games have this issue so maybe it's fine.

*/
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

        //Syncs newly connected players to current game session cards
        if(currentDeck.length > 0 && curentCardSlots.length > 0){
            socket.emit('cardsDealt', {
                newCardSlots: curentCardSlots,
                gameDeck: currentDeck
            });
        }

        callback();
    });

    socket.on('dealtCards', ({newCardSlots, gameDeck}, callback) => {
        console.log("cardsDealt io received!")
        console.log(newCardSlots);
        console.log(gameDeck);
        curentCardSlots = newCardSlots;
        currentDeck = gameDeck;
        //broadcast cards to all except sender since it came from them
        socket.broadcast.emit('cardsDealt', {
            newCardSlots: newCardSlots, 
            gameDeck: gameDeck
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
