
export default class Fat12TableView {
  /** @type {Uint8Array} */
  #view

  /**
   * 
   * @param {ArrayBuffer} buffer 
   * @param {number} [byteOffset]
   * @param {number} [byteLength]
   */
  constructor(buffer, byteOffset = 0, byteLength = buffer.byteLength) {
    this.#view = new Uint8Array(buffer, byteOffset, byteLength);
  }

  getCluster(clusterNum) {
    const offset = Math.floor(clusterNum * 1.5);
    const isOdd = clusterNum & 1;
    const byte1 = this.#view[offset];
    const byte2 = this.#view[offset + 1];

    if (isOdd) {
      return ((byte2 << 4) | (byte1 >> 4)) & 0xFFF;
    } else {
      return ((byte2 & 0x0F) << 8) | byte1;
    }
  }


  setCluster(clusterNum, value) {
    const offset = Math.floor(clusterNum * 1.5);
    const isOdd = clusterNum & 1;

    // TODO: range error
    value = value & 0x0FFF; // Ensure only 12 bits

    if (isOdd) {
      const byte1 = this.#view[offset];
      this.#view[offset] = (byte1 & 0x0F) | ((value & 0x000F) << 4);         // lower nibble of byte1
      this.#view[offset + 1] = (value >> 4) & 0xFF;                          // upper 8 bits
    } else {
      this.#view[offset] = value & 0xFF;                                     // lower 8 bits
      const byte2 = this.#view[offset + 1];
      this.#view[offset + 1] = (byte2 & 0xF0) | ((value >> 8) & 0x0F);       // preserve high nibble
    }
  }


  getClusterChain(cluster) {
    const clusters = [];
    while (cluster < 0xFF8) {
      clusters.push(cluster);
      cluster = this.getCluster(cluster)
    }
    return clusters;
  }


  get buffer() {
    return this.#view.buffer
  }

  get byteOffset() {
    return this.#view.byteOffset
  }

  get byteLength() {
    return this.#view.byteLength;
  }
}


