/**
 * @typedef {Object} DiskViewInitDict Configuration options for creating a new `DiskView` instance
 * @property {number} [tracks=80] the number of tracks on the disk
 * @property {number} [sides=2] the number of sides on the disk
 * @property {number} [sectorsPerTrack=9] the number of sectors on each track
 * @property {number} [bytesPerSector=512] the number of bytes in a single sector
 */


/**
 * The DiskView view provides a low-level interface for reading from, and 
 * writing to, sectors on a CHS geometry disk image stored in an `ArrayBuffer`.
 * 
 * @example
 * ```
 * const data = readFileSync('my-disk.img');
 * const view = new DiskView(data.buffer, { tracks: 80, sides: 2, sectorsPerTrack: 10 });
 * const bootsector = view.getSector(1, 0, 0); // sector 1, track 0, side 0
 * ```
 */
export default class DiskView {

  /** @type {ArrayBuffer} */
  #buffer;
  #tracks;
  #sides;
  #sectorsPerTrack;
  #bytesPerSector;
  #bytesPerTrack;
  #byteOffset;

  /**
   * Creates a new `DiskView` instance
   * @param {ArrayBuffer} buffer An ArrayBuffer to use as the storage backing the new DiskView
   * @param {DiskViewInitDict} [options] The options for customising the new view instance
   * @param {number} [byteOffset] The offset into the buffer where the disk image data starts.
   */
  constructor(buffer, options = {}, byteOffset = 0) {
    
    const {
      tracks = 80,
      sides = 2,
      sectorsPerTrack = 9,
      bytesPerSector = 512
    } = options;

    if (!(buffer instanceof ArrayBuffer)) {
      throw new TypeError(`Expected ArrayBuffer. Got ${buffer.constructor.name}.`);
    }
    
    this.#byteOffset = byteOffset;
    this.#buffer = buffer;
    this.#tracks = tracks;
    this.#sides = sides;
    this.#sectorsPerTrack = sectorsPerTrack;
    this.#bytesPerSector = bytesPerSector;
    this.#bytesPerTrack = sectorsPerTrack * bytesPerSector;
  }

  #getOffset(sector, track, side) {
    if (sector < 1 || sector > this.#sectorsPerTrack) {
      throw new RangeError(`Sector out of bounds. Expected 1-${this.#sectorsPerTrack}. Got ${sector}.`);
    }
    if (track < 0 || track > this.#tracks-1) {
      throw new RangeError(`Track out of bounds. Expected 0-${this.#tracks-1}. Got ${this.#tracks}.`);
    }
    if (side < 0 || track > this.#sides-1) {
      throw new RangeError(`Side out of bounds. Expected 0-${this.#sides-1}. Got ${this.#sides}.`);
    }
    let offset = track * this.#sides * this.#bytesPerTrack;
    // Add the side offet
    offset += side * this.#bytesPerTrack;
    // Add the sector offset
    offset += (sector - 1) * this.#bytesPerSector;
    // Add the ArrayBuffer offset
    offset += this.#byteOffset;
    return offset;  
  }


  /**
   * Retrieves a `Uint8Array` containing the bytes of a single track
   * 
   * @param {number} track The track to fetch
   * @param {number} side The side containing the track
   * @returns {Uint8Array} An Uint8Array containing the track data 
   */
  getTrack(track, side = 0) {
    const start = this.#getOffset(1, track, side);
    const end = start + this.#bytesPerTrack;
    return Uint8Array(this.#buffer.slice(start, end));
  }


  /**
   * Returns a `Uint8Array` containing the bytes of a single sector
   * 
   * @param {number} sector The sector to fetch
   * @param {number} track The track containing the sector
   * @param {number} side The side containing the sector
   * @returns {Uint8Array} A Uint8Array containing the sector data 
   */
  getSector(sector, track, side) {
    const start = this.#getOffset(sector, track, side);
    const end = start + this.#bytesPerSector;
    return new Uint8Array(this.#buffer.slice(start, end));
  }


  /**
   * Replaces the bytes in a sector with new data
   * 
   * @param {number} sector The sector to fetch
   * @param {number} track The track containing the sector
   * @param {number} side The side containing the sector
   * @param {Uint8Array} buffer The new data for the sector. Array length must match `bytesPerSector`
   */
  setSector(sector, track, side, buffer) {
    if (buffer.length !== this.#bytesPerSector) {
      throw new RangeError(`Buffer length invalid. Expected ${this.#bytesPerSector} bytes, got ${buffer.length}.`);
    }
    const start = this.#getOffset(sector, track, side);
    const dataView = new Uint8Array(this.#buffer);
    dataView.set(buffer, start);
  }


  /**
   * Gets the underlying ArrayBuffer backing this view.
   * @type {ArrayBuffer}
   */
  get buffer() {
    return this.#buffer
  }

  /**
   * The offset into the buffer where the disk image data starts.
   * @type {number}
   */
  get byteOffset() {
    return this.#byteOffset
  }

  /**
   * Gets the number of bytes per sector.
   * @type {number}
   */
  get bytesPerSector() {
    return this.#bytesPerSector
  }

  /**
   * Gets the number of configured tracks for the disk
   * @type {number}
   */
  get tracks() {
    return this.#tracks
  }

  /**
   * Gets the number of configured sides for the disk
   * @type {number}
   */
  get sides() {
    return this.#sides
  }
}
