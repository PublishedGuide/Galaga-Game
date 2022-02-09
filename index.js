//Step 1. Project Setup
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const scoreEl = document.querySelector('#scoreEl')

console.log(scoreEl)
canvas.width = 1024//innerWidth
canvas.height = 720//innerHeight

//Step 2: Create a player
class Player {
    constructor() {

        this.velocity ={
            x: 0,
            y: 0
        }

        this.rotaion = 0
        this.opacity = 1

        const image = new Image()
        image.src = './galaga_image/player1.png'
        image.onload = () => {
            const scale = 0.15
            this.image = image 
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            }
        }
    }

    draw() {
        //c.fillStyle = 'red'
        //c.fillRect(this.position.x, this.position.y, this.width, this.height)
        
        c.save()
        c.globalAlpha = this.opacity
        c.translate(
            player.position.x + player.width / 2, 
            player.position.y + player.height / 2
        )      
        c.rotate(this.rotaion)
        c.translate(
            -player.position.x - player.width / 2, 
            -player.position.y - player.height / 2
        ) 

        c.drawImage(
            this.image, 
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
        )
        c.restore()
    }

    update() {
        if (this.image) {
            this.draw()
            this.position.x += this.velocity.x    
        }
    }
}

class Pojectile {
    constructor({position, velocity}){
        this.position = position
        this.velocity = velocity

        this.radius = 4
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'red'
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Particle {
    constructor({position, velocity, radius, color, fades}){
        this.position = position
        this.velocity = velocity

        this.radius = radius
        this.color = color
        this.opacity = 1
        this.fades = fades
    }

    draw() {
        //time sensitive fade out - decreasing opacity value over time
        c.save()
        c.globalAlpha = this.opacity
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
        c.restore()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        
        if (this.fades){ 
            this.opacity -= 0.01}
    }
}

// Invaders shoot back
class InvaderPojectile {
    constructor({position, velocity}){
        this.position = position
        this.velocity = velocity

        this.width = 3
        this.height = 10
    }

    draw() {
        c.fillStyle = 'white'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

//Step 5. Create invader class from copying over and adjusting the player class script
class Invader {
    constructor({position}) {

        this.velocity ={
            x: 0,
            y: 0
        }

        const image = new Image()
        image.src = './galaga_image/invader1.png'
        image.onload = () => {
            const scale = 0.10
            this.image = image 
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x: position.x,
                y: position.y
            }
        }
    }

    draw() {
        //c.fillStyle = 'red'
        //c.fillRect(this.position.x, this.position.y, this.width, this.height)

        c.drawImage(
            this.image, 
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
        )
    }

    update({velocity}) {
        if (this.image) {
            this.draw()
            this.position.x += velocity.x 
            this.position.y += velocity.y   
        }
    }
    shoot(invaderPojectiles) {
        invaderPojectiles.push(new InvaderPojectile({
            position: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height
            },
            velocity: {
                x: 0,
                y: 5
            } 
        }))
    }
}

//Step 6. Create a grid of and move invaders
class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }

        this.velocity = {
            x: 3,
            y: 0
        }

        this.invaders = []

        const columns = Math.floor(Math.random() * 10 + 2) 
        const rows = Math.floor(Math.random() * 4 + 2) 
        this.width = columns * 55
        //random will generate 0 - 4 rows while adding 2 to every output, meaning we will have produced 2 - 6 rows at random
        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                this.invaders.push(new Invader({
                    position: {
                    x: x * 55, //image of invader should be 50 pixels wide
                    y: y * 50
                    }
                }))
            }
        }
    }
    
    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        this.velocity.y = 0

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x
            this.velocity.y = 50
        }
    }
}
const player = new Player()
const projectiles = []
//const invader = new Invader()
//const girds = [new Grid]  *Now that we have our frames spawn we don't need the default 'new Grid' here anymore
const girds = []
const invaderProjectiles = []
const particles = []

const keys = {
    a:{
        pressed: false
    },
    d:{
        pressed: false
    },
    space:{
        pressed: false
    }
}

//Step 7. Spawn Grids at intervals
let frames = 0
let randomInterval = Math.floor(Math.random() * 500 + 500)
let game = {
    over: false,
    active: true
}
let score = 0

//Step 11. Create stars in background
for (let i = 0; i < 100; i++) {
    particles.push(new Particle({
        position: {
            //the stars will appear in any location within the space offered below
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
        },
        velocity: {
            x: 0, //stars wont move left to right
            y: 0.5  //but will slowly move down the screen to make the appearance that our character is moving through space
        },
        radius: Math.random() * 2,
        color: 'white'
    }))
}

function createParticle({object, color, fades}) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle({
            position: {
                x: object.position.x + object.width / 2,
                y: object.position.y + object.height / 2
            },
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            radius: Math.random() * 3,
            color: color || '#BAA0DE', //hash code used to derive color of invader image
            fades: fades
        }))
    }
}
function animate() {
    if (!game.active) return //if our game is not active
    requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    //invader.update()
    //player.draw()
    player.update()

    particles.forEach((particle, i) => {
        //replacing/respawning star particles once they leave the screen to create continuously moving bg
        if (particle.position.y - particle.radius >= canvas.height) {
            particle.position.x = Math.random() * canvas.width
            particle.position.y = -particle.radius
        }

        //have particles from explosions fade and time out
        if (particle.opacity <= 0) {
            setTimeout(()=> {
                particles.splice(i, 1)
            }, 0)
        } else {
            particle.update()
        }
    })

    //console.log(particles)

    invaderProjectiles.forEach((invaderProjectile, index) => {
        //Garbage collection - removing the projectile shot objects once they leave the screen
        if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1)
            }, 0)
        } else {
            invaderProjectile.update()
        }
        //Collision detection for when our player is hit
        if(invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
            invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
            invaderProjectile.position.x <= player.position.x + player.width) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1)
                player.opacity = 0
                game.over = true
            }, 0)

            setTimeout(() => {
                invaderProjectiles.splice(index, 1)
                player.opacity = 0
                game.active = false
            }, 2000) //this will run after 2 sec (2000ms) of the player character being destroyed

            //console.log('you lose')
            createParticle({
                object: player,
                color: 'white',
                fades: true
            })
        }
    })

    //just to check if the abstraction is preforming well
    //console.log(invaderProjectiles)

    projectiles.forEach((projectile, index) => {
        //Garbage collection - removing the projectile shot objects once they leave the screen
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0) 
        } else {
            projectile.update()
        }
    })

    girds.forEach((grid, gridIndex) => {
        grid.update()
        // spawn projectiles
        if (frames % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
        }
        grid.invaders.forEach((invader, i) => {
            invader.update({velocity: grid.velocity})

            //Projectiles hit invader
            projectiles.forEach((projectile, j) => {
                if (projectile.position.y - projectile.radius <= 
                    invader.position.y + invader.height &&
                    projectile.position.x + projectile.radius >=
                    invader.position.x &&
                    projectile.position.x - projectile.radius <=
                    invader.position.x + invader.width &&
                    projectile.position.y + projectile.radius >= 
                    invader.position.y
                ) {
                        setTimeout(() => {
                            const invaderFound = grid.invaders.find((invader2) => {
                                return invader2 === invader
                            })
                            const projectileFound = projectiles.find(
                                projectile2 => {
                                    return projectile2 === projectile
                                }
                            )
                            // remove invader and projectile
                            if (invaderFound && projectileFound) {
                                score += 100 //we place this to add 100pts to count of every destroed invader
                                //console.log(score)
                                scoreEl.innerHTML = score
                                createParticle({
                                    object: invader,
                                    fades: true
                                })
                                grid.invaders.splice(i, 1)
                                projectiles.splice(j, 1)

                                if (grid.invaders.length > 0) {
                                    const firstInvader = grid.invaders[0]
                                    const lastInvader = grid.invaders[grid.invaders.length - 1]

                                    grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width
                                    grid.position.x = firstInvader.position.x
                                } else {
                                    grids.splice(gridIndex, 1)
                                }
                            }
                        }, 0)
                    }
            })
        })
    })

    if (keys.a.pressed && player.position.x >= 0) {
        player.velocity.x = -7
        player.rotaion = -0.15
    } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
        player.velocity.x = 7
        player.rotaion = 0.15
    } else {
        player.velocity.x = 0
        player.rotaion = 0
    }
    // spawning enemies
    if (frames % randomInterval === 0) {
        girds.push(new Grid())
        randomInterval = Math.floor(Math.random() * 500 + 500)
        frames = 0
        //console.log(randomInterval)
    }

    //console.log(frames)   *we use the log display just to see what is happening in the console as commands progress
    frames ++
}

animate()

//Step 3. Move the player
//Step 4. create projectiles
//At each of these steps we are adding and manipulating methods and clases within our player class
 
//addEventListener('keydown', (event) => { console.log(event.key) })
//Object destructuring
addEventListener('keydown', ({key}) => {
    if (game.over) return

    //console.log(key)
    switch (key) {
        case 'a':
            //console.log('left')
            keys.a.pressed = true
            break
        case 'd':
            //console.log('right')
            keys.d.pressed = true
            break
        case ' ':
            //console.log('space')
            //keys.space.pressed = true
            projectiles.push(new Pojectile({
                position: {
                    x: player.position.x + player.width / 2,
                    y: player.position.y
                }, 
                velocity: {
                    x: 0,
                    y: -10
                }
            })
        )

        //console.log(projectiles)
        break
    }
 })

 addEventListener('keyup', ({key}) => {
    //console.log(key)
    switch (key) {
        case 'a':
            //console.log('left')
            keys.a.pressed = false
            break
        case 'd':
            //console.log('right')
            keys.d.pressed = false
            break
        case ' ':
            //console.log('space')
            //keys.space.pressed = true
            break
    }
 })

