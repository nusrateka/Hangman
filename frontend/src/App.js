import './App.css';
import React from "react";

function App() {
    const [guessedLetters, setGuessedLetters] = React.useState([]);
    const [remainingAttempts, setRemainingAttempts] = React.useState(null);
    const [validList, setValidList] = React.useState([]);
    const [gameStats, setGameStats] = React.useState(null);
    const [result, setResult] = React.useState('');

    React.useEffect(() => {
        getGame();
    }, []);

    const gameReset = () => {
        fetch("/reset/game")
            .then((res) => res.json())
            .then(() => {
                setGuessedLetters([]);
                setRemainingAttempts(null);
                setValidList([]);
                startNewGame();
            });
    }

    const statsReset = () => {
        fetch("/reset/stats")
            .then((res) => res.json()).then(
            (data) => {
                setGameStats(data.gameStats);
                startNewGame();
            });
    }

    const startNewGame = () => {
        window.location.reload();
    }

    const Hang = (prevRemainingAttempts) => {
        let ref = React.useRef();
        React.useEffect(() => {
            let canvas = ref.current;
            let canvasContext = canvas.getContext('2d');
            drawHangman(canvasContext, prevRemainingAttempts);
        })
        return (
            <canvas
                ref={ref}
                width={300}
                height={300}
            />
        );
    }

    const drawHangman = (canvasContext, prevRemainingAttempts) => {
        if (remainingAttempts === 9 || prevRemainingAttempts <= 9) {
            canvasContext.beginPath();
            canvasContext.lineWidth = 5;
            canvasContext.moveTo(0, 250);
            canvasContext.lineTo(100, 250);
            canvasContext.stroke();
        }
        if (remainingAttempts === 8 || prevRemainingAttempts <= 8) {
            canvasContext.beginPath();
            canvasContext.lineWidth = 5;
            canvasContext.moveTo(50, 250);
            canvasContext.lineTo(50, 25);
            canvasContext.stroke();
        }
        if (remainingAttempts === 7 || prevRemainingAttempts <= 7) {
            canvasContext.beginPath();
            canvasContext.lineWidth = 5;
            canvasContext.moveTo(50, 25);
            canvasContext.lineTo(200, 25);
            canvasContext.stroke();
        }
        if (remainingAttempts === 6 || prevRemainingAttempts <= 6) {
            canvasContext.beginPath();
            canvasContext.lineWidth = 5;
            canvasContext.moveTo(200, 25);
            canvasContext.lineTo(200, 50);
            canvasContext.stroke();
        }
        if (remainingAttempts === 5 || prevRemainingAttempts <= 5) {
            canvasContext.beginPath();
            canvasContext.lineWidth = 5;
            canvasContext.arc(200, 75, 25, 2 * Math.PI, 0);
            canvasContext.stroke();
        }
        if (remainingAttempts === 4 || prevRemainingAttempts <= 4) {
            canvasContext.beginPath();
            canvasContext.lineWidth = 5;
            canvasContext.moveTo(200, 100);
            canvasContext.lineTo(200, 155);
            canvasContext.stroke();
        }
        if (remainingAttempts === 3 || prevRemainingAttempts <= 3) {
            canvasContext.beginPath();
            canvasContext.lineWidth = 3;
            canvasContext.moveTo(200, 100);
            canvasContext.lineTo(175, 125);
            canvasContext.stroke();
        }
        if (remainingAttempts === 2 || prevRemainingAttempts <= 2) {
            canvasContext.beginPath();
            canvasContext.lineWidth = 3;
            canvasContext.moveTo(200, 100);
            canvasContext.lineTo(225, 125);
            canvasContext.stroke();
        }
        if (remainingAttempts === 1 || prevRemainingAttempts <= 1) {
            canvasContext.beginPath();
            canvasContext.lineWidth = 5;
            canvasContext.moveTo(200, 150);
            canvasContext.lineTo(175, 175);
            canvasContext.stroke();
        }
        if (remainingAttempts === 0 || prevRemainingAttempts === 0) {
            canvasContext.beginPath();
            canvasContext.lineWidth = 5;
            canvasContext.moveTo(200, 150);
            canvasContext.lineTo(225, 175);
            canvasContext.stroke();
        }

        if (result) renderResult(canvasContext, result)
    }

    const inputHandler = (event) => {
        const letter = event.target.value.toUpperCase()
        if (letter.match(/^[A-Z]$/)) {
            sendLetter(letter);
        }
        event.target.value = "";
    }

    const renderResult = (canvasContext, result) => {
        canvasContext.font = '48px Arial';
        canvasContext.lineWidth = 3;
        canvasContext.fillStyle = result === 'win' ? 'green' : 'red';
        canvasContext.fillText(result === 'win' ? 'You won!' : 'You lost!', 0, 120);
        canvasContext.font = '24px Arial';
    }

    const getGame = () => {
        fetch("/game")
            .then((res) => res.json())
            .then((json) => {
                setGuessedLetters(json.guessedLetters);
                setRemainingAttempts(json.remainingAttempts);
                setValidList(json.validList);
                setGameStats(json.gameStats);
            });
    }

    const sendLetter = (letter) => {
        fetch('/letter/' + letter, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        }).then(res => res.json())
            .then(json => {
                setGuessedLetters(json.guessedLetters);
                setRemainingAttempts(json.remainingAttempts);
                setValidList(json.validList);
                setGameStats(json.gameStats);
                if (json.isGameOver) {
                    setResult(json.gameOverType);
                }
            })
    }

    return (
        <div className="App">
            <h2>Hangman</h2>
            {!!remainingAttempts && remainingAttempts <= 9 ? Hang(remainingAttempts) : Hang()}
            <div id="hangman-word">
                {validList.map((letter, index) => (letter ? <div key={index} className="letter">{letter}</div> :
                    <div key={index} className="letter blank"/>))}
            </div>
            <br/>
            <p><b>Remaining Attempts:</b> {remainingAttempts ?? 10}</p>
            <p><b>Input letter:</b> <input id="letter-input" type="text" onChange={inputHandler} autoFocus
                                           disabled={!!result}/></p>
            <p><b>Guessed Letters:</b> {guessedLetters && guessedLetters.join(',')}</p>
            <h3>Game stats</h3>
            <p>{gameStats ? 'Won: ' + gameStats.won : ''}</p>
            <p>{gameStats ? 'Lost: ' + gameStats.lost : ''}</p>
            <br/>
            {
                !!result ? <button className="button button3" onClick={startNewGame}>Star new game</button> : ''
            }
            <button className="button button2" onClick={gameReset}>Game Reset</button>
            <button className="button" onClick={statsReset}>Stats Reset</button>
        </div>
    );
}

export default App;
