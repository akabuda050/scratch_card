window.Telegram.WebApp.expand()
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const paytable = {
    1: 1.5,   // Payout for number 1
    2: 1.30,   // Payout for number 2
    3: 1.70,   // Payout for number 3
    4: 1.70,   // Payout for number 4
    5: 0.5,   // Payout for number 5
    6: 1.70,   // Payout for number 6
    7: 1.70,   // Payout for number 7
    8: 0.70,   // Payout for number 8
    9: 0.70,   // Payout for number 9
    10: 0.70,  // Payout for number 10
    11: 1.30,  // Payout for number 11
    12: 1.30,  // Payout for number 12
    13: 1.70,  // Payout for number 13
    14: 1.5,  // Payout for number 14
    15: 1.70,  // Payout for number 15
    16: 1.70,  // Payout for number 16
    17: 0.5   // Payout for number 17
};

// Set up the reels and paytable
const reels = [];

for (let i = 0; i < 3; i++) {
    const reel = [];

    // Fill the reel with numbers based on the desired RTP
    for (let number in paytable) {
        const payout = paytable[number];
        const occurrence = Math.ceil(((number) / 0.98) / payout); // Increase the occurrence by multiplying by 1000

        reel.push(...Array(occurrence).fill(number));
    }

    reels.push(reel);
}

console.log({ paytable, reels })

// Simulate the game and calculate RTP
function simulateGame() {
    let totalSpins = 0;
    let totalPayout = 0;

    while (totalSpins < 100000) {
        const spinResult = spinReels();

        if (isWinningCombination(spinResult)) {
            const payout = paytable[spinResult[0]];
            totalPayout += payout;
        }

        totalSpins++;
    }

    const rtp = (totalPayout / totalSpins) * 100;
    return rtp.toFixed(2);
}

// Spin the reels and return the result
function spinReels() {
    const result = [];
    for (let i = 0; i < 3; i++) {
        const reel = reels[i];
        const randomIndex = Math.floor(Math.random() * reel.length);
        result.push(reel[randomIndex]);
    }
    return result;
}

const lines = {
    1: 1,
    2: 2,
    3: 3,
    4: 3,
    5: 1,
    6: 3,
    7: 3,
    8: 3,
    9: 3,
    10: 3,
    11: 2,
    12: 2,
    13: 3,
    14: 1,
    15: 3,
    16: 3,
    17: 1,
}
// Check if the spin result is a winning combination
function isWinningCombination(spinResult) {
    const grandResult = [];
    Object.keys(lines).forEach(((sym) => {
        const result = spinResult.filter(i => i === sym)
        if (result.length >= lines[sym]) {
            let payout = paytable[sym] * result.length;
            grandResult.push({ sym, count: result.length, payout })
        }
    }))
    return grandResult;
}

// Run the simulation and output the RTP
//const rtp = simulateGame();
//console.log(`Simulated RTP: ${rtp}%`);

let balance = 1000;

document.getElementById('balance').innerText = `$${balance}`;


let resultOfGame = []
let cards = [];

function start() {
    balance -= 1;
    document.getElementById('balance').innerText = `$${balance}`;
    document.getElementById('restart-button').innerText = `Reveal`;
    document.getElementById('result-sym').innerHTML = '';
    resultOfGame = []
    cards = [];
    const scratchContainers = document.querySelectorAll('.js-scratchcard');

    for (let scratch of scratchContainers) {
        scratch.innerHTML = '';
        const idx = scratch.dataset.idx;
        const number = reels[idx][Math.floor(Math.random() * reels[idx].length)];

        let scratchId = '#' + scratch.id;
        let sc = new ScratchCard(scratchId, {
            scratchType: SCRATCH_TYPE.LINE,
            containerWidth: 100,
            containerHeight: 100,
            imageForwardSrc: 'https://akabuda050.github.io/scratch_card/images/scratchcard.jpg',
            imageBackgroundSrc: `https://akabuda050.github.io/scratch_card/rewards/${number}.png`,
            htmlBackground: '',
            clearZoneRadius: 10,
            nPoints: 0,
            pointSize: 0,
            percentToFinish: 20,
            callback: function () {
                resultOfGame.push(number);

                if (resultOfGame.length === 3) {
                    const payout = isWinningCombination(resultOfGame);

                    const totalPayout = payout.reduce((acc, curr) => acc + curr.payout, 0)
                    if (totalPayout > 0) {
                        document.getElementById('result-text').innerText = `You won $${totalPayout.toFixed(2)}`;
                        balance += totalPayout;

                        document.getElementById('balance').innerText = `$${balance.toFixed(2)}`;
                        payout.forEach((p) => {
                            const img = new Image();
                            img.src = `https://akabuda050.github.io/scratch_card/rewards/${p.sym}.png`
                            img.width = 30;
                            img.height = 30;

                            const div = document.createElement('div');
                            const span = document.createElement('span');
                            span.innerText = `x${p.count}`
                            div.appendChild(img)
                            div.appendChild(span)

                            document.getElementById('result-sym').appendChild(div);

                        })

                    } else {
                        document.getElementById('result-text').innerText = `Good luck next time :)`;
                    }

                    reveald = true;
                    document.getElementById('restart-button').innerText = `Restart`;
                }
            }
        });
        cards.push(sc);
        // Init
        sc.init().then(() => {
            sc.canvas.addEventListener('scratch.move', () => {
                let percent = sc.getPercent().toFixed(0);
            })
        }).catch((error) => {
            // image not loaded
            alert(error.message);
        });
    }
}

let reveald = false;
function restart() {
    if (reveald) {
        reveald = false
        start();

        return;
    }

    cards.forEach((sc) => {
        sc.percent = 100;
        sc.finish();
    });
    reveald = true;
    document.getElementById('restart-button').innerText = `Restart`;
}

start()