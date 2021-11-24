
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import classes from './PlayerSpace.module.css';


//Needs to be up here, or it'll re-initialize upon every re-render
let gameDeck = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13',
'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12', 'd13', 'h1', 'h2', 'h3',
'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10', 'h11', 'h12', 'h13', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6',
'c7', 'c8', 'c9', 'c10', 'c11', 'c12', 'c13'];
let playerCardValues = [0, 0, 0, 0]
let initialShuffle = false;
const deckMax = 52;
let currentTurn = 0; //0: waiting, 1-3: player, 4: dealer

const PlayerSpace = () => {

    const socket = useRef(null);
    const ENDPOINT = '/';
    const [gameText, gameTextSetter] = useState('');
    const [connectionsCount, setConnectionsCount] = useState('');
    const [showHitStandButtons, setShowHitStandButtons] = useState(false); //show deal-button tied to this
    const [cardSlots, setCardSlots] = useState(() => ['back', 'back', 'back', 'back', 'back', 'back', 'back', 'back']);

    useEffect(() => {
        socket.current = io.connect(ENDPOINT);
        socket.current.emit('blackjackJoin', {}, () => { });

        socket.current.on('blackjackConnections', (connections) => {
            setConnectionsCount(connections.connectionSize);
        });

        socket.current.on('gameTextTransmit', (gameSession) => {
            gameTextSetter(gameSession.currentGameText);
            currentTurn = gameSession.currentGameTurn;
            showHideGameButtons();
        });

        //Make sure cards dealt & deck & text are synched for all players
        socket.current.on('cardsDealt', (currentSessionData) => {
            //console.log("io emit received for cardsDealt!");
            //console.log(currentSessionData);
            setCardSlots(currentSessionData.newCardSlots);
            gameDeck = currentSessionData.gameDeck;
            gameTextSetter(currentSessionData.gameText);
            currentTurn = currentSessionData.currentGameTurn;
            showHideGameButtons();
            initialShuffle = true;

            //If it's a player's turn, we want to disable deal button, enable hit/stand buttons.
            if(currentSessionData.gameText.includes('turn')){
                setShowHitStandButtons(true);
            }
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    //cards are in format c##, h##, s##, d##, where '##' can be 1-13
    const getCardDealt = (slot) => {
        return 'images/classic-cards/' + cardSlots[slot] + '.png';
    }

    const showHideGameButtons = () => {
        if(currentTurn === 0){
            setShowHitStandButtons(false);
        }
        else {
            setShowHitStandButtons(true);
        }
    }

    const setNextTurn = () => {
        if(currentTurn >= 4){
            currentTurn = 0;
            showHideGameButtons();
        }
        else if (currentTurn === 0){
            currentTurn++;
            showHideGameButtons();
        }
        else{
            currentTurn++;
            showHideGameButtons();
        }

        updateGameText();
        socket.current.emit('gameTextUpdate', {gameText: updateGameText(), turn: currentTurn}, () => { });
    }

    const updateGameText = () => {
        // switch(currentTurn){
        //     case 1:
        //         gameText = <div><img  className={classes.gameTextAvatar}src='images/wheelchair.jpeg' alt='player'></img> 's turn</div>;
        //         break;
        //     case 2:
        //         gameText = <div><img className={classes.gameTextAvatar} src='images/caveman.png' alt='player'></img> 's turn</div>;
        //         break;
        //     case 3:
        //         gameText = <div><img className={classes.gameTextAvatar} src='images/joe.png' alt='player'></img> 's turn</div>;
        //         break;
        //     case 4:
        //         gameText = 'Dealer\'s turn. Drizzy is thinking...';
        //         break;
        //     default:
        //         gameText = 'Waiting on players...'
        //         break;
        // }
        switch(currentTurn){
            case 1:
                gameTextSetter('Wheelchair\'s turn!');
                return 'Wheelchair\'s turn!';
            case 2:
                gameTextSetter('Caveman\'s turn!');
                return 'Caveman\'s turn!';
            case 3:
                gameTextSetter('Blackjack Joe\'s turn!');
                return 'Blackjack Joe\'s turn!';
            case 4:
                gameTextSetter('Dealer\'s turn. Drizzy is thinking...');
                return 'Dealer\'s turn. Drizzy is thinking...';
            default:
                gameTextSetter('Waiting on players...');
                return 'Waiting on players...';
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
        countPlayerCards(newCardSlots);
        setNextTurn();
    }

    const countPlayerCards = (cardSlots) => {
        //substring(1) -> get value by removing 1st char from cardSlots, in format like "d12" or "h7"
        let player1Cards = parseInt(cardSlots[0].substring(1)) + parseInt(cardSlots[1].substring(1));
        let player2Cards = parseInt(cardSlots[2].substring(1)) + parseInt(cardSlots[3].substring(1));
        let player3Cards = parseInt(cardSlots[4].substring(1)) + parseInt(cardSlots[5].substring(1));
        let dealerCards = parseInt(cardSlots[6].substring(1)) + parseInt(cardSlots[7].substring(1));
        playerCardValues = [player1Cards, player2Cards, player3Cards, dealerCards];
        //console.log('player card values: ' + playerCardValues);
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
                <h2>{(gameText !== '')? gameText : 'Waiting on players...'}</h2>
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
