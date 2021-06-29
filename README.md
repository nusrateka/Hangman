REQUIREMENTS:
- nodejs
- redis
`brew install redis`

TO RUN:
1. Run `redis-server` to start redis server
2. cd to server
3. Run `npm install` to install all necessary dependencies for server
4. Run `npm run client-install` to install all necessary dependencies for client
5. Run `npm run dev` to run client and server concurrently
6. Navigate to localhost:3000 in a browser to view

FUNCTIONALITY
- start new game: to run new after current game finished
- reset game: to reset current game
- reset stats: to clear all the stats

TODO:
- [x] get a random word from external api
- [x] start new game
- [x] load previous game
- [x] send a letter to validate 
- [x] show remaining attempts
- [x] show guessed letters
- [x] show valid letters
- [x] show game stats
- [x] draw hangman image
- [x] add buttons to reset game and clear stats
- [ ] add multiplayer functionality

