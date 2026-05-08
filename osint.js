// ==========================================
// 1. NAVIGATION ET INITIALISATION
// ==========================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
        if (event && event.currentTarget) {
            event.currentTarget.classList.add('active');
        }
    }

    if(tabId === 'geo') {
        setTimeout(initMap, 300);
    }
}

// ==========================================
// 2. MODULE RADIO FM & FREQUENCES
// ==========================================
function updateFMFreq(val) {
    document.getElementById('fmDisplay').innerText = parseFloat(val).toFixed(1);
}

function changeFM(step) {
    let slider = document.getElementById('fmSlider');
    let newVal = parseFloat(slider.value) + step;
    if (newVal >= 87.5 && newVal <= 108) {
        slider.value = newVal;
        updateFMFreq(newVal);
    }
}

function toggleFMPlay() {
    const rds = document.getElementById('rdsDisplay');
    const rdsContent = document.getElementById('rdsContent');
    const isPlaying = rds.classList.toggle('active');
    rdsContent.innerText = isPlaying ? "SCANNING... SIGNAL DETECTED: [NIMBUSTE-SDR-PRO]" : "";
}

async function simulateSignalDetection() {
    const out = document.getElementById('signalOutput');
    out.innerText = "Interrogation de l'API FMDX...";
    try {
        const res = await fetch('https://servers.fmdx.org/api/v1/servers');
        const data = await res.json();
        let html = '<strong>Top 10 Serveurs Actifs :</strong><br><br>';
        data.slice(0, 10).forEach(s => {
            html += `📡 ${s.name} | ${s.country} | ${s.frequency}MHz <br>`;
            html += `<a href="${s.url}" target="_blank" style="color:#667eea;font-size:0.8em;">[Ouvrir WebSDR]</a><br><hr style="border:0.1px solid #222">`;
        });
        out.innerHTML = html;
    } catch(e) {
        out.innerText = "Erreur : Impossible de joindre l'API radio.";
    }
}

function calculateRange() {
    const ht = parseFloat(document.getElementById('txHeight').value);
    const hr = parseFloat(document.getElementById('rxHeight').value);
    const range = 3.57 * (Math.sqrt(ht) + Math.sqrt(hr));
    document.getElementById('rangeOutput').innerText = "Portee theorique : " + range.toFixed(2) + " km";
}

// ==========================================
// 3. GEOLOCALISATION & CARTOGRAPHIE
// ==========================================
let map;
function initMap() {
    if (map) return;
    const mapDiv = document.getElementById('map');
    if (mapDiv) {
        map = L.map('map').setView([48.8566, 2.3522], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    }
}

function convertCoords() {
    const lat = parseFloat(document.getElementById('lat').value);
    const lon = parseFloat(document.getElementById('lon').value);
    
    const toDMS = (deg, pos, neg) => {
        const absDeg = Math.abs(deg);
        const d = Math.floor(absDeg);
        const m = Math.floor((absDeg - d) * 60);
        const s = ((absDeg - d - m/60) * 3600).toFixed(2);
        const sign = deg >= 0 ? pos : neg;
        return d + " deg " + m + "' " + s + "'' " + sign;
    };
    
    document.getElementById('coordsOutput').innerText = toDMS(lat, 'N', 'S') + " , " + toDMS(lon, 'E', 'W');
}

function calculateDistance() {
    const lat1 = parseFloat(document.getElementById('lat1').value) * Math.PI / 180;
    const lon1 = parseFloat(document.getElementById('lon1').value) * Math.PI / 180;
    const lat2 = parseFloat(document.getElementById('lat2').value) * Math.PI / 180;
    const lon2 = parseFloat(document.getElementById('lon2').value) * Math.PI / 180;
    const d = 2 * 6371 * Math.asin(Math.sqrt(Math.pow(Math.sin((lat2-lat1)/2),2) + Math.cos(lat1)*Math.cos(lat2)*Math.pow(Math.sin((lon2-lon1)/2),2)));
    document.getElementById('distOutput').innerText = "Distance : " + d.toFixed(3) + " km";
}

function calculateAzimuth() {
    const fromArr = document.getElementById('fromCoord').value.split(',').map(Number);
    const toArr = document.getElementById('toCoord').value.split(',').map(Number);
    if(fromArr.length < 2 || toArr.length < 2) return;

    const lat1 = fromArr[0] * Math.PI / 180;
    const lon1 = fromArr[1] * Math.PI / 180;
    const lat2 = toArr[0] * Math.PI / 180;
    const lon2 = toArr[1] * Math.PI / 180;

    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    const brng = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    
    document.getElementById('azOutput').innerText = "Azimuth : " + brng.toFixed(2) + " deg";
}

// ==========================================
// 4. ANALYSE D'IMAGES & EXIF
// ==========================================
function extractExif() {
    const fileInput = document.getElementById('imageFile');
    const out = document.getElementById('exifOutput');
    if (!fileInput.files[0]) return out.innerText = "Selectionnez une image.";
    
    if (typeof EXIF !== 'undefined') {
        EXIF.getData(fileInput.files[0], function() {
            const tags = EXIF.getAllTags(this);
            out.innerText = Object.keys(tags).length ? JSON.stringify(tags, null, 2) : "Aucun tag EXIF trouve.";
        });
    } else {
        out.innerText = "Erreur: Librairie EXIF non chargee.";
    }
}

function analyzeShadow() {
    const angle = parseFloat(document.getElementById('shadowAngle').value);
    const h = parseFloat(document.getElementById('objectHeight').value);
    const shadow = h / Math.tan(angle * Math.PI / 180);
    document.getElementById('shadowOutput').innerText = "Ombre : " + shadow.toFixed(2) + "m";
}

// ==========================================
// 5. RESEAU (IP & WHOIS RDAP)
// ==========================================
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

async function whoislookup() {
    const target = document.getElementById('whoisTarget').value;
    const out = document.getElementById('whoisOutput');
    out.innerText = "Requete RDAP...";
    try {
        const res = await fetch("https://rdap.org/domain/" + target);
        const data = await res.json();
        out.innerText = "Registrar: " + (data.entities ? data.entities[data.entities.length-1].handle : "Non trouve");
    } catch(e) { out.innerText = "Donnees non disponibles en RDAP."; }
}

// ==========================================
// 6. CRYPTOGRAPHIE & CODECS
// ==========================================
function base64Encode() { document.getElementById('base64Output').innerText = btoa(document.getElementById('base64Input').value); }
function base64Decode() { try { document.getElementById('base64Output').innerText = atob(document.getElementById('base64Input').value); } catch(e) { alert("Base64 invalide"); } }

function rot13Transform() {
    const str = document.getElementById('rot13Input').value;
    document.getElementById('rot13Output').innerText = str.replace(/[a-zA-Z]/g, c => String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26));
}

function textToMorse() {
    const morseMap = { 'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----', ' ': '/' };
    document.getElementById('morseOutput').innerText = document.getElementById('morseInput').value.toUpperCase().split('').map(c => morseMap[c] || '').join(' ');
}

async function generateHash() {
    const msg = document.getElementById('hashInput').value;
    const encoder = new TextEncoder();
    const data = encoder.encode(msg);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    document.getElementById('hashOutput').innerText = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ==========================================
// 7. METADONNEES
// ==========================================
function extractEmails() {
    const text = document.getElementById('emailText').value;
    const matches = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    document.getElementById('emailOutput').innerText = matches ? matches.join('\n') : "Aucun email.";
}

function convertTimestamp() {
    const ts = parseInt(document.getElementById('unixTs').value);
    document.getElementById('tsOutput').innerText = new Date(ts * 1000).toLocaleString();
}