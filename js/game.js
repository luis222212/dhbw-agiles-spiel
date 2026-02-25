/* ===========================================================
   DOM REFERENCES
   =========================================================== */
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const transitionScreen = document.getElementById('transition-screen');
const quizScreen = document.getElementById('quiz-screen');
const endScreen = document.getElementById('end-screen');

// Memory (Phase 1)
const boardEl = document.getElementById('board');
const timerEl = document.getElementById('timer');
const pairsLeftEl = document.getElementById('pairs-left');
const legendEl = document.getElementById('legend');
const btnSkipToQuiz = document.getElementById('btn-skip-to-quiz');

// Transition
const transitionTimeEl = document.getElementById('transition-time');
const btnStartQuiz = document.getElementById('btn-start-quiz');

// Quiz (Phase 2)
const quizTimerEl = document.getElementById('quiz-timer');
const quizScoreEl = document.getElementById('quiz-score');
const quizProgressEl = document.getElementById('quiz-progress');
const quizQuestionEl = document.getElementById('quiz-question');
const quizChoicesEl = document.getElementById('quiz-choices');

// Common
const diffSelect = document.getElementById('difficulty');
const btnStart = document.getElementById('btn-start');
const btnRestart = document.getElementById('btn-restart');
const endTitle = document.getElementById('end-title');
const endMessage = document.getElementById('end-message');
const finalScoreEl = document.getElementById('final-score');
const finalCorrectEl = document.getElementById('final-correct');
const finalTimeEl = document.getElementById('final-time');

/* ===========================================================
   GAME STATE
   =========================================================== */
let cards = [];
let flippedCards = [];
let matchedCount = 0;
let totalPairs = 0;
let accumulatedTime = 0;   // Zeit-Bank (Phase 1)
let quizTimeLeft = 0;      // Countdown (Phase 2)
let quizScore = 0;
let quizCorrect = 0;
let quizTotal = 0;
let currentQuizIndex = 0;
let quizQuestions = [];
let timerInterval = null;
let lockBoard = false;

/* ===========================================================
   BASE TIME & TIME BONUSES
   =========================================================== */
const BASE_TIME = 45;  // Sekunden Startguthaben

const TIER_TIME_BONUS = {
    green: 3,
    yellow: 5,
    red: 8,
};

/* ===========================================================
   DIFFICULTY CONFIG
   =========================================================== */
const DIFFICULTY_CONFIG = {
    'very-easy': {
        pairs: GREEN_PAIRS.slice(0, 8),
        quizCount: 5,
        cols: 4,
    },
    easy: {
        pairs: GREEN_PAIRS,
        quizCount: 8,
        cols: 6,
    },
    medium: {
        pairs: [...GREEN_PAIRS, ...YELLOW_PAIRS],
        quizCount: 12,
        cols: 8,
    },
    hard: {
        pairs: ALL_PAIRS,
        quizCount: 15,
        cols: 8,
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
   SCREEN HELPERS
   =========================================================== */
function hideAll() {
    startScreen.style.display = 'none';
    gameScreen.style.display = 'none';
    transitionScreen.style.display = 'none';
    quizScreen.style.display = 'none';
    endScreen.style.display = 'none';
}

function showScreen(el) {
    hideAll();
    el.style.display = el.id === 'game-screen' || el.id === 'quiz-screen' ? 'block' : '';
    if (el.style.display === '') el.style.display = 'block';
    el.style.animation = 'fadeUp 0.5s ease-out';
}

/* ===========================================================
   INIT  –  Event Listeners
   =========================================================== */
btnStart.addEventListener('click', startPhase1);
btnStartQuiz.addEventListener('click', startPhase2);
btnRestart.addEventListener('click', () => showScreen(startScreen));
btnSkipToQuiz.addEventListener('click', () => showTransition());

/* ═══════════════════════════════════════════════════════════
   ██  PHASE 1: MEMORY (Lernphase)
   ═══════════════════════════════════════════════════════════ */
function startPhase1() {
    // Reset state
    matchedCount = 0;
    accumulatedTime = BASE_TIME;
    flippedCards = [];
    lockBoard = false;
    cards = [];
    boardEl.innerHTML = '';

    const difficulty = diffSelect.value;
    const config = DIFFICULTY_CONFIG[difficulty];
    const selectedPairs = shuffle([...config.pairs]);
    totalPairs = selectedPairs.length;

    const activeTiers = new Set();

    // Build card array
    selectedPairs.forEach((pair, i) => {
        activeTiers.add(pair.tier);
        cards.push({
            id: `p${i}-a`, pairId: i, text: pair.term,
            type: 'normal', tier: pair.tier, image: pair.image || null
        });
        cards.push({
            id: `p${i}-b`, pairId: i, text: pair.match,
            type: 'normal', tier: pair.tier, image: null
        });
    });

    shuffle(cards);

    // Grid columns
    let cols = config.cols;
    if (window.innerWidth < 500) cols = Math.min(cols, 4);
    else if (window.innerWidth < 700) cols = Math.min(cols, 6);
    boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    buildLegend(activeTiers);

    // Render cards
    cards.forEach((card) => {
        const el = document.createElement('div');
        el.classList.add('card');
        el.dataset.id = card.id;
        el.dataset.pairId = card.pairId;

        const tierClass = card.tier ? `tier-${card.tier}` : '';

        let frontContent = '';
        if (card.image) {
            frontContent += `<img src="${card.image}" class="card-img" alt="" onerror="this.style.display='none'" />`;
        }
        frontContent += `<span class="card-text">${card.text}</span>`;

        el.innerHTML = `
          <div class="card-inner">
            <div class="card-face card-back">
              <span class="card-pattern">🍃</span>
              ${card.tier ? `<span class="tier-stripe ${card.tier}"></span>` : ''}
            </div>
            <div class="card-face card-front ${tierClass}">
              ${frontContent}
            </div>
          </div>
        `;

        el.addEventListener('click', () => handleCardClick(el, card));
        boardEl.appendChild(el);
    });

    // HUD
    timerEl.textContent = accumulatedTime;
    pairsLeftEl.textContent = totalPairs;

    showScreen(gameScreen);
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
        const bonus = TIER_TIME_BONUS[tier];
        const label = TIER_LABELS[tier];
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `<span class="legend-dot ${tier}"></span>${label} (+${bonus}s)`;
        legendEl.appendChild(item);
    });
}

/* ===========================================================
   CARD CLICK HANDLER (Phase 1)
   =========================================================== */
function handleCardClick(el, card) {
    if (lockBoard) return;
    if (el.classList.contains('flipped') || el.classList.contains('matched')) return;

    el.classList.add('flipped');
    flippedCards.push({ el, card });

    if (flippedCards.length === 2) {
        lockBoard = true;
        const [first, second] = flippedCards;

        if (first.card.pairId === second.card.pairId) {
            // ✅ Match
            first.el.classList.add('matched');
            second.el.classList.add('matched');
            matchedCount++;

            // Earn time based on tier
            const bonus = TIER_TIME_BONUS[first.card.tier] || 3;
            accumulatedTime += bonus;
            timerEl.textContent = accumulatedTime;
            showBonusFloat(`+${bonus}s`, first.el);

            flippedCards = [];
            lockBoard = false;
            pairsLeftEl.textContent = totalPairs - matchedCount;

            // All pairs found → transition to Quiz
            if (matchedCount === totalPairs) {
                setTimeout(() => showTransition(), 700);
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
   FLOATING BONUS TEXT
   =========================================================== */
function showBonusFloat(text, anchorEl) {
    const rect = anchorEl
        ? anchorEl.getBoundingClientRect()
        : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0 };
    const span = document.createElement('span');
    span.className = 'bonus-float';
    span.textContent = text;
    span.style.left = `${rect.left + rect.width / 2 - 30}px`;
    span.style.top = `${rect.top}px`;
    document.body.appendChild(span);
    setTimeout(() => span.remove(), 1100);
}

/* ===========================================================
   TRANSITION (Memory → Quiz)
   =========================================================== */
function showTransition() {
    transitionTimeEl.textContent = accumulatedTime;
    showScreen(transitionScreen);
}

/* ═══════════════════════════════════════════════════════════
   ██  PHASE 2: QUIZ (Abfragephase)
   ═══════════════════════════════════════════════════════════ */
function startPhase2() {
    const difficulty = diffSelect.value;
    const config = DIFFICULTY_CONFIG[difficulty];

    // Prepare quiz questions
    quizQuestions = shuffle([...QUIZ_QUESTIONS]).slice(0, config.quizCount);
    currentQuizIndex = 0;
    quizScore = 0;
    quizCorrect = 0;
    quizTotal = quizQuestions.length;
    quizTimeLeft = accumulatedTime;

    // Update HUD
    quizTimerEl.textContent = quizTimeLeft;
    quizScoreEl.textContent = 0;
    quizProgressEl.textContent = `1/${quizTotal}`;

    showScreen(quizScreen);
    showQuizQuestion();
    startQuizTimer();
}

/* ===========================================================
   QUIZ TIMER
   =========================================================== */
function startQuizTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        quizTimeLeft--;
        quizTimerEl.textContent = quizTimeLeft;

        if (quizTimeLeft <= 10) {
            quizTimerEl.style.color = '#c96b6b';
        } else {
            quizTimerEl.style.color = '';
        }

        if (quizTimeLeft <= 0) {
            clearInterval(timerInterval);
            endGame(false);
        }
    }, 1000);
}

/* ===========================================================
   SHOW QUIZ QUESTION
   =========================================================== */
function showQuizQuestion() {
    if (currentQuizIndex >= quizTotal) {
        clearInterval(timerInterval);
        endGame(true);
        return;
    }

    const q = quizQuestions[currentQuizIndex];
    quizProgressEl.textContent = `${currentQuizIndex + 1}/${quizTotal}`;
    quizQuestionEl.textContent = q.question;
    quizChoicesEl.innerHTML = '';

    // Animate card
    const card = document.getElementById('quiz-card');
    card.style.animation = 'none';
    // Force reflow
    void card.offsetHeight;
    card.style.animation = 'scaleUp 0.3s ease-out';

    q.choices.forEach((choice) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.text;

        btn.addEventListener('click', () => {
            // Disable all
            quizChoicesEl.querySelectorAll('.choice-btn').forEach(b => {
                b.disabled = true;
                b.style.pointerEvents = 'none';
            });

            if (choice.correct) {
                btn.classList.add('correct');
                quizScore += 100;
                quizCorrect++;
                quizScoreEl.textContent = quizScore;
            } else {
                btn.classList.add('wrong');
                // Highlight correct
                const correctBtn = [...quizChoicesEl.querySelectorAll('.choice-btn')]
                    .find(b => b.textContent === q.choices.find(c => c.correct).text);
                if (correctBtn) correctBtn.classList.add('correct');
                // Time penalty
                quizTimeLeft = Math.max(0, quizTimeLeft - 5);
                quizTimerEl.textContent = quizTimeLeft;
                showBonusFloat('−5s', btn);
                if (quizTimeLeft <= 0) {
                    clearInterval(timerInterval);
                    setTimeout(() => endGame(false), 800);
                    return;
                }
            }

            // Next question after delay
            setTimeout(() => {
                currentQuizIndex++;
                showQuizQuestion();
            }, 1000);
        });

        quizChoicesEl.appendChild(btn);
    });
}

/* ===========================================================
   END GAME
   =========================================================== */
function endGame(allAnswered) {
    clearInterval(timerInterval);

    if (allAnswered) {
        endTitle.textContent = '🎉 Geschafft!';
        endMessage.textContent = 'Du hast alle Fragen beantwortet!';
    } else {
        endTitle.textContent = '⏰ Zeit abgelaufen!';
        endMessage.textContent = `Du hast ${currentQuizIndex} von ${quizTotal} Fragen geschafft.`;
    }

    finalScoreEl.textContent = quizScore;
    finalCorrectEl.textContent = `${quizCorrect}/${quizTotal}`;
    finalTimeEl.textContent = allAnswered ? `${quizTimeLeft}s` : '0s';

    showScreen(endScreen);
}
