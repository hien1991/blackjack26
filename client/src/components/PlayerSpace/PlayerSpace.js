
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import classes from './PlayerSpace.module.css';


//Needs to be up here, or it'll re-initialize upon every re-render
let gameDeck = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13',
'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12', 'd13', 'h1', 'h2', 'h3',
'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10', 'h11', 'h12', 'h13', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6',
'c7', 'c8', 'c9', 'c10', 'c11', 'c12', 'c13'];
let initialShuffle = false;
const deckMax = 52;

const PlayerSpace = () => {

    const socket = useRef(null);
    const ENDPOINT = '/';
    const [connectionsCount, setConnectionsCount] = useState('');
    const [cardSlots, setCardSlots] = useState(() => ['back', 'back', 'back', 'back', 'back', 'back', 'back', 'back']);

    useEffect(() => {
        socket.current = io.connect(ENDPOINT);
        socket.current.emit('blackjackJoin', {}, () => { });

        socket.current.on('blackjackConnections', (connections) => {
            setConnectionsCount(connections.connectionSize);
        });

        //Make sure cards dealt & deck are synched for all players
        socket.current.on('cardsDealt', (cards) => {
            console.log("io emit received for cardsDealt!");
            console.log(cards);
            setCardSlots(cards.newCardSlots);
            gameDeck = cards.gameDeck;
            initialShuffle = true;
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    //cards are in format c##, h##, s##, d##, where '##' can be 1-13
    const getCardDealt = (slot) => {
        return 'images/classic-cards/' + cardSlots[slot] + '.png';
    }

    /* Because the html div reloads/re-renders frequently, we can't simply bind {popCardFromdeck()} or it'll keep popping cards
       despite us not directly telling it to. So we need to set up a system where we keep track of how many cards are needed
       in the game, and then shuffle & pop the deck and deal them as assigned variables that won't change until a specific
       game action is taken.  */
    const dealCards = () => {
        let cardsInPlay = 6; //un-hardcode this
        let newCardSlots = ['', '', '', '', '', '', '', ''];

        shuffleDeck();
        for (var i = 0; i < cardsInPlay; i++) {
            newCardSlots[i] = gameDeck.pop();
        }
        setCardSlots(newCardSlots);
        //Need to set to "newCardSlots" instead of the state hook var cardSlots because it's still loading(?)
        socket.current.emit('dealtCards', {newCardSlots, gameDeck}, () => { });
    }


    return (
        <div>
            <div className={classes.connectionCount}>Online: {connectionsCount}</div>
            <div className={classes.playerHand}>
                <img className={classes.playingCard} src={getCardDealt(0)} alt="card" />
                <img className={`${classes.playingCard} ${classes.overlappingCard}`} src={getCardDealt(1)} alt="card" />
            </div>
            <div className={classes.playerHand}>
                <img className={classes.playingCard} src={getCardDealt(2)} alt="card" />
                <img className={`${classes.playingCard} ${classes.overlappingCard}`} src={getCardDealt(3)} alt="card" />
            </div>
            <div className={classes.playerHand}>
                <img className={classes.playingCard} src={getCardDealt(4)} alt="card" />
                <img className={`${classes.playingCard} ${classes.overlappingCard}`} src={getCardDealt(5)} alt="card" />
            </div>

            {/* <div className={classes.player}>P1</div>
            <div className={classes.player}>P2</div>
            <div className={classes.player}>P3</div> */}
            <button onClick={() => dealCards()}>Deal</button>
        </div>
    );

    function shuffleDeck(){
        //only re-fill & shuffle if cards are running low
        if(gameDeck.length < (deckMax / 4) || initialShuffle === false){
            console.log("shuffling deck!");
            gameDeck = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13',
            'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12', 'd13', 'h1', 'h2', 'h3',
            'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10', 'h11', 'h12', 'h13', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6',
            'c7', 'c8', 'c9', 'c10', 'c11', 'c12', 'c13']; //re-filling deck before shuffle

            for (var i = 0; i < gameDeck.length; i++) {
                // Pick a remaining element...
                let randomIndex = Math.floor(Math.random() * (gameDeck.length - 1)) + 1;
                // And swap it with the current element.
                [gameDeck[i], gameDeck[randomIndex]] = [gameDeck[randomIndex], gameDeck[i]];
            }
            initialShuffle = true;
        }
    }

};


export default PlayerSpace;
