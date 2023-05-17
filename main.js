window.Telegram.WebApp.expand()
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Set up lines, the reels and paytable.
const lines = {
    2: 1,
    11: 1,
    15: 1,

    3: 2,
    4: 2,
    6: 2,
    7: 2,
    8: 2,
    9: 2,
    10: 2,
    12: 2,
    13: 2,
    16: 2,
    1: 3,
    5: 3,
    17: 3,
    14: 3,
    
}

const paytable = {
    2: 0.53,
    11: 0.58,
    15: 0.54,

    3: 2.5,
    4: 1.75,
    10: 1.75,
    16: 1.75,

    6: 1.35,
    7: 1.35,
    8: 1.45,
    9: 1.45,

    13: 1.5,
    
    1: 4,
    5: 3,

    17: 3,
    14: 2.5,

    12: 2,
};

const sortedArray = Object.entries(paytable).sort(([keyA, valueA], [keyB, valueB]) => valueA - valueB);
const paytableWrapper = document.getElementById('sc__wrapper2')
sortedArray.forEach(([p]) => {
    const paytableItem = document.createElement('div');
    paytableItem.id = `scratchcard-${p}`;
    paytableItem.classList.add('scratchcard');
    
    const image = new Image();
    image.src = `https://akabuda050.github.io/scratch_card/rewards/${p}.png`

    const paytableItemPayout = document.createElement('span');
    paytableItemPayout.innerText = `$${paytable[p]}`;
    paytableItem.append(image, paytableItemPayout);

    paytableWrapper.prepend(paytableItem);
})

const reels = [];

for (let i = 0; i < 3; i++) {
    const reel = [];

    // Fill the reel with numbers based on the desired RTP
    for (let number in paytable) {
        const payout = paytable[number];
        const occurrence = Math.round((lines[number] + payout)); // Increase the occurrence by multiplying by 1000

        reel.push(...Array(occurrence).fill(number));
    }

    reels.push(reel);
}

console.log({ paytable, lines, reels })

// Simulate the game and calculate RTP.
function simulateGame() {
    let balance = 1000;
    let totalLooose = 0;
    let totalSpins = 0;
    let totalWin = 0;

    while (totalSpins < 1000000) {

        if (balance <= 0) {
            break;
        }

        balance -= 0.5;
        totalLooose += 0.5;

        const spinResult = spinReels();
        const payout = isWinningCombination(spinResult);
        const totalPayout = payout.reduce((acc, curr) => acc + curr.payout, 0);

        if (totalPayout > 0) {
            totalWin += totalPayout;
            balance += totalPayout;
        }

        totalSpins++;
    }

    const rtp = (totalWin / totalLooose) * 100;
    return {
        rtp: `${rtp.toFixed(2)}%`,
        balance,
        totalLooose,
        totalWin
    };
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

// Run the simulation and output the RTP
const resultOfSim = simulateGame();
console.log(resultOfSim);

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

// Start game.
let balance = 1000;

document.getElementById('balance').innerText = `$${balance}`;


let resultOfGame = []
let cards = [];

function start() {
    balance -= 0.5;
    document.getElementById('result-text').innerText = `Scratch cards`;

    document.getElementById('balance').innerText = `$${balance.toFixed(2)}`;
    document.getElementById('restart-button').innerText = `Reveal`;
    document.getElementById('restart-button').style = `display: none`;
    resultOfGame = []
    cards = [];
    Object.keys(paytable).forEach((p) => {
        const scratchcard = document.getElementById(`scratchcard-${p}`);
        scratchcard.style = '';
    })

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

                if (resultOfGame.length === 1) {
                    document.getElementById('restart-button').style = `display: inline-block`;
                }

                if (resultOfGame.length === 3) {
                    const payout = isWinningCombination(resultOfGame);

                    const totalPayout = payout.reduce((acc, curr) => acc + curr.payout, 0)
                    if (totalPayout > 0) {
                        document.getElementById('result-text').innerText = `You won $${totalPayout.toFixed(2)}`;
                        balance += totalPayout;

                        document.getElementById('balance').innerText = `$${balance.toFixed(2)}`;
                        payout.forEach((p) => {
                            const scratchcard = document.getElementById(`scratchcard-${p.sym}`);
                            console.log(`scratchcard-${p.sym}`, scratchcard)

                            scratchcard.style = 'border: 2px solid red;'
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