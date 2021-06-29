"use strict";

const express = require('express');
const session = require('express-session');
const redisStore = require('connect-redis')(session);
const redis = require('redis');
const redisClient = redis.createClient();
const request = require('request');
const Hangman = require('./hangman');
const app = express();

redisClient.on('error', (err) => {
    console.log('Redis error: ', err);
});

app.use(session({
    name: 'gameId',
    secret: 'datenut',
    resave: false,
    saveUninitialized: true,
    store: new redisStore({client: redisClient}),
}));

let activeGame,
    gameStats = {
        'won': 0,
        'lost': 0
    };

//checking if gameStats exist in redis
redisClient.exists('gameStats', (err, val) => {
    if (val === 1) {
        console.log('exists');
        redisClient.hget('gameStats', 'won', (err, val) => {
            gameStats.won = val;
        });
        redisClient.hget('gameStats', 'lost', (err, val) => {
            gameStats.lost = val;
        });
    } else {
        redisClient.hmset('gameStats', {
            'won': 0,
            'lost': 0
        });
    }
})

//game reset
app.get("/reset/game", (req, res) => {
    if (req.session && req.session.game) {
        req.session.destroy();
        res.json({message: "Game cleared"});
    }
});

//stat (gameStats) reset
app.get("/reset/stats", (req, res) => {
    redisClient.del('gameStats');
    gameStats = {
        'won': 0,
        'lost': 0
    };
    res.json({message: "Stats cleared", gameStats});
});

// sends new or previous game information to starts a new or previous game
app.get('/game', (req, res) => {
    // checking if game exist in session
    if (req.session && req.session.game) {
        previousGame(req.session.game);
        res.send({
            'type': 'old',
            'guessedLetters': activeGame.guessedLetters,
            'validList': activeGame.validList,
            'remainingAttempts': activeGame.maxWrongAnswers - activeGame.attempts,
            'gameStats': gameStats
        });
    } else {
        newGame(req.session, (validList) => {
            res.send({
                'type': 'new',
                'validList': validList,
                'gameStats': gameStats
            });
        });
    }
});

// sends letter to validate
app.post('/letter/:letter', (req, res) => {
    if (req.session.game) {
        previousGame(req.session.game);
        let json = activeGame.validateLetter(req.params.letter);
        req.session.game = activeGame;
        req.session.save();

        if (json.isGameOver) {
            req.session.game = null;
            req.session.save();

            if (json.gameOverType === 'win') {
                gameStats.won++;
                redisClient.hincrby('gameStats', 'won', 1);
            } else {
                gameStats.lost++;
                redisClient.hincrby('gameStats', 'lost', 1);
            }
        }
        json.gameStats = gameStats;
        res.send(json);
    } else {
        res.status(412).end();
    }
});

const newGame = (session, callback) => {
    request('https://random-word-api.herokuapp.com/word?number=1', {json: true}, (err, res, words) => {
        if (err) {
            return console.log(err);
        }
        session.game = new Hangman(words[0]);
        session.save();
        callback(session.game.validList);
    });
}

const previousGame = (gameSession) => {
    activeGame = new Hangman(gameSession.word, gameSession.guessedLetters, gameSession.validList, gameSession.attempts);
}

const port = 5000;
const ip_address = "127.0.0.1";
app.listen(port, ip_address);
