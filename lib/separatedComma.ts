const separatedComma = (value: string | number) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export default separatedComma
