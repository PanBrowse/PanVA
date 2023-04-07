export const chromosomesLookup = (sequences) => {
  /**
   * Returns all sequences per chromosome
   */
  const lookup = {}
  sequences.forEach((sequence) => {
    const key = sequence.phasing_chromosome
    const rows = lookup[key] || []
    rows.push(sequence)
    lookup[key] = rows
  })
  return lookup
}

export const sortedSequenceIdsLookup = (chrLookup) => {
  /**
   * Returns for each chromosome number the intial sorting order of sequence ids
   */
  const lookup = {}

  Object.keys(chrLookup).forEach((key) => {
    // console.log(key, chrLookup[key], [...Array(chrLookup[key].length).keys()])

    const ids = lookup[key] || [...Array(chrLookup[key].length).keys()]
    lookup[key] = ids
  })
  return lookup
}
