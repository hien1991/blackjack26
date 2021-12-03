
import React from 'react';
import "./Players.css"
import PropTypes from "prop-types";
//import io from 'socket.io-client';

 /* 0-1: player1 cards, 2-3: player2 cards, 4-5: player3 cards, 6-7: dealer cards, 8-12: player1 hit cards,
    13-17: player2 hit cards, 18-22: player3 hit cards, 23-27: dealer hit cards */
let cardSlots = [];

export default class Players extends React.Component {

    static propTypes = {
        cardSlots: PropTypes.any
    };

    render() {
        cardSlots = this.props.cardSlots;
        //console.log("rendering! cardSlots is: " + this.props.cardSlots);
        return <div>
            <div className='dealer'>
                <img className='dealerImg' src='images/drakeYes.png' alt="dealer" />
                <img className='dealerCard' src='images/classic-cards/back.png' alt="card" />
                <img className='dealerOverlapCard' src={getCardDealt(7)} alt="card" />
                <img className='dealerOverlappingCard2' src={getCardDealt(23)} alt="card" style={hideHitCardIfNotExist(cardSlots[23])}  />
                <img className='dealerOverlappingCard3' src={getCardDealt(24)} alt="card" style={hideHitCardIfNotExist(cardSlots[24])}  />
                <img className='dealerOverlappingCard4' src={getCardDealt(25)} alt="card" style={hideHitCardIfNotExist(cardSlots[25])}  />
                <img className='dealerOverlappingCard5' src={getCardDealt(26)} alt="card" style={hideHitCardIfNotExist(cardSlots[26])}  />
                <img className='dealerOverlappingCard6' src={getCardDealt(27)} alt="card" style={hideHitCardIfNotExist(cardSlots[27])}  />
            </div>
            <div className='playerHand'>
                <img className='playingCard' src={getCardDealt(0)} alt="card" />
                <img className={['playingCard', 'overlappingCard'].join(' ')} src={getCardDealt(1)} alt="card" />
                <img className={['playingCard', 'overlappingCard2'].join(' ')}src={getCardDealt(8)} alt="card" style={hideHitCardIfNotExist(cardSlots[8])} />
                <img className={['playingCard', 'overlappingCard3'].join(' ')} src={getCardDealt(9)} alt="card" style={hideHitCardIfNotExist(cardSlots[9])} />
                <img className={['playingCard', 'overlappingCard4'].join(' ')} src={getCardDealt(10)} alt="card" style={hideHitCardIfNotExist(cardSlots[10])} />
                <img className={['playingCard', 'overlappingCard5'].join(' ')} src={getCardDealt(11)} alt="card" style={hideHitCardIfNotExist(cardSlots[11])} />
                <img className={['playingCard', 'overlappingCard6'].join(' ')} src={getCardDealt(12)} alt="card" style={hideHitCardIfNotExist(cardSlots[12])} />
                <div className='player'><img className='player' src='images/wheelchair.jpeg' alt="player" /> </div>
            </div>
            <div className='playerHand'>
                <img className='playingCard' src={getCardDealt(2)} alt="card" />
                <img className={['playingCard', 'overlappingCard'].join(' ')} src={getCardDealt(3)} alt="card" />
                <img className={['playingCard', 'overlappingCard2'].join(' ')}src={getCardDealt(13)} alt="card" style={hideHitCardIfNotExist(cardSlots[13])} />
                <img className={['playingCard', 'overlappingCard3'].join(' ')} src={getCardDealt(14)} alt="card" style={hideHitCardIfNotExist(cardSlots[14])} />
                <img className={['playingCard', 'overlappingCard4'].join(' ')} src={getCardDealt(15)} alt="card" style={hideHitCardIfNotExist(cardSlots[15])} />
                <img className={['playingCard', 'overlappingCard5'].join(' ')} src={getCardDealt(16)} alt="card" style={hideHitCardIfNotExist(cardSlots[16])} />
                <img className={['playingCard', 'overlappingCard6'].join(' ')} src={getCardDealt(17)} alt="card" style={hideHitCardIfNotExist(cardSlots[17])} />
                <div className='player'><img className='player' src='images/caveman.png' alt="player" /></div>
            </div>
            <div className='playerHand'>
                <img className='playingCard' src={getCardDealt(4)} alt="card" />
                <img className={['playingCard', 'p4overlappingCard'].join(' ')} src={getCardDealt(5)} alt="card" />
                <img className='p4overlappingCard2' src={getCardDealt(18)} alt="card" style={hideHitCardIfNotExist(cardSlots[18])} />
                <img className='p4overlappingCard3' src={getCardDealt(19)} alt="card" style={hideHitCardIfNotExist(cardSlots[19])} />
                <img className='p4overlappingCard4' src={getCardDealt(20)} alt="card" style={hideHitCardIfNotExist(cardSlots[20])} />
                <img className='p4overlappingCard5' src={getCardDealt(21)} alt="card" style={hideHitCardIfNotExist(cardSlots[21])} />
                <img className='p4overlappingCard6' src={getCardDealt(22)} alt="card" style={hideHitCardIfNotExist(cardSlots[22])} />
                <div className={['player', 'leftPlayer'].join(' ')}><img className='player' src='images/joe.png' alt="player" /></div>
            </div>
        </div>;
    }

}

//cards are in format c##, h##, s##, d##, where '##' can be 1-13
const getCardDealt = (slot) => {
    return 'images/classic-cards/' + cardSlots[slot] + '.png';
}

const hideHitCardIfNotExist = (card) => {
    //set 'none' to 'visible' to debug-test styling of all cards present
    if (card === '0') {
        return { "display": "visible" };
    }
    else {
        return { "display": "visible" }
    }
}