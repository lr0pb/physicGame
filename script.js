const fire = document.querySelector('#fire');
let projectile = {
      model: document.querySelector('#projectile'),
      radius: 0.5,
    };
    ufo = {
      model: document.querySelector('#ufo'),
      radius: 4.5,
      left: 0,
      top: 0,
    };

fire.addEventListener('click', startFlight);

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
  currentS: 0,
  fullS: 0,
  H: 15,
  currentH: 0,
  currentT: 100, //ms
  fullT: 0, //ms
};
let iteration;
    distance = 100;
    i = 1;

function setUfo() {
  if (phiz.EField && !phiz.MField) {
    ufo.left = 80 + Math.round(Math.random() * 45);
    ufo.top = 30 + Math.round(Math.random() * 35);
  }
  ufoPlacement();
};

function ufoPlacement() {
  ufo.model.style.left = ufo.left + 'rem';
  ufo.model.style.top = 80 - ufo.top + 'rem';
}

setUfo();

projectile.model.style.top = 80 - phiz.H + 'rem';

function startFlight() {
  projectile.model.style.top = 80 - phiz.H + 'rem';
  projectile.model.style.left = '0';

  phiz.a = phiz.q * phiz.E / phiz.m;
  phiz.Vx = phiz.V0 * Math.cos(phiz.alpha * Math.PI / 180);
  phiz.Vy = phiz.V0 * Math.sin(phiz.alpha * Math.PI / 180);

  phiz.fullT = ( phiz.Vy + Math.sqrt(Math.pow(phiz.Vy, 2) + 2 * phiz.a * phiz.H) ) / phiz.a * 1000;
  phiz.fullS = phiz.Vx * phiz.fullT / 1000;

  console.log(phiz.fullT);
  console.log(phiz.fullS);

  positionCalculator();
  iteration = setInterval(positionCalculator, 100);
};

function positionCalculator() {
  phiz.currentH = phiz.H + (phiz.Vy * (phiz.currentT / 1000) - (phiz.a * Math.pow(phiz.currentT / 1000, 2)) / 2);
  phiz.currentS = phiz.Vx * phiz.currentT / 1000;

  if (phiz.currentT < phiz.fullT) {
    positionPlacement();
    phiz.currentT += 100;
  } else if (phiz.currentT > phiz.fullT) {
    i = 0;
    end();
  };
  if (phiz.currentS > phiz.fullS * 0.45) {
    checkCollision();
  };
  //console.log(i + ' : ' + phiz.currentS);
  console.log(i + ' : ' + phiz.currentH);

  i++;
};

function positionPlacement() {
  projectile.model.style.top = 80 - phiz.currentH + 'rem';
  projectile.model.style.left = phiz.currentS + 'rem';
};

function stop() {
  console.log('stop');
  clearInterval(iteration);
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
  distance = Math.sqrt(Math.pow(ufo.left - phiz.currentS, 2) + Math.pow(ufo.top - phiz.currentH, 2));
  console.log(distance);
  if (distance <= 4) {
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
