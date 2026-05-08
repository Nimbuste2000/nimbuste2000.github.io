// ==========================================
// 1. NAVIGATION ET INITIALISATION
// ==========================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');

    // Initialisation spéciale pour la carte
    if(tabId === 'geo') {
        setTimeout(initMap, 300);
    }
}

// ==========================================
// 2. MODULE RADIO FM & FRÉQUENCES
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
    document.getElementById('rangeOutput').innerText = `Portée théorique : ${range.toFixed(2)} km`;
}

// ==========================================
// 3. GÉOLOCALISATION & CARTOGRAPHIE
// ==========================================
let map;
function initMap() {
    if (map) return;
    map = L.map('map').setView([48.8566, 2.3522], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
}

function convertCoords() {
    const lat = parseFloat(document.getElementById('lat').value);
    const lon = parseFloat(document.getElementById('lon').value);
    const toDMS = (deg, pos, neg) => {
        const d = Math.floor(Math.abs(deg));
        const m = Math.floor((Math.abs(deg) - d) * 60);
        const s = ((Math.abs(deg) - d - m/60) * 3600).toFixed(2);
        return `${d}°${m}'${s}"${deg >= 0 ? pos : neg}`;
    };
    document.getElementById('coordsOutput').innerText = `${toDMS(lat, 'N', 'S')} , ${toDMS(lon, 'E', 'W')}`;
}

function calculateDistance() {
    const lat1 = parseFloat(document.getElementById('lat1').value) * Math.PI / 180;
    const lon1 = parseFloat(document.getElementById('lon1').value) * Math.PI / 180;
    const lat2 = parseFloat(document.getElementById('lat2').value) * Math.PI / 180;
    const lon2 = parseFloat(document.getElementById('lon2').value) * Math.PI / 180;
    const d = 2 * 6371 * Math.asin(Math.sqrt(Math.pow(Math.sin((lat2-lat1)/2),2) + Math.cos(lat1)*Math.cos(lat2)*Math.pow(Math.sin((lon2-lon1)/2),2)));
    document.getElementById('distOutput').innerText = `Distance : ${d.toFixed(3)} km`;
}

function calculateAzimuth() {
    const from = document.getElementById('fromCoord').value.split(',').map(Number);
    const to = document.getElementById('toCoord').value.split(',').map(Number);
    const y = Math.sin((to[1]-from[1])*Math.PI/180) * Math.cos(to[0]*Math.PI/180);
    const x = Math.cos(from[0]*Math.PI/180)*Math.sin(to[0]*Math.PI/180) - Math.sin(from[0]*Math.PI/180)*Math.cos(to[0]*Math.PI/180)*Math.cos((to[1]-from[1])*Math.PI/180);
    document.getElementById('azOutput').innerText = `Azimuth : ${((Math.atan2(y, x)*180/Math.PI)+360)%360.toFixed(2)}°`;
}

// ==========================================
// 4. ANALYSE D'IMAGES & EXIF
// ==========================================
function extractExif() {
    const fileInput = document.getElementById('imageFile');
    const out = document.getElementById('exifOutput');
    if (!fileInput.files[0]) return out.innerText = "Sélectionnez une image.";
    
    EXIF.getData(fileInput.files[0], function() {
        const tags = EXIF.getAllTags(this);
        out.innerText = Object.keys(tags).length ? JSON.stringify(tags, null, 2) : "Aucun tag EXIF trouvé.";
    });
}

function analyzeShadow() {
    const angle = parseFloat(document.getElementById('shadowAngle').value);
    const h = parseFloat(document.getElementById('objectHeight').value);
    document.getElementById('shadowOutput').innerText = `Ombre : ${(h / Math.tan(angle * Math.PI / 180)).toFixed(2)}m`;
}

// ==========================================
// 5. RÉSEAU (IP & WHOIS RDAP)
// ==========================================
async function ipLookup() {
    const ip = document.getElementById('ipAddress').value;
    const out = document.getElementById('ipOutput');
    out.innerText = "Recherche...";
    try {
        const res = await fetch(`https://ipapi.co/${ip}/json/`);
        out.innerText = JSON.stringify(await res.json(), null, 2);
    } catch(e) { out.innerText = "Erreur API."; }
}

async function whoislookup() {
    const target = document.getElementById('whoisTarget').value;
    const out = document.getElementById('whoisOutput');
    out.innerText = "Requête RDAP...";
    try {
        const res = await fetch(`https://rdap.org/domain/${target}`);
        const data = await res.json();
        out.innerText = `Registrar: ${data.entities[data.entities.length-1].vcardArray[1][1][3]}`;
    } catch(e) { out.innerText = "Données non disponibles en RDAP."; }
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
    const map = { 'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----', ' ': '/' };
    document.getElementById('morseOutput').innerText = document.getElementById('morseInput').value.toUpperCase().split('').map(c => map[c] || '').join(' ');
}

async function generateHash() {
    const msg = document.getElementById('hashInput').value;
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
    document.getElementById('hashOutput').innerText = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ==========================================
// 7. MÉTADONNÉES
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