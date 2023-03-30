export const eventIndex = (event: Event) => {
  const target = event.target as HTMLElement
  const index = target.getAttribute('data-index')
  return index ? Number(index) : null
}
