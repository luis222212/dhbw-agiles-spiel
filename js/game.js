/* ===========================================================
   DOM REFERENCES
   =========================================================== */
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const boardEl = document.getElementById('board');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const pairsLeftEl = document.getElementById('pairs-left');
const diffSelect = document.getElementById('difficulty');
const btnStart = document.getElementById('btn-start');
const btnRestart = document.getElementById('btn-restart');
const endTitle = document.getElementById('end-title');
const endMessage = document.getElementById('end-message');
const finalScoreEl = document.getElementById('final-score');
const finalTimeEl = document.getElementById('final-time');
const legendEl = document.getElementById('legend');

/* ===========================================================
   GAME STATE
   =========================================================== */
let cards = [];
let flippedCards = [];
let matchedCount = 0;
let totalPairs = 0;
let score = 0;
let timeLeft = 60;
let timerInterval = null;
let lockBoard = false;

/* ===========================================================
   DIFFICULTY CONFIG
   =========================================================== */
const DIFFICULTY_CONFIG = {
    easy: {
        pairs: GREEN_PAIRS,           // 12 grüne Paare
        time: 90,
        quiz: false,
        cols: 6,
        label: 'Leicht'
    },
    medium: {
        pairs: [...GREEN_PAIRS, ...YELLOW_PAIRS],   // 23 Paare
        time: 180,
        quiz: true,
        cols: 8,
        label: 'Mittel'
    },
    hard: {
        pairs: ALL_PAIRS,             // 32 Paare
        time: 300,
        quiz: true,
        cols: 8,
        label: 'Schwer'
    }
};

/* ===========================================================
   UTILITY  –  Shuffle (Fisher-Yates)
   =========================================================== */
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/* ===========================================================
   GAME INIT
   =========================================================== */
btnStart.addEventListener('click', startGame);
btnRestart.addEventListener('click', () => {
    endScreen.style.display = 'none';
    startScreen.style.display = 'block';
    startScreen.style.animation = 'fadeUp 0.5s ease-out';
});

function startGame() {
    // Reset state
    matchedCount = 0;
    score = 0;
    flippedCards = [];
    lockBoard = false;
    cards = [];
    boardEl.innerHTML = '';

    const difficulty = diffSelect.value;
    const config = DIFFICULTY_CONFIG[difficulty];
    const selectedPairs = shuffle([...config.pairs]);
    totalPairs = selectedPairs.length;
    timeLeft = config.time;

    // Track which tiers are used (for the legend)
    const activeTiers = new Set();

    // Build card array: each pair → 2 cards sharing a pairId
    selectedPairs.forEach((pair, i) => {
        activeTiers.add(pair.tier);
        cards.push({
            id: `p${i}-a`,
            pairId: i,
            text: pair.term,
            type: 'normal',
            tier: pair.tier,
            image: pair.image || null
        });
        cards.push({
            id: `p${i}-b`,
            pairId: i,
            text: pair.match,
            type: 'normal',
            tier: pair.tier,
            image: null   // image only on term card
        });
    });

    // Add quiz cards on medium/hard
    if (config.quiz) {
        cards.push({ id: 'quiz-1', pairId: -1, text: '❓ Quiz-Karte', type: 'quiz', tier: null });
        cards.push({ id: 'quiz-2', pairId: -2, text: '❓ Quiz-Karte', type: 'quiz', tier: null });
    }

    shuffle(cards);

    // Set grid columns
    const total = cards.length;
    let cols = config.cols;
    // For smaller screens, limit columns
    if (window.innerWidth < 500) {
        cols = Math.min(cols, 4);
    } else if (window.innerWidth < 700) {
        cols = Math.min(cols, 6);
    }
    boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    // Build legend
    buildLegend(activeTiers);

    // Render cards
    cards.forEach((card) => {
        const el = document.createElement('div');
        el.classList.add('card');
        el.dataset.id = card.id;
        el.dataset.pairId = card.pairId;
        el.dataset.type = card.type;

        const isQuiz = card.type === 'quiz';
        const tierClass = card.tier ? `tier-${card.tier}` : '';

        // Build front content
        let frontContent = '';
        if (card.image) {
            frontContent += `<img src="${card.image}" class="card-img" alt="" onerror="this.style.display='none'" />`;
        }
        frontContent += `<span class="card-text">${card.text}</span>`;

        el.innerHTML = `
          <div class="card-inner">
            <div class="card-face card-back ${isQuiz ? 'quiz-back' : ''}">
              <span class="card-pattern">${isQuiz ? '❓' : '🍃'}</span>
              ${!isQuiz && card.tier ? `<span class="tier-stripe ${card.tier}"></span>` : ''}
            </div>
            <div class="card-face card-front ${isQuiz ? 'quiz-face' : tierClass}">
              ${isQuiz ? card.text : frontContent}
            </div>
          </div>
        `;

        el.addEventListener('click', () => handleCardClick(el, card));
        boardEl.appendChild(el);
    });

    // Update HUD
    updateHUD();

    // Switch screens
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    gameScreen.style.animation = 'fadeUp 0.5s ease-out';

    // Start timer
    startTimer();
}

/* ===========================================================
   LEGEND
   =========================================================== */
function buildLegend(activeTiers) {
    if (!legendEl) return;
    legendEl.innerHTML = '';
    const tierOrder = ['green', 'yellow', 'red'];
    tierOrder.forEach(tier => {
        if (!activeTiers.has(tier)) return;
        const pts = TIER_POINTS[tier];
        const label = TIER_LABELS[tier];
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `<span class="legend-dot ${tier}"></span>${label} (${pts} Pkt.)`;
        legendEl.appendChild(item);
    });
}

/* ===========================================================
   TIMER
   =========================================================== */
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;

        if (timeLeft <= 10) {
            timerEl.style.color = '#c96b6b';
        } else {
            timerEl.style.color = '';
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame(false);
        }
    }, 1000);
}

/* ===========================================================
   CARD CLICK HANDLER
   =========================================================== */
function handleCardClick(el, card) {
    if (lockBoard) return;
    if (el.classList.contains('flipped') || el.classList.contains('matched')) return;

    el.classList.add('flipped');

    // ---- QUIZ CARD ----
    if (card.type === 'quiz') {
        lockBoard = true;
        setTimeout(() => {
            showQuizModal(() => {
                el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                el.style.opacity = '0';
                el.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    el.style.visibility = 'hidden';
                    el.style.pointerEvents = 'none';
                    lockBoard = false;
                }, 400);
            });
        }, 500);
        return;
    }

    // ---- NORMAL CARD ----
    flippedCards.push({ el, card });

    if (flippedCards.length === 2) {
        lockBoard = true;
        const [first, second] = flippedCards;

        if (first.card.pairId === second.card.pairId) {
            // ✅ Match found
            first.el.classList.add('matched');
            second.el.classList.add('matched');
            matchedCount++;

            // Points based on tier
            const pts = TIER_POINTS[first.card.tier] || 100;
            addScore(pts);
            addTime(5, first.el);
            flippedCards = [];
            lockBoard = false;
            updateHUD();

            if (matchedCount === totalPairs) {
                setTimeout(() => endGame(true), 600);
            }
        } else {
            // ❌ No match
            setTimeout(() => {
                first.el.classList.remove('flipped');
                second.el.classList.remove('flipped');
                flippedCards = [];
                lockBoard = false;
            }, 900);
        }
    }
}

/* ===========================================================
   SCORE & TIME HELPERS
   =========================================================== */
function addScore(amount) {
    score += amount;
    scoreEl.textContent = score;
}

function addTime(seconds, anchorEl) {
    timeLeft += seconds;
    timerEl.textContent = timeLeft;
    showBonusFloat(`+${seconds}s`, anchorEl);
}

function updateHUD() {
    scoreEl.textContent = score;
    timerEl.textContent = timeLeft;
    pairsLeftEl.textContent = totalPairs - matchedCount;
}

/* ===========================================================
   FLOATING BONUS TEXT
   =========================================================== */
function showBonusFloat(text, anchorEl) {
    const rect = anchorEl ? anchorEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2 };
    const span = document.createElement('span');
    span.className = 'bonus-float';
    span.textContent = text;
    span.style.left = `${rect.left + rect.width / 2 - 30}px`;
    span.style.top = `${rect.top}px`;
    document.body.appendChild(span);
    setTimeout(() => span.remove(), 1100);
}

/* ===========================================================
   QUIZ MODAL
   =========================================================== */
function showQuizModal(onClose) {
    const q = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal glass';

    modal.innerHTML = `
        <h2>⚡ Quiz-Frage</h2>
        <p class="question">${q.question}</p>
        <div class="choices"></div>
    `;

    const choicesDiv = modal.querySelector('.choices');

    q.choices.forEach((choice) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.text;
        btn.addEventListener('click', () => {
            choicesDiv.querySelectorAll('.choice-btn').forEach(b => {
                b.disabled = true;
                b.style.pointerEvents = 'none';
            });

            if (choice.correct) {
                btn.classList.add('correct');
                addScore(200);
                addTime(15, modal);
            } else {
                btn.classList.add('wrong');
                const correctBtn = [...choicesDiv.querySelectorAll('.choice-btn')]
                    .find((b) => b.textContent === q.choices.find(c => c.correct).text);
                if (correctBtn) correctBtn.classList.add('correct');
            }

            setTimeout(() => {
                overlay.remove();
                onClose();
            }, 1000);
        });
        choicesDiv.appendChild(btn);
    });

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

/* ===========================================================
   END GAME
   =========================================================== */
function endGame(won) {
    clearInterval(timerInterval);
    gameScreen.style.display = 'none';
    endScreen.style.display = 'block';
    endScreen.style.animation = 'fadeUp 0.6s ease-out';

    if (won) {
        endTitle.textContent = '🎉 Geschafft!';
        endMessage.textContent = 'Stark! Du hast alle Paare gefunden.';
    } else {
        endTitle.textContent = '⏰ Zeit abgelaufen!';
        endMessage.textContent = `Du hast ${matchedCount} von ${totalPairs} Paaren gefunden.`;
    }

    finalScoreEl.textContent = score;
    finalTimeEl.textContent = won ? `${timeLeft}s` : '0s';
}
