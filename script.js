const fire = document.querySelector('#fire');
let projectile = {
      model: document.querySelector('#projectile'),
    };
    ufo = {
      model: document.querySelector('#ufo'),
      left: 0,
      top: 0,
    };
    fontSize = 0;
    canvasElement = document.querySelector('canvas');
    canvas = canvasElement.getContext('2d');
    distance = 0;
    dx = 0;
    dy = 0;
    i = 1;
let iteration;

window.addEventListener('load', normalize);
window.addEventListener('resize', normalize);

function normalize() {
  console.log('normalize');
  fontSize = parseInt(getComputedStyle(document.documentElement).fontSize.match(/\d/g).join(''));
  canvasElement.width = 140 * fontSize;
  canvasElement.height = 80 * fontSize;
  canvas.lineWidth = 0.4 * fontSize;
  canvas.lineCap = 'square';
  canvas.strokeStyle = 'hsl(225, 50%, 85%)';
};

document.addEventListener('DOMContentLoaded', loadData);
window.addEventListener('beforeunload', saveData);

function saveData() {
  localStorage.setItem('velocity', phiz.V0);
  localStorage.setItem('height', phiz.H);
  localStorage.setItem('angle', phiz.alpha);
};
function loadData() {
  if (localStorage.getItem('velocity') && localStorage.getItem('height') && localStorage.getItem('angle')) {
    phiz.V0 = +localStorage.getItem('velocity');
    phiz.H = +localStorage.getItem('height');
    phiz.alpha = +localStorage.getItem('angle');
  };
  projectile.model.style.top = 80 - phiz.H + 'rem';
};

fire.addEventListener('click', startFlight);
for (var input of document.querySelectorAll('input')) {
  input.addEventListener('focus', focus);
  input.addEventListener('input', change);
  input.addEventListener('blur', blur);
};

function focus() {
  this.placeholder = '';
};
function change() {
  this.value = this.value.replace(this.value.match(/[\D]/g), '');
  //if (this.value.length > 2) this.value.length = 2;
};
function blur() {
  console.log(this.value);
  switch (this.name) {
    case 'velocity':
      if (!this.value) {this.placeholder = '55';}
      else {
        if (this.value >= 60) this.value = 60;
        phiz.V0 = +this.value;
      };
      break;
    case 'height':
      if (!this.value) {this.placeholder = '15';}
      else {
        if (this.value >= 20) this.value = 20;
        phiz.H = +this.value;
        projectile.model.style.top = 80 - phiz.H + 'rem';
      };
      break;
    case 'angle':
      if (!this.value) {this.placeholder = '45';}
      else {
        if (this.value >= 90) this.value = 90;
        phiz.alpha = +this.value;
      };
      break;
  };
};

let phiz = {
  EField: true,
  MField: false,
  m: 1e-2,
  q: 1e-6,
  E: 2e5,
  V0: 55,
  Vx: 0,
  Vy: 0,
  alpha: 45,
  a: 0,
  H: 15,
  fullS: 0,
  currentS: 0,
  previousS: 0,
  currentH: 0,
  previousH: 0,
  currentT: 100, //ms
  fullT: 0, //ms
};

function setUfo() {
  if (phiz.EField && !phiz.MField) {
    ufo.left = 80 + Math.round(Math.random() * 45);
    ufo.top = 30 + Math.round(Math.random() * 35);
  };
  ufoPlacement();
};

function ufoPlacement() {
  ufo.model.style.left = ufo.left + 'rem';
  ufo.model.style.top = 80 - ufo.top - 1 + 'rem';
  document.querySelector('#ufoCoordinates').textContent = 'Координаты тарелки: (' + ufo.left + ', ' + ufo.top + ')';
};

setUfo();

function startFlight() {
  projectile.model.style.top = 80 - phiz.H + 'rem';
  projectile.model.style.left = '0';

  if (phiz.EField && !phiz.MField) {
    EStart();
  };
};

function EStart() {
  phiz.a = phiz.q * phiz.E / phiz.m;
  phiz.Vx = phiz.V0 * Math.cos(phiz.alpha * Math.PI / 180);
  phiz.Vy = phiz.V0 * Math.sin(phiz.alpha * Math.PI / 180);

  phiz.fullT = ( phiz.Vy + Math.sqrt(Math.pow(phiz.Vy, 2) + 2 * phiz.a * phiz.H) ) / phiz.a * 1000;
  phiz.fullS = phiz.Vx * phiz.fullT / 1000;

  console.log(phiz.fullT);
  console.log(phiz.fullS);

  canvas.beginPath();
  canvas.moveTo(0, (80 - phiz.H) * fontSize);
  phiz.currentH = phiz.H;
  EPositionCalculator();
  iteration = setInterval(EPositionCalculator, 100);
};

function EPositionCalculator() {
  phiz.previousH = phiz.currentH;
  phiz.previousS = phiz.currentS;
  phiz.currentH = phiz.H + (phiz.Vy * (phiz.currentT / 1000) - (phiz.a * Math.pow(phiz.currentT / 1000, 2)) / 2);
  phiz.currentS = phiz.Vx * phiz.currentT / 1000;

  if (phiz.currentT < phiz.fullT) {
    positionPlacement();
    phiz.currentT += 100;
  } else if (phiz.currentT > phiz.fullT) {
    i = 0;
    end();
  };
  if (phiz.currentS > phiz.fullS * 0.4) {
    checkCollision();
  };
  //console.log(i + ' : ' + phiz.currentS);
  //console.log(i + ' : ' + phiz.currentH);

  i++;
};

function positionPlacement() {
  projectile.model.style.top = 80 - phiz.currentH + 'rem';
  projectile.model.style.left = phiz.currentS + 'rem';
  canvas.moveTo(phiz.previousS * fontSize, (80 - phiz.previousH) * fontSize);
  canvas.lineTo(phiz.previousS * fontSize, (80 - phiz.previousH) * fontSize);
  canvas.stroke();
};

function stop() {
  console.log('stop');
  clearInterval(iteration);
  ufo.model.style.border = '0.4rem dotted var(--red)';
};

function end() {
  console.log('end');
  stop();

  projectile.model.style.top = 80 - phiz.currentH + 'rem';
  projectile.model.style.left = phiz.fullS + 'rem';

  phiz.currentT = 100;
  phiz.currentS = 0;
  phiz.currentH = 0;
  projectile.model.style.top = '80rem';
};

function checkCollision() {
  //distance = Math.sqrt(Math.pow(ufo.left - phiz.currentS, 2) + Math.pow(ufo.top - phiz.currentH, 2));
  //console.log(distance);
  dx = ufo.left - phiz.currentS;
  dy = ufo.top - phiz.currentH;
  console.log(dx);
  console.log(dy);
  if (dx >= -4.5 && dx<= 4.5 && dy >= -3.5 && dy <= 3.5) {
    console.log('collision');
    stop();
  };
  if (phiz.currentS >= 140) {
    console.log('right border');
    stop();
  };
  if (phiz.currentH < 0) {
    console.log('bottom border');
    stop();
  };
};
