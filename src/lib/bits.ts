export function bitsOf(mask: number, count: number): number[] {
  const bits: number[] = []
  for (let i = 0; i < count; i++) {
    if (mask & (1 << i)) bits.push(i)
  }
  return bits
}

export function popcount(mask: number): number {
  let count = 0
  let value = mask
  while (value) {
    value &= value - 1
    count += 1
  }
  return count
}
