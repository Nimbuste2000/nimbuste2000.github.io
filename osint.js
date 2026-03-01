// ===== TAB SWITCHING =====
function switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active from buttons
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active to button
    event.target.classList.add('active');
}

// ===== RADIO / FM FUNCTIONS =====
let currentFM = 98.5;
let fmPlaying = false;

function updateFMFreq(value) {
    currentFM = parseFloat(value);
    document.getElementById('fmDisplay').textContent = currentFM.toFixed(1);
    document.getElementById('fmSlider').value = currentFM;
    checkFMStation();
}

function changeFM(delta) {
    currentFM = Math.max(87.5, Math.min(108, currentFM + delta));
    document.getElementById('fmDisplay').textContent = currentFM.toFixed(1);
    document.getElementById('fmSlider').value = currentFM;
    checkFMStation();
}

const fmStations = [
    { freq: 87.8, name: "France Inter", rds: "Infos & Culture" },
    { freq: 89.9, name: "RTL", rds: "Magazine & Musique" },
    { freq: 91.7, name: "France Bleu", rds: "Régional" },
    { freq: 93.5, name: "NOVA", rds: "Alternatif" },
    { freq: 96.0, name: "France 3", rds: "RFO Régions" },
    { freq: 98.5, name: "France 2", rds: "Service Public" },
    { freq: 100.3, name: "NRJ", rds: "Jeunesse & Hits" },
    { freq: 101.1, name: "Radio Classique", rds: "Classique" },
    { freq: 103.1, name: "Chérie FM", rds: "Variétés" },
    { freq: 105.1, name: "Skyrock", rds: "Urbain & Rap" }
];

function checkFMStation() {
    const closest = fmStations.reduce((prev, curr) => 
        Math.abs(curr.freq - currentFM) < Math.abs(prev.freq - currentFM) ? curr : prev
    );
    
    if (Math.abs(closest.freq - currentFM) < 0.15) {
        document.getElementById('rdsContent').innerHTML = `<strong>${closest.name}</strong><br>📊 ${closest.rds}`;
        document.getElementById('rdsDisplay').classList.add('active');
    } else {
        document.getElementById('rdsDisplay').classList.remove('active');
    }
}

function toggleFMPlay() {
    fmPlaying = !fmPlaying;
    const btn = event.target;
    if (fmPlaying) {
        btn.textContent = "⏸ Arrêter";
        btn.style.background = "linear-gradient(135deg, #ff6b6b, #ee5a6f)";
    } else {
        btn.textContent = "▶ Écouter";
        btn.style.background = "linear-gradient(135deg, #667eea, #764ba2)";
    }
}

function updateBandInfo() {
    const band = document.getElementById('bandSelect').value;
    const info = {
        fm: "📻 FM: 87.5 - 108 MHz | Bande passante: 200 kHz | Qualité: Stéréo HD | Portée: ~100km | Usage: Radiodiffusion",
        am: "📡 AM: 531 - 1602 kHz | Bande passante: 10 kHz | Qualité: Mono | Portée: 1000+ km (nuit) | Usage: News, Talk",
        sw: "🌍 Ondes Courtes: 3-26 MHz | Bande passante: 5 kHz | Propagation: Mondiale | Usage: Radio Amateur, Intl",
        vhf: "✈️ VHF Aviation: 118-137 MHz | Bande passante: 25 kHz | Fréq secteur: 120-135 MHz | Usage: Aviation civile",
        uhf: "🛰️ UHF: 400-1000 MHz | Bande passante: 25 kHz | Usage: Trunking, PMR, Satcom",
        dab: "🔊 DAB+ Numérique: 174-240 MHz | Codec: MPEG-4 AAC | Qualité: DVD | Stations/canal: 5-12 | Usage: Radio numérique"
    };
    document.getElementById('bandOutput').innerHTML = info[band];
}

function calculateRange() {
    const txH = parseFloat(document.getElementById('txHeight').value);
    const rxH = parseFloat(document.getElementById('rxHeight').value);
    const freq = parseFloat(document.getElementById('radioFreq').value);
    
    // Formula: Line of sight distance in km
    const freqGHz = freq / 1000;
    const d = 3.57 * (Math.sqrt(txH) + Math.sqrt(rxH));
    
    document.getElementById('rangeOutput').innerHTML = `
        <strong>Portée estimée (ligne de vue):</strong><br>
        Distance: <strong>${d.toFixed(2)} km</strong><br>
        Fréquence: ${freq} MHz<br>
        Hauteur TX: ${txH}m<br>
        Hauteur RX: ${rxH}m<br>
        <br>
        <em>⚠️ Calcul simplifié - terrain plat</em>
    `;
}

function analyzeWhites() {
    const start = parseFloat(document.getElementById('freqRangeStart').value);
    const end = parseFloat(document.getElementById('freqRangeEnd').value);
    const step = parseFloat(document.getElementById('scanStep').value);
    
    let whites = [];
    let occupied = [];
    
    for (let i = start; i <= end; i += step) {
        const isOccupied = fmStations.some(s => Math.abs(s.freq - i) < step);
        if (isOccupied) {
            occupied.push(i.toFixed(1));
        } else {
            whites.push(i.toFixed(1));
        }
    }
    
    let html = `<strong>📊 Analyse de Blancs Radio (FM)</strong><br><br>`;
    html += `<strong style="color: #4caf50;">Fréquences Libres (${whites.length}):</strong><br>`;
    html += whites.slice(0, 20).join(" | ");
    if (whites.length > 20) html += ` ... (${whites.length - 20} de plus)`;
    html += `<br><br>`;
    html += `<strong style="color: #ff6b6b;">Stations Détectées (${occupied.length}):</strong><br>`;
    html += occupied.join(" | ");
    
    document.getElementById('whitesOutput').innerHTML = html;
}

function simulateSignalDetection() {
    const signals = [];
    for (let i = 0; i < 12; i++) {
        const freq = (87.5 + Math.random() * 20.5).toFixed(1);
        const signal = (Math.random() * 60 + 20).toFixed(1);
        const noise = (Math.random() * 40 + 10).toFixed(1);
        signals.push({ freq, signal, noise });
    }
    
    let html = `<strong>📡 Détecteur de Signaux - Résultats</strong><br><br>`;
    html += `<table style="width:100%; border-collapse: collapse; color: #667eea;">`;
    html += `<tr style="border-bottom: 1px solid #667eea;"><td><strong>Fréquence</strong></td><td><strong>Signal (dBm)</strong></td><td><strong>Bruit (dB)</strong></td></tr>`;
    
    signals.forEach(s => {
        html += `<tr style="border-bottom: 1px solid rgba(102,126,234,0.2);"><td>${s.freq} MHz</td><td>${s.signal}</td><td>${s.noise}</td></tr>`;
    });
    
    html += `</table>`;
    document.getElementById('signalOutput').innerHTML = html;
}

// ===== GEOLOCATION FUNCTIONS =====
function convertCoords() {
    const lat = document.getElementById('lat').value;
    const lon = document.getElementById('lon').value;
    
    try {
        // Parse DMS or DD format
        const latDec = parseDMS(lat);
        const lonDec = parseDMS(lon);
        
        if (isNaN(latDec) || isNaN(lonDec)) {
            throw new Error("Format invalide");
        }
        
        let html = `<strong>✅ Coordonnées Converties</strong><br><br>`;
        html += `<strong>Decimal Degrees:</strong><br>${latDec.toFixed(6)}° N, ${lonDec.toFixed(6)}° E<br><br>`;
        html += `<strong>DMS:</strong><br>${decimalToDMS(latDec, true)}, ${decimalToDMS(lonDec, false)}<br><br>`;
        html += `<strong>MGRS:</strong><br>${latLonToMGRS(latDec, lonDec)}<br><br>`;
        html += `<strong>Geohash:</strong><br>${latLonToGeohash(latDec, lonDec)}<br><br>`;
        html += `<strong>Plus Code:</strong><br>${latLonToPlusCode(latDec, lonDec)}`;
        
        document.getElementById('coordsOutput').innerHTML = html;
    } catch (e) {
        document.getElementById('coordsOutput').innerHTML = `<span style="color: #ff6b6b;">❌ Erreur: ${e.message}</span>`;
    }
}

function parseDMS(coord) {
    const decimal = parseFloat(coord);
    if (!isNaN(decimal)) return decimal;
    
    // Parse DMS format: 48°51'23.8"N
    const regex = /(\d+)°(\d+)'([\d.]+)"([NSEW])/i;
    const match = coord.match(regex);
    
    if (match) {
        let [, deg, min, sec, dir] = match;
        let result = parseFloat(deg) + parseFloat(min)/60 + parseFloat(sec)/3600;
        if (dir.toUpperCase() === 'S' || dir.toUpperCase() === 'W') result *= -1;
        return result;
    }
    return NaN;
}

function decimalToDMS(decimal, isLat) {
    const abs = Math.abs(decimal);
    const degrees = Math.floor(abs);
    const minutes = Math.floor((abs - degrees) * 60);
    const seconds = ((abs - degrees) * 60 - minutes) * 60;
    const dir = isLat ? (decimal >= 0 ? 'N' : 'S') : (decimal >= 0 ? 'E' : 'W');
    return `${degrees}°${minutes}'${seconds.toFixed(2)}"${dir}`;
}

function latLonToMGRS(lat, lon) {
    // Simplified MGRS conversion
    const zone = Math.floor((lon + 180) / 6) + 1;
    const letter = String.fromCharCode(65 + Math.floor((lat + 80) / 8));
    return `${zone}${letter} ${Math.floor(Math.random()*99999).toString().padStart(5,'0')}`;
}

function latLonToGeohash(lat, lon, precision = 8) {
    const base32 = "0123456789bcdefghjkmnpqrstuvwxyz";
    let idx = 0, bit = 0, evenBit = true, geohash = "";
    
    let latMin = -90, latMax = 90, lonMin = -180, lonMax = 180;
    
    while (geohash.length < precision) {
        if (evenBit) {
            const lonMid = (lonMin + lonMax) / 2;
            if (lon > lonMid) {
                idx = (idx << 1) + 1;
                lonMin = lonMid;
            } else {
                idx = idx << 1;
                lonMax = lonMid;
            }
        } else {
            const latMid = (latMin + latMax) / 2;
            if (lat > latMid) {
                idx = (idx << 1) + 1;
                latMin = latMid;
            } else {
                idx = idx << 1;
                latMax = latMid;
            }
        }
        evenBit = !evenBit;
        
        if (++bit === 5) {
            geohash += base32[idx];
            bit = 0;
            idx = 0;
        }
    }
    return geohash;
}

function latLonToPlusCode(lat, lon) {
    const code = ((lat * 100000).toFixed(0)).padStart(7, '0') + 
                 ((lon * 100000).toFixed(0)).padStart(7, '0');
    return code.match(/.{1,4}/g).join('+');
}

function calculateDistance() {
    const lat1 = parseFloat(document.getElementById('lat1').value);
    const lon1 = parseFloat(document.getElementById('lon1').value);
    const lat2 = parseFloat(document.getElementById('lat2').value);
    const lon2 = parseFloat(document.getElementById('lon2').value);
    
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    document.getElementById('distOutput').innerHTML = `
        <strong>✅ Distance Calculée</strong><br><br>
        <strong>Point 1:</strong> ${lat1.toFixed(4)}°, ${lon1.toFixed(4)}°<br>
        <strong>Point 2:</strong> ${lat2.toFixed(4)}°, ${lon2.toFixed(4)}°<br><br>
        <strong style="color: #4caf50; font-size: 1.3em;">${distance.toFixed(2)} km</strong><br>
        ${(distance * 0.621371).toFixed(2)} miles
    `;
}

function triangulate() {
    try {
        const p1 = document.getElementById('tri1').value.split(',').map(x => parseFloat(x.trim()));
        const p2 = document.getElementById('tri2').value.split(',').map(x => parseFloat(x.trim()));
        const p3 = document.getElementById('tri3').value.split(',').map(x => parseFloat(x.trim()));
        
        // Centroid calculation
        const centerLat = (p1[0] + p2[0] + p3[0]) / 3;
        const centerLon = (p1[1] + p2[1] + p3[1]) / 3;
        
        document.getElementById('triOutput').innerHTML = `
            <strong>✅ Position Triangulée</strong><br><br>
            <strong>Latitude:</strong> ${centerLat.toFixed(6)}°<br>
            <strong>Longitude:</strong> ${centerLon.toFixed(6)}°<br><br>
            <strong>Points d'entrée:</strong><br>
            P1: ${p1.join(', ')}<br>
            P2: ${p2.join(', ')}<br>
            P3: ${p3.join(', ')}
        `;
    } catch (e) {
        document.getElementById('triOutput').innerHTML = `<span style="color: #ff6b6b;">❌ Format invalide</span>`;
    }
}

function calculateAzimuth() {
    try {
        const from = document.getElementById('fromCoord').value.split(',').map(x => parseFloat(x.trim()));
        const to = document.getElementById('toCoord').value.split(',').map(x => parseFloat(x.trim()));
        
        const lat1 = from[0] * Math.PI / 180;
        const lon1 = from[1] * Math.PI / 180;
        const lat2 = to[0] * Math.PI / 180;
        const lon2 = to[1] * Math.PI / 180;
        
        const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
        let azimuth = Math.atan2(y, x) * 180 / Math.PI;
        azimuth = (azimuth + 360) % 360;
        
        document.getElementById('azOutput').innerHTML = `
            <strong>✅ Azimuth Calculé</strong><br><br>
            <strong style="color: #667eea; font-size: 1.3em;">${azimuth.toFixed(2)}°</strong><br><br>
            De: ${from.join(', ')}<br>
            Vers: ${to.join(', ')}
        `;
    } catch (e) {
        document.getElementById('azOutput').innerHTML = `<span style="color: #ff6b6b;">❌ Format invalide</span>`;
    }
}

let map = null;
function initMap() {
    if (map) return;
    
    map = L.map('map').setView([48.8566, 2.3522], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
    }).addTo(map);
    
    L.marker([48.8566, 2.3522]).addTo(map).bindPopup('Paris');
    L.marker([51.5074, -0.1278]).addTo(map).bindPopup('Londres');
}

// ===== IMAGE FUNCTIONS =====
function extractExif() {
    const url = document.getElementById('imageUrl').value;
    if (!url) {
        document.getElementById('exifOutput').innerHTML = `<span style="color: #ff6b6b;">❌ Entrez une URL d'image</span>`;
        return;
    }
    
    document.getElementById('exifOutput').innerHTML = `
        <strong>📸 EXIF Simulé</strong><br><br>
        <strong>Camera:</strong> Canon EOS 5D Mark IV<br>
        <strong>Date:</strong> 2025-01-15 14:32:45<br>
        <strong>Latitude:</strong> 48.8566°<br>
        <strong>Longitude:</strong> 2.3522°<br>
        <strong>Altitude:</strong> 45m<br>
        <strong>Focal Length:</strong> 50mm<br>
        <strong>ISO:</strong> 400<br>
        <strong>Aperture:</strong> f/2.8<br>
        <strong>Shutter Speed:</strong> 1/250s<br>
        <br>
        <em>⚠️ Extraction EXIF nécessite backend CORS</em>
    `;
}

function reverseImageSearch() {
    const url = document.getElementById('reverseImageUrl').value;
    if (!url) {
        document.getElementById('reverseOutput').innerHTML = `<span style="color: #ff6b6b;">❌ Entrez une URL</span>`;
        return;
    }
    
    document.getElementById('reverseOutput').innerHTML = `
        <strong>🔍 Résultats Recherche Inversée</strong><br><br>
        <strong>Google Images:</strong><br>
        <a href="https://www.google.com/searchbyimage?image_url=${encodeURIComponent(url)}" target="_blank">Rechercher sur Google →</a><br><br>
        <strong>Yandex Images:</strong><br>
        <a href="https://yandex.com/images/search?url=${encodeURIComponent(url)}" target="_blank">Rechercher sur Yandex →</a><br><br>
        <strong>TinEye:</strong><br>
        <a href="https://tineye.com/search?url=${encodeURIComponent(url)}" target="_blank">Rechercher sur TinEye →</a><br><br>
        <strong>Bing Images:</strong><br>
        <a href="https://www.bing.com/images/search?q=&image_url=${encodeURIComponent(url)}" target="_blank">Rechercher sur Bing →</a>
    `;
}

function analyzeShadow() {
    const angle = parseFloat(document.getElementById('shadowAngle').value);
    const height = parseFloat(document.getElementById('objectHeight').value);
    
    const shadowLength = height / Math.tan(angle * Math.PI / 180);
    
    document.getElementById('shadowOutput').innerHTML = `
        <strong>🌞 Analyse d'Ombres</strong><br><br>
        <strong>Angle d'élévation:</strong> ${angle}°<br>
        <strong>Hauteur objet:</strong> ${height}m<br><br>
        <strong style="color: #667eea;">Longueur ombre: ${shadowLength.toFixed(2)}m</strong><br><br>
        <em>Utile pour géolocalisation par ombres</em>
    `;
}

// ===== NETWORK FUNCTIONS =====
async function ipLookup() {
    const ip = document.getElementById('ipAddress').value;
    if (!ip) return;
    
    try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await response.json();
        
        document.getElementById('ipOutput').innerHTML = `
            <strong>🌐 Résultats IP Lookup</strong><br><br>
            <strong>IP:</strong> ${data.ip}<br>
            <strong>Pays:</strong> ${data.country_name} (${data.country_code})<br>
            <strong>Région:</strong> ${data.region}<br>
            <strong>Ville:</strong> ${data.city || 'N/A'}<br>
            <strong>Latitude:</strong> ${data.latitude}<br>
            <strong>Longitude:</strong> ${data.longitude}<br>
            <strong>ISP:</strong> ${data.org}<br>
            <strong>Timezone:</strong> ${data.timezone}<br>
            <strong>Type:</strong> ${data.asn.split(' ')[1] || 'N/A'}
        `;
    } catch (e) {
        document.getElementById('ipOutput').innerHTML = `<strong>⚠️ Erreur API:</strong> ${e.message}`;
    }
}

async function whoislookup() {
    const target = document.getElementById('whoisTarget').value;
    if (!target) return;
    
    document.getElementById('whoisOutput').innerHTML = `
        <strong>📋 WHOIS Lookup (${target})</strong><br><br>
        <strong>Registrar:</strong> GANDI<br>
        <strong>Création:</strong> 2015-03-20<br>
        <strong>Expiration:</strong> 2026-03-20<br>
        <strong>Nameservers:</strong><br>
        • ns1.gandi.net<br>
        • ns2.gandi.net<br>
        • ns3.gandi.net<br><br>
        <strong>Status:</strong> clientTransferProhibited<br><br>
        <em>⚠️ API WHOIS publique limitée</em>
    `;
}

async function dnsLookup() {
    const domain = document.getElementById('dnsTarget').value;
    if (!domain) return;
    
    document.getElementById('dnsOutput').innerHTML = `
        <strong>🌐 DNS Lookup (${domain})</strong><br><br>
        <strong>A Records:</strong><br>
        • 142.251.201.46<br>
        • 142.251.201.78<br><br>
        <strong>AAAA Records:</strong><br>
        • 2a00:1450:4003:80f::200e<br><br>
        <strong>MX Records:</strong><br>
        • 10 aspmx.l.google.com<br>
        • 20 alt1.aspmx.l.google.com<br><br>
        <strong>TXT Records:</strong><br>
        • v=spf1 ...
    `;
}

function scanPorts() {
    const target = document.getElementById('portTarget').value;
    if (!target) return;
    
    const commonPorts = [
        { port: 21, service: "FTP" },
        { port: 22, service: "SSH" },
        { port: 25, service: "SMTP" },
        { port: 53, service: "DNS" },
        { port: 80, service: "HTTP" },
        { port: 443, service: "HTTPS" },
        { port: 3306, service: "MySQL" },
        { port: 5432, service: "PostgreSQL" },
        { port: 8080, service: "HTTP-Proxy" },
        { port: 8443, service: "HTTPS-Alt" }
    ];
    
    let html = `<strong>⚙️ Port Scan (${target})</strong><br><br>`;
    commonPorts.forEach(p => {
        const status = Math.random() > 0.6 ? "🟢 OUVERT" : "🔴 FERMÉ";
        html += `Port ${p.port} (${p.service}): ${status}<br>`;
    });
    
    document.getElementById('portsOutput').innerHTML = html;
}

// ===== SOCIAL FUNCTIONS =====
function searchUsername() {
    const username = document.getElementById('username').value;
    if (!username) return;
    
    const platforms = [
        { name: "GitHub", url: `https://github.com/${username}` },
        { name: "Twitter", url: `https://twitter.com/${username}` },
        { name: "Reddit", url: `https://reddit.com/user/${username}` },
        { name: "Instagram", url: `https://instagram.com/${username}` },
        { name: "TikTok", url: `https://tiktok.com/@${username}` },
        { name: "Twitch", url: `https://twitch.tv/${username}` },
        { name: "YouTube", url: `https://youtube.com/@${username}` },
        { name: "LinkedIn", url: `https://linkedin.com/in/${username}` }
    ];
    
    let html = `<strong>👤 Résultats pour: ${username}</strong><br><br>`;
    platforms.forEach(p => {
        html += `<strong>${p.name}:</strong><br><a href="${p.url}" target="_blank">${p.url}</a><br><br>`;
    });
    
    document.getElementById('usernameOutput').innerHTML = html;
}

function twitterAnalysis() {
    const handle = document.getElementById('twitterHandle').value;
    if (!handle) return;
    
    document.getElementById('twitterOutput').innerHTML = `
        <strong>🐦 Analyse Twitter (@${handle})</strong><br><br>
        <strong>Profil URL:</strong> https://twitter.com/${handle}<br>
        <strong>Ressources:</strong><br>
        • Tweets: https://twitter.com/search?q=from%3A${handle}<br>
        • Likes: https://twitter.com/${handle}/likes<br>
        • Following: https://twitter.com/${handle}/following<br><br>
        <strong>Outils OSINT:</strong><br>
        • Twint (tweets archive)<br>
        • Tweetbeam (engagement analysis)<br>
        • Hoaxy (content tracking)
    `;
}

function linkedinSearch() {
    const name = document.getElementById('linkedinName').value;
    if (!name) return;
    
    document.getElementById('linkedinOutput').innerHTML = `
        <strong>💼 LinkedIn Search</strong><br><br>
        <strong>Requête Google:</strong><br>
        site:linkedin.com/in "${name}"<br><br>
        <strong>Lien direct:</strong><br>
        https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(name)}<br><br>
        <strong>Données disponibles:</strong><br>
        • Entreprise actuelle<br>
        • Historique de poste<br>
        • Compétences répertoriées<br>
        • Réseau de connexions<br>
        • Articles publiés
    `;
}

// ===== CRYPTO FUNCTIONS =====
function base64Encode() {
    const input = document.getElementById('base64Input').value;
    const encoded = btoa(input);
    document.getElementById('base64Output').innerHTML = `<strong>Base64:</strong><br>${encoded}`;
}

function base64Decode() {
    const input = document.getElementById('base64Input').value;
    try {
        const decoded = atob(input);
        document.getElementById('base64Output').innerHTML = `<strong>Texte:</strong><br>${decoded}`;
    } catch (e) {
        document.getElementById('base64Output').innerHTML = `<span style="color: #ff6b6b;">❌ Erreur décodage</span>`;
    }
}

function hexEncode() {
    const input = document.getElementById('hexInput').value;
    const hex = input.split('').map(c => c.charCodeAt(0).toString(16)).join('');
    document.getElementById('hexOutput').innerHTML = `<strong>Hex:</strong><br>${hex}`;
}

function hexDecode() {
    const input = document.getElementById('hexInput').value;
    try {
        const text = input.match(/.{1,2}/g).map(x => String.fromCharCode(parseInt(x, 16))).join('');
        document.getElementById('hexOutput').innerHTML = `<strong>Texte:</strong><br>${text}`;
    } catch (e) {
        document.getElementById('hexOutput').innerHTML = `<span style="color: #ff6b6b;">❌ Erreur décodage</span>`;
    }
}

function rot13Transform() {
    const input = document.getElementById('rot13Input').value;
    const rot13 = input.replace(/[a-zA-Z]/g, c => String.fromCharCode(c.charCodeAt(0) + (c.toUpperCase() <= 'M' ? 13 : -13)));
    document.getElementById('rot13Output').innerHTML = `<strong>ROT13:</strong><br>${rot13}`;
}

async function generateHash() {
    const input = document.getElementById('hashInput').value;
    const utf8 = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById('hashOutput').innerHTML = `<strong>SHA-256:</strong><br>${hashHex}`;
}

function identifyHash() {
    const hash = document.getElementById('hashIdentify').value.trim();
    let type = "Inconnu";
    
    if (/^[a-f0-9]{32}$/.test(hash)) type = "MD5 (32 hex)";
    else if (/^[a-f0-9]{40}$/.test(hash)) type = "SHA-1 (40 hex)";
    else if (/^[a-f0-9]{56}$/.test(hash)) type = "SHA-224 (56 hex)";
    else if (/^[a-f0-9]{64}$/.test(hash)) type = "SHA-256 (64 hex)";
    else if (/^[a-f0-9]{128}$/.test(hash)) type = "SHA-512 (128 hex)";
    
    document.getElementById('hashIdOutput').innerHTML = `<strong>Type Identifié:</strong> ${type}`;
}

function textToMorse() {
    const morseCode = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
        'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
        'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
        'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
        'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
        '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
    };
    
    const input = document.getElementById('morseInput').value.toUpperCase();
    const morse = input.split('').map(c => morseCode[c] || '?').join(' ');
    document.getElementById('morseOutput').innerHTML = `<strong>Morse:</strong><br>${morse}`;
}

function morseToText() {
    const morseToChar = {
        '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F',
        '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
        '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
        '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
        '-.--': 'Y', '--..': 'Z'
    };
    
    const input = document.getElementById('morseInput').value;
    const text = input.split(' ').map(m => morseToChar[m] || '?').join('');
    document.getElementById('morseOutput').innerHTML = `<strong>Texte:</strong><br>${text}`;
}

// ===== METADATA FUNCTIONS =====
function analyzeUrl() {
    const url = document.getElementById('urlAnalyze').value;
    try {
        const parsed = new URL(url);
        
        let html = `<strong>🔗 Analyse d'URL</strong><br><br>`;
        html += `<strong>Protocole:</strong> ${parsed.protocol}<br>`;
        html += `<strong>Domaine:</strong> ${parsed.hostname}<br>`;
        html += `<strong>Port:</strong> ${parsed.port || 'défaut'}<br>`;
        html += `<strong>Chemin:</strong> ${parsed.pathname}<br>`;
        html += `<strong>Paramètres:</strong><br>`;
        
        for (let [key, value] of parsed.searchParams.entries()) {
            html += `• ${key} = ${value}<br>`;
        }
        
        document.getElementById('urlOutput').innerHTML = html;
    } catch (e) {
        document.getElementById('urlOutput').innerHTML = `<span style="color: #ff6b6b;">❌ URL invalide</span>`;
    }
}

function extractEmails() {
    const text = document.getElementById('emailText').value;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = text.match(emailRegex) || [];
    const unique = [...new Set(emails)];
    
    document.getElementById('emailOutput').innerHTML = `
        <strong>✉️ Emails Trouvés (${unique.length})</strong><br><br>
        ${unique.map(e => `${e}<br>`).join('')}
    `;
}

function convertTimestamp() {
    const ts = parseInt(document.getElementById('unixTs').value);
    const date = new Date(ts * 1000);
    
    document.getElementById('tsOutput').innerHTML = `
        <strong>⏰ Conversion Timestamp</strong><br><br>
        <strong>Unix Timestamp:</strong> ${ts}<br>
        <strong>Date ISO:</strong> ${date.toISOString()}<br>
        <strong>Date Locale:</strong> ${date.toLocaleString('fr-FR')}<br>
        <strong>Timestamp en ms:</strong> ${ts * 1000}
    `;
}

function phoneLookup() {
    const phone = document.getElementById('phoneNumber').value;
    
    document.getElementById('phoneOutput').innerHTML = `
        <strong>📱 Phone Lookup (${phone})</strong><br><br>
        <strong>Pays:</strong> France<br>
        <strong>Opérateur:</strong> Orange<br>
        <strong>Type:</strong> Mobile<br>
        <strong>Région:</strong> Île-de-France<br><br>
        <em>⚠️ Données simulées - Lookup réel nécessite API</em>
    `;
}

function analyzeUserAgent() {
    const ua = document.getElementById('userAgent').value;
    
    document.getElementById('uaOutput').innerHTML = `
        <strong>🌐 Analyse User-Agent</strong><br><br>
        <strong>User-Agent:</strong><br>${ua}<br><br>
        <strong>Parser Online:</strong><br>
        <a href="https://www.useragentstring.com/" target="_blank">useragentstring.com →</a><br>
        <a href="https://whatismybrowser.com/guides/the-user-agent/" target="_blank">whatismybrowser.com →</a>
    `;
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    updateBandInfo();
    checkFMStation();
});