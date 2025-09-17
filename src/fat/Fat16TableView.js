export default class Fat16TableView {
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
    const entryOffset = (clusterNum * 2); // 2 bytes per entry in FAT16

    // Read two bytes (little-endian) from the FAT
    const lowByte = this.#view[entryOffset];
    const highByte = this.#view[entryOffset + 1];

    return (highByte << 8) | lowByte;
  }


  setCluster(clusterNumber, clusterValue) {
    const entryOffset = (clusterNumber * 2); // 2 bytes per FAT16 entry

    // Write value in little-endian format
    this.#view[entryOffset] = clusterValue & 0xFF;         // Low byte
    this.#view[entryOffset + 1] = (clusterValue >> 8) & 0xFF; // High byte
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


