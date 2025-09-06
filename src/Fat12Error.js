export const ERROR_NAME_WRITE = 'WriteError'
export const ERROR_NAME_NOT_FOUND = 'NotFoundError'

export default class Fat12Exception extends Error {

  #name;

  constructor(message, name, options) {
    super(message, options)
    this.#name = name
  }

  get name() {
    return this.#name;
  }
};
