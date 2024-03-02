const 
    canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d')

let
    sprite, scorer, animation,
    trigger = false, stopper = false, gameOver = false

const 
    setSize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    },

    clearScreen = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    },

    init = () => {
        setSize()
        trigger = false
        stopper = false
        gameOver = false

        sprite = new Sprite(75)
        scorer = new Score()

        sprite.draw()
        scorer.draw()
    }, 
    
    animate = () => {
        clearScreen()
        sprite.update()
        scorer.draw()

        if(gameOver) gameOverScreen()
        else requestAnimationFrame(animate)
    },

    handleClick = e => {
        if(gameOver && stopper) {
            clearScreen()
            cancelAnimationFrame(animate)
            init()
        } else sprite.clicked(e.clientX, e.clientY)

        if(!trigger && sprite.isBound()){
            animation = requestAnimationFrame(animate)
            trigger = true
        }

    },

    gameOverScreen = () => {
        clearScreen()
        
        ctx.fillStyle = '#2f2f2f'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = '#fcfcfc'
        ctx.fillText("Game Over", canvas.width / 2, canvas.height * 0.45)

        ctx.font = '600 48px Arial'
        ctx.fillText("Score:  " + scorer.value, canvas.width/2, canvas.height * 0.6)

        setTimeout(() => {
            ctx.font = '100 1rem Arial'
            ctx.fillText("click anywhere to continue", canvas.width / 2, canvas.height * 0.9)

            stopper = true
        }, 1000)
    }

class Sprite {
    constructor(r) {
        this.r = r
        this.x = canvas.width * 0.5
        this.y = canvas.height * 0.5
        
        this.dy = 1
        this.dx = 0

        this.gravity = 0.45
        this.friction = 0.99

        this.pointX
        this.pointY
        this.contactX
        this.contactY
    }

    update() {
        this.dy += this.gravity * this.friction
        this.dx = -this.contactX / (this.r / 5)
        
        this.y += this.dy
        this.x += this.dx

        if(this.x + this.r >= canvas.width || this.x - this.r <= 0) {
            this.dx *= -1
            this.contactX *= -1
        }
        
        this.draw()

        if(this.y - this.r > canvas.height) gameOver = true
    }

    draw() {
        ctx.beginPath()
        ctx.fillStyle = '#E1AFD1'
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx.fill()
    }

    clicked(x, y) {
        this.pointX = x
        this.pointY = y

        if(!this.isBound()) return
        
        if(this.dy >= 0) {
            this.calculateContact()
            let res = 6 + (this.contactY / (this.r * 2)) * 6
            this.dy = -res
            scorer.value++
        }
    }

    isBound() {
        let distance = Math.sqrt(Math.pow(this.pointX - this.x, 2) + Math.pow(this.pointY - this.y, 2))
        return distance <= this.r
    }

    calculateContact() {
        this.contactX = this.pointX - this.x
        this.contactY = this.pointY - this.y + this.r
    }
}

class Score {
    constructor() {
        this.value = 0
    }

    draw() {
        ctx.font = '800 64px Arial'
        ctx.textAlign = 'center'
        ctx.fillStyle = '#AD88C6'
        ctx.fillText(this.value, canvas.width / 2,  100)
    }
}

addEventListener('DOMContentLoaded', init)
addEventListener('resize',  setSize)
addEventListener('mousedown', handleClick)