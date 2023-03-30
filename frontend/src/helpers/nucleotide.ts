import { sortBy } from 'lodash'

import { CELL_SIZE } from '@/constants'
import type { NucleotideSimplified, Theme } from '@/types'

export const sortNucleotideString = (value: string) => {
  const order = 'ACGTN-'
  return sortBy(value.split(''), (val) => order.indexOf(val)).join('')
}

export const simplifyNucleotideString = (value: string): string => {
  let count = 0
  return (
    value
      .toUpperCase()
      // Replace first non-ACGT with a N, remove others.
      .replace(/[^ACGT-]/, () => {
        count++
        if (count === 1) return 'N'
        return ''
      })
  )
}

type DrawNucleotide = {
  ctx: CanvasRenderingContext2D
  nucleotides: string
  x: number
  y: number
  theme: Theme
}

export const drawNucleotide = ({
  ctx,
  nucleotides: nucleotideString,
  x,
  y,
  theme: { cellColors },
}: DrawNucleotide) => {
  const size = CELL_SIZE
  const halfsize = CELL_SIZE * 0.5
  const nucleotides = new Set(
    simplifyNucleotideString(nucleotideString).split('')
  )

  // No nucleotide or matches with reference.
  if (nucleotides.size === 0) {
    ctx.fillStyle = cellColors.empty
    ctx.fillRect(x, y, size, size)
  }
  // Single nucleotide or group with the same nucleotide; solid color square.
  else if (nucleotides.size === 1) {
    const nucleotide = nucleotides.values().next().value as NucleotideSimplified
    ctx.fillStyle = cellColors[nucleotide]
    ctx.fillRect(x, y, size, size)
  }
  // Multiple nucleotides.
  else {
    ctx.fillStyle = cellColors.aggregate
    ctx.fillRect(x, y, size, size)

    if (nucleotides.has('A')) {
      ctx.fillStyle = cellColors.A
      ctx.beginPath()
      // Top.
      ctx.moveTo(x + halfsize, y + halfsize)
      ctx.lineTo(x, y)
      ctx.lineTo(x + size, y)
      ctx.lineTo(x + halfsize, y + halfsize)
      ctx.closePath()
      ctx.fill()
    }

    if (nucleotides.has('C')) {
      ctx.fillStyle = cellColors.C
      ctx.beginPath()
      // Right.
      ctx.moveTo(x + halfsize, y + halfsize)
      ctx.lineTo(x + size, y)
      ctx.lineTo(x + size, y + size)
      ctx.lineTo(x + halfsize, y + halfsize)
      ctx.closePath()
      ctx.fill()
    }

    if (nucleotides.has('G')) {
      ctx.fillStyle = cellColors.G
      ctx.beginPath()
      // Bottom.
      ctx.moveTo(x + halfsize, y + halfsize)
      ctx.lineTo(x + size, y + size)
      ctx.lineTo(x, y + size)
      ctx.lineTo(x + halfsize, y + halfsize)
      ctx.closePath()
      ctx.fill()
    }

    if (nucleotides.has('T')) {
      ctx.fillStyle = cellColors.T
      ctx.beginPath()
      // Left.
      ctx.moveTo(x + halfsize, y + halfsize)
      ctx.lineTo(x, y + size)
      ctx.lineTo(x, y)
      ctx.lineTo(x + halfsize, y + halfsize)
      ctx.closePath()
      ctx.fill()
    }

    if (nucleotides.has('-')) {
      ctx.fillStyle = cellColors['-']
      ctx.strokeStyle = cellColors.aggregate
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.ellipse(x + halfsize, y + halfsize, 2, 2, 0, 0, 2 * Math.PI)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  }

  // White border overlay.
  ctx.strokeStyle = '#ffffff'
  ctx.lineCap = 'square'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, size, size)
}
