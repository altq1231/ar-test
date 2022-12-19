// 每种形状的数据
// const blockShape = {
//   I: [
//     [1, 1, 1, 1]
//   ],
//   L: [
//     [0, 0, 2],
//     [2, 2, 2]
//   ],
//   J: [
//     [3, 0, 0],
//     [3, 3, 3]
//   ],
//   Z: [
//     [4, 4, 0],
//     [0, 4, 4]
//   ],
//   S: [
//     [0, 5, 5],
//     [5, 5, 0]
//   ],
//   O: [
//     [6, 6],
//     [6, 6]
//   ],
//   T: [
//     [0, 7, 0],
//     [7, 7, 7]
//   ]
// }
// 每种形状的数据
const blockShape = {
  I: [
    [1, 1, 1, 1]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1]
  ]
}


const origin = {
  I: [
    [-1, 1],
    [1, -1]
  ],
  L: [
    [0, 0]
  ],
  J: [
    [0, 0]
  ],
  Z: [
    [0, 0]
  ],
  S: [
    [0, 0]
  ],
  O: [
    [0, 0]
  ],
  T: [
    [0, 0],
    [1, 0],
    [-1, 1],
    [0, -1]
  ]
}

// 每个形状的名称
const blockType = Object.keys(blockShape)

// 消除行后的分数
const clearPoints = [100, 300, 700, 1500]

// 一行填满的状态
const fillLine = (colNum) => {
  colNum ? colNum : colNum = 10
  return new Array(colNum).fill(1)
}

// 一行空的状态
const blankLine = (colNum) => {
  colNum ? colNum : colNum = 10
  return new Array(colNum).fill(0)
}

// 全空
const blankMatrix = (rowBum, blankLine) => {
  rowBum ? rowBum : rowBum = 20
  blankLine ? blankLine : blankLine = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  const matrix = []
  for (let i = 0; i < rowBum; i++) {
    matrix.push(blankLine)
  }
  return matrix
}


class Block {
  constructor(option) {
    this.type = option.type || 'I'
    this.rotateIndex = option.rotateIndex || 0
    this.timeStamp = option.timeStamp || Date.now()
    this.shape = option.shape || blockShape[option.type]

    if (!option.xy) {
      switch (option.type) {
        case 'I': // I
          this.xy = [0, 3]
          break
        case 'L': // L
          this.xy = [-1, 4]
          break
        case 'J': // J
          this.xy = [-1, 4]
          break
        case 'Z': // Z
          this.xy = [-1, 4]
          break
        case 'S': // S
          this.xy = [-1, 4]
          break
        case 'O': // O
          this.xy = [-1, 4]
          break
        case 'T': // T
          this.xy = [-1, 4]
          break
        default:
          break
      }
    } else {
      this.xy = option.xy
    }
  }
  rotate() {
    const shape = this.shape
    let result = []
    shape.forEach(m =>
      m.forEach((n, k) => {
        const index = m.length - k - 1
        if (result[index] === undefined) {
          result[index] = []
        }

        result[index].push(n)
        const tempK = [...result[index]]
        result[index] = tempK
      })
    )
    const nextXy = [
      this.xy[0] + origin[this.type][this.rotateIndex][0],
      this.xy[1] + origin[this.type][this.rotateIndex][1]
    ]
    const nextRotateIndex = this.rotateIndex + 1 >= origin[this.type].length ?
      0 :
      this.rotateIndex + 1
    return {
      shape: result,
      type: this.type,
      xy: nextXy,
      rotateIndex: nextRotateIndex,
      timeStamp: this.timeStamp
    }
  }
  fall(n = 1) {
    return {
      shape: this.shape,
      type: this.type,
      xy: [this.xy[0] + n, this.xy[1]],
      rotateIndex: this.rotateIndex,
      timeStamp: Date.now()
    }
  }
  right() {
    return {
      shape: this.shape,
      type: this.type,
      xy: [this.xy[0], this.xy[1] + 1],
      rotateIndex: this.rotateIndex,
      timeStamp: this.timeStamp
    }
  }
  left() {
    return {
      shape: this.shape,
      type: this.type,
      xy: [this.xy[0], this.xy[1] - 1],
      rotateIndex: this.rotateIndex,
      timeStamp: this.timeStamp
    }
  }
}

class UgameTetris {
  constructor({
    size = [9, 9],
    speed = 800,
    points = 100,
    countdown = 0,
    layout = null,
    statusChangeCallback = true,
    scoreChangeCallback = true,
    updateChangeCallback = true,
    gameOverChangeCallback = true,
    clearChangeCallback = true,
    beforeClearChangeCallback = true,
    countdownChangeCallBack = true
  } = {}) {
    this.colNum = size[0]
    this.rowNum = size[1]
    this.blankLine = blankLine(this.colNum)
    this.fillLine = fillLine(this.colNum)
    this.matrix = layout || blankMatrix(this.rowNum, this.blankLine)
    this.currentBlock = null
    this.nextBlock = null
    this.status = 'ready'
    this.speed = speed
    this.fallInterval = null
    this.startLines = 0
    this.clearLines = []
    this.lock = false
    this.points = points
    this.currentMatrix = this.matrix
    this.score = 0
    this.countdown = countdown
    this.gameTimer = null
    this.startTime = null
    this.time = null
    this.millisecond = null
    this.layout = layout

    this.statusChangeCallback = statusChangeCallback
    this.scoreChangeCallback = scoreChangeCallback
    this.updateChangeCallback = updateChangeCallback
    this.gameOverChangeCallback = gameOverChangeCallback
    this.clearChangeCallback = clearChangeCallback
    this.beforeClearChangeCallback = beforeClearChangeCallback
    this.countdownChangeCallBack = countdownChangeCallBack
    this.initGame()
  }

  // 初始化游戏
  initGame() {
    this.matrix = this.layout || this.getStartMatrix(this.startLines)
    this.currentMatrix = this.matrix
    this.status = 'ready'
    this.startLines = 0
    this.nextBlock = this.getNextType()
    console.table('initGame', this);
    this.runUpdateChangeCallback(this.currentMatrix, this.currentBlock, {
      shape: blockShape[this.nextBlock],
      type: this.nextBlock
    }, 'init')
  }

  // 开始游戏
  startGame() {
    this.startTime = Date.now()
    if (this.currentBlock === null) {
      this.currentBlock = new Block({
        type: this.nextBlock
      })
      this.nextBlock = this.getNextType()
    }
    this.currentMatrix = this.getResult({
      propMatrix: this.matrix,
      cur: this.currentBlock
    })
    this.runUpdateChangeCallback(this.currentMatrix, this.currentBlock, {
      shape: blockShape[this.nextBlock],
      type: this.nextBlock
    }, 'down')
    this.status = 'play'
    this.runStatusChangeCallback(this.status)
    if (this.countdown > 0) {
      this.gameTimer = setInterval(() => {
        this.countdown--;
        this.runCountdownChangeCallback(this.countdown)
        if (this.countdown === 0) {
          clearInterval(this.gameTimer)
          this.gameTimer = null
          this.gameOver()
        }
      }, 1000)
    }
    this.autoRun(400)
  }

  // 暂停游戏
  pauseGame() {
    clearTimeout(this.fallInterval)
    this.status = 'pause'
    this.runStatusChangeCallback(this.status)
  }

  // 游戏结束
  gameOver() {
    clearTimeout(this.fallInterval)
    this.status = 'ready'
    this.runStatusChangeCallback(this.status)
    const nowT = Date.now()
    this.millisecond = nowT - this.startTime
    this.time = +(this.millisecond / 1000).toFixed(2)
    this.runGameOverChangeCallback(this.score, this.time, this.millisecond)
  }

  // 自动下落
  autoRun(timeout) {
    const out = timeout < 0 ? 0 : timeout
    let cur = this.currentBlock
    const fallFunc = () => {
      cur = this.currentBlock
      // console.log('cur', this.currentMatrix, this.matrix);
      const next = cur.fall()
      if (this.want(next, this.matrix)) {
        this.currentBlock = new Block(next)
        this.currentMatrix = this.getResult({
          propMatrix: this.matrix,
          cur: this.currentBlock
        })
        this.runUpdateChangeCallback(this.currentMatrix, this.currentBlock, {
          shape: blockShape[this.nextBlock],
          type: this.nextBlock
        }, 'down')
        this.fallInterval = setTimeout(fallFunc, this.speed)
      } else {
        let matrix = JSON.parse(JSON.stringify(this.matrix))
        const shape = cur && cur.shape
        const xy = cur && cur.xy
        shape.forEach((m, k1) =>
          m.forEach((n, k2) => {
            if (n && xy[0] + k1 >= 0) {
              // 竖坐标可以为负
              let line = matrix[xy[0] + k1]
              const color = blockType.indexOf(this.currentBlock.type) + 1;
              line[xy[1] + k2] = color
              matrix[xy[0] + k1] = line
            }
          })
        )
        this.nextAround(matrix)
      }
    }
    clearTimeout(this.fallInterval)
    this.fallInterval = setTimeout(
      fallFunc,
      out === undefined ? this.speed : out
    )
  }

  // 一个方块结束, 触发下一个
  nextAround(matrix) {
    clearTimeout(this.fallInterval)

    this.matrix = matrix
    this.clearLines = this.isClear(matrix)
    if (this.clearLines.length > 0) {
      // console.log('isClear');
      this.runBeforeClearChangeCallback(this.clearLines)
      this.clearLinesFunc(matrix, this.clearLines)
      this.autoRun()
      return
    }

    if (this.isOver(matrix)) {
      // console.log('isOver');
      this.gameOver()
      return
    }

    this.currentBlock = new Block({
      type: this.nextBlock
    })
    this.nextBlock = this.getNextType()
    this.currentMatrix = this.getResult({
      propMatrix: this.matrix,
      cur: this.currentBlock
    })
    this.runUpdateChangeCallback(this.currentMatrix, this.currentBlock, {
      shape: blockShape[this.nextBlock],
      type: this.nextBlock
    }, 'down')
    this.autoRun(700)
  }

  // 更新当前matrix 
  getResult(props) {
    const cur = props.cur;
    const shape = cur && cur.shape;
    const xy = cur && cur.xy;
    let matrix = JSON.parse(JSON.stringify(props.propMatrix));
    if (shape) {
      shape.forEach((m, k1) =>
        m.forEach((n, k2) => {
          if (n && xy[0] + k1 >= 0) {
            // 竖坐标可以为负
            let line = matrix[xy[0] + k1];
            let color = blockType.indexOf(this.currentBlock.type) + 1;
            line[xy[1] + k2] = color;
            matrix[xy[0] + k1] = line;
          }
        })
      );
    }
    return matrix;
  }

  // 消除行
  clearLinesFunc(matrix, lines) {
    let newMatrix = JSON.parse(JSON.stringify(matrix))
    lines.forEach(n => {
      newMatrix.splice(n, 1)
      newMatrix.unshift(this.blankLine)
    })

    this.score = this.score + this.points * lines.length
    this.runScoreChangeCallback(this.score)
    this.matrix = newMatrix
    this.currentBlock = new Block({
      type: this.nextBlock
    })
    this.nextBlock = this.getNextType()
    this.currentMatrix = this.getResult({
      propMatrix: newMatrix,
      cur: this.currentBlock
    })
    this.runUpdateChangeCallback(this.currentMatrix, this.currentBlock, {
      shape: blockShape[this.nextBlock],
      type: this.nextBlock
    }, 'clearline')
    this.runClearChangeCallback(lines)
  }

  // 倒计时变化触发
  runCountdownChangeCallback(countdown) {
    if (this.countdownChangeCallBack && typeof this.countdownChangeCallBack === 'function') {
      this.countdownChangeCallBack(countdown)
    }
  }

  // 游戏结束
  runGameOverChangeCallback(score, time, millisecond) {
    if (this.gameOverChangeCallback && typeof this.gameOverChangeCallback === 'function') {
      this.gameOverChangeCallback(score, time, millisecond)
    }
  }

  // 整行被削掉后触发
  runClearChangeCallback(rows) {
    if (this.clearChangeCallback && typeof this.clearChangeCallback === 'function') {
      this.clearChangeCallback(rows)
    }
  }

  // 整行被削掉前触发
  runBeforeClearChangeCallback(rows) {
    if (this.beforeClearChangeCallback && typeof this.beforeClearChangeCallback === 'function') {
      this.beforeClearChangeCallback(rows)
    }
  }

  // 每次画面发生变化时
  runUpdateChangeCallback(matrix, currentBlock, nextBlock, action) {
    if (this.updateChangeCallback && typeof this.updateChangeCallback === 'function') {
      this.updateChangeCallback(matrix, currentBlock, nextBlock, action)
    }
  }

  // 游戏状态变化
  runStatusChangeCallback(status) {
    if (this.statusChangeCallback && typeof this.statusChangeCallback === 'function') {
      this.statusChangeCallback(status)
    }
  }

  // 游戏分数变化
  runScoreChangeCallback(score) {
    if (this.scoreChangeCallback && typeof this.scoreChangeCallback === 'function') {
      this.scoreChangeCallback(score)
    }
  }

  // 重新开始游戏
  reset() {
    clearTimeout(this.fallInterval)
    this.nextBlock = this.getNextType()
    this.currentBlock = null
    this.matrix = this.getStartMatrix(this.startLines)
    this.currentMatrix = this.matrix
    this.status = 'ready'
    this.score = 0
    this.runStatusChangeCallback(this.status)
    this.runUpdateChangeCallback(this.currentMatrix, this.currentBlock, {
      shape: blockShape[this.nextBlock],
      type: this.nextBlock
    })
    this.runScoreChangeCallback(this.score)
  }

  // 旋转
  rotateBlock() {
    if (this.status !== 'play') {
      return
    }
    if (this.currentBlock !== null) {
      if (this.status === 'pause') {
        return
      }
      if (this.currentBlock === null) {
        return
      }
      const next = this.currentBlock.rotate()

      if (this.want(next, this.matrix)) {
        this.currentBlock = new Block(next)
      }

      this.currentMatrix = this.getResult({
        propMatrix: this.matrix,
        cur: this.currentBlock
      })
      this.runUpdateChangeCallback(this.currentMatrix, this.currentBlock, {
        shape: blockShape[this.nextBlock],
        type: this.nextBlock
      }, 'rotate')
    }
  }

  // 左移
  moveLeft() {
    if (this.status !== 'play') {
      return
    }
    if (this.currentBlock !== null) {
      if (this.status === 'pause') {
        return
      }
      const next = this.currentBlock.left()
      const delay = 50
      let timeStamp
      if (this.want(next, this.matrix)) {
        next.timeStamp += parseInt(delay, 10)
        this.currentBlock = new Block(next)
        timeStamp = next.timeStamp
      } else {
        this.currentBlock.timeStamp += parseInt(parseInt(delay, 10) / 1.5, 10) // 真实移动delay多一点，碰壁delay少一点
        this.currentBlock = new Block(this.currentBlock)
        timeStamp = this.currentBlock.timeStamp
      }
      this.currentMatrix = this.getResult({
        propMatrix: this.matrix,
        cur: this.currentBlock
      })
      this.runUpdateChangeCallback(this.currentMatrix, this.currentBlock, {
        shape: blockShape[this.nextBlock],
        type: this.nextBlock
      }, 'left')
      const remain = this.speed - (Date.now() - timeStamp)
      this.autoRun(remain)
    }
  }

  // 右移
  moveRight() {
    if (this.status !== 'play') {
      return
    }
    if (this.currentBlock !== null) {
      if (this.status === 'pause') {
        return
      }
      const next = this.currentBlock.right()
      const delay = 50
      let timeStamp
      if (this.want(next, this.matrix)) {
        next.timeStamp += parseInt(delay, 10)
        this.currentBlock = new Block(next)
        timeStamp = next.timeStamp
      } else {
        this.currentBlock.timeStamp += parseInt(parseInt(delay, 10) / 1.5, 10) // 真实移动delay多一点，碰壁delay少一点
        this.currentBlock = new Block(this.currentBlock)
        timeStamp = this.currentBlock.timeStamp
      }
      this.currentMatrix = this.getResult({
        propMatrix: this.matrix,
        cur: this.currentBlock
      })
      this.runUpdateChangeCallback(this.currentMatrix, this.currentBlock, {
        shape: blockShape[this.nextBlock],
        type: this.nextBlock
      }, 'right')
      const remain = this.speed - (Date.now() - timeStamp)
      this.autoRun(remain)
    }
  }

  // 下降
  moveDown() {
    if (this.status !== 'play') {
      return
    }
    clearTimeout(this.fallInterval)
    if (this.currentBlock !== null) {
      const cur = this.currentBlock;
      if (cur === null) {
        return;
      }
      if (this.status === 'pause') {
        return
      }
      const next = cur.fall();
      if (this.want(next, this.matrix)) {
        this.currentBlock = new Block(next)
        this.currentMatrix = this.getResult({
          propMatrix: this.matrix,
          cur: this.currentBlock
        })
        this.runUpdateChangeCallback(this.currentMatrix, this.currentBlock, {
          shape: blockShape[this.nextBlock],
          type: this.nextBlock
        }, 'drop')
        this.autoRun();
      } else {
        let matrix = JSON.parse(JSON.stringify(this.matrix));
        const shape = cur.shape;
        const xy = cur.xy;
        shape.forEach((m, k1) =>
          m.forEach((n, k2) => {
            if (n && xy[0] + k1 >= 0) {
              // 竖坐标可以为负
              let line = matrix[xy[0] + k1];
              let color = blockType.indexOf(this.currentBlock.type) + 1;
              line[xy[1] + k2] = color;
              matrix[xy[0] + k1] = line;
            }
          })
        );
        this.currentMatrix = this.getResult({
          propMatrix: matrix,
          cur: this.currentBlock
        })
        this.runUpdateChangeCallback(this.currentMatrix, this.currentBlock, {
          shape: blockShape[this.nextBlock],
          type: this.nextBlock
        }, 'drop')
        this.nextAround(matrix);
      }
    }
  }

  // 随机获取下一个方块类型
  getNextType() {
    const len = blockType.length
    return blockType[Math.floor(Math.random() * len)]
  }

  // 获取初始matrix
  getStartMatrix(startLines) {
    // 生成startLines
    const getLine = (min, max) => {
      // 返回标亮个数在min~max之间一行方块, (包含边界)
      const count = parseInt((max - min + 1) * Math.random() + min, 10)
      const line = []
      for (let i = 0; i < count; i++) {
        // 插入高亮
        line.push(1)
      }
      for (let i = 0, len = 10 - count; i < len; i++) {
        // 在随机位置插入灰色
        const index = parseInt((line.length + 1) * Math.random(), 10)
        line.splice(index, 0, 0)
      }

      return line
    }
    let startMatrix = []

    for (let i = 0; i < startLines; i++) {
      if (i <= 2) {
        // 0-3
        startMatrix.push(getLine(5, 8))
      } else if (i <= 6) {
        // 4-6
        startMatrix.push(getLine(4, 9))
      } else {
        // 7-9
        startMatrix.push(getLine(3, 9))
      }
    }
    for (let i = 0, len = this.rowNum - startLines; i < len; i++) {
      // 插入上部分的灰色
      startMatrix.unshift(this.blankLine)
    }
    return startMatrix
  }

  // 方块是否能移到到指定位置
  want(next, matrix) {
    const xy = next.xy
    const shape = next.shape
    const horizontal = shape[0].length
    return shape.every((m, k1) => m.every((n, k2) => {
      if (xy[1] < 0) {
        // left
        return false
      }
      if (xy[1] + horizontal > this.colNum) {
        // right
        return false
      }
      if (xy[0] + k1 < 0) {
        // top
        return true
      }
      if (xy[0] + k1 >= this.rowNum) {
        // bottom
        return false
      }
      if (n) {
        if (matrix[xy[0] + k1][xy[1] + k2]) {
          return false
        }
        return true
      }
      return true
    }))
  }

  // 是否达到消除状态
  isClear(matrix) {
    const clearLines = []
    matrix.forEach((m, k) => {
      if (m.every(n => {
          return !!n
        })) {
        clearLines.push(k)
      }
    })
    if (clearLines.length === 0) {
      return false
    }
    return clearLines
  }

  // 游戏是否结束, 第一行落下方块为依据
  isOver(matrix) {
    return matrix[0].some(n => !!n)
  }
}