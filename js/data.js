/* ===========================================================
   DATA  –  32 Kartenpaare in 3 Schwierigkeitsstufen
   Jedes Paar: { term, match, tier, image? }
   tier: 'green' (leicht), 'yellow' (mittel), 'red' (schwer)
   =========================================================== */

// ── Kategorie 1: Leicht (Grün) – 100 Punkte ──────────────
const GREEN_PAIRS = [
    {
        term: 'DHBW',
        match: 'Duale Hochschule Baden-Württemberg',
        tier: 'green',
        image: 'https://www.dhbw.de/fileadmin/user_upload/Logo_DHBW.jpg'
    },
    {
        term: 'Duales Studium',
        match: 'Theorie & Praxis im Wechsel',
        tier: 'green'
    },
    {
        term: 'Campus Nordschwarzwald',
        match: 'Horb am Neckar',
        tier: 'green'
    },
    {
        term: 'Standort des Rektorats',
        match: 'Rotebühlstraße 133',
        tier: 'green',
        image: 'https://www.dhbw-stuttgart.de/fileadmin/processed/6/d/csm_Rektorat_Rotebuehlstrasse_133_87e742e975.jpg'
    },
    {
        term: 'Dauer einer Phase',
        match: 'Drei Monate',
        tier: 'green',
        image: 'https://www.dhbw.de/fileadmin/user_upload/Grafik_Duales_Studium.jpg'
    },
    {
        term: 'Praxispartner',
        match: 'Dualer Partner',
        tier: 'green'
    },
    {
        term: 'Name des Systems',
        match: 'DUALIS',
        tier: 'green'
    },
    {
        term: 'Gründungsjahr BA Stuttgart',
        match: '1974',
        tier: 'green',
        image: 'https://50jahredhbwstuttgart.de/wp-content/uploads/2023/07/BA_Stuttgart_Logo_hist.png'
    },
    {
        term: 'Vergütung',
        match: 'Monatliches Gehalt während des gesamten Studiums',
        tier: 'green'
    },
    {
        term: 'Vorlesungen',
        match: 'Finden in kleinen Kursen statt (ca. 30 Personen)',
        tier: 'green'
    },
    {
        term: 'ECTS-Punkte Bachelor',
        match: '210',
        tier: 'green'
    },
    {
        term: 'Studierende in Stuttgart',
        match: 'ca. 8.000',
        tier: 'green'
    },
];

// ── Kategorie 2: Mittel (Gelb) – 200 Punkte ──────────────
const YELLOW_PAIRS = [
    {
        term: 'Fakultät Technik',
        match: 'Lerchenstraße 1',
        tier: 'yellow',
        image: 'https://www.dhbw-stuttgart.de/fileadmin/processed/3/7/csm_DHBW_S_Technik_Neubau_2_0769_e08092289c.jpg'
    },
    {
        term: 'Fakultät Sozialwesen',
        match: 'Rotebühlstraße 131',
        tier: 'yellow',
        image: 'https://www.dhbw-stuttgart.de/fileadmin/processed/e/0/csm_DHBW_Stuttgart_Rotebuehlstr_131_83a15291b1.jpg'
    },
    {
        term: 'Wirtschaftsinformatik',
        match: 'Rotebühlplatz 41',
        tier: 'yellow',
        image: 'https://www.dhbw-stuttgart.de/fileadmin/processed/4/f/csm_DHBW_S_Rotebuehlplatz_41_78e91244e8.jpg'
    },
    {
        term: 'Audimax / Tiefenhörsaal',
        match: 'Jägerstraße 58',
        tier: 'yellow',
        image: 'https://www.dhbw-stuttgart.de/fileadmin/processed/2/a/csm_DHBW_S_Jaegerstrasse_Audimax_234e9122a1.jpg'
    },
    {
        term: 'Rennteam Stuttgart',
        match: 'DHBW Engineering',
        tier: 'yellow',
        image: 'https://www.dhbw-stuttgart.de/fileadmin/dateien/DHBW_Engineering/Rennwagen_Action.jpg'
    },
    {
        term: 'Frauen-MINT-Netzwerk',
        match: 'the tech faem',
        tier: 'yellow'
    },
    {
        term: 'Master-Zentrum',
        match: 'CAS Heilbronn',
        tier: 'yellow'
    },
    {
        term: 'Fakultät Wirtschaft',
        match: 'Herdweg 21–31',
        tier: 'yellow'
    },
    {
        term: 'Bibliothek',
        match: 'Kronenstraße 53 B',
        tier: 'yellow'
    },
    {
        term: 'Übernahmequote',
        match: 'über 80 %',
        tier: 'yellow'
    },
    {
        term: 'Duale Partner (Stuttgart)',
        match: 'ca. 2.000',
        tier: 'yellow'
    },
];

// ── Kategorie 3: Schwer (Rot) – 300 Punkte ───────────────
const RED_PAIRS = [
    {
        term: 'Campus Horb-Hohenberg',
        match: 'Ehemalige Kaserne',
        tier: 'red'
    },
    {
        term: 'Gründungsleiter Horb',
        match: 'Prof. Dr. Helmut Günther',
        tier: 'red'
    },
    {
        term: 'Fakultät Gesundheit',
        match: 'Tübinger Straße 33',
        tier: 'red',
        image: 'https://www.dhbw-stuttgart.de/fileadmin/processed/d/1/csm_DHBW_S_Tuebinger_Str_33_90e122a11.jpg'
    },
    {
        term: 'Ranking Platz 1 (WP)',
        match: 'manager magazin',
        tier: 'red'
    },
    {
        term: 'Facility-Management-Preis',
        match: 'Gefma Förderpreis',
        tier: 'red',
        image: 'https://www.dhbw-stuttgart.de/fileadmin/dateien/Bilder_Allgemein/News/Marie_Steger_Gefma.jpg'
    },
    {
        term: 'Umwandlung zur Hochschule',
        match: '1. März 2009',
        tier: 'red'
    },
    {
        term: 'Professoren (Stuttgart)',
        match: '192',
        tier: 'red'
    },
    {
        term: 'Lehrbeauftragte (Stuttgart)',
        match: 'ca. 2.860',
        tier: 'red'
    },
    {
        term: 'Jubiläum 2024',
        match: '50 Jahre DHBW Stuttgart',
        tier: 'red'
    },
];

// ── Alle Paare zusammengeführt ────────────────────────────
const ALL_PAIRS = [...GREEN_PAIRS, ...YELLOW_PAIRS, ...RED_PAIRS];

// ── Punkte pro Tier ───────────────────────────────────────
const TIER_POINTS = {
    green: 100,
    yellow: 200,
    red: 300,
};

// ── Tier-Label ────────────────────────────────────────────
const TIER_LABELS = {
    green: 'Leicht',
    yellow: 'Mittel',
    red: 'Schwer',
};

// ── Quiz-Fragen ───────────────────────────────────────────
const QUIZ_QUESTIONS = [
    {
        question: 'Wie oft wechselt man zwischen Theorie und Praxis?',
        choices: [
            { text: 'A: Jedes Semester', correct: false },
            { text: 'B: Alle 3 Monate', correct: true },
            { text: 'C: Einmal im Jahr', correct: false },
        ],
    },
    {
        question: 'Wann wurde die Berufsakademie zur DHBW umgewandelt?',
        choices: [
            { text: 'A: 2005', correct: false },
            { text: 'B: 2009', correct: true },
            { text: 'C: 2012', correct: false },
        ],
    },
    {
        question: 'Wie viele Studierende hat die DHBW Stuttgart ungefähr?',
        choices: [
            { text: 'A: 3.000', correct: false },
            { text: 'B: 8.000', correct: true },
            { text: 'C: 15.000', correct: false },
        ],
    },
    {
        question: 'Was ist DHBW Engineering?',
        choices: [
            { text: 'A: Ein Studiengang', correct: false },
            { text: 'B: Ein studentisches Formula-Student-Rennteam', correct: true },
            { text: 'C: Eine Abteilung der Verwaltung', correct: false },
        ],
    },
    {
        question: 'Wie hoch ist die Übernahmequote nach dem Abschluss?',
        choices: [
            { text: 'A: über 50 %', correct: false },
            { text: 'B: über 80 %', correct: true },
            { text: 'C: über 95 %', correct: false },
        ],
    },
];
