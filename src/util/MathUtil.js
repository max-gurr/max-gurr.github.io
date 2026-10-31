export default class MathUtil {

    static vectorLength(x, y) {
        return Math.hypot(x, y)
    }

    static vectorAngle(x, y) {
        return Math.atan2(y, x)
    }

    static constrainVector(x, y, min, max) {
        const magnitude = MathUtil.vectorLength(x, y)
        if (magnitude === 0) return [0, 0]

        const desiredMagnitude = Math.max(min, Math.min(max, magnitude))
        return [desiredMagnitude * x / magnitude, desiredMagnitude * y / magnitude]
    }
}