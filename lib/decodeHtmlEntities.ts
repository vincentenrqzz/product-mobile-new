const decodeHtmlEntities = (str: string): string =>
  str.replace(/&lt;/g, '<').replace(/&gt;/g, '>')

export default decodeHtmlEntities
