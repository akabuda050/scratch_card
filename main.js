function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const paytable = {
    1: 0.05,   // Payout for number 1
    2: 0.08,   // Payout for number 2
    3: 0.08,   // Payout for number 3
    4: 0.10,   // Payout for number 4
    5: 0.12,   // Payout for number 5
    6: 0.12,   // Payout for number 6
    7: 0.15,   // Payout for number 7
    8: 0.15,   // Payout for number 8
    9: 0.20,   // Payout for number 9
    10: 0.20,  // Payout for number 10
    11: 0.25,  // Payout for number 11
    12: 0.30,  // Payout for number 12
    13: 0.35,  // Payout for number 13
    14: 0.40,  // Payout for number 14
    15: 0.50,  // Payout for number 15
    16: 0.60,  // Payout for number 16
    17: 0.70   // Payout for number 17
};

// Set up the reels and paytable
const reels = [];

for (let i = 0; i < 3; i++) {
  const reel = [];

  // Fill the reel with numbers based on the desired RTP
  for (let number in paytable) {
    const payout = paytable[number];
    const occurrence = Math.ceil(number * payout) * 98; // Increase the occurrence by multiplying by 1000

    reel.push(...Array(occurrence).fill(number));
  }

  reels.push(reel);
}

console.log({paytable, reels})

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

for (let scratch of scratchContainers) {
    const idx = scratch.dataset.idx;
    const number = reels[idx][Math.floor(Math.random() * reels[idx].length)];

    let scratchId = '#' + scratch.id;
    let sc = new ScratchCard(scratchId, {
        scratchType: SCRATCH_TYPE.LINE,
        containerWidth: 100,
        containerHeight: 100,
        imageForwardSrc: '/images/scratchcard.jpg',
        imageBackgroundSrc: `/rewards/${number}.png`,
        htmlBackground: '',
        clearZoneRadius: 10,
        nPoints: 0,
        pointSize: 0,
        percentToFinish: 20,
        callback: function () {

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

