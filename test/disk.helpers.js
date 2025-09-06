export const createEmptyDisk = (options = {}) => {

  const {
    sides = 2,
    tracks = 80,
    sectorsPerTrack = 9,
    bytesPerSector = 512,
    reserved = 1,
    fatSize = 5,
    fatCount = 2,
    numDirs = 112
  } = options;

  const buffer = new ArrayBuffer(bytesPerSector * sectorsPerTrack * tracks * sides);

  // Bootsector
  const bootsector = new DataView(buffer, 0, bytesPerSector);
  bootsector.setUint8(0x00, 0xe9);
  bootsector.setUint8(0x01, 0x00);
  bootsector.setUint8(0x02, 0x4e);
  bootsector.setUint8(0x03, 0x4e);
  bootsector.setUint8(0x04, 0x4e);
  bootsector.setUint8(0x05, 0x4e);
  bootsector.setUint8(0x06, 0x4e);
  bootsector.setUint8(0x07, 0x4e);
  bootsector.setUint8(0x08, 0x58);
  bootsector.setUint8(0x09, 0x74);
  bootsector.setUint8(0x0a, 0x40);

  bootsector.setUint16(0x0b, bytesPerSector, true); // bytes per sector
  bootsector.setUint8(0x0d, 2); // sectors per cluster
  bootsector.setUint16(0x0e, reserved, true); // reserved sectors
  bootsector.setUint8(0x10, fatCount); // numfats
  bootsector.setUint16(0x11, numDirs, true); // numdirs
  bootsector.setUint16(0x13, tracks * sectorsPerTrack * sides, true);
  bootsector.setUint8(0x15, 0xf9); //FAT size (in sectors)
  bootsector.setUint16(0x16, fatSize, true); //FAT size (in sectors)
  bootsector.setUint16(0x18, sectorsPerTrack, true);
  bootsector.setUint16(0x1a, sides, true); // heads

  // Fat tables
  for (let c = 0; c < fatCount; c++) {
    const fatOffset = c * fatSize * bytesPerSector
    const fatView = new DataView(buffer, (reserved * bytesPerSector) + fatOffset, fatSize * bytesPerSector);
    fatView.setUint32(0, 0xf9ffff00, false);
  }

  // Root directory
  const rootDirectoryStart = (fatSize * fatCount) + reserved;
  const rootDirView = new DataView(buffer, rootDirectoryStart * bytesPerSector);
  
  // volume name
  rootDirView.setUint32(0, 0x20202020, false);
  rootDirView.setUint32(4, 0x20202020, false);
  rootDirView.setUint32(8, 0x20202008, false);

  return buffer
}

/**
 * 
 * @param {ArrayBufferView|ArrayBufferLike} buffer 
 */

export const logBuffer = (buffer) => {
  const data = new Uint8Array(buffer instanceof ArrayBuffer ? buffer : buffer.buffer);
  console.log([...data].map((byte,i) => `${(i%8==0) ? '\n' : ''}0x${byte.toString(16).padStart(2,'0')}`).join(', '))
}