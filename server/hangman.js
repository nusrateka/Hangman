"use strict";

class Hangman {
    constructor(word, guessedLetters, validList, attempts) {
        this.word = word.toUpperCase();

        this.guessedLetters = guessedLetters || [];
        this.validList = validList || new Array(word.length);
        this.attempts = attempts || 0;
    }

    maxWrongAnswers = 10

    isGameOver() {
        if (this.attempts >= this.maxWrongAnswers) {
            return {
                'isGameOver': true,
                'gameOverType': 'loss'
            };
        } else if (this.validList.join('') === this.word) {
            return {
                'isGameOver': true,
                'gameOverType': 'win'
            };
        } else {
            return {
                'isGameOver': false
            };
        }
    }

    validateLetter(letter) {
        let valid = false;

        letter = letter.toUpperCase();

        if (this.guessedLetters.indexOf(letter) === -1) {
            this.guessedLetters.push(letter);
            for (let i = 0; i < this.word.length; i++) {
                if (this.word[i] === letter) {
                    valid = true;
                    this.validList[i] = letter;
                }
            }
            if (!valid) this.attempts += 1;
        }
        let response = this.isGameOver();
        response.valid = valid;
        response.validList = this.validList;
        response.guessedLetters = this.guessedLetters;
        response.remainingAttempts = this.maxWrongAnswers - this.attempts;
        return response;
    }
}

module.exports = Hangman;
