const MAX_VELOCITY = 1.25
const MIN_VELOCITY = 0.5
const MAX_FORCE = 0.004
const NEIGHBOUR_RADIUS = 50
const NEIGHBOUR_ANGLE_MAX = Math.PI / 1.75
const NEIGHBOUR_ANGLE_COS = Math.cos(NEIGHBOUR_ANGLE_MAX)
const SEPARATION_RADIUS = NEIGHBOUR_RADIUS * 0.75
const NEIGHBOUR_RADIUS_SQUARED = NEIGHBOUR_RADIUS * NEIGHBOUR_RADIUS
const SEPARATION_RADIUS_SQUARED = SEPARATION_RADIUS * SEPARATION_RADIUS
const NEIGHBOUR_ANGLE_COS_SQUARED = NEIGHBOUR_ANGLE_COS * NEIGHBOUR_ANGLE_COS
function vectorLength(x, y) {
    return Math.hypot(x, y)
}

function vectorAngle(x, y) {
    return Math.atan2(y, x)
}

function constrainVector(x, y, min, max) {
    const magnitude = vectorLength(x, y)
    if (magnitude === 0) return [0, 0]

    const desiredMagnitude = Math.max(min, Math.min(max, magnitude))
    return [desiredMagnitude * x / magnitude, desiredMagnitude * y / magnitude]
}

function gaussianRandom(start, end) {
    let sample = 0
    for (let index = 0; index < 5; index += 1) {
        sample += Math.random()
    }
    return Math.floor(start + sample / 5 * (end - start + 1))
}

class Joint {
    constructor(context, x, y, length, angle) {
        this.context = context
        this.leftPoint = [0, 0]
        this.rightPoint = [0, 0]
        this.length = length
        this.angle = angle
        this.x = x
        this.y = y
    }

    setParent(parent) {
        this.parent = parent
        this.calculatePosition()
    }

    update(x, y) {
        this.x += x
        this.y += y
    }

    driveAngle(size, angle) {
        this.angle += size * Math.sin(angle)
        if (this.parent) this.calculatePosition()
    }

    followParent() {
        this.angle = vectorAngle(this.x - this.parent.x, this.y - this.parent.y)
        this.calculatePosition()
    }

    calculatePosition() {
        this.x = this.parent.x + this.length * Math.cos(this.angle)
        this.y = this.parent.y + this.length * Math.sin(this.angle)
    }

    transformToJoint() {
        this.context.translate(this.x, this.y)
        this.context.rotate(this.angle + Math.PI / 2)
    }

    getDrawingPoints(width) {
        const offset = Math.PI / 2
        this.leftPoint[0] = this.x + width * Math.cos(this.angle - offset)
        this.leftPoint[1] = this.y + width * Math.sin(this.angle - offset)
        this.rightPoint[0] = this.x + width * Math.cos(this.angle + offset)
        this.rightPoint[1] = this.y + width * Math.sin(this.angle + offset)
    }

    drawHead(width) {
        const context = this.context
        context.save()
        this.transformToJoint()
        context.rotate(Math.PI)
        context.beginPath()
        context.moveTo(-width, 0)
        context.quadraticCurveTo(0, -width * 2.5, width, 0)
        context.closePath()
        context.fill()
        context.restore()
    }

    drawFins(width, yAdjust = 0) {
        const context = this.context
        context.save()
        this.transformToJoint()
        const finSize = width * 1.5
        const finX = width * 1.3
        const finY = -width + yAdjust
        const finStretch = 1.25

        context.beginPath()
        context.moveTo(-finX, -finY)
        context.quadraticCurveTo(-(finX + finSize), -finY, -(finX + finSize), -(finY + finSize * finStretch))
        context.quadraticCurveTo(-finX, -(finY + finSize), -finX, -finY)
        context.moveTo(finX, -finY)
        context.quadraticCurveTo(finX + finSize, -finY, finX + finSize, -(finY + finSize * finStretch))
        context.quadraticCurveTo(finX, -(finY + finSize), finX, -finY)
        context.closePath()
        context.fill()
        context.restore()
    }

    drawTail(width) {
        const context = this.context
        context.save()
        this.transformToJoint()
        const tailY = Math.round(-width / 3)
        const tailSize = Math.round(width * 1.5)
        const tailStretch = Math.round(width / 4)

        context.beginPath()
        context.moveTo(0, tailY)
        context.quadraticCurveTo(-tailSize, tailY, -tailSize, tailY - tailSize * tailStretch)
        context.quadraticCurveTo(0, tailY - tailSize, 0, tailY)
        context.moveTo(0, tailY)
        context.quadraticCurveTo(tailSize, tailY, tailSize, tailY - tailSize * tailStretch)
        context.quadraticCurveTo(0, tailY - tailSize, 0, tailY)
        context.closePath()
        context.fill()
        context.restore()
    }

}

export class KoiFish {
    constructor(context, x, y, jointCount) {
        this.context = context
        this.velocitySquared = 0
        const angle = Math.random() * Math.PI * 2
        this.velocityX = MAX_VELOCITY * Math.cos(angle)
        this.velocityY = MAX_VELOCITY * Math.sin(angle)
        this.velocitySquared = this.velocityX * this.velocityX + this.velocityY * this.velocityY
        this.accelerationX = 0
        this.accelerationY = 0
        this.joints = this.constructJoints(x, y, angle - Math.PI, jointCount)
        this.updatePosition()
        this.resetFlocking()
        this.tick = Math.random() * Math.PI

        this.bodyColour = `rgb(
            ${Math.random() * 255},
            100,
            150
        )`
    }

    constructJoints(x, y, angle, count) {
        let length = 0
        const joints = []
        let jointLength = 4 + 2.5 * count
        joints.push(new Joint(this.context, x, y, jointLength, angle))
        length += jointLength

        for (let index = 0; index < count - 1; index += 1) {
            jointLength = 4 + 2.5 * (count - index - 1)
            const joint = new Joint(this.context, x, y, jointLength, angle)
            joint.setParent(joints[index])
            joints.push(joint)
            length += jointLength
        }

        this.length = length
        return joints
    }

    updatePosition() {
        this.x = this.joints[0].x
        this.y = this.joints[0].y
        const tail = this.joints[this.joints.length - 1]
        this.tailX = tail.x
        this.tailY = tail.y
    }

    resetFlocking() {
        this.neighbourCount = 0
        this.separationCount = 0
        this.cohesionX = 0
        this.cohesionY = 0
        this.alignmentX = 0
        this.alignmentY = 0
        this.separationX = 0
        this.separationY = 0
    }

    flockTo(neighbour) {
        const dx = neighbour.x - this.x
        const dy = neighbour.y - this.y
        const distanceSquared = dx * dx + dy * dy
        if (distanceSquared === 0 || distanceSquared >= NEIGHBOUR_RADIUS_SQUARED) return

        this.neighbourCount += 1
        const viewDot = dx * this.velocityX + dy * this.velocityY
        const viewDotSquared = viewDot * viewDot
        const withinView = NEIGHBOUR_ANGLE_COS >= 0
            ? viewDot >= 0
                && viewDotSquared >= NEIGHBOUR_ANGLE_COS_SQUARED * distanceSquared * this.velocitySquared
            : viewDot >= 0
                || viewDotSquared <= NEIGHBOUR_ANGLE_COS_SQUARED * distanceSquared * this.velocitySquared

        if (withinView) {
            this.alignmentX += neighbour.velocityX
            this.alignmentY += neighbour.velocityY
            this.cohesionX += neighbour.x
            this.cohesionY += neighbour.y

            const tailX = this.x - neighbour.tailX
            const tailY = this.y - neighbour.tailY
            const tailDistanceSquared = tailX * tailX + tailY * tailY
            if (tailDistanceSquared > 0 && tailDistanceSquared <= SEPARATION_RADIUS_SQUARED) {
                const tailDistance = Math.sqrt(tailDistanceSquared)
                const magnitude = NEIGHBOUR_RADIUS - tailDistance
                this.separationX += magnitude * tailX / tailDistance
                this.separationY += magnitude * tailY / tailDistance
            }
        }

        if (distanceSquared <= SEPARATION_RADIUS_SQUARED) {
            const distance = Math.sqrt(distanceSquared)
            this.separationCount += 1
            const magnitude = NEIGHBOUR_RADIUS - distance
            this.separationX -= magnitude * dx / distance
            this.separationY -= magnitude * dy / distance
        }
    }

    applyFlocking() {
        if (this.neighbourCount === 0) return
        this.applyAlignment(this.alignmentX / this.neighbourCount, this.alignmentY / this.neighbourCount)
        this.applyCohesion(this.cohesionX / this.neighbourCount, this.cohesionY / this.neighbourCount)
        if (this.separationCount > 0) {
            this.applySeparation(this.separationX / this.separationCount, this.separationY / this.separationCount)
        }
    }

    applyAlignment(x, y) {
        this.addForce(x - this.velocityX, y - this.velocityY, 0.7)
    }

    applyCohesion(x, y) {
        this.addForce(x - this.x - this.velocityX, y - this.y - this.velocityY, 0.9)
    }

    applySeparation(x, y) {
        this.addForce(x - this.velocityX, y - this.velocityY, 2)
    }

    addForce(x, y, scale) {
        const [forceX, forceY] = constrainVector(x, y, 0, MAX_FORCE)
        this.accelerationX += forceX * scale
        this.accelerationY += forceY * scale
    }

    update(width, height) {
        const boundary = this.length * 1.15
        const offset = this.length * 1.5
        let xOffset = 0
        let yOffset = 0
        if (this.x < -boundary) xOffset = width + offset
        else if (this.x > width + boundary) xOffset = -(width + offset)
        if (this.y < -boundary) yOffset = height + offset
        else if (this.y > height + boundary) yOffset = -(height + offset)
        if (xOffset || yOffset) this.joints.forEach((joint) => joint.update(xOffset, yOffset))

        const xDistance = (width / 2 - this.x) / Math.max(1, width / 2)
        const yDistance = (height / 2 - this.y) / Math.max(1, height / 2)
        const angle = vectorAngle(xDistance, yDistance) + Math.PI / 3
        const [borderX, borderY] = constrainVector(
            vectorLength(xDistance, yDistance) * Math.cos(angle),
            vectorLength(xDistance, yDistance) * Math.sin(angle),
            0,
            MAX_FORCE,
        )
        this.accelerationX += borderX
        this.accelerationY += borderY

        this.velocityX += this.accelerationX
        this.velocityY += this.accelerationY
        const velocity = constrainVector(
            this.velocityX,
            this.velocityY,
            MIN_VELOCITY,
            MAX_VELOCITY,
        )
        this.velocityX = velocity[0]
        this.velocityY = velocity[1]
        this.velocitySquared = this.velocityX * this.velocityX + this.velocityY * this.velocityY

        this.joints[0].update(this.velocityX, this.velocityY)
        this.joints[0].angle = vectorAngle(this.velocityX, this.velocityY) + Math.PI
        this.driveJoint(0)
        for (let index = 1; index < this.joints.length; index += 1) {
            this.joints[index].followParent()
            this.driveJoint(index)
        }
        this.updatePosition()
       
        const acceleration = vectorLength(this.accelerationX, this.accelerationY)
        this.tick = (this.tick + 0.05 + acceleration * 6) % (Math.PI * 2)
        this.accelerationX = 0
        this.accelerationY = 0
    }

    driveJoint(index) {
        const count = this.joints.length
        const angle = this.tick - Math.PI / count * (index + 1)
        const acceleration = vectorLength(this.accelerationX, this.accelerationY)
        const startSize = 0.02 / count
        const sizeIncrement = 0.03 / count + acceleration / 2
        const velocity = vectorLength(this.velocityX, this.velocityY)
        const velocityScale = 0.5 * (velocity - MIN_VELOCITY) / (MAX_VELOCITY - MIN_VELOCITY) + MIN_VELOCITY
        this.joints[index].driveAngle((startSize + sizeIncrement * index) * velocityScale, angle)
    }

    draw() {
        const context = this.context
        const count = this.joints.length
        context.fillStyle = this.bodyColour
        context.strokeStyle = this.bodyColour
        for (let index = 0; index < count; index += 1) {
            const joint = this.joints[index]
            const width = 1.5 * (count - index)
            joint.getDrawingPoints(width)

            if (index === 0) joint.drawHead(width)
            else if (index === 1) joint.drawFins(width)
            else if (index === count - 1) joint.drawTail(width + count)
            else if (count > 4 && index === 3) joint.drawFins(width * 0.9)
        }

        context.beginPath()
        context.moveTo(this.x, this.y)
        for (let index = 0; index < count; index += 1) {
            context.lineTo(this.joints[index].rightPoint[0], this.joints[index].rightPoint[1])
        }
        for (let index = count - 1; index >= 0; index -= 1) {
            context.lineTo(this.joints[index].leftPoint[0], this.joints[index].leftPoint[1])
        }
        context.closePath()
        context.fill()
        context.stroke()

    }
}

export function createKoiSchool(context, width, height, count) {
    return Array.from({ length: count }, () => {
        const jointCount = gaussianRandom(3, 5)
        const border = 50
        const x = width / 2 + (Math.random() * 2 - 1) * Math.max(0, width / 2 - border)
        const y = height / 2 + (Math.random() * 2 - 1) * Math.max(0, height / 2 - border)
        return new KoiFish(context, x, y, jointCount)
    })
}
