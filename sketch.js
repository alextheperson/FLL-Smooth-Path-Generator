let linePoints = [[100, 300], [100, 100], [200, 200], [275, 100], [300, 200], [400, 100], [500, 100]];
let curvedPoints = [];
let curveness = 10;
let resolution = 1;

let gridOffset = [0, 0];
let gridScale = 1;

let original = true;
let quadratic = false;
let approxQuadratic = false
let catmull = false;

let sliderCurveness, sliderResolution, showOriginal, showQuadratic, showApproxQuadratic, showCatmull;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  sliderCurveness = document.getElementById("curviness");
  sliderResolution = document.getElementById("resolution");

  showOriginal = document.getElementById("original")
  showQuadratic = document.getElementById("quadratic")
  showApproxQuadratic = document.getElementById("approxQuadratic")
  showCatmull = document.getElementById("catmull")

  background(255);
  strokeJoin(BEVEL);

  textAlign(CENTER, CENTER);

  gridOffset = [Math.round(width / 2), Math.round(height / 2)];
}

function draw() {
  resizeCanvas(window.innerWidth, window.innerHeight)
  background(255);
  curveness = float(sliderCurveness.value);
  resolution = int(sliderResolution.value);

  original = showOriginal.checked;
  quadratic = showQuadratic.checked;
  approxQuadratic = showApproxQuadratic.checked;
  catmull = showCatmull.checked;
  
  if (mouseIsPressed) {
    gridOffset[0] = gridOffset[0] + movedX;
    gridOffset[1] = gridOffset[1] + movedY;

    gridOffset[0] = constrain(gridOffset[0], -1000, 1000);
    gridOffset[1] = constrain(gridOffset[1], -1000, 1000);
  }

  push();
  scale(gridScale);
  translate(gridOffset[0], gridOffset[1]);

  drawGrid();
  
  if (original) drawOriginal();
  if (quadratic) drawQuadratic();
  if (catmull) drawCatmullSpline();
  if (approxQuadratic) drawApproxQuadratic();
  drawMarkers();
  pop();
}

function mouseWheel(event) {
  gridScale += (event.delta * -0.01);
  gridScale = constrain(gridScale, 1, 2)
  return false;
}

function drawGrid() {
  let viewStart = [-gridOffset[0], -gridOffset[1]];
  let viewEnd = [(viewStart[0] + width), (viewStart[1] + height)];

  push();
  strokeWeight(1);

  stroke(220);
  drawGridlines(10, viewStart, viewEnd);
  stroke(160);
  drawGridlines(50, viewStart, viewEnd);
  stroke(20);
  drawGridlines(100, viewStart, viewEnd);

  strokeWeight(2);
  stroke(0);
  line(0, viewStart[1], 0, viewEnd[1])
  line(viewStart[0], 0, viewEnd[0], 0)

  pop();
}

function drawOriginal() {
  push()
  stroke(255, 0, 0);
  strokeWeight(2);
  fill(255);
  for (let i = 1; i < linePoints.length; i++){
    line(linePoints[i-1][0], linePoints[i-1][1], linePoints[i][0], linePoints[i][1]);
  }
  pop()
}

function drawMarkers() {
  push()
  stroke(0);
  strokeWeight(2);
  fill(255);
  for (let i = 1; i < linePoints.length-1; i++){
    let prevPoint = linePoints[i-1];
    let currPoint = linePoints[i];
    let nextPoint = linePoints[i+1];
    let lerpVal = 0.5;

    let slopeOne = (currPoint[1] - prevPoint[1])/(currPoint[0] - prevPoint[0])
    let slopeTwo = (nextPoint[1] - currPoint[1])/(nextPoint[0] - currPoint[0])

    let angle = calculateAngle(slopeOne, slopeTwo)

    circle(currPoint[0], currPoint[1], 5);

    //prev segment
    segmentDistance = dist(prevPoint[0], prevPoint[1], currPoint[0], currPoint[1]);
    lerpVal = 1 - constrain(curveness / segmentDistance, 0, 0.5)
    prevControl = [lerp(prevPoint[0], currPoint[0], lerpVal), lerp(prevPoint[1], currPoint[1], lerpVal)]
    if (quadratic){
      push()
      translate(prevControl[0], prevControl[1])
      rotate(Math.atan(slopeOne) + HALF_PI)
      centeredTriangle(0, 0, 5)
      pop()
    }

    //next segment
    segmentDistance = dist(currPoint[0], currPoint[1], nextPoint[0], nextPoint[1]);
    lerpVal = constrain(curveness / segmentDistance, 0, 0.5)
    nextControl = [lerp(currPoint[0], nextPoint[0], lerpVal), lerp(currPoint[1], nextPoint[1], lerpVal)]
    if (quadratic){
      push()
      translate(nextControl[0], nextControl[1])
      rotate(Math.atan(slopeTwo) - HALF_PI)
      centeredTriangle(0, 0, 5)
      pop()
    }

    push();
    strokeWeight(3);
    stroke(255);
    fill(0);
    text((angle * (180/PI)).toFixed(1) + "º", currPoint[0] - 25, currPoint[1]);
    pop();
  }

  if (approxQuadratic){
    for (let i = 0; i < curvedPoints.length; i++){
      centeredSquare(curvedPoints[i][0], curvedPoints[i][1], 5);
    }
  }

  circle(linePoints[0][0], linePoints[0][1], 5)
  circle(linePoints[linePoints.length-1][0], linePoints[linePoints.length-1][1], 5)
  pop()
}

function drawQuadratic() {
  push();
  stroke(0, 0, 255);
  strokeWeight(2);
  noFill();
  beginShape();
  vertex(linePoints[0][0], linePoints[0][1]);

  for (let i = 1; i < linePoints.length-1; i++){
    let prevPoint = linePoints[i-1];
    let currPoint = linePoints[i];
    let nextPoint = linePoints[i+1];

    segmentDistance = dist(prevPoint[0], prevPoint[1], currPoint[0], currPoint[1]);
    lerpVal = 1 - constrain(curveness / segmentDistance, 0, 0.5)
    prevControl = [lerp(prevPoint[0], currPoint[0], lerpVal), lerp(prevPoint[1], currPoint[1], lerpVal)]

    segmentDistance = dist(currPoint[0], currPoint[1], nextPoint[0], nextPoint[1]);
    lerpVal = constrain(curveness / segmentDistance, 0, 0.5)
    nextControl = [lerp(currPoint[0], nextPoint[0], lerpVal), lerp(currPoint[1], nextPoint[1], lerpVal)]

    vertex(prevControl[0], prevControl[1])
    quadraticVertex(currPoint[0], currPoint[1], nextControl[0], nextControl[1])
  }
  vertex(linePoints[linePoints.length-1][0], linePoints[linePoints.length-1][1]);
  endShape()
  pop()
}

function drawApproxQuadratic() {
  push()
  stroke(255, 0, 255);
  strokeWeight(2);
  fill(255);

  curvedPoints = [[linePoints[0], linePoints[1]]];

  for (let i = 1; i < linePoints.length-1; i++){
    subdivideCurve(i);
  }

  for (let i = 1; i < curvedPoints.length; i++){
    line(curvedPoints[i-1][0], curvedPoints[i-1][1], curvedPoints[i][0], curvedPoints[i][1]);
  }
  pop()
}

function drawCatmullSpline() {
  push();
  noFill();
  stroke(0, 200, 0);
  strokeWeight(2)
  beginShape();
  curveVertex(linePoints[0][0], linePoints[0][1]);
  for (let i = 0; i < linePoints.length; i++){
    curveVertex(linePoints[i][0], linePoints[i][1]);
  }
  curveVertex(linePoints[linePoints.length-1][0], linePoints[linePoints.length-1][1]);
  endShape();
  pop();
}

function drawGridlines(depth, start, end) {
  for (let i = start[0]; i < end[0]; i++){
    if (i % depth == 0) {
      line(i, start[1], i, end[1])
    }
  }
  for (let i = start[1]; i < end[1]; i++){
    if (i % depth == 0) {
      line(start[0], i, end[0], i)
    }
  }
}

function calculateAngle(slopeOne, slopeTwo) {
  let angleOne = Math.abs(Math.atan(slopeOne))
  let angleTwo = Math.abs(Math.atan(slopeTwo))

  let angle = PI - (angleOne + angleTwo)

  if (slopeOne == slopeTwo) {
    angle = PI;
  }

  return angle;
}

function subdivideCurve(i) {
  let prevPoint = linePoints[i-1];
  let currPoint = linePoints[i];
  let nextPoint = linePoints[i+1];

  segmentDistance = dist(prevPoint[0], prevPoint[1], currPoint[0], currPoint[1]);
  lerpVal = 1 - constrain(curveness / segmentDistance, 0, 0.5)
  prevControl = [lerp(prevPoint[0], currPoint[0], lerpVal), lerp(prevPoint[1], currPoint[1], lerpVal)]

  segmentDistance = dist(currPoint[0], currPoint[1], nextPoint[0], nextPoint[1]);
  lerpVal = constrain(curveness / segmentDistance, 0, 0.5)
  nextControl = [lerp(currPoint[0], nextPoint[0], lerpVal), lerp(currPoint[1], nextPoint[1], lerpVal)]

  let step = 1 / (resolution + 1);

  for (let j = 0; j <= 1; j += step) {
    let pointX = ((1-j)**2)*prevControl[0] + 2*(1-j)*j*currPoint[0]+(j**2)*nextControl[0]
    let pointY = ((1-j)**2)*prevControl[1] + 2*(1-j)*j*currPoint[1]+(j**2)*nextControl[1]

    curvedPoints.push([pointX, pointY]);
  }
}