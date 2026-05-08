// Verification de chargement
console.log("OSINT.js charge avec succes");

// --- NAVIGATION ---
function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    const btns = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(t => t.classList.remove('active'));
    btns.forEach(b => b.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    if (event) event.currentTarget.classList.add('active');
    if (tabId === 'geo') setTimeout(initMap, 300);
}

// --- RADIO (Correction des erreurs ReferenceError) ---
function updateFMFreq(val) {
    const display = document.getElementById('fmDisplay');
    if (display) display.innerText = parseFloat(val).toFixed(1);
}

function changeFM(step) {
    const slider = document.getElementById('fmSlider');
    if (slider) {
        let newVal = parseFloat(slider.value) + step;
        if (newVal >= 87.5 && newVal <= 108) {
            slider.value = newVal;
            updateFMFreq(newVal);
        }
    }
}

function toggleFMPlay() {
    const rds = document.getElementById('rdsDisplay');
    const rdsContent = document.getElementById('rdsContent');
    if (rds) {
        const isPlaying = rds.classList.toggle('active');
        if (rdsContent) rdsContent.innerText = isPlaying ? "SCANNING... SIGNAL: [NIMBUSTE-PRO]" : "";
    }
}

// --- GEOLOCALISATION ---
let map;
function initMap() {
    if (map || !document.getElementById('map')) return;
    map = L.map('map').setView([48.8566, 2.3522], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
}

// --- UTILITAIRES ---
async function ipLookup() {
    const ip = document.getElementById('ipAddress').value;
    const out = document.getElementById('ipOutput');
    out.innerText = "Recherche...";
    try {
        const res = await fetch("https://ipapi.co/" + ip + "/json/");
        const data = await res.json();
        out.innerText = JSON.stringify(data, null, 2);
    } catch(e) { out.innerText = "Erreur API."; }
}

// Ajoute ici les autres fonctions (base64, morse...) si besoin, 
// mais teste d'abord avec celles-ci.