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

export const groupInfosLookup = (groupInfo) => {
  /**
   * Returns all mrNAs per chromosome
   */
  const lookup = {}
  groupInfo.forEach((info) => {
    const key = info.phasing_chromosome
    const rows = lookup[key] || []
    rows.push(info)
    lookup[key] = rows
  })
  return lookup
}

export const sequencesIdLookup = (chrLookup) => {
  /**
   * Returns a mapping of sequence ids and their initial order per chromosome
   */
  const lookup = {}
  Object.keys(chrLookup).forEach((key) => {
    const object = chrLookup[key].reduce(
      (obj, item, dataIndex) =>
        Object.assign(obj, { [item.sequence_id]: dataIndex }),
      {}
    )

    lookup[key] = object
  })

  return lookup
}

export const sortedSequenceIdsLookup = (chrLookup) => {
  /**
   * Returns for each chromosome the intial sorting order of sequences
   */
  const lookup = {}

  Object.keys(chrLookup).forEach((key) => {
    // console.log(key, chrLookup[key], [...Array(chrLookup[key].length).keys()])

    const ids = lookup[key] || [...Array(chrLookup[key].length).keys()]
    lookup[key] = ids
  })
  return lookup
}

export const sortedGroupInfosLookup = (grInfoLookup, seqIdLookup) => {
  /**
   * Returns intitial sorting indices of gene set per chromosome
   */
  const lookup = {}
  const that = this
  Object.keys(grInfoLookup).forEach((key) => {
    const groupLookup = grInfoLookup[key]
    const sequenceLookup = seqIdLookup[key]
    const ids =
      lookup[key] ||
      groupLookup.map(function (item) {
        const newKey = `${item.genome_number}_${item.sequence_number}`
        if (key != 'unphased') {
          return sequenceLookup[newKey]
        } else {
          return -99 //map unphased to -99
        }
      })

    lookup[key] = ids
  })

  return lookup
}
