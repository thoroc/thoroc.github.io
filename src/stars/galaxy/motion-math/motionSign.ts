export const motionSign = (key: string): number => {
  let h = 0
  for (let i = 0; i < key.length; i += 1) {
    h = (h * 31 + key.charCodeAt(i)) | 0
  }
  return h % 2 === 0 ? 1 : -1
}
