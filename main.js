function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const paytable = {
    1: 1 * 7.58823529411,
    2: 2 * 3.58823529411,
    3: 3 * 4.58823529411,
    4: 4 * 5.58823529411,
    5: 5 * 0.58823529411,
    6: 6 * 6.58823529411,
    7: 7 * 1.58823529411,
    8: 8 * 4.58823529411,
    9: 9 * 0.58823529411,
    10: 10 * 4.58823529411,
    11: 11 * 0.58823529411,
    12: 12 * 4.58823529411,
    13: 13 * 1.58823529411,
    14: 14 * 5.58823529411,
    15: 15 * 0.58823529411,
    16: 16 * 0.58823529411,
    17: 17 * 0.58823529411,
};

// Set up the reels and paytable
const reels = [];

for (let i = 0; i < 3; i++) {
    const reel = [];

    // Fill the reel with numbers based on the desired RTP
    for (let number in paytable) {
        const payout = paytable[number];
        const occurrence = Math.ceil(payout / 0.98 / 0.98) ; // Increase the occurrence by multiplying by 1000

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

// Check if the spin result is a winning combination
function isWinningCombination(spinResult) {
    const counts = {};
    for (let i = 0; i < spinResult.length; i++) {
        const num = spinResult[i];
        counts[num] = (counts[num] || 0) + 1;
        if (counts[num] === 3) {
            return true;
        }
    }
    return false;
}

// Run the simulation and output the RTP
//const rtp = simulateGame();
//console.log(`Simulated RTP: ${rtp}%`);

const scratchContainers = document.querySelectorAll('.js-scratchcard');

const resultOfGame = []
for (let scratch of scratchContainers) {
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
                if (isWinningCombination(resultOfGame)) {
                    const payout = paytable[resultOfGame[0]];

                    document.getElementById('result-text').innerText = `You won $${payout}`;
                } else {
                    document.getElementById('result-text').innerText = `Good luck next time :)`;
                }
                document.getElementById('restart-button').style = `display: inline-block`;
            }
        }
    });

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

function restart() {
    window.location.reload()
}