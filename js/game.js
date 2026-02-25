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
let quizCardsTotal = 0;

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
    timeLeft = 60;
    flippedCards = [];
    lockBoard = false;
    cards = [];
    boardEl.innerHTML = '';

    const difficulty = diffSelect.value;            // 'easy' | 'medium'
    const pairCount = difficulty === 'easy' ? 3 : 5;
    const addQuiz = difficulty === 'medium';

    // Pick random pairs
    const selectedPairs = shuffle([...ALL_PAIRS]).slice(0, pairCount);
    totalPairs = pairCount;

    // Build card array: each pair → 2 cards sharing a pairId
    selectedPairs.forEach((pair, i) => {
        cards.push({ id: `p${i}-a`, pairId: i, text: pair.term, type: 'normal' });
        cards.push({ id: `p${i}-b`, pairId: i, text: pair.match, type: 'normal' });
    });

    // Add quiz cards (2 cards with unique type)
    quizCardsTotal = 0;
    if (addQuiz) {
        // We insert 2 quiz cards; each acts independently
        cards.push({ id: 'quiz-1', pairId: -1, text: '❓ Quiz-Karte', type: 'quiz' });
        cards.push({ id: 'quiz-2', pairId: -2, text: '❓ Quiz-Karte', type: 'quiz' });
        quizCardsTotal = 2;
    }

    shuffle(cards);

    // Set grid columns based on total cards
    const total = cards.length;
    let cols = 4;
    if (total <= 6) cols = 3;
    if (total <= 4) cols = 2;
    boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    // Render cards
    cards.forEach((card) => {
        const el = document.createElement('div');
        el.classList.add('card');
        el.dataset.id = card.id;
        el.dataset.pairId = card.pairId;
        el.dataset.type = card.type;

        const isQuiz = card.type === 'quiz';

        el.innerHTML = `
          <div class="card-inner">
            <div class="card-face card-back ${isQuiz ? 'quiz-back' : ''}">
              <span class="card-pattern">${isQuiz ? '❓' : '🍃'}</span>
            </div>
            <div class="card-face card-front ${isQuiz ? 'quiz-face' : ''}">
              ${card.text}
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
    // Ignore clicks on matched, already-flipped, or during lock
    if (lockBoard) return;
    if (el.classList.contains('flipped') || el.classList.contains('matched')) return;

    // Flip card
    el.classList.add('flipped');

    // ---- QUIZ CARD ----
    if (card.type === 'quiz') {
        lockBoard = true;
        // Short delay so flip animation finishes
        setTimeout(() => {
            showQuizModal(() => {
                // After quiz is answered, remove the quiz card from board
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
            addScore(100);
            addTime(5, first.el);
            flippedCards = [];
            lockBoard = false;
            updateHUD();

            if (matchedCount === totalPairs) {
                setTimeout(() => endGame(true), 600);
            }
        } else {
            // ❌ No match – flip back
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

    // Build overlay
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
            // Disable all buttons
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
                // Find the correct one and highlight it
                const correctBtn = [...choicesDiv.querySelectorAll('.choice-btn')]
                    .find((b) => b.textContent === q.choices.find(c => c.correct).text);
                if (correctBtn) correctBtn.classList.add('correct');
            }

            // Close modal after short delay
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
