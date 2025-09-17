export const ERROR_NAME_WRITE = 'WriteError';
export const ERROR_NAME_NOT_FOUND = 'NotFoundError';

/**
 * 
 */
export default class Fat12Exception extends Error {

  #name;

  /**
   * @param {string} message The error message
   * @param {'WriteError'|'NotFoundError'} name The error name 
   */
  constructor(message, name) {
    super(message);
    this.#name = name;
  }

  /**
   * The name of the error
   * @type {string}
   */
  get name() {
    return this.#name;
  }
};
