import { EMPTY_CELL_COLOR, CELL_SIZE } from '@/constants'
import { sortBy } from 'lodash'

import colors from '@/assets/colors.module.scss'
import type { CellThemeColors } from '@/types'

export const sortNucleotideString = (value: string) => {
  const order = 'ACGTacgt-'
  return sortBy(value.split(''), (val) => order.indexOf(val)).join('')
}

type DrawNucleotide = {
  ctx: CanvasRenderingContext2D
  nucleotides: string
  x: number
  y: number
  cellThemeColors: CellThemeColors
}

export const drawNucleotide = ({
  ctx,
  nucleotides,
  x,
  y,
  cellThemeColors,
}: DrawNucleotide) => {
  // No nucleotide or matches with reference.
  if (nucleotides.length === 0) {
    ctx.fillStyle = EMPTY_CELL_COLOR
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
  }
  // Single nucleotide or group with the same nucleotide; solid color square.
  else if (nucleotides.length === 1) {
    ctx.fillStyle = cellThemeColors[nucleotides as keyof typeof cellThemeColors]
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
  }
  // Multiple nucleotides.
  else {
    ctx.fillStyle = colors['gray-9']
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)

    if (nucleotides.includes('a') || nucleotides.includes('A')) {
      ctx.fillStyle = cellThemeColors.A
      ctx.beginPath()
      // Top.
      ctx.moveTo(x + 5, y + 5)
      ctx.lineTo(x, y)
      ctx.lineTo(x + 10, y)
      ctx.lineTo(x + 5, y + 5)
      ctx.closePath()
      ctx.fill()
    }

    if (nucleotides.includes('c') || nucleotides.includes('C')) {
      ctx.fillStyle = cellThemeColors.C
      ctx.beginPath()
      // Right.
      ctx.moveTo(x + 5, y + 5)
      ctx.lineTo(x + 10, y)
      ctx.lineTo(x + 10, y + 10)
      ctx.lineTo(x + 5, y + 5)
      ctx.closePath()
      ctx.fill()
    }

    if (nucleotides.includes('g') || nucleotides.includes('G')) {
      ctx.fillStyle = cellThemeColors.G
      ctx.beginPath()
      // Bottom.
      ctx.moveTo(x + 5, y + 5)
      ctx.lineTo(x + 10, y + 10)
      ctx.lineTo(x, y + 10)
      ctx.lineTo(x + 5, y + 5)
      ctx.closePath()
      ctx.fill()
    }

    if (nucleotides.includes('t') || nucleotides.includes('T')) {
      ctx.fillStyle = cellThemeColors.T
      ctx.beginPath()
      // Left.
      ctx.moveTo(x + 5, y + 5)
      ctx.lineTo(x, y + 10)
      ctx.lineTo(x, y)
      ctx.lineTo(x + 5, y + 5)
      ctx.closePath()
      ctx.fill()
    }

    if (nucleotides.includes('-')) {
      ctx.fillStyle = colors['gray-1']
      ctx.beginPath()
      ctx.ellipse(x + 5, y + 5, 2.75, 2.75, 0, 0, 0)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = colors['gray-9']
      ctx.beginPath()
      ctx.ellipse(x + 5, y + 5, 2.5, 2.5, 0, 0, 0)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = colors['gray-1']
      ctx.beginPath()
      ctx.ellipse(x + 5, y + 5, 1.5, 1.5, 0, 0, 0)
      ctx.closePath()
      ctx.fill()
    }
  }

  // White border overlay.
  ctx.strokeStyle = colors['gray-1']
  ctx.lineWidth = 0.5
  ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE)
}
