var vConsole = new VConsole();

//  Init

// init renderer
var renderer = new THREE.WebGLRenderer({
  antialias: true,
  precision: "highp", //333
  alpha: true,
});

renderer.setClearColor(new THREE.Color("lightgrey"), 0);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.setSize(
  document.getElementById("arMain").offsetWidth,
  document.getElementById("arMain").offsetHeight
);
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
document.getElementById("arMain").appendChild(renderer.domElement);

// array of functions for the rendering loop
var onRenderFcts = [];
var onRenderFctsmy = {};

var tetrisArToolkitContext,
  tetrisArToolkitMarker,
  tetrisMarkerRoot

// init scene and camera
var scene = new THREE.Scene();

//		Initialize a basic camera

// Create a camera
var camera = new THREE.Camera();
scene.add(camera);

tetrisMarkerRoot = new THREE.Group();
scene.add(tetrisMarkerRoot);

// handle arToolkitSource

var arToolkitSource = new THREEx.ArToolkitSource({
  // to read from the webcam
  sourceType: "webcam",

  // to read from an image
  // sourceType : 'image',
  // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',

  // to read from a video
  // sourceType : 'video',
  // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',
});

arToolkitSource.init(function onReady() {
  initARContext();
  onResize();
});

// handle resize
window.addEventListener("resize", function () {
  onResize();
});

function onResize() {
  arToolkitSource.onResizeElement();
  arToolkitSource.copyElementSizeTo(renderer.domElement);
  if (window.tetrisArToolkitContext.arController !== null) {
    arToolkitSource.copyElementSizeTo(
      window.tetrisArToolkitContext.arController.canvas
    );
  }
}

//  initialize arToolkitContext

// create atToolkitContext
function initARContext() {
  // console.log("initARContext()");

  tetrisArToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: "https://ued.united-imaging.com/doc_server/doc_server/resource/src/343c761a5174cf7f427e30ba75ceb63f.dat",
    detectionMode: "mono",
    maxDetectionRate: 30,
    canvasWidth: 80 * 3,
    canvasHeight: 60 * 3,
  });
  // initialize it
  tetrisArToolkitContext.init(function onCompvared() {
    // copy projection matrix to camera
    camera.projectionMatrix.copy(tetrisArToolkitContext.getProjectionMatrix());
    tetrisArToolkitContext.arController.orientation = getSourceOrientation();
    tetrisArToolkitContext.arController.options.orientation =
      getSourceOrientation();
    // console.log("arToolkitContext", arToolkitContext);
    window.tetrisArToolkitContext = tetrisArToolkitContext;
  });
  tetrisArToolkitMarker = new THREEx.ArMarkerControls(
    tetrisArToolkitContext,
    tetrisMarkerRoot, {
      type: "pattern",
      patternUrl: "https://ued.united-imaging.com/doc_server/doc_server/resource/src/684ee5920fdec2cf5413ecb1ac9af18f.patt",
    }
  );
}

function getSourceOrientation() {
  if (!arToolkitSource) {
    return null;
  }

  // console.log(
  //   "actual source dimensions",
  //   arToolkitSource.domElement.videoWidth,
  //   arToolkitSource.domElement.videoHeight
  // );

  if (
    arToolkitSource.domElement.videoWidth >
    arToolkitSource.domElement.videoHeight
  ) {
    // console.log("source orientation", "landscape");
    return "landscape";
  } else {
    // console.log("source orientation", "portrait");
    return "portrait";
  }
}

// update artoolkit on every frame
onRenderFcts.push(function () {
  if (!tetrisArToolkitContext || !arToolkitSource || !arToolkitSource.ready) {
    return;
  }

  tetrisArToolkitContext.update(arToolkitSource.domElement);
});

// // build a tetrisSmoothedControls
var tetrisSmoothedRoot = new THREE.Group();
scene.add(tetrisSmoothedRoot);
var tetrisSmoothedControls = new THREEx.ArSmoothedControls(tetrisSmoothedRoot, {
  lerpPosition: 0.4,
  lerpQuaternion: 0.3,
  lerpScale: 1,
});
onRenderFcts.push(function (delta) {
  tetrisSmoothedControls.update(tetrisMarkerRoot);
});
// //
// //		add an object in the scene
// //

var tetrisArWorldRoot = tetrisSmoothedRoot;


class Cube {
  constructor(type, position) {
    // ????????????
    this.type = type;
    // ?????????????????????????????????
    this.position = position;
  }
}

// ???????????????????????????20
let tetrisCubeWidth = 0.2;
// ??????10????????????20???, ?????????4
let tetrisLineWidthSeg = 9,
  tetrisLineHeightSeg = 10,
  tetrisSeg = 0.02;
// ????????????????????????
let lineWidth = tetrisCubeWidth * tetrisLineWidthSeg + tetrisSeg * (tetrisLineWidthSeg + 1);
let lineHeight = tetrisCubeWidth * tetrisLineHeightSeg + tetrisSeg * (tetrisLineHeightSeg + 1);

// ?????????????????????
let tetrisMatrix = [],
  tetrisNextMatrix = [];
// ?????????
let tetrisTimer;

let tetrisHaveStart = false;
let currentTetrisCube = null;
let nextTetrisCube = null;
let tetrisScore = 0;
let tetrisSpeed = 800;
let tetrisCanUpdate = false;
const imgUrl = "./image/cell.png";
const imgUrl1 = "./image/cell1.png";
let tetrisCountDownNum = 30;
let tetrisGameTimer = null;
let tetrisTypes = []

const ugameTetris = new UgameTetris({})

console.log(1111, ugameTetris);

//????????????
function copyArr(m) {
  return JSON.parse(JSON.stringify(m));
}

// ???
var ambient = new THREE.AmbientLight(0xffffff);
scene.add(ambient);

var directctionalLight = new THREE.DirectionalLight(0xffffff);
directctionalLight.position.set(1, 1, 1).normalize();
scene.add(directctionalLight);

//
//		render the whole thing on the page
//
// var stats = new Stats();
// document.body.appendChild(stats.dom);
// render the scene
onRenderFcts.push(function () {
  renderer.render(scene, camera);
  // stats.update();
});

// run the rendering loop
var lastTimeMsec = null;
requestAnimationFrame(function animate(nowMsec) {
  // keep looping
  requestAnimationFrame(animate);
  // measure time
  lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
  var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
  lastTimeMsec = nowMsec;
  // call each update function
  onRenderFcts.forEach(function (onRenderFct) {
    onRenderFct(deltaMsec / 1000, nowMsec / 1000);
  });
  Object.values(onRenderFctsmy).forEach(function (onRenderFct) {
    onRenderFct(deltaMsec / 1000, nowMsec / 1000);
  });
});

initTetrisCubes();
generateTetrisCube();
generateLines();

function generateLines(param) {
  let rect = new THREE.Group();
  let lineMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
  });


  let topGeometry = new THREE.BufferGeometry();
  let bottomGeometry = new THREE.BufferGeometry();
  let leftGeometry = new THREE.BufferGeometry();
  let rightGeometry = new THREE.BufferGeometry();

  topGeometry.setFromPoints([
    new THREE.Vector3(
      -lineWidth / 2 - tetrisCubeWidth / 2 - tetrisSeg,
      0,
      lineHeight / 2 + tetrisSeg
    ),
    new THREE.Vector3(
      lineWidth / 2 + tetrisCubeWidth / 2 + tetrisSeg,
      0,
      lineHeight / 2 + tetrisSeg
    ),
  ]);

  bottomGeometry.setFromPoints([
    new THREE.Vector3(
      -lineWidth / 2 - tetrisCubeWidth / 2 - tetrisSeg,
      0,
      -lineHeight / 2
    ),
    new THREE.Vector3(
      lineWidth / 2 + tetrisCubeWidth / 2 + tetrisSeg,
      0,
      -lineHeight / 2
    ),
  ]);

  let top = new THREE.Line(topGeometry, lineMaterial);
  let bottom = new THREE.Line(bottomGeometry, lineMaterial);

  leftGeometry.setFromPoints([
    new THREE.Vector3(
      -lineWidth / 2 - tetrisCubeWidth / 2 - tetrisSeg,
      0,
      lineHeight / 2 + tetrisSeg
    ),
    new THREE.Vector3(
      -lineWidth / 2 - tetrisCubeWidth / 2 - tetrisSeg,
      0,
      -lineHeight / 2
    ),
  ]);

  rightGeometry.setFromPoints([
    new THREE.Vector3(
      lineWidth / 2 + tetrisCubeWidth / 2 + tetrisSeg,
      0,
      lineHeight / 2 + tetrisSeg
    ),
    new THREE.Vector3(
      lineWidth / 2 + tetrisCubeWidth / 2 + tetrisSeg,
      0,
      -lineHeight / 2
    ),
  ]);

  let left = new THREE.Line(leftGeometry, lineMaterial);
  let right = new THREE.Line(rightGeometry, lineMaterial);

  rect.add(top, bottom, left, right);
  scene.add(rect);
  tetrisArWorldRoot.add(rect);
}

//?????????????????????
function generateTetrisCube() {
  // ??????????????????
  if (isLose()) {
    tetrisScore = 0;
    updateTetrisScore();
    tetrisCountDownNum = 30;
    document.getElementById("tetrisClock").innerHTML = tetrisCountDownNum;

    return stopTetrisGame();
  }
  tetrisTypes = [
    new Cube(1, [
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6],
    ]),
    new Cube(2, [
      [0, 3],
      [1, 3],
      [1, 4],
      [1, 5],
    ]),
    new Cube(3, [
      [0, 5],
      [1, 3],
      [1, 4],
      [1, 5],
    ]),
    new Cube(4, [
      [0, 4],
      [0, 5],
      [1, 4],
      [1, 5],
    ]),
    new Cube(5, [
      [0, 5],
      [0, 6],
      [1, 4],
      [1, 5],
    ]),
    new Cube(6, [
      [0, 5],
      [1, 4],
      [1, 5],
      [1, 6],
    ]),
    new Cube(7, [
      [0, 3],
      [0, 4],
      [1, 4],
      [1, 5],
    ]),
  ];

  // ??????????????????????????????
  if (nextTetrisCube == null) {
    currentTetrisCube = tetrisTypes[Math.floor(Math.random() * 7)];
  } else {
    currentTetrisCube = nextTetrisCube;
  }
  nextTetrisCube = tetrisTypes[Math.floor(Math.random() * 7)];

  let pos = currentTetrisCube.position;
  let nextPos = nextTetrisCube.position;
  for (let i = 0; i < pos.length; i++) {
    tetrisMatrix[pos[i][0]][pos[i][1]].cube.visible = true;
  }

  //??????????????????????????????
  // for (let i = 0; i < tetrisNextMatrix.length; i++) {
  //   for (let j = 0; j < tetrisNextMatrix[i].length; j++) {
  //     tetrisNextMatrix[i][j].visible = false;
  //   }
  // }

  // //???????????????cube
  // for (let i = 0; i < nextPos.length; i++) {
  //   tetrisNextMatrix[nextPos[i][0]][nextPos[i][1] - 3].visible = true;
  // }
}

function initTetrisCubes() {
  tetrisMatrix = [];
  let matrixObject = new THREE.Object3D();
  let cube = new THREE.BoxGeometry(tetrisCubeWidth, tetrisCubeWidth / 50, tetrisCubeWidth);
  let map = new THREE.TextureLoader().load(imgUrl);
  map.wrapS = map.mapT = THREE.RepeatWrapping;
  let material = new THREE.MeshLambertMaterial({
    map,
    side: THREE.DoubleSide,
  });
  let mesh = new THREE.Mesh(cube, material);
  let m = 0,
    n = 0;
  // ????????????????????????????????????
  for (
    let j = lineHeight / 2 - tetrisCubeWidth / 2 - tetrisSeg; j > -lineHeight / 2; j -= tetrisCubeWidth + tetrisSeg, m++, n = 0
  ) {
    tetrisMatrix[m] = [];
    for (
      let i = -lineWidth / 2 + tetrisCubeWidth / 2 + tetrisSeg; i < lineWidth / 2; i += tetrisCubeWidth + tetrisSeg, n++
    ) {
      // console.log("lineWidth", lineWidth, "i", i, "j", j);
      mesh = mesh.clone(true);
      mesh.receiveShadow = true;
      mesh.position.set(i, 0, -j);
      mesh.visible = false;
      tetrisMatrix[m][n] = {
        cube: mesh,
      };
      matrixObject.add(mesh);
    }
  }
  scene.add(matrixObject);
  tetrisArWorldRoot.add(matrixObject);
}

function showOrHidePopup(key, isShow) {
  const domNode = document.getElementById(key);
  if (isShow) {
    if (domNode.classList.contains("is-visible")) {
      return;
    } else {
      domNode.classList.add("is-visible");
    }
  } else {
    if (domNode.classList.contains("is-visible")) {
      domNode.classList.remove("is-visible");
    } else {
      return;
    }
  }
}

function updateTetrisScore(propScore) {
  const scoreN = propScore || tetrisScore;
  document.getElementById("tetrisScore").innerHTML = scoreN;
}

function leaveTetrisGame() {
  clearInterval(tetrisGameTimer);
  tetrisCountDownNum = 30;
  document.getElementById("tetrisClock").innerHTML = tetrisCountDownNum;
  tetrisScore = 0;
  updateTetrisScore(0);
  clearInterval(tetrisTimer);
  tetrisMatrix.forEach((m) => {
    m.forEach((n) => {
      n.cube.visible = false;
    });
  });
  generateTetrisCube();
  tetrisHaveStart = false;
  showOrHidePopup("overModal", false);
  showOrHidePopup("readyModal", true);
}

// ????????????
function startTetrisGame() {
  console.log("startTetrisGame");
  showOrHidePopup("readyModal", false);
  if (!tetrisHaveStart) {
    tetrisTimer = setInterval(() => {
      moveDown();
    }, tetrisSpeed);
    tetrisHaveStart = true;

    tetrisGameTimer = setInterval(() => {
      tetrisCountDownNum--;
      document.getElementById("tetrisClock").innerHTML = tetrisCountDownNum;
      if (tetrisCountDownNum === 0) {
        clearInterval(tetrisGameTimer);
        stopTetrisGame();
      }
    }, 1000);
  }
}

// ????????????
function stopTetrisGame() {
  tetrisHaveStart = false;
  clearInterval(tetrisGameTimer);
  clearInterval(tetrisTimer);
  showOrHidePopup("overModal", true);
}

// ??????????????????
function restartTetrisGame() {
  showOrHidePopup("overModal", false);

  tetrisScore = 0;
  updateTetrisScore(0);
  clearInterval(tetrisTimer);
  tetrisMatrix.forEach((m) => {
    m.forEach((n) => {
      n.cube.visible = false;
    });
  });
  generateTetrisCube();
  tetrisHaveStart = false;
  clearInterval(tetrisGameTimer);
  tetrisCountDownNum = 30;
  document.getElementById("tetrisClock").innerHTML = tetrisCountDownNum;
  startTetrisGame();
}

// ??????
function rotateBlock() {
  if (tetrisHaveStart) {
    // console.log("rotateBlock");

    let pos = currentTetrisCube.position;
    let copy = copyArr(currentTetrisCube.position);
    let type = currentTetrisCube.type;

    // ??????(ab)?????????mn????????????90??? ?????????m+n-b,n-m+a)
    let cx = Math.round(
      (copy[0][0] + copy[1][0] + copy[2][0] + copy[3][0]) / 4
    );
    let cy = Math.round(
      (copy[0][1] + copy[1][1] + copy[2][1] + copy[3][1]) / 4
    );
    //?????????????????????. ??????????????????????????????
    //??????????????????????????????????????????????????????????????????
    for (let i = 0; i < 4; i++) {
      copy[i][0] = cx + cy - pos[i][1];
      copy[i][1] = cy - cx + pos[i][0];
    }

    //???????????????????????????S?????????????????????
    if (type == 1 || type == 5 || type == 7) {
      if (copy[0][0] == copy[1][0]) {
        for (let i = 0; i < 4; i++) {
          copy[i][0] -= 1;
        }
      }
    }

    let canRotate = true;
    let minus = minusTetrisMatrix(copy, pos);
    for (let i = 0; i < minus.length; i++) {
      if (
        minus[i][0] < 0 ||
        minus[i][1] < 0 ||
        minus[i][0] > 19 ||
        minus[i][1] > 9
      ) {
        canRotate = false;
        break;
      }
      if (tetrisMatrix[minus[i][0]][minus[i][1]].cube.visible == true) {
        canRotate = false;
        break;
      }
    }
    if (canRotate) {
      tetrisCanUpdate = true;
      updateTetrisMatrixView(copy);
      currentTetrisCube.position = copy;
    }
  }
}

// ????????????
function moveDown() {
  if (tetrisHaveStart) {
    // console.log("moveDown", tetrisMatrix, currentTetrisCube);
    let pos = currentTetrisCube.position;
    let x, y;
    let newPos = [];
    let canMove = true;
    for (let i = 0; i < pos.length; i++) {
      (x = pos[i][0]), (y = pos[i][1]);
      if (x + 1 <= tetrisLineHeightSeg - 1) {
        newPos.push([x + 1, y]);
      } else {
        break;
      }
    }
    if (newPos.length == pos.length) {
      //??????????????????????????????????????????
      let minus = minusTetrisMatrix(newPos, pos);
      //?????????????????????????????????
      for (let i = 0; i < minus.length; i++) {
        if (tetrisMatrix[minus[i][0]][minus[i][1]].cube.visible != false) {
          canMove = false;
          break;
        }
      }
      if (canMove) {
        tetrisCanUpdate = true;
        updateTetrisMatrixView(newPos);
        currentTetrisCube.position = newPos;
      } else {
        // ?????????????????????,?????????
        clearTetrisCubes();
        generateTetrisCube();
      }
    } else {
      // ??????????????????????????????????????????
      clearTetrisCubes();
      generateTetrisCube();
    }
  }
}

//??????????????????
function isLose() {
  let num = 0;
  for (let i = 3; i <= 6; i++) {
    if (tetrisMatrix[0][i].cube.visible == true) {
      num++;
    }
  }
  return num >= 3;
}

// ????????????
function moveLeftAndRight(type) {
  if (tetrisHaveStart) {
    let pos = currentTetrisCube.position;
    let x, y;
    let newPos = [];
    let canMove = true;
    let step = type == 0 ? -1 : 1;
    for (let i = 0; i < pos.length; i++) {
      (x = pos[i][0]), (y = pos[i][1]);
      if (y + step >= 0 && y + step <= tetrisLineWidthSeg - 1) {
        newPos.push([x, y + step]);
      } else {
        break;
      }
    }
    if (newPos.length == pos.length) {
      //??????????????????????????????????????????
      let minus = minusTetrisMatrix(newPos, pos);
      //?????????????????????????????????
      for (let i = 0; i < minus.length; i++) {
        if (tetrisMatrix[minus[i][0]][minus[i][1]].cube.visible != false) {
          canMove = false;
          break;
        }
      }
      if (canMove) {
        tetrisCanUpdate = true;
        updateTetrisMatrixView(newPos);
        currentTetrisCube.position = newPos;
      }
    }
  }
}

//??????????????????
function updateTetrisMatrixView(newPos) {
  if (tetrisCanUpdate) {
    console.log(currentTetrisCube, tetrisTypes);
    let pos;
    //??????????????????
    for (let i = 0; i < currentTetrisCube.position.length; i++) {
      pos = currentTetrisCube.position[i];
      tetrisMatrix[pos[0]][pos[1]].cube.visible = false;
    }
    //????????????
    for (let i = 0; i < newPos.length; i++) {
      // let tetrisCell1 = new THREE.TextureLoader().load(imgUrl);
      // tetrisCell1.wrapS = tetrisCell1.mapT = THREE.RepeatWrapping;
      // let material = new THREE.MeshLambertMaterial({
      //   tetrisCell1,
      //   side: THREE.DoubleSide,
      // });
      tetrisMatrix[newPos[i][0]][newPos[i][1]].cube.visible = true;
    }
  }
}

//??????????????????????????????,??????????????????????????????????????????
function minusTetrisMatrix(m1, m2) {
  let arr = [];
  let flag = true;
  for (let i = 0; i < m1.length; i++) {
    flag = true;
    for (let j = 0; j < m2.length; j++) {
      if (m1[i][0] == m2[j][0] && m1[i][1] == m2[j][1]) {
        flag = false;
        break;
      }
    }
    if (flag) {
      arr.push([m1[i][0], m1[i][1]]);
    }
  }
  return arr;
}

// ??????????????????????????????
function clearTetrisCubes() {
  tetrisCanUpdate = false;
  let clear = false,
    lineNumber = [];
  for (let i = 0; i <= tetrisLineHeightSeg - 1; i++) {
    for (let j = 0; j <= tetrisLineWidthSeg - 1; j++) {
      // ?????????????????????????????????
      if (tetrisMatrix[i][j].cube.visible == true) {
        clear = true;
      } else {
        clear = false;
        break;
      }
    }
    if (clear) {
      lineNumber.push(i);
    }
  }
  if (lineNumber.length > 0) {
    //??????
    tetrisScore += lineNumber.length * 100;
    updateTetrisScore(tetrisScore);

    //????????????
    for (let i = lineNumber.length - 1; i >= 0; i--) {
      for (let j = 0; j <= tetrisLineWidthSeg - 1; j++) {
        tetrisMatrix[lineNumber[i]][j].cube.visible = false;
      }
    }

    //????????????????????????
    for (let i = 0; i < lineNumber.length; i++) {
      for (let j = lineNumber[i]; j >= 1; j--) {
        for (let k = 0; k <= tetrisLineWidthSeg - 1; k++) {
          if (tetrisMatrix[j - 1][k].cube.visible == true) {
            tetrisMatrix[j - 1][k].cube.visible = false;
            tetrisMatrix[j][k].cube.visible = true;
          }
        }
      }
    }
  }
}