const RE_FILENAME = /^[A-Z0-9$%'\-_@~`!()^#&]{1,8}(\.[A-Z0-9$%'\-_@~`!()^#&]{1,3})?$/

/**
 * @typedef {Object} FatFilepath Represents a parsed filepath
 * @property {string[]} segments The indivual URL segments
 * @property {string} dir The parent directory of the path
 * @property {string} base The base name of the file (name + '.' + extension)
 * @property {string} name The name of the file without the extension
 * @property {string} ext The file extension, without the `.` character
 */

/**
  * Parses a file path into its component parts
  * @param {string} path The path to parse
  * @returns {FatFilepath} The parsed path
  */
export const parsePath = (path) => {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  const segments = path.split('/').slice(1).filter((segment) => !!segment);
  const base = segments.at(-1) ?? '';
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
 * Checks if a given file name is valid in the FAT filesystem
 * @param {string} name the filename to check
 * @returns {boolean} `true` if the file is valid, otherwise `false`
 */
export const isValidFilename = (name) => {
  return RE_FILENAME.test(name);
}
