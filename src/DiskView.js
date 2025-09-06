export default class DiskView {

  /** @type {ArrayBuffer} */
  #buffer;

  #tracks;
  #sides;
  #sectorsPerTrack;
  #bytesPerSector;
  #bytesPerTrack;

  constructor(buffer, tracks = 80, sides = 2, sectorsPerTrack = 9, bytesPerSector = 512) {
    if (!(buffer instanceof ArrayBuffer)) {
      throw new TypeError(`Expected ArrayBuffer. Got ${buffer.constructor.name}.`);

    }
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
  getSector(sector, track = 0, side = 0) {
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
   * @param {Uint8Array} buffer The new data for the sector. Must match sectorsPerTrack
   */
  setSector(sector, track = 0, side = 0, buffer) {
    if (buffer.length !== this.#bytesPerSector) {
      throw new RangeError(`Buffer length invalid. Expected ${this.#bytesPerSector} bytes, got ${buffer.length}.`);
    }
    const start = this.#getOffset(sector, track, side);
    const dataView = new Uint8Array(this.#buffer);
    dataView.set(buffer, start);
  }

  get buffer() {
    return this.#buffer
  }

  get bytesPerSector() {
    return this.#bytesPerSector
  }

  get tracks() {
    return this.#tracks
  }

  get sides() {
    return this.#sides
  }
}

