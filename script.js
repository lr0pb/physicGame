const fire = document.querySelector('#fire');
let projectile = {
      model: document.querySelector('#projectile'),
    };
    ufo = {
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
    i = 1;
let iteration;

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
  switch (this.name) {
    case 'velocity':
      if (this.value >= 60) this.value = 60;
      break;
    case 'height':
      if (this.value >= 60) this.value = 60;
      projectile.model.style.top = 80 - this.value + 'rem';
      break;
    case 'angle':
      if (this.value >= 90) this.value = 90;
      break;
  };
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
        if (this.value >= 60) this.value = 60;
        phiz.H = +this.value;
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
  MField: true,
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

document.querySelector('#q').textContent = phiz.q;
document.querySelector('#m').textContent = phiz.m;
document.querySelector('#E').textContent = phiz.E;
document.querySelector('#B').textContent = phiz.B;

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

setUfo();

function startFlight() {
  projectile.model.style.top = 80 - phiz.H + 'rem';
  projectile.model.style.left = '0';

  document.querySelector('#controlsBlock').style.display = 'none';

  fire.dataset.ready;

  if (!phiz.EField && !phiz.MField) {
    NStart();
  }
  if (phiz.EField && !phiz.MField) {
    EStart();
  };
  if (!phiz.EField && phiz.MField) {
    MStart();
  };
  if (phiz.EField && phiz.MField) {
    EMStart();
  };
};

function NStart() {
  canvas.beginPath();
  canvas.moveTo(0, (80 - phiz.H) * fontSize);
  phiz.currentH = phiz.H;
  NPositionCalculator();
  iteration = setInterval(NPositionCalculator, 100);
};

function NPositionCalculator() {
  phiz.previousH = phiz.currentH;
  phiz.previousS = phiz.currentS;
  phiz.currentS = phiz.V0 * (phiz.currentT / 1000);
  phiz.currentH = phiz.H + Math.tan(phiz.alpha * Math.PI / 180) * phiz.currentS;

  positionPlacement();
  phiz.currentT += 100;
  checkCollision();

  //console.log(i + ' : ' + phiz.currentS);
  console.log(i + ' : ' + phiz.currentH);
  i++;
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
  phiz.currentH = phiz.H + (phiz.Vy * (phiz.currentT / 1000) - phiz.a * Math.pow(phiz.currentT / 1000, 2) / 2);
  phiz.currentS = phiz.Vx * phiz.currentT / 1000;

  if (phiz.currentT < phiz.fullT) {
    positionPlacement();
    phiz.currentT += 100;
  } else {
    i = 0;
    end();
  };
  if (phiz.currentS > phiz.fullS * 0.4) {
    checkCollision();
  };
  //console.log(i + ' : ' + phiz.currentS);
  console.log(i + ' : ' + phiz.currentH);
  i++;
};

function MStart() {
  phiz.omega = phiz.q * phiz.B / phiz.m;
  phiz.R = phiz.V0 / phiz.omega;
  phiz.Cx = phiz.R * Math.sin(phiz.alpha * Math.PI / 180);
  phiz.Cy = phiz.R * Math.cos(phiz.alpha * Math.PI / 180);

  phiz.fullT = (2 * Math.PI / phiz.omega) * 1000;

  console.log(phiz.fullT);

  canvas.beginPath();
  canvas.moveTo(0, (80 - phiz.H) * fontSize);
  phiz.currentH = phiz.H;
  MPositionCalculator();
  iteration = setInterval(MPositionCalculator, 100);
};

function MPositionCalculator() {
  phiz.previousH = phiz.currentH;
  phiz.previousS = phiz.currentS;
  phiz.currentH = phiz.H - phiz.Cy + phiz.R * Math.cos( phiz.omega * (phiz.currentT / 1000) - (phiz.alpha * Math.PI / 180) );
  phiz.currentS = phiz.Cx + phiz.R * Math.sin( phiz.omega * (phiz.currentT / 1000) - (phiz.alpha * Math.PI / 180) );

  if (phiz.currentT < phiz.fullT) {
    positionPlacement();
    phiz.currentT += 100;
  } else {
    i = 0;
    end();
  };
  checkCollision();
  //console.log(i + ' : ' + phiz.currentS);
  console.log(i + ' : ' + phiz.currentH);
  i++;
};


function EMStart() {
  phiz.omega = phiz.q * phiz.B / phiz.m;
  phiz.Vx = phiz.V0 * Math.cos(phiz.alpha * Math.PI / 180);
  phiz.Vy = phiz.V0 * Math.sin(phiz.alpha * Math.PI / 180);

  phiz.R = Math.sqrt( Math.pow(phiz.Vx - (phiz.E / phiz.B), 2) + Math.pow(phiz.Vy, 2) ) / phiz.omega;
  phiz.Cx = phiz.R * Math.cos(phiz.alpha * Math.PI / 180);
  phiz.Cy = -1 * (phiz.R * Math.sin(phiz.alpha * Math.PI / 180));

  phiz.fullT = (2 * Math.PI / phiz.omega) * 1000;

  console.log(phiz.R);
  console.log(phiz.fullT);

  canvas.beginPath();
  canvas.moveTo(0, (80 - phiz.H) * fontSize);
  phiz.currentH = phiz.H;
  EMPositionCalculator();
  iteration = setInterval(EMPositionCalculator, 100);
};

function EMPositionCalculator() {
  phiz.previousH = phiz.currentH;
  phiz.previousS = phiz.currentS;
  phiz.currentH = phiz.H + ( phiz.Cy + phiz.R * Math.sin( phiz.omega * (phiz.currentT / 1000) + ( (phiz.alpha) * Math.PI / 180) ) );
  phiz.currentS = phiz.Cx - phiz.R * Math.cos( phiz.omega * (phiz.currentT / 1000) + ( (phiz.alpha) * Math.PI / 180) ) + ( phiz.E * (phiz.currentT / 1000) ) / phiz.B;

  if (phiz.currentH <= 0) phiz.currentH = 0;

  positionPlacement();
  phiz.currentT += 100;

  checkCollision();
  //console.log(i + ' : ' + phiz.currentS);
  console.log(i + ' : ' + phiz.currentH);
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
  document.querySelector('#reload').style.display = 'block';
  document.querySelector('#reload').addEventListener('click', () => {
    document.location.reload();
  });
};

function end() {
  console.log('end');
  stop();

  projectile.model.style.top = 80 - phiz.currentH + 'rem';
  projectile.model.style.left = phiz.fullS + 'rem';

  phiz.currentT = 100;
  phiz.currentS = 0;
  phiz.currentH = 0;
  if (phiz.EField && !phiz.MField) {
    projectile.model.style.top = '80rem';
  };
};

function checkCollision() {
  distance = Math.sqrt(Math.pow(ufo.left - phiz.currentS, 2) + Math.pow(ufo.top - phiz.currentH, 2));
  //console.log('d : ' + distance);
  dx = ufo.left - phiz.currentS;
  dy = ufo.top - phiz.currentH;
  //console.log(dx);
  //console.log(dy);
  if (dx >= -4.5 && dx<= 4.5 && dy >= -3.5 && dy <= 3.5 && distance <= 4.5) {
    console.log('collision');
    stop();
    ufo.model.style.border = '0.4rem dotted var(--red)';
  };
  if (phiz.currentS >= 140) {
    console.log('right border');
    stop();
    projectile.model.style.left = '140rem';
  };
  if (!phiz.MField && phiz.currentH < 0) {
    console.log('bottom border');
    stop();
    projectile.model.style.top = '80rem';
  };
  if (!phiz.EField && !phiz.MField && phiz.currentH >= 80) {
    console.log('top border');
    stop();
    projectile.model.style.top = '0rem';
  };
};
