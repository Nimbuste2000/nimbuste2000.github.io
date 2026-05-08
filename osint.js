/**
 * NIMBUSTE 2000 - OSINT & RADIO SCRIPT
 * Version stabilisee sans caracteres speciaux
 */

console.log("Chargement du script OSINT...");

// --- NAVIGATION ---
function switchTab(tabId) {
    var tabs = document.querySelectorAll('.tab-content');
    var btns = document.querySelectorAll('.tab-btn');
    
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    for (var j = 0; j < btns.length; j++) {
        btns[j].classList.remove('active');
    }
    
    var target = document.getElementById(tabId);
    if (target) {
        target.classList.add('active');
    }
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    if (tabId === 'geo') {
        setTimeout(initMap, 300);
    }
}

// --- RADIO FUNCTIONS ---
function updateFMFreq(val) {
    var display = document.getElementById('fmDisplay');
    if (display) {
        display.innerText = parseFloat(val).toFixed(1);
    }
}

function changeFM(step) {
    var slider = document.getElementById('fmSlider');
    if (slider) {
        var newVal = parseFloat(slider.value) + step;
        if (newVal >= 87.5 && newVal <= 108) {
            slider.value = newVal;
            updateFMFreq(newVal);
        }
    }
}

function toggleFMPlay() {
    var rds = document.getElementById('rdsDisplay');
    var rdsContent = document.getElementById('rdsContent');
    if (rds) {
        var active = rds.classList.toggle('active');
        if (rdsContent) {
            rdsContent.innerText = active ? "SCANNING... SIGNAL OK" : "";
        }
    }
}

async function simulateSignalDetection() {
    var out = document.getElementById('signalOutput');
    if (!out) return;
    out.innerText = "Recherche via API FMDX...";
    try {
        var res = await fetch('https://servers.fmdx.org/api/v1/servers');
        var data = await res.json();
        var html = '<strong>Resultats:</strong><br>';
        for (var i = 0; i < Math.min(data.length, 10); i++) {
            var s = data[i];
            html += s.name + " (" + s.country + ") - " + s.frequency + "MHz<br>";
        }
        out.innerHTML = html;
    } catch(e) {
        out.innerText = "Erreur de connexion API.";
    }
}

// --- GEOLOCALISATION ---
var map = null;
function initMap() {
    if (map || !document.getElementById('map')) return;
    // @ts-ignore
    map = L.map('map').setView([48.8566, 2.3522], 13);
    // @ts-ignore
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
}

// --- RESEAU ---
async function ipLookup() {
    var ip = document.getElementById('ipAddress').value;
    var out = document.getElementById('ipOutput');
    if (!out) return;
    out.innerText = "Chargement...";
    try {
        var res = await fetch("https://ipapi.co/" + ip + "/json/");
        var data = await res.json();
        out.innerText = JSON.stringify(data, null, 2);
    } catch(e) {
        out.innerText = "Erreur lors de la requete.";
    }
}

console.log("Script charge avec succes !");