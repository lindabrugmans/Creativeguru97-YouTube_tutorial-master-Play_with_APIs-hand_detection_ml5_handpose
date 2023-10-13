let handpose;
let detections = [];

let canvas;
let video;
let painting;
let ratio;

let brushPos
let brushPosOld
let isPainting = false;

function setup() {
  // canvas = createCanvas(640, 480, WEBGL);
  canvas = createCanvas(1024, 768, WEBGL);//3D mode!!! 320 240
  canvas.id("canvas");

  painting = createGraphics(width, height);
  painting.background(255);

  brushPos = createVector(0, 0, 0)
  brushPosOld = createVector(0, 0, 0)

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
      console.log("updating");
    }
    else {
      // brushPosOld = brushPos;
      console.log("reset");
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

    painting.fill(0, 0, 255);
    // painting.ellipse(brushPos.x * ratio, brushPos.y * ratio, 20);
    painting.strokeWeight(10);
    painting.line(brushPos.x * ratio, brushPos.y * ratio, brushPosOld.x * ratio, brushPosOld.y * ratio);

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
    drawLandmarks([4, 5], 60);//thumb
    // drawLandmarks([1, 5], 60);//thumb

    // drawLandmarks([5, 9], 120);//index finger
    drawLandmarks([8, 9], 120);//index finger

    // drawLandmarks([9, 13], 180);//middle finger
    // drawLandmarks([13, 17], 240);//ring finger
    // drawLandmarks([17, 21], 300);//pinky
  }

}

// pinch
// thumb & index finger at the same coördinate
// nr 4 -> last dot



function drawLandmarks(indexArray, hue) {
  noFill();
  strokeWeight(10);
  for (let i = 0; i < detections.length; i++) {
    for (let j = indexArray[0]; j < indexArray[1]; j++) {
      let x = detections[i].landmarks[j][0];
      let y = detections[i].landmarks[j][1];
      let z = detections[i].landmarks[j][2];
      stroke(hue, 40, 255);
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
