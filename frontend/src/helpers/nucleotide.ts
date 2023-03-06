import { CELL_SIZE } from '@/constants'
import { sortBy } from 'lodash'

import type { Nucleotide, Theme } from '@/types'

export const sortNucleotideString = (value: string) => {
  const order = 'ACGTacgt-'
  return sortBy(value.split(''), (val) => order.indexOf(val)).join('')
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
  nucleotides,
  x,
  y,
  theme: { cellColors },
}: DrawNucleotide) => {
  const size = CELL_SIZE
  const halfsize = CELL_SIZE * 0.5

  // No nucleotide or matches with reference.
  if (nucleotides.length === 0) {
    ctx.fillStyle = cellColors.empty
    ctx.fillRect(x, y, size, size)
  }
  // Single nucleotide or group with the same nucleotide; solid color square.
  else if (nucleotides.length === 1) {
    ctx.fillStyle = cellColors[nucleotides as Nucleotide]
    ctx.fillRect(x, y, size, size)
  }
  // Multiple nucleotides.
  else {
    ctx.fillStyle = cellColors.aggregate
    ctx.fillRect(x, y, size, size)

    if (nucleotides.includes('a') || nucleotides.includes('A')) {
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

    if (nucleotides.includes('c') || nucleotides.includes('C')) {
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

    if (nucleotides.includes('g') || nucleotides.includes('G')) {
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

    if (nucleotides.includes('t') || nucleotides.includes('T')) {
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

    if (nucleotides.includes('-')) {
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
