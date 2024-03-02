const 
    canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d')

let
    sprite

const setSize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
}

const init = () => {
    setSize()
    sprite = new Sprite(75)
    animate()
}

const animate = () => {
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    sprite.update()
}

const handleClick = e => {
    sprite.clicked(e.clientX, e.clientY)
}

class Sprite {
    constructor(r) {
        this.r = r
        this.x = canvas.width * 0.5
        this.y = canvas.height * 0.4
        this.dy = 1
    }

    update() {
        this.dy += 0.5

        this.y += this.dy
        this.draw()
    }

    draw() {
        ctx.beginPath()
        ctx.fillStyle = '#E1AFD1'
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx.fill()
    }

    isBound(x, y) {
        let distance = Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2))
        return distance <= this.r
    }

    clicked(x, y) {
        if(!this.isBound(x, y)) return

        if(this.dy >= 0)
            this.dy = -this.dy * 1.005
    }
}




addEventListener('DOMContentLoaded', init)
addEventListener('resize',  setSize)
addEventListener('click', handleClick)