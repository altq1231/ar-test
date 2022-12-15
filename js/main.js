var vConsole = new VConsole();

//  Init

var width = window.innerWidth,
  height = window.innerHeight;
console.log("window.innerWidth", width, height);

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
      patternUrl: "https://ued.united-imaging.com/doc_server/doc_server/resource/src/9a3ca4a7d3a818ed6f14a1e7c995142b.patt",
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
    // 方块类型
    this.type = type;
    // 记录方块当前的位置信息
    this.position = position;
  }
}

// 设置一个方格长宽为20
let tetrisCubeWidth = 0.2;
// 横向10格，纵向20格, 间隙为4
let tetrisLineWidthSeg = 9,
  tetrisLineHeightSeg = 10,
  tetrisSeg = 0.02;
// 计算外框线长与宽
let lineWidth = tetrisCubeWidth * tetrisLineWidthSeg + tetrisSeg * (tetrisLineWidthSeg + 1);
let lineHeight = tetrisCubeWidth * tetrisLineHeightSeg + tetrisSeg * (tetrisLineHeightSeg + 1);

// 存储方块的矩阵
let tetrisMatrix = [],
  tetrisNextMatrix = [];
// 定时器
let tetrisTimer;

let tetrisHaveStart = false;
let currentTetrisCube = null;
let nextTetrisCube = null;
let tetrisScore = 0;
let tetrisSpeed = 800;
let tetrisCanUpdate = false;
const imgUrl = "./image/cell.png";
let tetrisCountDownNum = 30;
let tetrisGameTimer = null;

//深度拷贝
function copyArr(m) {
  return JSON.parse(JSON.stringify(m));
}

// 光
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

//生成下一个方块
function generateTetrisCube() {
  // 判断是否输了
  if (isLose()) {
    tetrisScore = 0;
    updateTetrisScore();
    tetrisCountDownNum = 30;
    document.getElementById("tetrisClock").innerHTML = tetrisCountDownNum;

    return stopTetrisGame();
  }
  let types = [
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

  // 随机生成七种形状之一
  if (nextTetrisCube == null) {
    currentTetrisCube = types[Math.floor(Math.random() * 7)];
  } else {
    currentTetrisCube = nextTetrisCube;
  }
  nextTetrisCube = types[Math.floor(Math.random() * 7)];

  let pos = currentTetrisCube.position;
  let nextPos = nextTetrisCube.position;
  for (let i = 0; i < pos.length; i++) {
    tetrisMatrix[pos[i][0]][pos[i][1]].cube.visible = true;
  }

  //隐藏之前的下一个方格
  // for (let i = 0; i < tetrisNextMatrix.length; i++) {
  //   for (let j = 0; j < tetrisNextMatrix[i].length; j++) {
  //     tetrisNextMatrix[i][j].visible = false;
  //   }
  // }

  // //显示下一个cube
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
  // 初始化所有方块设置为隐藏
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

// 开始游戏
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

// 停止游戏
function stopTetrisGame() {
  tetrisHaveStart = false;
  clearInterval(tetrisGameTimer);
  clearInterval(tetrisTimer);
  showOrHidePopup("overModal", true);
}

// 重新开始游戏
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

// 旋转
function rotateBlock() {
  if (tetrisHaveStart) {
    // console.log("rotateBlock");

    let pos = currentTetrisCube.position;
    let copy = copyArr(currentTetrisCube.position);
    let type = currentTetrisCube.type;

    // 某点(ab)绕点（mn）逆时针90度 得点（m+n-b,n-m+a)
    let cx = Math.round(
      (copy[0][0] + copy[1][0] + copy[2][0] + copy[3][0]) / 4
    );
    let cy = Math.round(
      (copy[0][1] + copy[1][1] + copy[2][1] + copy[3][1]) / 4
    );
    //旋转的主要算法. 可以这样分解来理解。
    //先假设围绕源点旋转。然后再加上中心点的坐标。
    for (let i = 0; i < 4; i++) {
      copy[i][0] = cx + cy - pos[i][1];
      copy[i][1] = cy - cx + pos[i][0];
    }

    //对横向长条以及两个S型进行精度补偿
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

// 向下移动
function moveDown() {
  if (tetrisHaveStart) {
    console.log("moveDown", tetrisMatrix, currentTetrisCube);
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
      //计算出变更前后两个矩阵的差集
      let minus = minusTetrisMatrix(newPos, pos);
      //判断变更的部分能否移动
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
        // 如果发生碰撞了,先消除
        clearTetrisCubes();
        generateTetrisCube();
      }
    } else {
      // 如果到最底层了，重新生成图案
      clearTetrisCubes();
      generateTetrisCube();
    }
  }
}

//判断是否输了
function isLose() {
  let num = 0;
  for (let i = 3; i <= 6; i++) {
    if (tetrisMatrix[0][i].cube.visible == true) {
      num++;
    }
  }
  return num >= 3;
}

// 左右移动
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
      //计算出变更前后两个矩阵的差集
      let minus = minusTetrisMatrix(newPos, pos);
      //判断变更的部分能否移动
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

//更新视图矩阵
function updateTetrisMatrixView(newPos) {
  if (tetrisCanUpdate) {
    let pos;
    //将之前的隐藏
    for (let i = 0; i < currentTetrisCube.position.length; i++) {
      pos = currentTetrisCube.position[i];
      tetrisMatrix[pos[0]][pos[1]].cube.visible = false;
    }
    //显示新的
    for (let i = 0; i < newPos.length; i++) {
      tetrisMatrix[newPos[i][0]][newPos[i][1]].cube.visible = true;
    }
  }
}

//计算两个二维数组差集,用于判断变更后的部分能否移动
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

// 清除某一行全部点亮的
function clearTetrisCubes() {
  tetrisCanUpdate = false;
  let clear = false,
    lineNumber = [];
  for (let i = 0; i <= tetrisLineHeightSeg - 1; i++) {
    for (let j = 0; j <= tetrisLineWidthSeg - 1; j++) {
      // 判断某一行是否全部点亮
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
    //加分
    tetrisScore += lineNumber.length * 100;
    updateTetrisScore(tetrisScore);

    //消除完整
    for (let i = lineNumber.length - 1; i >= 0; i--) {
      for (let j = 0; j <= tetrisLineWidthSeg - 1; j++) {
        tetrisMatrix[lineNumber[i]][j].cube.visible = false;
      }
    }

    //将上面的移动下来
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