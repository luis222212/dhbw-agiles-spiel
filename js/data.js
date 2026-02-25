/* ===========================================================
   DATA  –  Kartenpaare & Quizfragen
   =========================================================== */
const ALL_PAIRS = [
    { term: 'Duales Studium', match: 'Theorie & Praxis im Wechsel' },
    { term: 'DHBW', match: 'Duale Hochschule Baden-Württemberg' },
    { term: 'Vergütung', match: 'Monatliches Gehalt während des gesamten Studiums' },
    { term: 'Praxispartner', match: 'Das Unternehmen, bei dem du angestellt bist' },
    { term: 'Vorlesungen', match: 'Finden in kleinen Kursen statt (ca. 30 Personen)' },
];

const QUIZ_QUESTIONS = [
    {
        question: 'Wie oft wechselt man zwischen Theorie und Praxis?',
        choices: [
            { text: 'A: Jedes Semester', correct: false },
            { text: 'B: Alle 3 Monate', correct: true },
            { text: 'C: Nie', correct: false },
        ],
    },
];
