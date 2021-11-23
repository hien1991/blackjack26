
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
    const [showHitStandButtons, setShowHitStandButtons] = useState(false);
    const [currentTurn, setCurrentTurn] = useState(0); //0: waiting, 1-3: player, 4: dealer
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

    const setNextTurn = () => {
        if(parseInt(currentTurn) < 4){
            setCurrentTurn(currentTurn + 1);
            setShowHitStandButtons(true);
        }
        else{
            setCurrentTurn(0);
            setShowHitStandButtons(false);
        }
    }

    const getGameText = () => {
        switch(currentTurn){
            case 1:
                return <div><img className={classes.gameTextAvatar} src='images/joe.png' alt='player'></img> 's turn</div>;
            case 2:
                return <div><img className={classes.gameTextAvatar} src='images/caveman.png' alt='player'></img> 's turn</div>;
            case 3:
                return <div><img  className={classes.gameTextAvatar}src='images/wheelchair.jpeg' alt='player'></img> 's turn</div>;
            case 4:
                return 'Dealer\'s turn. Drizzy is thinking...';
            default:
                return 'Waiting on players...'
        }
    }

    /* Because the html div reloads/re-renders frequently, we can't simply bind {popCardFromdeck()} or it'll keep popping cards
       despite us not directly telling it to. So we need to set up a system where we keep track of how many cards are needed
       in the game, and then shuffle & pop the deck and deal them as assigned variables that won't change until a specific
       game action is taken.  */
    const dealCards = () => {
        let cardsInPlay = 8; //un-hardcode this
        let newCardSlots = ['', '', '', '', '', '', '', ''];

        shuffleDeck();
        for (var i = 0; i < cardsInPlay; i++) {
            newCardSlots[i] = gameDeck.pop();
        }
        setCardSlots(newCardSlots);
        //Need to set to "newCardSlots" instead of the state hook var cardSlots because it's still loading(?)
        socket.current.emit('dealtCards', {newCardSlots, gameDeck}, () => { });
        setNextTurn();
    }


    return (
        <div>
            <div className={classes.connectionCount}>Online: {connectionsCount}</div>
            <div className={classes.dealer}>
                <img className={classes.dealerImg} src='images/drakeYes.png' alt="dealer" />
                <img className={classes.dealerCard} src='images/classic-cards/back.png' alt="card" />
                <img className={`${classes.dealerOverlapCard}`} src={getCardDealt(7)} alt="card" />
            </div>
            <div className={classes.playerHand}>
                <img className={classes.playingCard} src={getCardDealt(0)} alt="card" />
                <img className={`${classes.playingCard} ${classes.overlappingCard}`} src={getCardDealt(1)} alt="card" />
                <div className={classes.player}><img className={classes.player} src='images/wheelchair.jpeg' alt="player" /> 
            </div>
            </div>
            <div className={classes.playerHand}>
                <img className={classes.playingCard} src={getCardDealt(2)} alt="card" />
                <img className={`${classes.playingCard} ${classes.overlappingCard}`} src={getCardDealt(3)} alt="card" />
                <div className={classes.player}><img className={classes.player} src='images/caveman.png' alt="player" /></div>
            </div>
            <div className={classes.playerHand}>
                <img className={classes.playingCard} src={getCardDealt(4)} alt="card" />
                <img className={`${classes.playingCard} ${classes.overlappingCard}`} src={getCardDealt(5)} alt="card" />
                <div className={`${classes.player} ${classes.leftPlayer}`}><img className={classes.player} src='images/joe.png' alt="player" /></div>
            </div>
            <div className={classes.gameText}>
                <h2>{getGameText()}</h2>
            </div>
            <div>
                {showHitStandButtons? 
                <div className={classes.gameButtons}>
                    <button onClick={() => setNextTurn()}>Hit</button>
                    <button onClick={() => setNextTurn()}>Stand</button>
                </div> 
                : ''}
            </div>
            <div className={classes.gameButtons}>
                {!showHitStandButtons? 
                <button onClick={() => dealCards()}>Deal</button>
                : ''}
            </div>
            
            
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
