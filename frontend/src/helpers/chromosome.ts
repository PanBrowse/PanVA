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

export const groupInfoDensity = (groupInfo) => {
  /**
   * Returns all mrNAs per chromosome
   */
  const lookup = {}
  groupInfo.forEach((item) => {
    const newKey = `${item.genome_number}_${item.sequence_number}`
    const rows = lookup[newKey] || []
    rows.push(item)
    lookup[newKey] = rows
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

// filter outliers GC conent
export const filterOutliers = (someArray) => {
  if (someArray.length < 4) return someArray

  let values, q1, q3, iqr, maxValue, minValue

  values = someArray.slice().sort((a, b) => a - b) //copy array fast and sort

  if ((values.length / 4) % 1 === 0) {
    //find quartiles
    q1 = (1 / 2) * (values[values.length / 4] + values[values.length / 4 + 1])
    q3 =
      (1 / 2) *
      (values[values.length * (3 / 4)] + values[values.length * (3 / 4) + 1])
  } else {
    q1 = values[Math.floor(values.length / 4 + 1)]
    q3 = values[Math.ceil(values.length * (3 / 4) + 1)]
  }

  iqr = q3 - q1
  maxValue = q3 + iqr * 1.5
  minValue = q1 - iqr * 1.5

  return values.filter((x) => x >= minValue && x <= maxValue)
}
