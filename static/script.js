// PAGE NAVIGATION
function showPage(page){
  var pages = document.querySelectorAll(".page");
  pages.forEach(function(p){
    p.classList.remove("active");
  });
  document.getElementById("page"+page).classList.add("active");

  var buttons = document.querySelectorAll(".feature-nav button");
  buttons.forEach(function(b){
    b.classList.remove("active");
  });
  document.getElementById("nav"+page).classList.add("active");

  // Fix map rendering when map page is shown
  if(page === 6){ // adjust if your map page number is different
    setTimeout(function(){
      map.invalidateSize();
    }, 200);
  }
}

// MAP INITIALIZATION
var map = L.map('map').setView([20,0],2);

// LIGHT MAP TILES
L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }
).addTo(map);

var markers = [];
var missiles = [];

// COUNTRY COORDINATES
var coords = {
  "USA":[37,-95],
  "Russia":[61,105],
  "China":[35,103],
  "India":[21,78],
  "Pakistan":[30,70],
  "Iran":[32,53],
  "Israel":[31,35],
  "North Korea":[40,127],
  "South Korea":[36,128],
  "Germany":[51,10],
  "France":[46,2],
  "UK":[55,-3],
  "Japan":[36,138],
  "Turkey":[39,35],
  "Saudi Arabia":[24,45],
  "Ukraine":[49,32]
};

// MAIN SIMULATION
function simulate(){
  var attacker = document.getElementById("attacker").value;
  var defender = document.getElementById("defender").value;

  fetch("/simulate",{
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body: "attacker=" + attacker + "&defender=" + defender
  })
  .then(function(res){ return res.json(); })
  .then(function(data){
    document.getElementById("prediction").innerText = data.prediction;
    updateRiskMeter(data.risk);
    updateAlert(data.risk);
    showEffects(data);
    showAllies(data);
    showTimeline(data);
    showReport(data);
    createChart(data);
    showMap(attacker, defender);
    launchMissile(attacker, defender); // missile now with curved arc & weak explosion
  });
}

// GLOBAL ALERT
function updateAlert(risk){
  var banner = document.getElementById("warAlert");
  banner.classList.remove("alert-critical","alert-warning");

  if(risk > 70){
    banner.innerText = "🚨 GLOBAL WAR ALERT: CRITICAL";
    banner.classList.add("alert-critical");
  }
  else if(risk > 40){
    banner.innerText = "⚠ GLOBAL WAR ALERT: HIGH TENSION";
    banner.classList.add("alert-warning");
  }
  else{
    banner.innerText = "GLOBAL WAR STATUS: STABLE";
    banner.style.background="#16a34a";
  }
}

// RISK METER
function updateRiskMeter(risk){
  var meter = document.querySelector(".risk-meter");
  var value = document.getElementById("riskValue");
  value.innerText = risk + "%";

  var color = "green";
  if(risk > 70) color = "red";
  else if(risk > 50) color = "orange";
  else if(risk > 30) color = "yellow";

  var deg = risk*3.6;
  meter.style.transition = "background 0.8s ease";
  meter.style.background = "conic-gradient(" + color + " 0deg " + deg + "deg,#1e293b " + deg + "deg 360deg)";
}

// EFFECTS
function showEffects(data){
  var d = document.getElementById("directEffects");
  d.innerHTML = "";
  data.direct.forEach(function(e){
    var li = document.createElement("li");
    li.innerText = e;
    d.appendChild(li);
  });

  var i = document.getElementById("indirectEffects");
  i.innerHTML = "";
  data.indirect.forEach(function(e){
    var li = document.createElement("li");
    li.innerText = e;
    i.appendChild(li);
  });
}

// AFFECTED COUNTRIES
function showAllies(data){
  var a = document.getElementById("affected");
  a.innerHTML = "";
  data.affectedCountries.forEach(function(c){
    var li = document.createElement("li");
    li.innerText = c;
    a.appendChild(li);
  });
}

// WAR TIMELINE
function showTimeline(data){
  var t = document.getElementById("timeline");
  t.innerHTML = "";
  data.timeline.forEach(function(e){
    var li = document.createElement("li");
    li.innerText = e;
    t.appendChild(li);
  });
}

// AI REPORT
function showReport(data){
  document.getElementById("report").innerText = data.report;
}

// IMPACT CHART
var chart;
function createChart(data){
  var ctx = document.getElementById("impactChart");
  if(chart) chart.destroy();
  chart = new Chart(ctx,{
    type:'bar',
    data:{
      labels:["Oil Impact","Trade Impact","GDP Loss"],
      datasets:[{
        label:"Impact %",
        data:[data.oilImpact,data.tradeImpact,data.gdpLoss]
      }]
    }
  });
}

// MAP MARKERS
function showMap(attacker, defender){
  markers.forEach(function(m){ map.removeLayer(m); });
  markers = [];

  var m1 = L.marker(coords[attacker]).addTo(map).bindPopup("Attacker: " + attacker).openPopup();
  var m2 = L.marker(coords[defender]).addTo(map).bindPopup("Defender: " + defender);

  markers.push(m1, m2);
  map.setView(coords[attacker],4);
}

// MISSILE ANIMATION WITH CURVED ARC AND WEAK EXPLOSION
function launchMissile(attacker, defender){
  missiles.forEach(function(m){ map.removeLayer(m); });
  missiles = [];

  setTimeout(function(){
    map.invalidateSize();

    var start = coords[attacker];
    var end = coords[defender];
    var steps = 60; // smoother animation
    var i = 0;

    // Quadratic curve control point above straight line
    var midLat = (start[0] + end[0])/2 + 10; 
    var midLng = (start[1] + end[1])/2;

    var missileIcon = L.divIcon({
      className: 'missile-icon',
      html: "🚀",
      iconSize: [20,20]
    });

    var missile = L.marker(start, {icon: missileIcon}).addTo(map);
    missiles.push(missile);

    var interval = setInterval(function(){
      if(i >= steps){
        clearInterval(interval);
        missile.remove();

        // WEAK explosion effect at defender
        var explosionIcon = L.divIcon({
          className: 'explosion-icon',
          html: "💥",
          iconSize: [30,30],
          popupAnchor: [0,-15]
        });
        var explosion = L.marker(end, {icon: explosionIcon}).addTo(map);

        // Fade out explosion smoothly
        var opacity = 1;
        var fade = setInterval(function(){
          opacity -= 0.05;
          if(opacity <= 0){
            clearInterval(fade);
            map.removeLayer(explosion);
          } else {
            explosion.getElement().style.opacity = opacity;
          }
        }, 50);

        return;
      }

      var t = i/steps;
      // Quadratic Bezier curve: B(t) = (1-t)^2*P0 + 2*(1-t)*t*P1 + t^2*P2
      var lat = (1-t)*(1-t)*start[0] + 2*(1-t)*t*midLat + t*t*end[0];
      var lng = (1-t)*(1-t)*start[1] + 2*(1-t)*t*midLng + t*t*end[1];

      missile.setLatLng([lat, lng]);
      i++;
    },30);

  }, 200); // slight delay to ensure map is visible
}