const MAX_VELOCITY = 1.25
const MIN_VELOCITY = 0.5
const MAX_FORCE = 0.005

import MathUtil from "@/util/MathUtil"

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
        this.angle = MathUtil.vectorAngle(this.x - this.parent.x, this.y - this.parent.y)
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
        const tailY = -width / 3
        const tailSize = width * 1.5
        const tailStretch = width / 4

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

	drawPoint(size) {       
        const context = this.context
        context.save()

		size = Math.round(size)
		this.context.beginPath()

		this.context.moveTo(this.x, this.y)
		this.context.arc(this.x, this.y, size, 0, 2*Math.PI)

		this.context.closePath()
		this.context.fill()
        
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
        
	    this.dotColours = [];
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

        length += count

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

    addForce(x, y, scale) {
        const [forceX, forceY] = MathUtil.constrainVector(x, y, 0, MAX_FORCE)
        this.accelerationX += forceX * scale
        this.accelerationY += forceY * scale
    }

    avoidBorder(width, height, scale) {
        // Avoid edges of screen - pushes fish towards a circular swim path
        const xDistance = (width / 2 - this.x) / Math.max(1, width / 2)
        const yDistance = (height / 2 - this.y) / Math.max(1, height / 2)
        const angle = MathUtil.vectorAngle(xDistance, yDistance) + Math.PI / 3
        const [borderX, borderY] = MathUtil.constrainVector(
            MathUtil.vectorLength(xDistance, yDistance) * Math.cos(angle),
            MathUtil.vectorLength(xDistance, yDistance) * Math.sin(angle),
            0,
            MAX_FORCE,
        )
        this.addForce(borderX, borderY, scale);
    }

    update(width, height) {
        // Wrap to other side of screen
        const boundary = this.length * 1.5
        const offset = this.length * 1.75
        let xOffset = 0
        let yOffset = 0
        if (this.x < -boundary) xOffset = width + offset
        else if (this.x > width + boundary) xOffset = -(width + offset)
        if (this.y < -boundary) yOffset = height + offset
        else if (this.y > height + boundary) yOffset = -(height + offset)
        if (xOffset || yOffset) this.joints.forEach((joint) => joint.update(xOffset, yOffset))


        // Regular physics step
        this.velocityX += this.accelerationX
        this.velocityY += this.accelerationY
        const velocity = MathUtil.constrainVector(
            this.velocityX,
            this.velocityY,
            MIN_VELOCITY,
            MAX_VELOCITY,
        )
        this.velocityX = velocity[0]
        this.velocityY = velocity[1]
        this.velocitySquared = this.velocityX * this.velocityX + this.velocityY * this.velocityY
        
        // Inverse kinematics
        this.joints[0].update(this.velocityX, this.velocityY)
        this.joints[0].angle = MathUtil.vectorAngle(this.velocityX, this.velocityY) + Math.PI
        this.driveJoint(0)
        for (let index = 1; index < this.joints.length; index += 1) {
            this.joints[index].followParent()
            this.driveJoint(index)
        }
        this.updatePosition()
       
        const acceleration = MathUtil.vectorLength(this.accelerationX, this.accelerationY)

        this.accelerationX = 0
        this.accelerationY = 0
        
        // Update swim ticker
        const tickIncrement = 0.05 * 8 / (this.joints.length * 2)
        this.tick = (this.tick + tickIncrement + acceleration * 6) % (Math.PI * 2)
    }

    driveJoint(index) {
        const count = this.joints.length
        const angle = this.tick - Math.PI / count * (index + 1)
        const acceleration = MathUtil.vectorLength(this.accelerationX, this.accelerationY)
        const startSize = 0.02 / count
        const sizeIncrement = 0.03 / count + acceleration / 2
        const velocity = MathUtil.vectorLength(this.velocityX, this.velocityY)
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

        // Draw body segments
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

	drawDots() {
		// Go through each stored dot colour
		for (let i = 0; i < this.dotColours.length; i++) {
			if (this.dotColours[i] == "null") {
				continue;
			}
			
			this.context.fillStyle = this.dotColours[i];
			this.context.strokeStyle = this.dotColours[i];

			// Adjust size based on position from head
			const sizeFactor = this.joints.length - i;
			const sizeIncrement = 0.75;
			const minSize = 0.25;

			const size = minSize + sizeIncrement * sizeFactor;

			this.joints[i].drawPoint(size);
		}
	}

	setBodyColour(newColour) {
		this.bodyColour = newColour;
	}

	setDotColours(colourList) {
		for (let i = 0; i < this.joints.length-1; i++) {
			// Pick a random colour 
			const randomColour = colourList[parseInt(Math.random() * colourList.length)];
			this.dotColours[i] = randomColour;
		}
	}
}

export function createKoiFish(context, width, height) {
    const jointCount = Math.round(Math.random() * 2 + 3)
    const border = 50
    const x = width / 2 + (Math.random() * 2 - 1) * Math.max(0, width / 2 - border)
    const y = height / 2 + (Math.random() * 2 - 1) * Math.max(0, height / 2 - border)
    return new KoiFish(context, x, y, jointCount)
}

export function createKoiSchool(context, width, height, count) {
    return Array.from({ length: count }, () => {
        return createKoiFish(context, width, height)
    })
}
