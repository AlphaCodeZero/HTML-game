function getDistance (pointA, pointB) {
  return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2))
}

function random (min, max, skew) {
  let u = 0; let v = 0
  while (u === 0) u = Math.random() // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random()
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)

  num = num / 10.0 + 0.5 // Translate to 0 -> 1
  if (num > 1 || num < 0) num = random(min, max, skew) // resample between 0 and 1 if out of range
  num = Math.pow(num, skew) // Skew
  num *= max - min // Stretch to fill range
  num += min // offset to min
  return num
}

class World {
  constructor () {
    this.canvas = document.createElement('canvas')
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    document.body.appendChild(this.canvas)
    this.scores = 0
    this.context = this.canvas.getContext('2d')
    this.frameNo = 0
    this.total = 50
    this.viruses = []
    this.missiles = []
    this.paused = true
    this.plane = new Plane({
      initX: 0.5 * this.canvas.width,
      initY: 0.75 * this.canvas.height,
      maxX: this.canvas.width,
      maxY: this.canvas.height,
      context: this.context
    })
    for (let i = 0; i < this.total; i++) {
      this.viruses.push(new Virus(this.canvas.width, this.canvas.height, this.context, 200))
    }
    this.canvas.addEventListener('touchstart', e => {
      // 如果鼠标在飞机范围内，开始游戏或者继续游戏
      if (
        e.touches[0].clientX > this.plane.positionX - this.plane.width * 0.5 &&
        e.touches[0].clientX < this.plane.positionX + this.plane.width * 0.5 &&
        e.touches[0].clientY > this.plane.positionY - this.plane.height * 0.5 &&
        e.touches[0].clientY < this.plane.positionY + this.plane.height * 0.5
      ) {
        this.start()
        const tips = document.querySelector('#tips')
        tips.style.display = 'none'
      }
    })
    this.canvas.addEventListener('touchmove', e => {
      if (!this.paused) {
        this.plane.moveto(e.touches[0].clientX, e.touches[0].clientY)
      }
    })
    this.canvas.addEventListener('touchend', e => {
      // 暂停游戏
      this.pause()
    })
  }

  start () {
    this.paused = false
    this.interval = window.setInterval(this.update.bind(this), 20)
  }

  pause () {
    this.paused = true
    window.clearInterval(this.interval)
    this.interval = null
  }

  win () {
    const div = document.querySelector('#win')
    div.style.display = 'flex'
    this.pause()
  }

  lose () {
    const div = document.querySelector('#lose')
    div.style.display = 'flex'
    this.pause()
  }

  update () {
    this.frameNo++
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.plane.update(this.context)
    this.missiles = this.missiles.filter(missile => missile.positionY > -50)
    this.missiles.forEach(missile => missile.update())
    if (this.frameNo % 10 === 0) {
      const missile = new Missile(this.plane.positionX, this.plane.positionY - 4, this.context)
      this.missiles.push(missile)
    }
    for (let i = 0; i < this.viruses.length; i++) {
      const virus = this.viruses[i]
      virus.update()
      if (virus.positionY > -50) {
        const hitPlane = virus.checkHitPlane(this.plane)
        if (hitPlane) {
          this.lose()
          return
        }
        for (let j = 0; j < this.missiles.length; j++) {
          const missile = this.missiles[j]
          const hitMissile = virus.checkHitMissile(missile)
          if (hitMissile) {
            virus.hitPoints--
            virus.slow()
            missile.shouldBeRemoved = true
          }
        }
      }
    }
    const survivedViruses = []
    this.viruses.forEach(v => {
      if (v.hitPoints > 0) survivedViruses.push(v)
      else this.scores += v.initHitPoints
    })
    this.viruses = survivedViruses
    if (this.viruses.length === 0) {
      window.setTimeout(() => {
        this.win()
      }, 2000)
    }
    this.missiles = this.missiles.filter(m => !m.shouldBeRemoved)
    // 画分数
    this.context.fillStyle = 'black'
    this.context.font = '20px serif'
    this.context.textAlign = 'left'
    this.context.fillText(`分数：${this.scores}`, 10, 30)
    this.context.fillText(`剩余：${Math.ceil(this.viruses.length / this.total * 100)}%`, this.canvas.width - 120, 30)
  }
}

/**
 * 飞机类
 */
class Plane {
  constructor ({
    initX,
    initY,
    maxX,
    maxY,
    context
  }) {
    this.positionX = initX
    this.positionY = initY
    this.maxX = maxX
    this.maxY = maxY
    this.width = 20
    this.height = 30
    this.context = context
    this.update()
  }

  moveto (x, y) {
    this.positionX = Math.max(0, Math.min(x, this.maxX))
    this.positionY = Math.max(0, Math.min(y, this.maxY))
  }

  update () {
    this.context.fillStyle = 'black'
    this.context.fillRect(this.positionX - this.width * 0.5, this.positionY - this.height * 0.5, this.width, this.height)
  }
}

/**
 * 导弹类
 */
class Missile {
  constructor (initX, initY, context) {
    this.positionX = initX
    this.positionY = initY
    this.width = 2
    this.height = 10
    this.context = context
    this.speedY = -5
    this.update()
  }

  update () {
    this.positionY += this.speedY
    this.context.fillStyle = 'aqua'
    this.context.fillRect(this.positionX - this.width / 2, this.positionY - this.height / 2, this.width, this.height)
  }
}

/**
 * 病毒类
 */
class Virus {
  constructor (maxX, maxY, context, initHitPoints) {
    this.maxX = maxX
    this.maxY = maxY
    this.context = context
    this.bgColor = '#' + Math.floor(Math.random() * Math.pow(16, 6)).toString(16)
    // 初始生命值，用其他公式来使概率不均匀，参考：https://stackoverflow.com/a/49434653
    this.initHitPoints = Math.floor(random(1, initHitPoints, 6))
    this.hitPoints = this.initHitPoints
    this.radius = Math.floor(Math.random() * 40) + 10 // 半径，10~50 的随机数
    this.positionX = Math.floor(Math.random() * maxX)
    this.positionY = -Math.floor(Math.random() * 15 * maxY) - 50
    this.speedX = Math.floor(Math.random() * 6) - 3 // x 方向的速度，-3~3 的随机数
    this.speedY = Math.floor(Math.random() * 3) + 1 // y 方向的速度，1~4 的随机数
    this.isSlowed = false // 受到攻击后，0.1 秒的时间内 isSlowed 为 true，此时速度会降低为1/10
    this.timeout = null
  }

  slow () {
    this.isSlowed = true
    window.clearTimeout(this.timeout) // 防抖
    this.timeout = window.setTimeout(() => {
      this.isSlowed = false
    }, 200)
  }

  checkHitPlane (plane) {
    const virusCenter = {
      x: this.positionX,
      y: this.positionY
    }
    if (
      getDistance(
        {
          x: plane.positionX - plane.width / 2,
          y: plane.positionY - plane.height / 2
        }, virusCenter
      ) < this.radius ||
      getDistance(
        {
          x: plane.positionX + plane.width / 2,
          y: plane.positionY - plane.height / 2
        }, virusCenter
      ) < this.radius ||
      getDistance(
        {
          x: plane.positionX - plane.width / 2,
          y: plane.positionY + plane.height / 2
        }, virusCenter
      ) < this.radius ||
      getDistance(
        {
          x: plane.positionX + plane.width / 2,
          y: plane.positionY + plane.height / 2
        }, virusCenter
      ) < this.radius
    ) return true
    return false
  }

  checkHitMissile (missile) {
    const virusCenter = {
      x: this.positionX,
      y: this.positionY
    }
    if (
      getDistance(
        {
          x: missile.positionX - missile.width / 2,
          y: missile.positionY - missile.height / 2
        }, virusCenter
      ) < this.radius ||
      getDistance(
        {
          x: missile.positionX + missile.width / 2,
          y: missile.positionY - missile.height / 2
        }, virusCenter
      ) < this.radius ||
      getDistance(
        {
          x: missile.positionX - missile.width / 2,
          y: missile.positionY + missile.height / 2
        }, virusCenter
      ) < this.radius ||
      getDistance(
        {
          x: missile.positionX + missile.width / 2,
          y: missile.positionY + missile.height / 2
        }, virusCenter
      ) < this.radius
    ) return true
    return false
  }

  update () {
    if (this.isSlowed) {
      this.positionX += this.speedX * 0.1
      this.positionY += this.speedY * 0.1
    } else {
      this.positionX += this.speedX
      this.positionY += this.speedY
    }
    if (this.positionX - this.radius <= 0) this.speedX = Math.abs(this.speedX)
    if (this.positionX + this.radius >= this.maxX) this.speedX = -Math.abs(this.speedX)
    if (this.positionY > this.maxY + 50) this.positionY = -50
    if (this.positionY > -50) {
      this.context.fillStyle = this.bgColor
      this.context.beginPath()
      this.context.arc(this.positionX, this.positionY, this.radius, 0, Math.PI * 2, true)
      this.context.closePath()
      this.context.fill()
      this.context.fillStyle = 'black'
      this.context.font = `${this.radius}px serif`
      this.context.textAlign = 'center'
      this.context.fillText(this.hitPoints, this.positionX, this.positionY + this.radius / 3, 1.5 * this.radius)
    }
  }
}

window.onload = function () {
  // eslint-disable-next-line no-new
  new World()
  const buttons = document.querySelectorAll('.restart')
  buttons.forEach(b => b.addEventListener('click', e => {
    const canvas = document.querySelector('canvas')
    document.body.removeChild(canvas)
    // eslint-disable-next-line no-new
    new World()
    e.target.parentNode.style.display = 'none'
  }))
}
