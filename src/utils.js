const RE_FILENAME = /^[A-Z0-9$%'\-_@~`!()^#&]{1,8}(\.[A-Z0-9$%'\-_@~`!()^#&]{1,3})?$/

/**
* 
* @param {string} path 
* @returns 
*/
export const parsePath = (path) => {
  if (!path.startsWith('/')) {
    path = '/' + path
  }
  const segments = path.split('/').slice(1).filter(x => !!x);
  const base = segments.at(-1) ?? ''
  const [name, ext = ''] = base.split('.');
  return {
    segments,
    dir: `/${segments.slice(0, -1).join('/')}`,
    base,
    name,
    ext
  }
}

/**
 * 
 * @param {string} str 
 * @returns 
 */
export const isValidFilename = (str) => {
  return RE_FILENAME.test(str)
}
