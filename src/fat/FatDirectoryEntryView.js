import FatException from "./FatError.js";
import { FAT_ENTRY_SIZE } from "./consts.js";
import { isValidFilename, parsePath } from "./utils.js";

/**
 * Represents a view over a FAT  directory entry in a given ArrayBuffer.
 * Allows reading and writing of file metadata such as filename, size, 
 * start cluster, and attributes.
 */
export default class FatDirectoryEntryView {
  /** @type {DataView} */
  #view

  /**
   * Creates a new view of a FAT directory entry.
   * @param {ArrayBuffer} buffer The buffer containing the FAT directory entry.
   * @param {number} [byteOffset] Offset into the buffer where the entry starts.
   * @throws {Error} If `buffer` is not an ArrayBuffer.
   */
  constructor(buffer, byteOffset = 0) {
    if (!(buffer instanceof ArrayBuffer)) {
      throw 'Expected ArrayBuffer'
    }
    this.#view = new DataView(buffer, byteOffset, this.byteLength)
  }

  /**
   * @param {string} name 
   */
  #assertValidFileName(name) {
    if (!isValidFilename(name)) {
      throw new FatException(`Invalid filename "${name}"`);
    }
  }

  /**
   * Returns the filename of the entry the view represents
   * @returns {string} The filename of the entry
   */
  getName() {
    const t = new TextDecoder();
    const { buffer, byteOffset } = this.#view;
    const fullName = t.decode(new Uint8Array(buffer, byteOffset, 11));
    const name = fullName.slice(0, 8).trim();
    const ext = fullName.slice(8).trim();
    return ext ? `${name}.${ext}` : name;
  }

  /**
   * Sets the filename of the entry the view represents. Changes are made to the
   * underlying `ArrayBuffer`
   * @param {string} value The new filename.
   */
  setName(value) {
    this.#assertValidFileName(value);
    const { buffer, byteOffset } = this.#view;
    const { name, ext } = parsePath(value);
    const fullName = name.padEnd(8, ' ') + ext.padEnd(3, ' ');
    const view = new Uint8Array(buffer, byteOffset, 11)
    view.set(new TextEncoder().encode(fullName.toUpperCase()));
  }

  /**
   * Returns the number of the cluster containing the first chunk of data for 
   * the entry's content.
   * @returns {number} The starting cluster number
   */
  getStartCluster() {
    return this.#view.getUint16(26, true);
  }

  /**
   * Sets the number of the cluster containing the first chunk of data for 
   * the entry's content.
   * @param {number} value The starting cluster number
   */
  setStartCluster(value) {
    this.#view.setUint16(26, value, true);
  }

  /**
   * Returns the attribute byte for the entry (e.g. archive, hidden, system, etc).
   * @returns {number} The attribute byte.
   */
  getAttributes() {
    return this.#view.getUint8(11);
  }

  /**
   * Sets the attribute byte for the entry (e.g. archive, hidden, system, etc).
   * @param {number} value The attribute byte.
   */
  setAttributes(value) {
    return this.#view.setUint8(11, value);
  }

  /**
   * Returns the file size in bytes stored in the entry.
   * @returns {number} The file size in bytes.
   */
  getSize() {
    return this.#view.getUint32(28, true);
  }


  /**
   * Sets the file size in bytes stored in the entry.
   * @param {number} value The file size in bytes.
   */
  setSize(value) {
    this.#view.setUint32(28, value, true);
  }


  /**
   * Gets the underlying ArrayBuffer.
   * @type {ArrayBuffer} The buffer backing this view.
   */
  get buffer() {
    return this.#view.buffer
  }

  /**
   * Gets the offset into the buffer where this view starts.
   * @type {number} The byte offset.
   */
  get byteOffset() {
    return this.#view.byteOffset
  }

  /**
   * Gets the number of bytes in a FAT directory entry.
   * @type {number}
   */
  get byteLength() {
    return FAT_ENTRY_SIZE;
  }
}


