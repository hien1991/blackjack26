# Blackjack26 | example multiplayer game (ReactJS, Socket.io)

Example of building a multiplayer game using [React.js] and [Socket.io]. Idea was to have a game like blackjack but play to 26 instead of 21, and face cards are worth 10-13 instead of all 10. So jacks = 11, Queen = 12, and King = 13. Possibly thinking of making Ace worth either 1 or 14. Project is highly unfinished as I've decided to move on to other things. Images/characters used are based off inside jokes amongst me & my group of friends. ;)

### Demo

Heroku Hosting - [Blackjack26]
Demo the app here: https://blackjack26.herokuapp.com/

Everything here can be cloned & pushed to heroku right out of the box.


### Current Features

- socket capabilities- Cards/text/info synched across all connected users, allowing this project to be used as a base template for simple multiplayer games.
- hit/stand- can "hit" to get a new card, or "stand" to move to next player
- deck dealing- a real 52 card deck is simulated & shuffled when it gets low, so you won't see duplicate cards
- Stats display- shows how many players online & value of player cards
- Mobile browser support- CSS designed to roughly work on most mobile devices along with web browsers. I mainly developed this with Chrome's Inspect on, so the game looks best when viewed in Chrome's Inspect mode.


### To be done & other side notes

- Connected users aren't assigned to players yet, so as of now, anyone connected can "hit" or "stand" for the players. There was to be a select your player screen, with an option to spectate if all players were taken.
- Dealer A.I. not designed yet, so it's currently just treated like another player.
- No currency or betting system in place yet. This was the lowest priority as I wanted to work on the core game first.
- In addition to currency & betting, a list of winners should be displayed after each round to announce which players won & which lost money.
- Ability to double down or split.
- Aces currently only worth 1, should possibly be updated to be either 1 or 14.
- Re-connect socket logic. If user disconnects but immediately reconnects, they might have the ability to click around but this might mess up the flow of the game if not handled.



### Problems/Blockers and overall where I left off

- I got stuck trying to figure out how to get a state to update immediately to allow all html/components using {variable binding} to update immediately. I realized functional components are stateless and don't work like that, but was unable to figure out a workaround either with useEffect() or any other solution I'd found online. 
- I made class components mixed in with functional components before understanding the difference, so I'm not sure if the inconsistency would need to be refactored out.
- The 5 face-down cards next to the first 2 for each player are the "hit cards". They were intended to be hidden, where I set the style to change to be visible once the player chooses "hit" and a card is assigned to that "hit card slot". I had to make them all visible in the end due to being unable to figure out how to make the state update immediately & synch with the {binding} I used to change the style from hidden to visible.


### Clone, Install, Development & Start

Install [NodeJS]. I also recommend installing and using [Yarn] for developing applications.

Below is a list of commands to deploy the project locally

```
// Clone the repository.
git clone (this git url)

// Go to the project folder.
cd blackjack26/server

// Installing npm modules.
npm install
// or
yarn install

// Starting local server for development.
npm start
// or
yarn start

// Go to the client folder.
cd blackjack26/client

// Installing npm modules.
npm install
// or
yarn install

// Starting local server for development.
npm start
// or
yarn start

```

