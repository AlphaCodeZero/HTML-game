var myGamePiece
var myObstacles = []
window.onload = prepareGame

function prepareGame () {
  var tips = document.createElement('div')
  tips.className = 'text'
  tips.innerHTML = '<div><p>点击灰色区域开始游戏</p><p>越过一个个障碍获取更高分</p><div>'
  document.body.appendChild(tips)
  window.addEventListener('keydown', function pressToStart (event) {
    if (event.keyCode === 38) {
      tips.parentNode.removeChild(tips)
      startGame()
      window.removeEventListener('keydown', pressToStart)
    }
  })
  document.body.addEventListener('click', function clickToStart (event) {
    tips.parentNode.removeChild(tips)
    startGame()
    document.body.removeEventListener('click', clickToStart)
  })
}

function startGame () {
  myGameArea.start()
  myGamePiece = new Component(30, 30, 'red', 10, 120)
  myGamePiece.gravity = 0.05
}

var myGameArea = {
  canvas: document.createElement('canvas'),
  start: function () {
    this.canvas.width = window.innerWidth
    this.canvas.height = 0.5625 * window.innerWidth
    this.context = this.canvas.getContext('2d')
    document.body.insertBefore(this.canvas, document.body.firstChild)
    this.frameNo = 0
    this.score = 0
    this.interval = setInterval(updateGame, 20)
    window.addEventListener('keydown', function (event) {
      myGameArea.key = event.keyCode
    })
    window.addEventListener('keyup', function (event) {
      myGameArea.key = false
    })
    document.body.addEventListener('touchstart', function (event) {
      myGameArea.key = 38
      event.stopPropagation()
    })
    document.body.addEventListener('touchend', function () {
      myGameArea.key = false
    })
  },
  clear: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}

function Component (width, height, color, x, y) {
  this.x = x
  this.y = y
  this.speedX = 0
  this.speedY = 0
  this.gravity = 0
  this.color = color
  this.width = width
  this.height = height
  this.update = function () {
    var ctx = myGameArea.context
    ctx.fillStyle = this.color
    this.speedY += this.gravity
    this.x += this.speedX
    this.y += this.speedY
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
  this.hitBoundary = function () {
    if (this.y <= 0 || this.y + this.height >= myGameArea.canvas.height) return true
    return false
  }
  this.crash = function (otherObstacle) {
    if (this.x > otherObstacle.x + otherObstacle.width || this.x + this.width < otherObstacle.x || this.y > otherObstacle.y + otherObstacle.height || this.y + this.height < otherObstacle.y) {
      return false
    } else {
      return true
    }
  }
}

function updateGame () {
  if (myGamePiece.hitBoundary()) {
    clearInterval(myGameArea.interval)
    setTimeout(restart, 1000)
    return
  };
  for (let i = 0; i < myObstacles.length; i++) {
    if (myGamePiece.crash(myObstacles[i])) {
      clearInterval(myGameArea.interval)
      setTimeout(restart, 1000)
      return
    };
  };
  myGameArea.clear()
  if (myGameArea.key && myGameArea.key === 38) {
    myGamePiece.gravity = -0.2
  } else {
    myGamePiece.gravity = 0.05
  };
  myGameArea.frameNo++
  if (myGameArea.frameNo > 480 && myObstacles[0].x < -20) {
    myObstacles.splice(0, 2)
    myGameArea.score++
  };
  if (myGameArea.frameNo === 1 || myGameArea.frameNo % Math.floor(0.25 * window.innerWidth) === 0) {
    var x = myGameArea.canvas.width; var y = myGameArea.canvas.height
    var minCenter = 25
    var maxCenter = 245
    var center = Math.floor(Math.random() * (maxCenter - minCenter + 1) + minCenter)
    var minGap = 50
    var maxGap = 100
    var gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap)
    var upper = (center - gap / 2 < 0) ? 0 : (center - gap / 2)
    var lower = (center + gap / 2 > y) ? y : (center + gap / 2)
    var upperObstacle = new Component(10, upper, 'green', x, 0)
    var lowerObstacle = new Component(10, y - lower, 'green', x, lower)
    myObstacles.push(upperObstacle, lowerObstacle)
  };
  for (let i = 0; i < myObstacles.length; i++) {
    myObstacles[i].speedX = -Math.floor(myGameArea.frameNo / 150) / 20 - 1
    myObstacles[i].update()
  };
  displayScore()
  myGamePiece.update()
}

function displayScore () {
  var ctx = myGameArea.context
  ctx.font = 'bold 20px Arial'
  ctx.fillStyle = 'black'
  ctx.fillText('分数: ' + myGameArea.score, 40, 40)
}

function restart () {
  var canvas = document.querySelector('canvas')
  canvas.parentNode.removeChild(canvas)
  var score = myGameArea.score
  var high
  if (window.localStorage) {
    if (localStorage.highest_score) {
      localStorage.highest_score = (localStorage.highest_score > score) ? localStorage.highest_score : score
    } else {
      localStorage.highest_score = score
    };
    high = localStorage.highest_score
  } else {
    high = 'NaN'
  };
  var tips = document.createElement('div')
  tips.className = 'text'
  tips.innerHTML = '<div><p>你输了！</p><p>你的分数: ' + score + '</p><p>最高分数: ' + high + '</p><p>点击灰色区域重新开始</p><div>'
  document.body.appendChild(tips)
  window.addEventListener('keydown', function pressToRestart (event) {
    if (event.keyCode === 38) {
      tips.parentNode.removeChild(tips)
      myGamePiece = null
      myObstacles = []
      startGame()
      window.removeEventListener('keydown', pressToRestart)
    }
  })
  document.body.addEventListener('click', function clickToRestart () {
    tips.parentNode.removeChild(tips)
    myGamePiece = null
    myObstacles = []
    startGame()
    document.body.removeEventListener('click', clickToRestart)
  })
}
