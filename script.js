const
    canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d')

let
    sprite, scorer, animation, highlightColor,
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

        if (gameOver) gameOverScreen()
        else requestAnimationFrame(animate)
    },

    handleClick = e => {
        if (gameOver && stopper) {
            clearScreen()
            cancelAnimationFrame(animate)
            init()
        } else sprite.clicked(e.clientX, e.clientY)

        if (!trigger && sprite.isBound()) {
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
        ctx.fillText("Score:  " + scorer.value, canvas.width / 2, canvas.height * 0.6)

        setTimeout(() => {
            ctx.font = '100 1rem Arial'
            ctx.fillText("click anywhere to continue", canvas.width / 2, canvas.height * 0.9)

            stopper = true
        }, 1000)
    },

    setColor = (e) => {
        document.documentElement.style.setProperty('--primary', e.target.value)

        const color = getHighlightColor(e.target.value)

        highlightColor = color

        sprite.setColor(color)
        scorer.setColor(color)
        sprite.draw()
        scorer.draw()
    }

function getHighlightColor(hex, amount = 20) {
    // remove #
    hex = hex.replace('#', '');

    // convert to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // convert RGB → HSL
    r /= 255; g /= 255; b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    // increase lightness
    l = Math.min(1, l + amount / 100);

    // HSL → RGB
    function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    let r2, g2, b2;

    if (s === 0) {
        r2 = g2 = b2 = l;
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r2 = hue2rgb(p, q, h + 1 / 3);
        g2 = hue2rgb(p, q, h);
        b2 = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
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

        this.color = highlightColor || '#535C91'
    }

    update() {
        this.dy += this.gravity * this.friction
        this.dx = -this.contactX / (this.r / 5)

        this.y += this.dy
        this.x += this.dx

        if (this.x + this.r >= canvas.width || this.x - this.r <= 0) {
            this.dx *= -1
            this.contactX *= -1
        }

        this.draw()

        if (this.y - this.r > canvas.height) gameOver = true
    }

    draw() {
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx.fill()
    }

    clicked(x, y) {
        this.pointX = x
        this.pointY = y

        if (!this.isBound()) return

        if (this.dy >= 0) {
            this.calculateContact()
            let res = 10 + (this.contactY / (this.r * 2)) * 4
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

    setColor(color) {
        this.color = color
    }
}

class Score {
    constructor() {
        this.value = 0
        this.color = highlightColor || '#535C91'
    }

    draw() {
        ctx.font = '800 64px Arial'
        ctx.textAlign = 'center'
        ctx.fillStyle = this.color
        ctx.fillText(this.value, canvas.width / 2, 100)
    }

    setColor(color) {
        this.color = color
    }
}

addEventListener('DOMContentLoaded', init)
addEventListener('resize', setSize)
addEventListener('mousedown', handleClick)
document.getElementById("color").addEventListener('change', setColor)