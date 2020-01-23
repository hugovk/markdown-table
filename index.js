'use strict'

module.exports = markdownTable

// Characters.
var space = ' '
var lineFeed = '\n'
var dash = '-'
var colon = ':'
var lowercaseC = 'c'
var lowercaseL = 'l'
var lowercaseR = 'r'
var verticalBar = '|'

var minCellSize = 3

// Create a table from a matrix of strings.
function markdownTable(table, options) {
  var settings = options || {}
  var padding = settings.padding === false ? '' : space
  var between = padding + verticalBar + padding
  var start = settings.delimiterStart === false ? '' : verticalBar + padding
  var end = settings.delimiterEnd === false ? '' : padding + verticalBar
  var alignment = settings.align
  var calculateStringLength = settings.stringLength || lengthNoop
  var cellCount = 0
  var rowIndex = -1
  var rowLength = table.length
  var sizes = []
  var align
  var rule
  var rows
  var row
  var cells
  var index
  var position
  var size
  var value
  var spacing
  var before
  var after

  alignment = alignment ? alignment.concat() : []

  while (++rowIndex < rowLength) {
    row = table[rowIndex]

    index = -1

    if (row.length > cellCount) {
      cellCount = row.length
    }

    while (++index < cellCount) {
      position = row[index] ? row[index].length : null

      if (!sizes[index]) {
        sizes[index] = minCellSize
      }

      if (position > sizes[index]) {
        sizes[index] = position
      }
    }
  }

  if (typeof alignment === 'string') {
    alignment = pad(cellCount, alignment).split('')
  }

  // Make sure only valid alignments are used.
  index = -1

  while (++index < cellCount) {
    align = alignment[index]

    if (typeof align === 'string') {
      align = align.charAt(0).toLowerCase()
    }

    if (align !== lowercaseL && align !== lowercaseR && align !== lowercaseC) {
      align = ''
    }

    alignment[index] = align
  }

  rowIndex = -1
  rows = []

  while (++rowIndex < rowLength) {
    row = table[rowIndex]

    index = -1
    cells = []

    while (++index < cellCount) {
      cells[index] = stringify(row[index])
    }

    rows[rowIndex] = cells
  }

  sizes = []
  rowIndex = -1

  while (++rowIndex < rowLength) {
    cells = rows[rowIndex]

    index = -1

    while (++index < cellCount) {
      value = cells[index]

      if (!sizes[index]) {
        sizes[index] = minCellSize
      }

      size = calculateStringLength(value)

      if (size > sizes[index]) {
        sizes[index] = size
      }
    }
  }

  rowIndex = -1

  while (++rowIndex < rowLength) {
    cells = rows[rowIndex]

    index = -1

    if (settings.alignDelimiters !== false) {
      while (++index < cellCount) {
        value = cells[index]

        position = sizes[index] - (calculateStringLength(value) || 0)
        spacing = pad(position)

        if (alignment[index] === lowercaseR) {
          value = spacing + value
        } else if (alignment[index] === lowercaseC) {
          position /= 2

          if (position % 1 === 0) {
            before = position
            after = position
          } else {
            before = position + 0.5
            after = position - 0.5
          }

          value = pad(before) + value + pad(after)
        } else {
          value += spacing
        }

        cells[index] = value
      }
    }

    rows[rowIndex] = cells.join(between)
  }

  index = -1
  rule = []

  while (++index < cellCount) {
    // When `pad` is false, make the rule the same size as the first row.
    if (settings.alignDelimiters === false) {
      value = table[0][index]
      spacing = calculateStringLength(stringify(value))
      spacing = spacing > minCellSize ? spacing : minCellSize
    } else {
      spacing = sizes[index]
    }

    align = alignment[index]

    // When `align` is left, don't add colons.
    value = align === lowercaseR || align === '' ? dash : colon
    value += pad(spacing - 2, dash)
    value += align !== lowercaseL && align !== '' ? colon : dash

    rule[index] = value
  }

  rows.splice(1, 0, rule.join(between))

  return start + rows.join(end + lineFeed + start) + end
}

function stringify(value) {
  return value === null || value === undefined ? '' : String(value)
}

// Get the length of `value`.
function lengthNoop(value) {
  return String(value).length
}

// Get a string consisting of `length` `character`s.
function pad(length, character) {
  return new Array(length + 1).join(character || space)
}
