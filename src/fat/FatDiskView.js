import FatDirectoryEntryView from './FatDirectoryEntryView.js';
import Fat12TableView from './Fat12TableView.js';
import Fat16TableView from './Fat16TableView.js';
import DiskView from "../DiskView.js";

import { parsePath, isValidFilename } from "./utils.js";

import {
  FAT_ENTRY_SIZE,
  FAT_DIRECTORY_WAYPOINT_CHAR,
  FILE_ATTRIBUTE_DIRECTORY,
  FAT_CLUSTER_EMPTY,
  FAT_CLUSTER_RESERVED,
  FAT_CLUSTER_TERMINATOR,
  FAT_DISKVIEW_CONFIG_OPTION_FAT16,
  FAT_DISKVIEW_CONFIG_OPTION_FAT12
} from './consts.js';

import FatException, {
  ERROR_NAME_WRITE,
  ERROR_NAME_NOT_FOUND
} from './FatError.js';

/**
 * @typedef {Object} FatDiskViewInitDict Configuration options for creating a new `FatDiskView` instance
 * @property {'fat12'|'fat16'} [format='fat12'] The FAT format of the filesystem the view represents
 */

/**
 * The FatDiskView view provides a low-level interface for reading from, and 
 * writing to, files and directories on a FAT12 or FAT16 disk image stored in a
 * binary `ArrayBuffer`.
 * 
 * @example
 * ```
 * const data = readFileSync('my-disk.img');
 * const view = new FatDiskView(data.buffer, { format: 'fat12' });
 * const rootDirEntries = view.getDirectoryContents();
 * 
 * console.log(rootDirEntries)
 * ```
 */
export default class FatDiskView extends DiskView {
  #fatStart;
  #rootDirStart;
  #rootDirSize;
  #clusterSize;
  #dataStart;
  #maxClusters;
  #fatSize;
  #fatCount;
  #reservedSectors;
  #numberDirectecories;
  #FatTableView;


  /**
   * Creates a new `FatDiskView` instance
   * 
   * @param {ArrayBuffer} buffer An ArrayBuffer to use as the storage backing the new FatDiskView
   * @param {FatDiskViewInitDict} [options] The options for customising the new view instance
   * @param {number} [byteOffset] The offset into the buffer where the disk image data starts.
   */
  constructor(buffer, options = {}, byteOffset = 0) {
    const {
      format = FAT_DISKVIEW_CONFIG_OPTION_FAT12
    } = options;

    const bootsector = new DataView(buffer, byteOffset);
    const bytesPerSector = bootsector.getUint16(0x0b, true);
    const sectorsPerCluster = bootsector.getUint8(0x0d);
    const totalSectors = bootsector.getUint16(0x13, true);
    const sectorsPerTrack = bootsector.getUint16(0x18, true);
    const heads = bootsector.getUint16(0x1a, true);
    const tracks = totalSectors / sectorsPerTrack / heads;

    super(buffer, {tracks, sides: heads, sectorsPerTrack, bytesPerSector}, byteOffset)

    if (format === FAT_DISKVIEW_CONFIG_OPTION_FAT12) {
      this.#FatTableView = Fat12TableView;
    } else if (format === FAT_DISKVIEW_CONFIG_OPTION_FAT16) {
      this.#FatTableView = Fat16TableView;
    } else {
      throw new TypeError(`Unknown FAT filesystem type ${format}`);
    }

    this.#numberDirectecories = bootsector.getUint16(0x11, true);
    this.#reservedSectors = bootsector.getUint16(0xe, true) || 1; // fixes invalid values
    this.#fatCount = bootsector.getUint8(0x10);
    this.#fatSize = bootsector.getUint16(0x16, true);
    this.#clusterSize = sectorsPerCluster * bytesPerSector;
    this.#fatStart =( this.#reservedSectors * this.bytesPerSector) + byteOffset;
    this.#rootDirStart = this.#fatStart + (this.#fatCount * this.#fatSize * this.bytesPerSector);
    this.#rootDirSize = this.#numberDirectecories * FAT_ENTRY_SIZE;
    this.#dataStart = this.#rootDirStart + this.#rootDirSize;

    const fatSectors = this.#fatCount * this.#fatSize;
    const dataSectors = totalSectors - this.#reservedSectors - fatSectors - (this.#rootDirSize / bytesPerSector);
    this.#maxClusters = (dataSectors / sectorsPerCluster);
  }


  /**
   * Resolves a fully qualified path to a directory (a `FatDirectoryEntryView`
   * instance) and filename (a string).
   * 
   * @param {string} path The file path to resolve
   * @returns {{name: string, directoryEntry: FatDirectoryEntryView}}
   */
  #resolvePath(path) {
    const { dir, base } = parsePath(path);
    return {
      name: base,
      directory: this.getDirectoryAtPath(dir)
    };
  }


  *#rootDirectoryIterator() {
    yield* this.#directoryEntryIterator(this.#rootDirStart, this.#rootDirSize);
  }


  /**
   * 
   * @param {number} byteOffset 
   * @param {number} byteLength 
   */
  *#directoryEntryIterator(byteOffset, byteLength) {
    const clusterView = new Uint8Array(this.buffer, byteOffset, byteLength);
    let offset = 0;
    while (offset < byteLength && clusterView[offset] !== 0) {
      yield new FatDirectoryEntryView(this.buffer, byteOffset + offset);
      offset += FAT_ENTRY_SIZE;
    }
  }


  /**
   * 
   * @param {FatDirectoryEntryView} entry 
   */
  *#directoryIterator(entry) {
    const fatTable = this.#getFatTable();
    const clusters = fatTable.getClusterChain(entry.getStartCluster());
    for (let cluster of clusters) {
      const clusterOffset = this.#dataStart + (cluster - 2) * this.#clusterSize;
      yield* this.#directoryEntryIterator(clusterOffset, this.#clusterSize);
    }
  }


  #createDirectoryIterator(entry) {
    if (entry) {
      return this.#directoryIterator(entry);
    }
    return this.#rootDirectoryIterator();
  }


  /**
   * 
   * @param {Iterable<FatDirectoryEntryView>} entries 
   * @param {string} name 
   * @returns {FatDirectoryEntryView|null}
   */
  #findEntryByName(entries, name) {
    for (const entry of entries) {
      if (entry.getName() === name) {
        return entry;
      }
    }
    return null;
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
   * @param {Iterable<FatDirectoryEntryView>} entries 
   * @param {string} name 
   */
  #assertEntryNotExists(entries, name) {
    if (this.#findEntryByName(entries, name)) {
      throw new FatException(`"${name}" aleady exists`, ERROR_NAME_WRITE);
    }
  }


  /**
   * Returns the available free space on the disk, in bytes. The resulting value
   * is computed from the number of unused clusters in the FAT table, so will be
   * a multiple of the cluster size, as defined in the Bios Paramater Block.
   * @returns {number}
   */
  getFree() {
    const fat = this.#getFatTable();
    let size = 0;
    for (let c = 2; c < this.#maxClusters; c++) {
      if (fat.getCluster(c) === FAT_CLUSTER_EMPTY) {
        size += this.#clusterSize;
      }
    }
    return size;
  }


  /**
   * The total number of bytes that can be stored on the volume
   * 
   * @returns {number}
   */
  getSize() {
    return this.#maxClusters * this.#clusterSize;
  }


  /**
   * 
   * @param {string} name The filename of the entry
   * @param {FatDirectoryEntryView} parentDirectory The parent directory for the new entry
   * @returns {FatDirectoryEntryView}
   * @throws {FatException}
   */
  #getEntry(name, parentDirectory = null) {
    this.#assertValidFileName(name);
    const directoryEntries = this.#createDirectoryIterator(parentDirectory);
    const entry = this.#findEntryByName(directoryEntries, name);
    if (!entry) {
      throw new FatException(`Entry "${name}" not found"`, ERROR_NAME_NOT_FOUND);
    }
    return entry;
  }


  /**
   * Creates a new empty directory entry and allocates a cluster to it.
   * 
   * @param {string} name The filename of the entry
   * @param {number} attributes File attributes of the entry
   * @param {FatDirectoryEntryView} parentDirectory The owner of the entry
   * @returns {FatDirectoryEntryView} The new entry
   */
  #createEntry(name, attributes = 0, parentDirectory = null) {
    const directoryEntries = this.getDirectoryEntries(parentDirectory);

    this.#assertValidFileName(name);
    this.#assertEntryNotExists(directoryEntries, name);

    const cluster = this.#allocateCluster();
    const offset = directoryEntries.at(-1).byteOffset + FAT_ENTRY_SIZE;

    // Create the entry
    const entry = new FatDirectoryEntryView(this.buffer, offset);
    entry.setName(name);
    entry.setSize(0);
    entry.setAttributes(attributes);
    entry.setStartCluster(cluster);

    // Mark the cluster as a terminator in the FAT table
    this.#setCluster(cluster, FAT_CLUSTER_TERMINATOR);
    return entry;   
  }


  /**
   * Returns a `FatEntryDataView` interface for the file at the specified path
   * 
   * @param {string} name 
   * @param {FatDirectoryEntryView} [parentDirectory]
   * @returns {FatDirectoryEntryView}
   */
  getFile(name, parentDirectory = null) {
    const file = this.#getEntry(name, parentDirectory);
    if (file.getAttributes() & FILE_ATTRIBUTE_DIRECTORY) {
      throw new FatException(`${name} is not a file`);
    }
    return file;
  }


  /**
   * Creates an empty file in the specified directory (or in the root directory
   * if none is provided) and returns a `FatDirectoryEntryView` representing
   * the new file.
   * 
   * @param {string} name 
   * The file name of the file
   * @param {FatDirectoryEntryView} [parentDirectory] 
   * A `FatDirectoryEntryView` interface representing the directory that new
   * file will be created in.
   * @returns {FatDirectoryEntryView} 
   * A `FatDirectoryEntryView` for the new file entry
   */
  createFile(name, parentDirectory = null) {
    return this.#createEntry(name, 0, parentDirectory);
  }


  /**
   * Retrieves the contents of a file represented by the given directory entry.
   *
   * This method reads the FAT table to determine the chain of clusters used by
   * the file, then reads the data from each cluster and assembles it into a
   * single contiguous buffer.
   *
   * @param {FatDirectoryEntryView} entry The directory entry representing the file to read.
   * @returns {Uint8Array} A byte array containing the file's contents.
   */
  getFileContents(entry) {
    const fatTable = this.#getFatTable();
    const clusters = fatTable.getClusterChain(entry.getStartCluster());
    const buffer = new Uint8Array(this.#clusterSize * clusters.length);
    clusters.forEach((cluster, index) => {
      const data = this.#getClusterData(cluster);
      buffer.set(new Uint8Array(data), this.#clusterSize * index);
    });
    return buffer.slice(0, entry.getSize());
  }


  /**
   * Sets the binary content of a file represented by the given directory entry.
   * 
   * @param {FatDirectoryEntryView} entry The directory entry representing the file to write to.
   * @param {Uint8Array} contents A byte array or string containing the new contents.
   */
  setFileContents(entry, contents) {
    if (typeof contents === 'string') {
      contents = new TextEncoder().encode(contents);
    }

    const fatTable = this.#getFatTable();
    const requiredClusterCount = Math.ceil(contents.byteLength / this.#clusterSize);

    const currentClusters = fatTable.getClusterChain(entry.getStartCluster());
    const deletedClusters = currentClusters.slice(requiredClusterCount);
    const fileClusters = currentClusters.slice(0, requiredClusterCount);
    const newClusters = [];

    // Attempt to allocate any new clusters needed to store the file’s updated 
    // contents. This is done before modifying the file to ensure there is 
    // sufficient space available on the disk. If the disk is full, 
    // `allocateCluster()` will throw an exception.
    try {
      while (fileClusters.length < requiredClusterCount) {
        const cluster = this.#allocateCluster();
        newClusters.push(cluster);
        fileClusters.push(cluster);
      }
    } catch (e) {
      // If something went wrong then we need to deallocate any new clusters 
      // that were created in the `try` block, or they won't be available for 
      // future writes.
      for (const cluster of newClusters) {
        this.#deallocateCluster(cluster);
      }
      throw e;
    }

    // Chunk up the contents array and write to each chunk to the relevant
    // cluster. When there are no clusters left, we set the terminator marker.
    fileClusters.forEach((cluster, i) => {
      const offset = i * this.#clusterSize;
      const chunk = contents.slice(offset, offset + this.#clusterSize);
      this.#setClusterData(cluster, chunk);
      const nextCluster = fileClusters[i + 1];
      if (nextCluster) {
        this.#setCluster(cluster, nextCluster);
      } else {
        this.#setCluster(cluster, FAT_CLUSTER_TERMINATOR);
      }
    });

    entry.setSize(contents.byteLength);

    // deallocate any deleted clusters
    deletedClusters.forEach(cluster => {
      this.#deallocateCluster(cluster);
    });
  }


  /**
   * Retrieves a directory entry by name from the specified parent directory. If
   * no parent is provided, the root directory is used.
   *
   * @param {string} name The name of the directory to retrieve.
   * @param {FatDirectoryEntryView} [parentDirectory] The parent directory to search in. Defaults to the root directory if not provided.
   * @returns {FatDirectoryEntryView} The directory entry corresponding to the specified name.
   * @throws {FatException} 
   */
  getDirectory(name, parentDirectory = null) {
    const entry = this.#getEntry(name, parentDirectory);
    if (!(entry.getAttributes() & FILE_ATTRIBUTE_DIRECTORY)) {
      throw new FatException(`${name} is not a directory`);
    }
    return entry;
  }


  /**
   * Retrieves the directory entries from the specified parent directory. If
   * no parent is provided, the root directory is used.
   * 
   * @param {FatDirectoryEntryView} [directory] The directory to fetch files from. If omitted, the root directory is used
   * @returns {FatDirectoryEntryView[]} The entries for the directory
   */
  getDirectoryEntries(directory = null) {
    return [...this.#createDirectoryIterator(directory)];
  }


  /**
   * Creates a new subdirectory within a specified directory entry. If no 
   * directory is specified, the subdirectory is created in the root directory.
   * 
   * @param {string} name The name of the new directory
   * @param {FatDirectoryEntryView} [parentDirectory] The parent of the new directory. Root if omitted
   * @returns {FatDirectoryEntryView} A `FatDirectoryEntryView` representing the new sub directory
   */
  createDirectory(name, parentDirectory = null) {
    const entry = this.#createEntry(name, FILE_ATTRIBUTE_DIRECTORY, parentDirectory)

    // Create a buffer to hold the new directory contents which will hold the
    // special `.` and `..` waypoint entries.
    const contents = new Uint8Array(FAT_ENTRY_SIZE * 2);

    const cluster = entry.getStartCluster();
    const parentCluster = parentDirectory?.getStartCluster() ?? 0;

    // New directories should contain a `.` and `..` entry. These provide a 
    // mechanism to navigate around the filesystem. `.` points to the current
    // directory and `..` points to the parent.
    const currentDirEntry = new FatDirectoryEntryView(contents.buffer);
    currentDirEntry.setName('A'); // '.' is an invalid file name.
    currentDirEntry.setSize(0);
    currentDirEntry.setAttributes(FILE_ATTRIBUTE_DIRECTORY);
    currentDirEntry.setStartCluster(cluster);

    const parentDirEntry = new FatDirectoryEntryView(contents.buffer, FAT_ENTRY_SIZE);
    parentDirEntry.setName('A'); // '..' is an invalid file name.
    parentDirEntry.setSize(0);
    parentDirEntry.setAttributes(FILE_ATTRIBUTE_DIRECTORY);
    parentDirEntry.setStartCluster(parentCluster);

    // Since `.` and `..` aren't valid filenames, we need to bypass the 
    // `FatEntryDataView` interface and write the 0x2E bytes directly to the 
    // `Uint8Array`
    contents[0] = FAT_DIRECTORY_WAYPOINT_CHAR;
    contents[FAT_ENTRY_SIZE] = FAT_DIRECTORY_WAYPOINT_CHAR;
    contents[FAT_ENTRY_SIZE + 1] = FAT_DIRECTORY_WAYPOINT_CHAR;

    // Write the new directory contents to the cluster
    this.#setClusterData(cluster, contents);

    return entry;
  }


  /**
   * Returns a `FatDirectoryEntryView` interface for the file at the specified 
   * path. If the file doesn't exist an exception is thrown.
   * 
   * @param {string} path The path of the file to access
   * @returns {FatDirectoryEntryView} A file reference
   */
  getFileAtPath(path) {
    const { name, directory } = this.#resolvePath(path);
    return this.getFile(name, directory);
  }


  /**
   * Creates a new empty file at a fully qualified file path. The directory 
   * structure must exist.
   * 
   * @param {string} path The path of the file to create
   * @returns {FatDirectoryEntryView} A file reference
   */
  createFileAtPath(path) {
    const { name, directory } = this.#resolvePath(path);
    return this.createFile(name, directory);
  }


  /**
   * Returns a reference to an existing directory at a fully qualified path. The
   * parent directory structure must exist.
   * 
   * @param {string} path The path of the directory to get a reference to
   * @returns {FatDirectoryEntryView} The entry for the directory, or `null` if
   * the path is resolves to the root directory.
   */
  getDirectoryAtPath(path) {
    const { segments } = parsePath(path);
    let entry = null;
    while (segments.length) {
      const segment = segments.shift();
      entry = this.getDirectory(segment, entry);
    }
    return entry;
  }


  /**
   * Creates a new empty directory at a fully qualified file path. The directory
   * structure must exist.
   * 
   * @param {string} path The path of the directory to create
   * @returns {FatDirectoryEntryView} A file reference
   */
  createDirectoryAtPath(path) {
    const { name, directory } = this.#resolvePath(path);
    return this.createDirectory(name, directory);
  }


  #getClusterData(cluster) {
    const clusterOffset = this.#dataStart + ((cluster - 2) * this.#clusterSize);
    return this.buffer.slice(clusterOffset, clusterOffset + this.#clusterSize);
  }


  #setClusterData(cluster, data) {
    const clusterOffset = this.#dataStart + ((cluster - 2) * this.#clusterSize);
    return new Uint8Array(this.buffer).set(data, clusterOffset);
  }


  /**
   * Finds the next empty cluster and reserves it. Once a cluster has been 
   * reserved it will not be returned in subsequent calls to this method. If no
   * empty clusters are available an error is thrown. The cluster will be marked
   * as reserved in all FAT tables.
   * 
   * @param {number} [tableNumber] The FAT table to allocate the cluster from
   * @returns {number} The allocated cluster number
   */
  #allocateCluster(tableNumber = 0) {
    const fatTable = this.#getFatTable(tableNumber);
    for (let cluster = 2; cluster < this.#maxClusters; cluster++) {
      if (fatTable.getCluster(cluster) === FAT_CLUSTER_EMPTY) {
        // reserve the cluster in all FATs
        this.#setCluster(cluster, FAT_CLUSTER_RESERVED);
        return cluster;
      }
    }
    throw new FatException('Disk full', ERROR_NAME_WRITE);
  }


  /**
   * Deallocates an cluster, making it available for resuse. The cluster will be
   * marked as available in all FAT tables.
   * @param {number} cluster 
   */
  #deallocateCluster(cluster) {
    this.#setCluster(cluster, FAT_CLUSTER_EMPTY)
  }        


  /**
   * Creates a `FatTableView` interface for the specified FAT table.
   * 
   * @param {number} [number] The FAT table to return. Defaults to `0`
   * @returns {FatTableView} A FatTableView view contaning the bytes of the FAT table
   */
  #getFatTable(number = 0) {
    if (number < 0 || number > this.#fatCount - 1) {
      throw new Error('Invalid FAT number.');
    }
    const length = this.#fatSize * this.bytesPerSector;
    return new this.#FatTableView(this.buffer, this.#fatStart + (number * length), length);
  }


  /**
   * Sets a cluster in all FAT tables defined by the filesystem
   * 
   * @param {number} clusterNum The cluster number to set
   * @param {number} value The new value
   */
  #setCluster(clusterNum, value) {
    for (let c = 0; c < this.#fatCount; c++) {
      const fatTable = this.#getFatTable(c);
      fatTable.setCluster(clusterNum, value);
    }
  }

}
