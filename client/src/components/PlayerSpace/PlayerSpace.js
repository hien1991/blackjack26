
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import classes from './PlayerSpace.module.css';
import StatsDisplay from '../StatsDisplay/StatsDisplay';
import Players from '../Players/Players';

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

    /* 0-1: player1 cards, 2-3: player2 cards, 4-5: player3 cards, 6-7: dealer cards, 8-12: player1 hit cards,
       13-17: player2 hit cards, 18-22: player3 hit cards, 23-27: dealer hit cards */
    const [cardSlots, setCardSlots] = useState(() => ['back', 'back', 'back', 'back', 'back', 'back', 'back', 'back', 
    '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0']);


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
        //     case 1:
        //         gameText = <div><img  className={classes.gameTextAvatar}src='images/wheelchair.jpeg' alt='player'></img> 's turn</div>;
        //         break;
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
        let cardsInPlay = 8; //unhardcode this to allow 1 or 2 players... this forces 3 players + dealer.
        let newCardSlots = ['', '', '', '', '', '', '', '',
        '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'];

        shuffleDeckIfNeeded(); 
        for (var i = 0; i < cardsInPlay; i++) {
            newCardSlots[i] = gameDeck.pop();
        }
        setCardSlots(newCardSlots);
        //Need to set to "newCardSlots" instead of the state hook var cardSlots because it's still loading(?)
        socket.current.emit('dealtCards', {newCardSlots, gameDeck}, () => { });
        //countPlayerCards(newCardSlots); //test after delete & delete if no effect.. the state/hook var might be useless...
        setNextTurn();
    }


    //When player hits 'hit' button, we find the first open 'hit card slot' to know where to display the 'hit' card.
    const findFirstOpenHitCardSlot = (hitCardSlotMin) => {
        for(let i = 0; i < 5; i++){
            if(cardSlots[hitCardSlotMin+i] === '0'){
                return hitCardSlotMin+i;
            }
        }
    }

    const hit = (cardSlots) => {
        //Find the player/dealer's hit-card slots depending on who's turn it is, then find the first hit card slot open
        let hitCardSlot = 0;
        switch(currentTurn){
            case 1: //player 1
                hitCardSlot = findFirstOpenHitCardSlot(8); 
                break;
            case 2: //player 2
                hitCardSlot = findFirstOpenHitCardSlot(13);
                break;
            case 3: //player 3
                hitCardSlot = findFirstOpenHitCardSlot(18);
                break;
            default: 
                hitCardSlot = findFirstOpenHitCardSlot(23);
                break;
        }

        let newCardSlots = [cardSlots[0], cardSlots[1], cardSlots[2], cardSlots[3], cardSlots[4], cardSlots[5], cardSlots[6], cardSlots[7],
        cardSlots[8], cardSlots[9], cardSlots[10], cardSlots[11], cardSlots[12], cardSlots[13], cardSlots[14], cardSlots[15],
        cardSlots[16], cardSlots[17], cardSlots[18], cardSlots[19], cardSlots[20], cardSlots[21], cardSlots[22], cardSlots[23], 
        cardSlots[24], cardSlots[25], cardSlots[26], cardSlots[27]];
        newCardSlots[hitCardSlot] = gameDeck.pop();
        setCardSlots(newCardSlots);
        
        //Need to set to "newCardSlots" instead of the state hook var cardSlots because it's still loading(?)
        socket.current.emit('dealtCards', {newCardSlots, gameDeck}, () => { });
    }


    /* return function only needed by <StatsDisplay> since it has cardSlots sent in by sockets but not
       playerCardValues upon joining/reconnecting. Other places just need playerCardValues set. */
    const countPlayerCards = (cardSlots) => {
        //substring(1) -> get value by removing 1st char from cardSlots, in format like "d12" or "h7"
        let player1Cards = parseInt(cardSlots[0].substring(1)) + parseInt(cardSlots[1].substring(1));
        let player2Cards = parseInt(cardSlots[2].substring(1)) + parseInt(cardSlots[3].substring(1));
        let player3Cards = parseInt(cardSlots[4].substring(1)) + parseInt(cardSlots[5].substring(1));
        let dealerCards = parseInt(cardSlots[6].substring(1)) + parseInt(cardSlots[7].substring(1));
        playerCardValues = [player1Cards, player2Cards, player3Cards, dealerCards];
        return playerCardValues;
    }


    return (
        <div>
            <StatsDisplay connectionsCount={connectionsCount} playerCardValues={countPlayerCards(cardSlots)}/>
            <Players cardSlots={cardSlots} />
            <div className={classes.gameText}>
                <h2>{(gameText !== '')? gameText : 'Waiting on players...'}</h2>
            </div>
            <div>
                {showHitStandButtons? 
                <div className={classes.gameButtons}>
                    <button className={classes.hitButton} onClick={() => hit(cardSlots)}>
                        <img className={classes.buttonImg} src="images/hit.png" alt="hit" /><br/>Hit
                    </button>
                    <button className={classes.hitButton} onClick={() => setNextTurn()}>
                        <img className={classes.buttonImg} src="images/stand.png" alt="stand" /><br/>Stand
                    </button>
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

    function shuffleDeckIfNeeded(){
        //only re-fill & shuffle if cards are running low
        if(gameDeck.length < (deckMax / 3) || initialShuffle === false){
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
