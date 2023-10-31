let handpose;
let detections = [];

let canvas;
let video;
let painting;
let ratio;

let brushPos
let brushPosOld
let isPainting = false;

let brushPosTwoRed
let brushPosOldRed
let isPaintingRed = false;

function setup() {
  // canvas = createCanvas(640, 480, WEBGL);
  canvas = createCanvas(1024, 768, WEBGL);//3D mode!!! 320 240
  canvas.id("canvas");

  painting = createGraphics(width, height);
  painting.background(255);

  brushPos = createVector(0, 0, 0)
  brushPosOld = createVector(0, 0, 0)
  
  brushPosRed = createVector(0, 0, 0)
  brushPosOldRed = createVector(0, 0, 0)

  let constraints = {
    video: {
      mandatory: {
        minWidth: 640,
        minHeight: 480
      },
      optional: [{ maxFrameRate: 30 }]
    },
    audio: false
  };

  video = createCapture(constraints, function (stream) {
    console.log(stream);
  });

  ratio = 1.6; //width / video.width;

  // video.id("video");
  // video.size(width, height);

  const options = {
    flipHorizontal: false, // boolean value for if the video should be flipped, defaults to false
    // maxContinuousChecks: 0.1, // How many frames to go without running the bounding box detector. Defaults to infinity, but try a lower value if the detector is consistently producing bad predictions.
    // detectionConfidence: 0.8, // Threshold for discarding a prediction. Defaults to 0.8.
    scoreThreshold: 0.75, // A threshold for removing multiple (likely duplicate) detections based on a "non-maximum suppression" algorithm. Defaults to 0.75
    iouThreshold: 0.3, // A float representing the threshold for deciding whether boxes overlap too much in non-maximum suppression. Must be between [0, 1]. Defaults to 0.3.
  }

  handpose = ml5.handpose(video, options, modelReady);
  // colorMode(HSB);
}

function modelReady() {
  console.log("Model ready!");
  handpose.on('predict', results => {
    detections = results;
    // console.log(detections);
  });
}

function update() {
  if (detections.length > 0) {
    let xThumb = detections[0].landmarks[4][0];
    let yThumb = detections[0].landmarks[4][1];
    let zThumb = detections[0].landmarks[4][2];

    let xPinky = detections[0].landmarks[20][0];
    let yPinky = detections[0].landmarks[20][1];
    let zPinky = detections[0].landmarks[20][2];

    let v1 = createVector(xThumb, yThumb, zThumb);
    let v2 = createVector(xPinky, yPinky, zPinky);

    let dist = v1.dist(v2);

    brushPosOldRed = brushPosRed;
    brushPosRed = v1;

    if (dist < 40) {
      isPaintingRed = true;
      // console.log("updating 2");
    }
    else {
      // brushPosOld = brushPos;
      // console.log("reset 2");
      isPaintingRed = false;
    }
    // console.log(dist);
  }
  else {
    isPaintingRed = false;
  }

if (detections.length > 0) {
  let xThumb = detections[0].landmarks[4][0];
  let yThumb = detections[0].landmarks[4][1];
  let zThumb = detections[0].landmarks[4][2];

  let xIndex = detections[0].landmarks[8][0];
  let yIndex = detections[0].landmarks[8][1];
  let zIndex = detections[0].landmarks[8][2];

  let v1 = createVector(xThumb, yThumb, zThumb);
  let v2 = createVector(xIndex, yIndex, zIndex);

  let dist = v1.dist(v2); // distance is 

  brushPosOld = brushPos;
  brushPos = v1;

  if (dist < 40) {
    isPainting = true;
    // console.log("updating");
  }
  else {
    // brushPosOld = brushPos;
    // console.log("reset");
    isPainting = false;
  }
  // console.log(dist);
}
else {
  isPainting = false;
}
  // console.log(brushPos, brushPosOld)
}

function draw() {
  update();
  background(0);
  //clear();
  //In webgl mode, origin of the coordinate setted to centre.
  //So I re-positioned it to top-left.
  translate(-width / 2, -height / 2);

  if (isPainting) {
    painting.fill(0, 255, 0);
    painting.stroke('green');
    // painting.ellipse(brushPos.x * ratio, brushPos.y * ratio, 20);
    painting.strokeWeight(10);
    painting.line(brushPos.x * ratio, brushPos.y * ratio, brushPosOld.x * ratio, brushPosOld.y * ratio);
  }

  if(isPaintingRed){
    painting.fill(0, 255, 0);
    painting.stroke('red');
    // painting.ellipse(brushPos.x * ratio, brushPos.y * ratio, 20);
    painting.strokeWeight(10);
    painting.line(brushPosRed.x * ratio, brushPosRed.y * ratio, brushPosOldRed.x * ratio, brushPosOldRed.y * ratio);
  }

  image(painting, 0, 0, width, height);

  tint(255, 255, 255, 30);
  push();
  // scale(-1, 1);
  image(video, 0, 0, width, width * video.height / video.width);
  pop();

  noTint();

  if (detections.length > 0) {
    // drawLines([0, 5, 9, 13, 17, 0]);//palm
    // drawLines([0, 1, 2, 3, 4]);//thumb
    // drawLines([5, 6, 7, 8]);//index finger 
    // drawLines([9, 10, 11, 12]);//middle finger
    // drawLines([13, 14, 15, 16]);//ring finger
    // drawLines([17, 18, 19, 20]);//pinky

    // drawLandmarks([0, 1], 0);//palm base
    // drawLandmarks([1, 5], 60);//thumb
    // drawLandmarks([5, 9], 120);//index finger
    // drawLandmarks([9, 13], 180);//middle finger
    // drawLandmarks([13, 17], 240);//ring finger
    // drawLandmarks([17, 21], 300);//pinky

    // mainpoints fingers
    drawLandmarks([0, 1, 0]); // palm base
    drawLandmarks([4, 5], 60); //thumb 
    drawLandmarks([8, 9], 120); //index finger 
    drawLandmarks([12, 13, 180]); // middle finger
    drawLandmarks([16, 17, 240]); // ring finger
    drawLandmarks([20, 21, 300]); // pinky
  }
}

function drawLandmarks(indexArray, hue) {
  noFill();
  strokeWeight(10);
  for (let i = 0; i < detections.length; i++) {
    for (let j = indexArray[0]; j < indexArray[1]; j++) {
      let x = detections[i].landmarks[j][0];
      let y = detections[i].landmarks[j][1];
      let z = detections[i].landmarks[j][2];
      stroke(hue, 80, 255);
      point(x * ratio, y * ratio);
    }
  }
}

function drawLines(index) {
  stroke(0, 0, 255);
  strokeWeight(3);
  for (let i = 0; i < detections.length; i++) {
    for (let j = 0; j < index.length - 1; j++) {
      let x = detections[i].landmarks[index[j]][0];
      let y = detections[i].landmarks[index[j]][1];
      let z = detections[i].landmarks[index[j]][2];

      let _x = detections[i].landmarks[index[j + 1]][0];
      let _y = detections[i].landmarks[index[j + 1]][1];
      let _z = detections[i].landmarks[index[j + 1]][2];
      line(x * ratio, y * ratio, 0, _x * ratio, _y * ratio, 0);
    }
  }
}
