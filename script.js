if ('serviceWorker' in navigator) {
  const SW = navigator.serviceWorker;
  SW.register('./sw.js');
  SW.ready.then(function () {
    SW.addEventListener('message', function (e) {
      console.log(e.data);
    });
    console.log(SW);
    SW.postMessage('msg')
  })
};

const fire = document.querySelector('#fire');
      projectile = document.querySelector('#projectile');
      launcher = document.querySelector('#launcher');
let ufo = {
      model: document.querySelector('#ufo'),
      left: 0,
      top: 0,
    };
    previousFontSize = 0;
    fontSize = 1;
    canvasElement = document.querySelector('canvas');
    canvas = canvasElement.getContext('2d');
    distance = 0;
    dx = 0;
    dy = 0;
let beforeIteration;
let iteration;
let afterIteration;

window.addEventListener('load', normalize);
window.addEventListener('resize', normalize);

function normalize() {
  console.log('normalize');
  previousFontSize = fontSize;
  fontSize = parseInt(getComputedStyle(document.documentElement).fontSize.match(/\d/g).join(''));
  if (previousFontSize != fontSize) {
    console.log('new canvas size');
    canvasElement.width = 140 * fontSize;
    canvasElement.height = 80 * fontSize;
  };
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

    document.querySelector('[name="velocity"]').value = phiz.V0;
    document.querySelector('[name="height"]').value = phiz.H;
    document.querySelector('[name="angle"]').value = phiz.alpha;
  };
  projectile.style.top = 80 - phiz.H + 'rem';
  launcher.style.top = 80 - 4 - phiz.H + 'rem';
  launcher.style.transform = 'rotateZ(' + (90 - phiz.alpha) + 'deg)';
};

for (let input of document.querySelectorAll('input')) {
  input.addEventListener('focus', focus);
  input.addEventListener('input', change);
  input.addEventListener('blur', blur);
};

function focus() {
  this.placeholder = '';
};
function change() {
  this.value = this.value.replace(this.value.match(/[\D]/g), '');
  switch (this.name) {
    case 'velocity':
      if (this.value >= 60) this.value = 60;
      break;
    case 'height':
      if (this.value >= 60) this.value = 60;
      projectile.style.top = 80 - this.value + 'rem';
      launcher.style.top = 80 - 4 - this.value + 'rem';
      break;
    case 'angle':
      if (this.value >= 90) this.value = 90;
      launcher.style.transform = 'rotateZ(' + (90 - this.value) + 'deg)';
      break;
  };
};
function blur() {
  console.log(this.value);
  switch (this.name) {
    case 'velocity':
      if (!this.value) {this.placeholder = phiz.V0;}
      else {
        if (this.value >= 60) this.value = 60;
        phiz.V0 = +this.value;
      };
      break;
    case 'height':
      if (!this.value) {
        this.placeholder = phiz.H;
        projectile.style.top = 80 - phiz.H + 'rem';
        launcher.style.top = 80 - 4 - phiz.H + 'rem';
      }
      else {
        if (this.value >= 60) this.value = 60;
        phiz.H = +this.value;
      };
      break;
    case 'angle':
      if (!this.value) {
        this.placeholder = phiz.alpha;
        launcher.style.transform = 'rotateZ(' + (90 - phiz.alpha) + 'deg)';
      }
      else {
        if (this.value >= 90) this.value = 90;
        phiz.alpha = +this.value;
      };
      break;
  };
};

let phiz = {
  EField: false,
  MField: false,
  m: 1e-8,
  q: 1e-7,
  E: 2,
  B: 0.1,
  V0: 55,
  Vx: 0,
  Vy: 0,
  alpha: 45,
  H: 15,
  a: 0,
  omega: 0,
  Cx: 0,
  Cy: 0,
  R: 0,
  fullS: 0,
  currentS: 0,
  previousS: 0,
  currentH: 0,
  previousH: 0,
  currentT: 100, //ms
  fullT: 0, //ms
};

function setUfo() {
  if (!phiz.MField) {
    ufo.left = 80 + Math.round(Math.random() * 45);
    ufo.top = 30 + Math.round(Math.random() * 35);
  };
  if (!phiz.EField && phiz.MField) {
    ufo.left = 40 + Math.round(Math.random() * 60);
    ufo.top = 10 + Math.round(Math.random() * 40);
  };
  if (phiz.EField && phiz.MField) {
    ufo.left = 80 + Math.round(Math.random() * 45);
    ufo.top = 10 + Math.round(Math.random() * 40);
  };
  ufoPlacement();
};

function ufoPlacement() {
  ufo.model.style.left = ufo.left + 'rem';
  ufo.model.style.top = 80 - ufo.top - 7 + 'rem';
  document.querySelector('#ufoX').textContent = ufo.left;
  document.querySelector('#ufoY').textContent = ufo.top;
};

function start() {
  canvas.beginPath();
  canvas.moveTo(0, (80 - phiz.H) * fontSize);
  phiz.currentH = phiz.H;
  beforePositionCalculator();
  beforeIteration = setInterval(beforePositionCalculator, 100);

  if (!phiz.EField && !phiz.MField) {
    NPositionCalculator();
    iteration = setInterval(NPositionCalculator, 100);
  };
  if (phiz.EField && !phiz.MField) {
    EStart();
    EPositionCalculator();
    iteration = setInterval(EPositionCalculator, 100);
  };
  if (!phiz.EField && phiz.MField) {
    MStart();
    MPositionCalculator();
    iteration = setInterval(MPositionCalculator, 100);
  };
  if (phiz.EField && phiz.MField) {
    EMStart();
    EMPositionCalculator();
    iteration = setInterval(EMPositionCalculator, 100);
  };

  afterIteration = setInterval(afterPositionCalculator, 100);
};

function beforePositionCalculator() {
  phiz.previousH = phiz.currentH;
  phiz.previousS = phiz.currentS;
};
function afterPositionCalculator() {
  positionPlacement();
  phiz.currentT += 100;
  checkCollision();
};

function NPositionCalculator() {
  phiz.currentS = phiz.V0 * (phiz.currentT / 1000);
  phiz.currentH = phiz.H + Math.tan(phiz.alpha * Math.PI / 180) * phiz.currentS;
};

function EStart() {
  phiz.a = phiz.q * phiz.E / phiz.m;
  phiz.Vx = phiz.V0 * Math.cos(phiz.alpha * Math.PI / 180);
  phiz.Vy = phiz.V0 * Math.sin(phiz.alpha * Math.PI / 180);

  phiz.fullT = ( phiz.Vy + Math.sqrt(Math.pow(phiz.Vy, 2) + 2 * phiz.a * phiz.H) ) / phiz.a * 1000;
  phiz.fullS = phiz.Vx * phiz.fullT / 1000;
};
function EPositionCalculator() {
  phiz.currentH = phiz.H + (phiz.Vy * (phiz.currentT / 1000) - phiz.a * Math.pow(phiz.currentT / 1000, 2) / 2);
  phiz.currentS = phiz.Vx * phiz.currentT / 1000;

  if (phiz.currentT >= phiz.fullT) {
    end();
  };
};

function MStart() {
  phiz.omega = phiz.q * phiz.B / phiz.m;
  phiz.R = phiz.V0 / phiz.omega;
  phiz.Cx = phiz.R * Math.sin(phiz.alpha * Math.PI / 180);
  phiz.Cy = phiz.R * Math.cos(phiz.alpha * Math.PI / 180);

  phiz.fullT = (2 * Math.PI / phiz.omega) * 1000;
};
function MPositionCalculator() {
  phiz.currentH = phiz.H - phiz.Cy + phiz.R * Math.cos( phiz.omega * (phiz.currentT / 1000) - (phiz.alpha * Math.PI / 180) );
  phiz.currentS = phiz.Cx + phiz.R * Math.sin( phiz.omega * (phiz.currentT / 1000) - (phiz.alpha * Math.PI / 180) );

  if (phiz.currentT >= phiz.fullT) {
    end();
  };
};

function EMStart() {
  phiz.omega = phiz.q * phiz.B / phiz.m;
  phiz.Vx = phiz.V0 * Math.cos(phiz.alpha * Math.PI / 180);
  phiz.Vy = phiz.V0 * Math.sin(phiz.alpha * Math.PI / 180);

  phiz.R = Math.sqrt( Math.pow(phiz.Vx - (phiz.E / phiz.B), 2) + Math.pow(phiz.Vy, 2) ) / phiz.omega;
  phiz.Cx = phiz.R * Math.cos(phiz.alpha * Math.PI / 180);
  phiz.Cy = -1 * (phiz.R * Math.sin(phiz.alpha * Math.PI / 180));

  phiz.fullT = (2 * Math.PI / phiz.omega) * 1000;
};
function EMPositionCalculator() {
  phiz.currentH = phiz.H + ( phiz.Cy + phiz.R * Math.sin( phiz.omega * (phiz.currentT / 1000) + ( (phiz.alpha) * Math.PI / 180) ) );
  phiz.currentS = phiz.Cx - phiz.R * Math.cos( phiz.omega * (phiz.currentT / 1000) + ( (phiz.alpha) * Math.PI / 180) ) + ( phiz.E * (phiz.currentT / 1000) ) / phiz.B;

  if (phiz.currentH <= 0) phiz.currentH = 0;
};

function positionPlacement() {
  projectile.style.top = 80 - phiz.currentH + 'rem';
  projectile.style.left = phiz.currentS + 'rem';
  canvas.moveTo(phiz.previousS * fontSize, (80 - phiz.previousH) * fontSize);
  canvas.lineTo(phiz.previousS * fontSize, (80 - phiz.previousH) * fontSize);
  canvas.stroke();
};

function stop() {
  console.log('stop');
  clearInterval(beforeIteration);
  clearInterval(iteration);
  clearInterval(afterIteration);
};

function end() {
  console.log('end');
  stop();

  projectile.style.top = 80 - phiz.currentH + 'rem';
  projectile.style.left = phiz.fullS + 'rem';

  if (phiz.EField && !phiz.MField) {
    projectile.style.top = '80rem';
  };
  fail();
};

function checkCollision() {
  distance = Math.sqrt(Math.pow(ufo.left - phiz.currentS, 2) + Math.pow(ufo.top - phiz.currentH, 2));
  dx = ufo.left - phiz.currentS;
  dy = ufo.top - phiz.currentH;
  if (dx >= -4.5 && dx<= 4.5 && dy >= -3.5 && dy <= 3.5 && distance <= 4.5) {
    console.log('collision');
    stop();
    ufo.model.style.border = '0.4rem dotted var(--red)';
    win();
  };
  if (phiz.currentS >= 140) {
    console.log('right border');
    stop();
    projectile.style.left = '140rem';
    fail();
  };
  if (phiz.currentH < 0) {
    console.log('bottom border');
    stop();
    projectile.style.top = '80rem';
    fail();
  };
  if (!phiz.EField && !phiz.MField && phiz.currentH >= 80) {
    console.log('top border');
    stop();
    projectile.style.top = '0rem';
    fail();
  };
};

function win() {
  console.log('win');
  show(document.querySelector('#winBlock'));
};
function fail() {
  console.log('fail');
  show(document.querySelector('#failBlock'));
};

show(document.querySelector('#startBlock'));

document.querySelector('#start').addEventListener('click', () => {
  hide(document.querySelector('#startBlock'));
  setUfo();
  showBlock(document.querySelector('#controlsBlock'));
});

fire.addEventListener('click', startFlight);

function startFlight() {
  hideBlock(document.querySelector('#controlsBlock'));
  start();
};

document.querySelector('#q').textContent = phiz.q;
document.querySelector('#m').textContent = phiz.m;
document.querySelector('#E').textContent = 0;
document.querySelector('#B').textContent = 0;

document.querySelector('#win').addEventListener('click', next);
document.querySelector('#fail').addEventListener('click', reentry);
document.querySelector('#reload').addEventListener('click', function () {
  document.location.reload();
});

function next() {
  hide(document.querySelector('#winBlock'));

  if (phiz.EField && phiz.MField) {
    show(document.querySelector('#finishBlock'));
    return;
  };
  if (!phiz.EField && phiz.MField) {
    phiz.EField = true;
    document.querySelector('#E').textContent = phiz.E;
    document.querySelector('#electro').style.opacity = '1';
  };
  if (phiz.EField && !phiz.MField) {
    phiz.EField = false;
    phiz.MField = true;
    document.querySelector('#E').textContent = 0;
    document.querySelector('#B').textContent = phiz.B;
    document.querySelector('#electro').style.opacity = '0';
    document.querySelector('#magnetic').style.opacity = '1';
  };
  if (!phiz.EField && !phiz.MField) {
    phiz.EField = true;
    document.querySelector('#E').textContent = phiz.E;
    document.querySelector('#electro').style.opacity = '1';
  };

  setUfo();
  backToStart();
};

function reentry() {
  hide(document.querySelector('#failBlock'));
  backToStart();
};

function backToStart() {
  canvas.clearRect(0, 0, canvasElement.width, canvasElement.height);
  phiz.currentT = 100;
  phiz.currentS = 0;
  projectile.style.top = 80 - phiz.H + 'rem';
  projectile.style.left = '0';
  ufo.model.style.border = 'none';
  showBlock(document.querySelector('#controlsBlock'));
};

function showBlock(block) {
  block.classList.contains('hideBlock') ?
  block.classList.replace('hideBlock','showBlock') : block.classList.add('showBlock');

  block.style.display = 'block';
  setTimeout( () => {
    block.classList.add('showBlock');
  }, 40 );
};
function hideBlock(block) {
  block.classList.contains('showBlock') ?
  block.classList.replace('showBlock','hideBlock') : block.classList.add('hideBlock');

  block.style.display = 'block';
  setTimeout( () => {
    block.classList.add('hideBlock');
  }, 40 );
};
function show(block) {
  block.classList.contains('hide') ?
  block.classList.replace('hide','show') : block.classList.add('show');

  block.style.display = 'flex';
  setTimeout( () => {
    block.classList.add('show');
  }, 40 );
};
function hide(block) {
  block.classList.contains('show') ?
  block.classList.replace('show','hide') : block.classList.add('hide');

  setTimeout( () => {
    block.style.display = 'none';
  }, 500 );
};
