// draw black pawn
function drawBlackPawn (parentNode) {
  var pawn = parentNode.getElementsByTagName('canvas')[0]
  var context = pawn.getContext('2d')
  context.beginPath()
  context.arc(40, 40, 30, 0, 2 * Math.PI, false)
  context.fillStyle = 'black'
  context.fill()
  parentNode.flag = 1
  his.push(parentNode)
}

// draw white pawn
function drawWhitePawn (parentNode) {
  var pawn = parentNode.getElementsByTagName('canvas')[0]
  var context = pawn.getContext('2d')
  context.beginPath()
  context.arc(40, 40, 30, 0, 2 * Math.PI, false)
  context.lineWidth = 3
  context.strokeStyle = 'black'
  context.stroke()
  parentNode.flag = -1
  his.push(parentNode)
}

// check if there is a victor or a tie
function judge () {
  var grids = document.getElementsByClassName('cell')
  var count = 0
  for (var j = 0; j < grids.length; j++) {
    if (grids[j].flag !== 0) count++
  }
  for (var i = 0; i < 3; i++) {
    // check x-orientation
    var sumX = grids[3 * i].flag + grids[3 * i + 1].flag + grids[3 * i + 2].flag
    // check y-orientation
    var sumY = grids[i].flag + grids[i + 3].flag + grids[i + 6].flag
    // check \-orientation
    var sum1 = grids[0].flag + grids[4].flag + grids[8].flag
    // check /-orientation
    var sum2 = grids[2].flag + grids[4].flag + grids[6].flag
    if (sumX === 3 || sumY === 3 || sum1 === 3 || sum2 === 3) {
      // alert('Black wins!');
      endGame(3)
      break
    } else if (sumX === -3 || sumY === -3 || sum1 === -3 || sum2 === -3) {
      // alert('White wins!');
      endGame(-3)
      break
    } else if (count === 9) {
      // alert('TIE!');
      endGame(0)
      break
    }
  }
}

function endGame (result) {
  var container = document.getElementById('container')
  var print = document.createElement('div')
  print.setAttribute('id', 'print')
  container.appendChild(print)
  var para = document.createElement('p')
  print.appendChild(para)
  if (result === 3) para.innerHTML = '黑棋胜利!'
  if (result === -3) para.innerHTML = '白棋胜利!'
  if (result === 0) para.innerHTML = '平局'
}

var flag
var his = []// 不能命名为history，因为BOM有个history对象，见ProJS第215页
var playernumber

function newGame (num) {
  flag = 1
  his = []
  var container = document.getElementById('container')
  container.innerHTML = ''
  for (var i = 0; i < 9; i++) {
    var cell = document.createElement('div')
    cell.setAttribute('class', 'cell')
    cell.flag = 0
    var can = document.createElement('canvas')
    can.width = 80
    can.height = 80
    cell.appendChild(can)
    container.appendChild(cell)
    if (num === 2) {
      cell.onclick = function () {
        if (this.flag !== 0) return
        if (flag === 1) {
          drawBlackPawn(this)
        } else {
          drawWhitePawn(this)
        }
        flag = -flag
        judge()
      }
    };
    if (num === 1) {
      cell.onclick = function () {
        if (this.flag !== 0) return
        drawBlackPawn(this)
        judge()
        var print = document.getElementById('print')
        if (!print) {
          autoDraw()
          judge()
        }
      }
    }
  }
}

window.onload = function () {
  var one = document.getElementById('oneplayer')
  one.onclick = function () {
    newGame(1)
    playernumber = 1
  }
  var two = document.getElementById('twoplayer')
  two.onclick = function () {
    newGame(2)
    playernumber = 2
  }
  var res = document.getElementById('restart')
  res.onclick = function () {
    if (playernumber === undefined) return
    newGame(playernumber)
  }
  var undo = document.getElementById('undo')
  undo.onclick = resetLastStep
}

function resetLastStep () {
  if (his.length === 0) return
  var print = document.getElementById('print')
  if (print) return
  let lastone
  let ctx1
  if (playernumber === 1) {
    lastone = his[his.length - 1]
    ctx1 = lastone.getElementsByTagName('canvas')[0].getContext('2d')
    ctx1.clearRect(0, 0, 80, 80)
    lastone.flag = 0
    var lasttwo = his[his.length - 2]
    var ctx2 = lasttwo.getElementsByTagName('canvas')[0].getContext('2d')
    ctx2.clearRect(0, 0, 80, 80)
    lasttwo.flag = 0
    his.pop()
    his.pop()
  };
  if (playernumber === 2) {
    lastone = his[his.length - 1]
    ctx1 = lastone.getElementsByTagName('canvas')[0].getContext('2d')
    ctx1.clearRect(0, 0, 80, 80)
    lastone.flag = 0
    flag = -flag
    his.pop()
  }
}

function autoDraw () {
  var grids = document.getElementsByClassName('cell')
  var count = 0
  for (var j = 0; j < grids.length; j++) {
    if (grids[j].flag !== 0) count++
  }
  if (count === 9) {
    return
  }
  // 先检查白棋有没有赢的机会
  // 检查X方向是否有两个白棋且第三个为空，如true则在第三个位置画白棋
  for (let i = 0; i < 3; i++) {
    const sum = grids[3 * i].flag + grids[3 * i + 1].flag + grids[3 * i + 2].flag
    if (sum === -2) {
      for (let j = 0; j < 3; j++) {
        if (grids[3 * i + j].flag === 0) {
          drawWhitePawn(grids[3 * i + j])
          return
        }
      }
    }
  };
  // 检查Y方向是否有两个白棋且第三个为空，如true则在第三个位置画白棋
  for (let i = 0; i < 3; i++) {
    const sum = grids[i].flag + grids[3 + i].flag + grids[6 + i].flag
    if (sum === -2) {
      for (let j = 0; j < 3; j++) {
        if (grids[3 * j + i].flag === 0) {
          drawWhitePawn(grids[3 * j + i])
          return
        }
      }
    }
  };
  // 检查\方向是否有两个白棋且第三个为空，如true则在第三个位置画白棋
  var sum1 = grids[0].flag + grids[4].flag + grids[8].flag
  if (sum1 === -2) {
    for (let i = 0; i < 3; i++) {
      if (grids[4 * i].flag === 0) {
        drawWhitePawn(grids[4 * i])
        return
      }
    }
  }
  // 检查/方向是否有两个白棋且第三个为空，如true则在第三个位置画白棋
  var sum2 = grids[2].flag + grids[4].flag + grids[6].flag
  if (sum2 === -2) {
    for (let i = 1; i < 4; i++) {
      if (grids[2 * i].flag === 0) {
        drawWhitePawn(grids[2 * i])
        return
      }
    }
  }

  // 再检查黑棋有没有赢的机会，有的话则阻止
  // 检查X方向是否有两个黑棋且第三个为空，如true则在第三个位置画白棋
  for (let i = 0; i < 3; i++) {
    const sum = grids[3 * i].flag + grids[3 * i + 1].flag + grids[3 * i + 2].flag
    if (sum === 2) {
      for (let j = 0; j < 3; j++) {
        if (grids[3 * i + j].flag === 0) {
          drawWhitePawn(grids[3 * i + j])
          return
        }
      }
    }
  };
  // 检查Y方向是否有两个黑棋且第三个为空，如true则在第三个位置画白棋
  for (let i = 0; i < 3; i++) {
    const sum = grids[i].flag + grids[3 + i].flag + grids[6 + i].flag
    if (sum === 2) {
      for (let j = 0; j < 3; j++) {
        if (grids[3 * j + i].flag === 0) {
          drawWhitePawn(grids[3 * j + i])
          return
        }
      }
    }
  };
  // 检查\方向是否有两个黑棋且第三个为空，如true则在第三个位置画白棋
  var sum048 = grids[0].flag + grids[4].flag + grids[8].flag
  if (sum048 === 2) {
    for (let i = 0; i < 3; i++) {
      if (grids[4 * i].flag === 0) {
        drawWhitePawn(grids[4 * i])
        return
      }
    }
  }
  // 检查/方向是否有两个黑棋且第三个为空，如true则在第三个位置画白棋
  var sum246 = grids[2].flag + grids[4].flag + grids[6].flag
  if (sum246 === 2) {
    for (let i = 1; i < 4; i++) {
      if (grids[2 * i].flag === 0) {
        drawWhitePawn(grids[2 * i])
        return
      }
    }
  }

  // 如果中间格是空的则画白棋
  if (grids[4].flag === 0) {
    drawWhitePawn(grids[4])
    return
  }
  // 否则如果4个角点有空的，则随机在空的角点中画白棋
  var blank = []
  for (let i = 0; i < 5; i++) {
    if (grids[2 * i].flag === 0) {
      blank.push(grids[2 * i])
    };
  };
  let ran
  if (blank.length !== 0) {
    ran = Math.floor(Math.random() * blank.length)
    drawWhitePawn(blank[ran])
  } else { // 如果中点和角点都非空，则在剩余空格中随机画白棋
    for (let i = 0; i < 9; i++) {
      if (grids[i].flag === 0) {
        blank.push(grids[i])
      }
    };
    ran = Math.floor(Math.random() * blank.length)
    drawWhitePawn(blank[ran])
  }
}
