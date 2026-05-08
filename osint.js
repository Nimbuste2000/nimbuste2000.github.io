// ==========================================
// 1. GESTION DES ONGLETS
// ==========================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// ==========================================
// 2. ANALYSE RADIO
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
    rds.classList.toggle('active');
    rdsContent.innerText = rds.classList.contains('active') ? 
        "SIGNAL DÉTECTÉ : [NIMBUSTE-FM] - SONG: OSINT TRACKER" : "";
}

function calculateRange() {
    const ht = parseFloat(document.getElementById('txHeight').value);
    const hr = parseFloat(document.getElementById('rxHeight').value);
    
    // Formule de l'horizon radio (Line of Sight)
    // Distance (km) ≈ 3.57 * (√ht + √hr)
    const range = 3.57 * (Math.sqrt(ht) + Math.sqrt(hr));
    
    document.getElementById('rangeOutput').innerHTML = `
        <strong>Portée théorique :</strong> ${range.toFixed(2)} km<br>
        <em>Note: Basé sur la courbure terrestre standard.</em>
    `;
}

function updateBandInfo() {
    const band = document.getElementById('bandSelect').value;
    const info = {
        fm: "87.5-108 MHz: Radio commerciale, WFM.",
        vhf: "118-137 MHz: Aviation Civile, AM.",
        uhf: "400-470 MHz: PMR446, LPD, Services Urgence."
    };
    document.getElementById('bandOutput').innerText = info[band] || "Informations non disponibles.";
}

// ==========================================
// 3. GÉOLOCALISATION
// ==========================================
let map;
function initMap() {
    if (map) return;
    map = L.map('map').setView([48.8566, 2.3522], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
}

function calculateDistance() {
    const lat1 = parseFloat(document.getElementById('lat1').value);
    const lon1 = parseFloat(document.getElementById('lon1').value);
    const lat2 = parseFloat(document.getElementById('lat2').value);
    const lon2 = parseFloat(document.getElementById('lon2').value);

    // Formule de Haversine
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;

    document.getElementById('distOutput').innerText = `Distance : ${d.toFixed(3)} km`;
}

// ==========================================
// 4. RÉSEAU & OSINT
// ==========================================
async function ipLookup() {
    const ip = document.getElementById('ipAddress').value;
    const out = document.getElementById('ipOutput');
    out.innerText = "Recherche...";
    try {
        const res = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await res.json();
        out.innerText = JSON.stringify(data, null, 2);
    } catch (e) {
        out.innerText = "Erreur : Impossible de joindre l'API.";
    }
}

function searchUsername() {
    const user = document.getElementById('username').value;
    const out = document.getElementById('usernameOutput');
    const sites = [
        { name: 'GitHub', url: `https://github.com/${user}` },
        { name: 'Twitter', url: `https://twitter.com/${user}` },
        { name: 'Instagram', url: `https://instagram.com/${user}` }
    ];
    let html = "<ul>";
    sites.forEach(s => {
        html += `<li>${s.name}: <a href="${s.url}" target="_blank">${s.url}</a></li>`;
    });
    out.innerHTML = html + "</ul>";
}

// ==========================================
// 5. CRYPTOGRAPHIE
// ==========================================
function base64Encode() {
    const input = document.getElementById('base64Input').value;
    document.getElementById('base64Output').innerText = btoa(input);
}

function base64Decode() {
    const input = document.getElementById('base64Input').value;
    try { document.getElementById('base64Output').innerText = atob(input); }
    catch(e) { document.getElementById('base64Output').innerText = "Invalide !"; }
}

function rot13Transform() {
    const str = document.getElementById('rot13Input').value;
    document.getElementById('rot13Output').innerText = str.replace(/[a-zA-Z]/g, function(c){
        return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);
    });
}

async function generateHash() {
    const msg = document.getElementById('hashInput').value;
    const msgBuffer = new TextEncoder().encode(msg);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById('hashOutput').innerText = hashHex;
}

// ==========================================
// 6. MÉTADONNÉES & UTILS
// ==========================================
function convertTimestamp() {
    const ts = parseInt(document.getElementById('unixTs').value);
    const date = new Date(ts * 1000);
    document.getElementById('tsOutput').innerText = date.toLocaleString();
}

function extractEmails() {
    const text = document.getElementById('emailText').value;
    const emails = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    document.getElementById('emailOutput').innerText = emails ? emails.join('\n') : "Aucun email trouvé.";
}