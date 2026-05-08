/**
 * NIMBUSTE 2000 - OSINT & RADIO TOOLKIT
 * Version finale - Mai 2026
 * API FMDX correcte: https://servers.fmdx.org/api  (dataset:[...])
 */

console.log("[NIMBUSTE] Script charge.");

// ============================================================
// 1. NAVIGATION
// ============================================================
function switchTab(tabId) {
    var contents = document.getElementsByClassName('tab-content');
    var btns = document.getElementsByClassName('tab-btn');
    for (var i = 0; i < contents.length; i++) {
        contents[i].classList.remove('active');
    }
    for (var j = 0; j < btns.length; j++) {
        btns[j].classList.remove('active');
    }
    var target = document.getElementById(tabId);
    if (target) { target.classList.add('active'); }
    if (event && event.currentTarget) { event.currentTarget.classList.add('active'); }
    if (tabId === 'geo') { setTimeout(initMap, 300); }
}

// ============================================================
// 2. MODULE RADIO FM
// ============================================================
function updateFMFreq(val) {
    var display = document.getElementById('fmDisplay');
    if (display) { display.innerText = parseFloat(val).toFixed(1); }
}

function changeFM(step) {
    var slider = document.getElementById('fmSlider');
    if (!slider) return;
    var newVal = Math.round((parseFloat(slider.value) + step) * 10) / 10;
    if (newVal >= 87.5 && newVal <= 108.0) {
        slider.value = newVal;
        updateFMFreq(newVal);
    }
}

function toggleFMPlay() {
    var rds = document.getElementById('rdsDisplay');
    var rdsContent = document.getElementById('rdsContent');
    if (!rds) return;
    var active = rds.classList.toggle('active');
    if (rdsContent) {
        rdsContent.innerText = active ? "SCANNING... EN ATTENTE SIGNAL SDR" : "";
    }
}

var allServers = [];

function renderServerList(servers) {
    var out = document.getElementById('signalOutput');
    if (!out) return;
    if (!servers || servers.length === 0) {
        out.innerHTML = "Aucun serveur trouve pour ce filtre.";
        return;
    }
    var html = "<strong>" + servers.length + " serveur(s) :</strong><br><br>";
    var limit = Math.min(servers.length, 40);
    for (var i = 0; i < limit; i++) {
        var s = servers[i];
        var name = s.name || ("Serveur " + (i + 1));
        var country = s.countryName || s.country || "?";
        var city = s.city || "";
        var url = s.url || "#";
        var statusColor = (s.status === 1) ? "#00ff88" : "#ff4444";
        var statusText = (s.status === 1) ? "EN LIGNE" : "HORS LIGNE";
        var audio = s.audioQuality || "";
        html += '<div style="border:1px solid #333;padding:8px;margin-bottom:6px;border-radius:4px;background:#111;">';
        html += '<span style="color:' + statusColor + ';">&#9679; ' + statusText + '</span> ';
        html += '<strong>' + name + '</strong><br>';
        html += '<small>' + country;
        if (city) html += ' - ' + city;
        if (audio) html += ' | Audio: ' + audio;
        html += '</small>';
        if (url && url !== "#") {
            html += '<br><a href="' + url + '" target="_blank" rel="noopener" style="color:#667eea;font-size:0.85em;">[Ouvrir ce serveur SDR]</a>';
        }
        html += '</div>';
    }
    out.innerHTML = html;
}

function filterByCountry() {
    var sel = document.getElementById('countryFilter');
    if (!sel || allServers.length === 0) return;
    var val = sel.value;
    if (val === "all") {
        renderServerList(allServers);
    } else {
        renderServerList(allServers.filter(function(s) { return s.country === val; }));
    }
}

async function simulateSignalDetection() {
    var out = document.getElementById('signalOutput');
    if (!out) return;
    out.innerHTML = "Interrogation de l'API FMDX...";
    try {
        var response = await fetch('https://servers.fmdx.org/api');
        if (!response.ok) { throw new Error("HTTP " + response.status); }
        var json = await response.json();
        allServers = json.dataset || [];
        if (allServers.length === 0) {
            out.innerHTML = "Aucun serveur retourne.";
            return;
        }
        // Construire filtre pays
        var filterDiv = document.getElementById('countryFilterDiv');
        if (!filterDiv) {
            filterDiv = document.createElement('div');
            filterDiv.id = 'countryFilterDiv';
            filterDiv.style.marginBottom = '10px';
            out.parentNode.insertBefore(filterDiv, out);
        }
        var countries = {};
        allServers.forEach(function(s) {
            if (s.country) { countries[s.country] = s.countryName || s.country.toUpperCase(); }
        });
        var sortedKeys = Object.keys(countries).sort();
        var selectHtml = '<label style="color:#ccc;">Filtrer par pays: </label>';
        selectHtml += '<select id="countryFilter" onchange="filterByCountry()" style="background:#222;color:#fff;border:1px solid #444;padding:4px;border-radius:4px;">';
        selectHtml += '<option value="all">Tous (' + allServers.length + ')</option>';
        for (var k = 0; k < sortedKeys.length; k++) {
            var code = sortedKeys[k];
            var count = allServers.filter(function(s) { return s.country === code; }).length;
            selectHtml += '<option value="' + code + '">' + countries[code] + ' (' + count + ')</option>';
        }
        selectHtml += '</select>';
        filterDiv.innerHTML = selectHtml;
        renderServerList(allServers);
    } catch (e) {
        out.innerHTML = '<strong>Erreur: ' + e.message + '</strong><br><br>' +
            '<a href="https://servers.fmdx.org" target="_blank" style="color:#667eea;">[Carte FMDX.org directement]</a>';
        console.error("[NIMBUSTE Radio]", e);
    }
}

function calculateRange() {
    var ht = parseFloat(document.getElementById('txHeight').value);
    var hr = parseFloat(document.getElementById('rxHeight').value);
    var out = document.getElementById('rangeOutput');
    if (!out) return;
    if (isNaN(ht) || isNaN(hr)) { out.innerText = "Valeurs invalides."; return; }
    out.innerText = "Portee : " + (3.57 * (Math.sqrt(ht) + Math.sqrt(hr))).toFixed(2) + " km";
}

// ============================================================
// 3. GEOLOCALISATION
// ============================================================
var map = null;

function initMap() {
    if (map) return;
    var mapDiv = document.getElementById('map');
    if (!mapDiv) return;
    if (typeof L === 'undefined') { mapDiv.innerText = "Leaflet non charge."; return; }
    map = L.map('map').setView([48.8566, 2.3522], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'OpenStreetMap' }).addTo(map);
}

function loadMap() { initMap(); }

function convertCoords() {
    var lat = parseFloat(document.getElementById('lat').value);
    var lon = parseFloat(document.getElementById('lon').value);
    var out = document.getElementById('coordsOutput');
    if (!out) return;
    if (isNaN(lat) || isNaN(lon)) { out.innerText = "Invalide."; return; }
    function toDMS(deg, pos, neg) {
        var abs = Math.abs(deg);
        var d = Math.floor(abs);
        var m = Math.floor((abs - d) * 60);
        var s = ((abs - d - m / 60) * 3600).toFixed(2);
        return d + "deg " + m + "' " + s + "\" " + (deg >= 0 ? pos : neg);
    }
    out.innerText = toDMS(lat, 'N', 'S') + "  /  " + toDMS(lon, 'E', 'W');
}

function calculateDistance() {
    var lat1 = parseFloat(document.getElementById('lat1').value);
    var lon1 = parseFloat(document.getElementById('lon1').value);
    var lat2 = parseFloat(document.getElementById('lat2').value);
    var lon2 = parseFloat(document.getElementById('lon2').value);
    var out = document.getElementById('distOutput');
    if (!out) return;
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) { out.innerText = "Valeurs invalides."; return; }
    var R = 6371;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    out.innerText = "Distance : " + (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(3) + " km";
}

function calculateAzimuth() {
    var fromArr = (document.getElementById('fromCoord').value || "").split(',').map(Number);
    var toArr = (document.getElementById('toCoord').value || "").split(',').map(Number);
    var out = document.getElementById('azOutput');
    if (!out) return;
    if (fromArr.length < 2 || isNaN(fromArr[0])) { out.innerText = "Format: lat,lon"; return; }
    var lat1 = fromArr[0] * Math.PI / 180;
    var lon1 = fromArr[1] * Math.PI / 180;
    var lat2 = toArr[0] * Math.PI / 180;
    var lon2 = toArr[1] * Math.PI / 180;
    var y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    out.innerText = "Azimuth : " + ((Math.atan2(y, x) * 180 / Math.PI + 360) % 360).toFixed(2) + " deg";
}

// ============================================================
// 4. IMAGES & EXIF
// ============================================================
function extractExif() {
    var fileInput = document.getElementById('imageFile');
    var out = document.getElementById('exifOutput');
    if (!out) return;
    if (!fileInput || !fileInput.files[0]) { out.innerText = "Selectionnez une image."; return; }
    if (typeof EXIF === 'undefined') { out.innerText = "Lib EXIF manquante. Ajoutez: <script src='https://cdn.jsdelivr.net/npm/exif-js'></script>"; return; }
    EXIF.getData(fileInput.files[0], function() {
        var tags = EXIF.getAllTags(this);
        out.innerText = Object.keys(tags).length ? JSON.stringify(tags, null, 2) : "Aucun tag EXIF trouve.";
    });
}

function reverseImageSearch() {
    var urlInput = document.getElementById('reverseImageUrl');
    var out = document.getElementById('reverseOutput');
    if (!urlInput || !out) return;
    var url = urlInput.value.trim();
    if (!url) { out.innerText = "Entrez une URL."; return; }
    out.innerHTML =
        '<a href="https://lens.google.com/uploadbyurl?url=' + encodeURIComponent(url) + '" target="_blank" style="color:#667eea;display:block;margin:4px 0;">[Google Lens]</a>' +
        '<a href="https://yandex.com/images/search?rpt=imageview&url=' + encodeURIComponent(url) + '" target="_blank" style="color:#667eea;display:block;margin:4px 0;">[Yandex Images]</a>' +
        '<a href="https://www.bing.com/images/search?q=imgurl:' + encodeURIComponent(url) + '&view=detailv2&iss=sbi" target="_blank" style="color:#667eea;display:block;margin:4px 0;">[Bing Visual]</a>';
}

function analyzeShadow() {
    var angle = parseFloat(document.getElementById('shadowAngle').value);
    var h = parseFloat(document.getElementById('objectHeight').value);
    var out = document.getElementById('shadowOutput');
    if (!out) return;
    if (isNaN(angle) || isNaN(h) || angle <= 0) { out.innerText = "Valeurs invalides."; return; }
    out.innerText = "Ombre : " + (h / Math.tan(angle * Math.PI / 180)).toFixed(2) + " m";
}

// ============================================================
// 5. RESEAU
// ============================================================
async function ipLookup() {
    var ip = (document.getElementById('ipAddress').value || "").trim();
    var out = document.getElementById('ipOutput');
    if (!out) return;
    if (!ip) { out.innerText = "Entrez une IP."; return; }
    out.innerText = "Recherche...";
    try {
        var res = await fetch("https://ipapi.co/" + ip + "/json/");
        var data = await res.json();
        if (data.error) { out.innerText = "Erreur: " + data.reason; return; }
        out.innerText = "IP: " + (data.ip || ip) + "\nPays: " + (data.country_name || "?") +
            "\nVille: " + (data.city || "?") + "\nRegion: " + (data.region || "?") +
            "\nFAI: " + (data.org || "?") + "\nTimezone: " + (data.timezone || "?") +
            "\nLat/Lon: " + (data.latitude || "?") + " / " + (data.longitude || "?");
    } catch (e) { out.innerText = "Erreur: " + e.message; }
}

async function whoislookup() {
    var target = (document.getElementById('whoisTarget').value || "").trim();
    var out = document.getElementById('whoisOutput');
    if (!out) return;
    if (!target) { out.innerText = "Entrez un domaine."; return; }
    out.innerText = "Requete RDAP...";
    try {
        var res = await fetch("https://rdap.org/domain/" + target);
        var data = await res.json();
        var info = "Domaine: " + (data.ldhName || target) + "\n";
        if (data.status) info += "Statut: " + data.status.join(', ') + "\n";
        if (data.events) {
            data.events.forEach(function(ev) { info += ev.eventAction + ": " + ev.eventDate + "\n"; });
        }
        out.innerText = info;
    } catch (e) { out.innerText = "RDAP indisponible pour ce domaine."; }
}

async function dnsLookup() {
    var domainEl = document.getElementById('dnsDomain');
    var out = document.getElementById('dnsOutput');
    if (!domainEl || !out) return;
    out.innerText = "Lookup DNS...";
    try {
        var res = await fetch("https://dns.google/resolve?name=" + domainEl.value.trim() + "&type=A");
        var data = await res.json();
        if (data.Answer) {
            var txt = "Enregistrements A:\n";
            data.Answer.forEach(function(r) { txt += " -> " + r.data + " (TTL: " + r.TTL + "s)\n"; });
            out.innerText = txt;
        } else { out.innerText = "Aucun enregistrement A trouve."; }
    } catch (e) { out.innerText = "Erreur DNS: " + e.message; }
}

async function portScan() {
    var targetEl = document.getElementById('portTarget');
    var out = document.getElementById('portOutput');
    if (!targetEl || !out) return;
    out.innerHTML = "Scan via HackerTarget (ports communs)...";
    try {
        var res = await fetch("https://api.hackertarget.com/nmap/?q=" + encodeURIComponent(targetEl.value.trim()));
        out.innerText = await res.text();
    } catch (e) { out.innerText = "Erreur: " + e.message; }
}

// ============================================================
// 6. RESEAUX SOCIAUX
// ============================================================
function searchUsername() {
    var input = document.getElementById('usernameSearch');
    var out = document.getElementById('socialOutput');
    if (!input || !out) return;
    var username = input.value.trim();
    if (!username) { out.innerText = "Entrez un username."; return; }
    var sites = [
        { name: "GitHub", url: "https://github.com/" + username },
        { name: "Twitter/X", url: "https://twitter.com/" + username },
        { name: "Instagram", url: "https://www.instagram.com/" + username },
        { name: "Reddit", url: "https://www.reddit.com/user/" + username },
        { name: "TikTok", url: "https://www.tiktok.com/@" + username },
        { name: "YouTube", url: "https://www.youtube.com/@" + username },
        { name: "Twitch", url: "https://www.twitch.tv/" + username },
        { name: "LinkedIn", url: "https://www.linkedin.com/in/" + username },
        { name: "Pinterest", url: "https://www.pinterest.com/" + username },
        { name: "Telegram", url: "https://t.me/" + username },
        { name: "Mastodon", url: "https://mastodon.social/@" + username },
        { name: "Keybase", url: "https://keybase.io/" + username },
        { name: "HackerNews", url: "https://news.ycombinator.com/user?id=" + username },
        { name: "Steam", url: "https://steamcommunity.com/id/" + username },
        { name: "Flickr", url: "https://www.flickr.com/people/" + username },
        { name: "DeviantArt", url: "https://www.deviantart.com/" + username },
        { name: "GitLab", url: "https://gitlab.com/" + username },
        { name: "Pastebin", url: "https://pastebin.com/u/" + username }
    ];
    var html = "<strong>Liens pour \"" + username + "\" :</strong><br><br>";
    sites.forEach(function(site) {
        html += '<a href="' + site.url + '" target="_blank" rel="noopener" style="display:inline-block;margin:3px;padding:4px 8px;background:#1a1a2e;border:1px solid #667eea;color:#667eea;border-radius:4px;text-decoration:none;font-size:0.85em;">' + site.name + '</a>';
    });
    out.innerHTML = html;
}

// ============================================================
// 7. CRYPTOGRAPHIE
// ============================================================
function base64Encode() {
    var input = document.getElementById('base64Input');
    var out = document.getElementById('base64Output');
    if (!input || !out) return;
    try { out.innerText = btoa(unescape(encodeURIComponent(input.value))); }
    catch (e) { out.innerText = "Erreur encodage."; }
}

function base64Decode() {
    var input = document.getElementById('base64Input');
    var out = document.getElementById('base64Output');
    if (!input || !out) return;
    try { out.innerText = decodeURIComponent(escape(atob(input.value))); }
    catch (e) { out.innerText = "Base64 invalide."; }
}

function hexEncode() {
    var input = document.getElementById('hexInput');
    var out = document.getElementById('hexOutput');
    if (!input || !out) return;
    var hex = '';
    for (var i = 0; i < input.value.length; i++) {
        hex += input.value.charCodeAt(i).toString(16).padStart(2, '0');
    }
    out.innerText = hex;
}

function hexDecode() {
    var input = document.getElementById('hexInput');
    var out = document.getElementById('hexOutput');
    if (!input || !out) return;
    try {
        var hex = input.value.replace(/\s/g, '');
        var str = '';
        for (var i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        out.innerText = str;
    } catch (e) { out.innerText = "Hex invalide."; }
}

function rot13Transform() {
    var input = document.getElementById('rot13Input');
    var out = document.getElementById('rot13Output');
    if (!input || !out) return;
    out.innerText = input.value.replace(/[a-zA-Z]/g, function(c) {
        var base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    });
}

async function generateHash() {
    var input = document.getElementById('hashInput');
    var out = document.getElementById('hashOutput');
    if (!input || !out) return;
    try {
        var hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input.value));
        out.innerText = Array.from(new Uint8Array(hashBuffer)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    } catch (e) { out.innerText = "Erreur: " + e.message; }
}

function identifyHash() {
    var input = document.getElementById('hashIdentify');
    var out = document.getElementById('hashIdOutput');
    if (!input || !out) return;
    var h = input.value.trim();
    var types = { 32: "MD5", 40: "SHA-1", 56: "SHA-224", 64: "SHA-256", 96: "SHA-384", 128: "SHA-512" };
    out.innerText = "Type probable: " + (types[h.length] || "Inconnu") + " (" + h.length + " chars)";
}

function textToMorse() {
    var input = document.getElementById('morseInput');
    var out = document.getElementById('morseOutput');
    if (!input || !out) return;
    var m = { 'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..',  '9':'----.','0':'-----',' ':'/' };
    var result = '';
    var txt = input.value.toUpperCase();
    for (var i = 0; i < txt.length; i++) { result += (m[txt[i]] || '') + ' '; }
    out.innerText = result.trim();
}

function morseToText() {
    var input = document.getElementById('morseInput');
    var out = document.getElementById('morseOutput');
    if (!input || !out) return;
    var r = { '.-':'A','-...':'B','-.-.':'C','-..':'D','.':'E','..-.':'F','--.':'G','....':'H','..':'I','.---':'J','-.-':'K','.-..':'L','--':'M','-.':'N','---':'O','.--.':'P','--.-':'Q','.-.':'R','...':'S','-':'T','..-':'U','...-':'V','.--':'W','-..-':'X','-.--':'Y','--..':'Z','.----':'1','..---':'2','...--':'3','....-':'4','.....':'5','-....':'6','--...':'7','---..':'8','----.':'9','-----':'0','/':' ' };
    out.innerText = input.value.trim().split(' ').map(function(w) { return r[w] || '?'; }).join('');
}

// ============================================================
// 8. METADONNEES
// ============================================================
function analyzeUrl() {
    var input = document.getElementById('urlAnalyze');
    var out = document.getElementById('urlOutput');
    if (!input || !out) return;
    try {
        var url = new URL(input.value);
        out.innerText = "Protocole: " + url.protocol + "\nHote: " + url.hostname + "\nPort: " + (url.port || "defaut") + "\nChemin: " + url.pathname + "\nParametres: " + (url.search || "aucun") + "\nFragment: " + (url.hash || "aucun");
    } catch (e) { out.innerText = "URL invalide."; }
}

function extractEmails() {
    var input = document.getElementById('emailText');
    var out = document.getElementById('emailOutput');
    if (!input || !out) return;
    var matches = input.value.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+/gi);
    out.innerText = matches ? matches.join('\n') : "Aucun email trouve.";
}

function convertTimestamp() {
    var input = document.getElementById('unixTs');
    var out = document.getElementById('tsOutput');
    if (!input || !out) return;
    var ts = parseInt(input.value);
    if (isNaN(ts)) { out.innerText = "Timestamp invalide."; return; }
    var d = new Date(ts * 1000);
    out.innerText = d.toLocaleString('fr-FR') + "\nISO: " + d.toISOString();
}

function analyzeUserAgent() {
    var input = document.getElementById('userAgentInput');
    var out = document.getElementById('uaOutput');
    if (!out) return;
    var ua = (input && input.value.trim()) ? input.value.trim() : navigator.userAgent;
    var info = "User-Agent:\n" + ua + "\n\n";
    if (/Windows/.test(ua)) info += "OS: Windows\n";
    else if (/Android/.test(ua)) info += "OS: Android\n";
    else if (/iPhone|iPad/.test(ua)) info += "OS: iOS\n";
    else if (/Linux/.test(ua)) info += "OS: Linux\n";
    else if (/Mac/.test(ua)) info += "OS: macOS\n";
    if (/Chrome\//.test(ua) && !/Edge/.test(ua)) info += "Navigateur: Chrome\n";
    else if (/Firefox\//.test(ua)) info += "Navigateur: Firefox\n";
    else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) info += "Navigateur: Safari\n";
    else if (/Edge\//.test(ua)) info += "Navigateur: Edge\n";
    info += (/Mobile/.test(ua)) ? "Type: Mobile\n" : "Type: Desktop\n";
    out.innerText = info;
}

console.log("[NIMBUSTE] Toutes les fonctions chargees.");