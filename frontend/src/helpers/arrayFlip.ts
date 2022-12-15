const arrayFlip = (arr: number[]) => {
  return arr.reduce<number[]>((acc, value, index) => {
    acc[value] = index
    return acc
  }, [])
}

export default arrayFlip
