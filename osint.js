// NIMBUSTE 2000 - FULL OSINT & RADIO TOOLKIT
console.log("Toolkit OSINT active");

// --- NAVIGATION ---
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
    if(target) { target.classList.add('active'); }
    if(event && event.currentTarget) { event.currentTarget.classList.add('active'); }
    if(tabId === 'geo') { setTimeout(initMap, 300); }
}

// --- MODULE RADIO ---
function updateFMFreq(val) {
    document.getElementById('fmDisplay').innerText = val;
}

function changeFM(step) {
    var s = document.getElementById('fmSlider');
    var v = (parseFloat(s.value) + step).toFixed(1);
    if(v >= 87.5 && v <= 108) {
        s.value = v;
        updateFMFreq(v);
    }
}

function toggleFMPlay() {
    var r = document.getElementById('rdsDisplay');
    var c = document.getElementById('rdsContent');
    if(r.classList.toggle('active')) {
        c.innerText = "SIGNAL DETECTE : NIMBUSTE-SDR";
    } else {
        c.innerText = "";
    }
}

async function simulateSignalDetection() {
    var out = document.getElementById('signalOutput');
    out.innerText = "Scan FMDX en cours...";
    try {
        var res = await fetch('https://servers.fmdx.org/api/v1/servers');
        var data = await res.json();
        var html = "<strong>Top 10 SDR :</strong><br>";
        for(var i=0; i<10; i++) {
            if(data[i]) html += data[i].name + " (" + data[i].frequency + " MHz)<br>";
        }
        out.innerHTML = html;
    } catch(e) { out.innerText = "Erreur API Radio"; }
}

// --- MODULE GEOGRAPHIE ---
var map = null;
function initMap() {
    if (map) return;
    if (typeof L !== 'undefined' && document.getElementById('map')) {
        map = L.map('map').setView([48.85, 2.34], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    }
}

function calculateDistance() {
    var lat1 = parseFloat(document.getElementById('lat1').value);
    var lon1 = parseFloat(document.getElementById('lon1').value);
    var lat2 = parseFloat(document.getElementById('lat2').value);
    var lon2 = parseFloat(document.getElementById('lon2').value);
    var R = 6371;
    var dLat = (lat2-lat1) * Math.PI / 180;
    var dLon = (lon2-lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    document.getElementById('distOutput').innerText = "Distance : " + (R * c).toFixed(2) + " km";
}

// --- MODULE RESEAU ---
async function ipLookup() {
    var ip = document.getElementById('ipAddress').value;
    var out = document.getElementById('ipOutput');
    out.innerText = "Analyse IP...";
    try {
        var res = await fetch("https://ipapi.co/" + ip + "/json/");
        var data = await res.json();
        out.innerText = JSON.stringify(data, null, 2);
    } catch(e) { out.innerText = "Erreur IP-API"; }
}

// --- MODULE CRYPTO ---
function base64Encode() {
    var val = document.getElementById('base64Input').value;
    document.getElementById('base64Output').innerText = btoa(val);
}
function base64Decode() {
    try {
        var val = document.getElementById('base64Input').value;
        document.getElementById('base64Output').innerText = atob(val);
    } catch(e) { document.getElementById('base64Output').innerText = "Invalide"; }
}

function textToMorse() {
    var m = { 'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----', ' ': '/' };
    var txt = document.getElementById('morseInput').value.toUpperCase();
    var res = "";
    for(var i=0; i<txt.length; i++) { res += (m[txt[i]] || "") + " "; }
    document.getElementById('morseOutput').innerText = res;
}

// --- MODULE IMAGES (EXIF) ---
function extractExif() {
    var file = document.getElementById('imageFile').files[0];
    var out = document.getElementById('exifOutput');
    if(!file) return;
    if(typeof EXIF !== 'undefined') {
        EXIF.getData(file, function() {
            out.innerText = JSON.stringify(EXIF.getAllTags(this), null, 2);
        });
    } else { out.innerText = "Erreur: Lib EXIF manquante"; }
}