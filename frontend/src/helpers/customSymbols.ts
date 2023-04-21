import { min, sqrt } from '@/helpers/math'

export const plus = {
  draw(context, size) {
    const r = sqrt(size - min(size / 7, 2)) * 0.87559
    context.moveTo(-r, 0)
    context.lineTo(r, 0)
    context.moveTo(0, r)
    context.lineTo(0, -r)
  },
}

export const cross = {
  draw(context, size) {
    const r = sqrt(size / 5) / 2
    context.moveTo(-3 * r, -r)
    context.lineTo(-r, -r)
    context.lineTo(-r, -3 * r)
    context.lineTo(r, -3 * r)
    context.lineTo(r, -r)
    context.lineTo(3 * r, -r)
    context.lineTo(3 * r, r)
    context.lineTo(r, r)
    context.lineTo(r, 3 * r)
    context.lineTo(-r, 3 * r)
    context.lineTo(-r, r)
    context.lineTo(-3 * r, r)
    context.closePath()
  },
}
const sqrt3 = sqrt(3)

export const asterisk = {
  draw(context, size) {
    const r = sqrt(size + min(size / 28, 0.75)) * 0.59436
    const t = r / 2
    const u = t * sqrt3
    context.moveTo(0, r)
    context.lineTo(0, -r)
    context.moveTo(-u, -t)
    context.lineTo(u, t)
    context.moveTo(-u, t)
    context.lineTo(u, -t)
  },
}
