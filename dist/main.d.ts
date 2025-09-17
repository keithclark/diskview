declare module "@keithclark/diskview" {
  /**
   * The DiskView view provides a low-level interface for reading from, and
   * writing to, sectors on a CHS geometry disk image stored in an
   * `ArrayBuffer`.
   */
  export class DiskView {
    /**
     * Creates a new `DiskView` instance
     * @param buffer An ArrayBuffer to use as the storage backing the new
     * DiskView
     * @param options The options for customising the new view instance
     * @param byteOffset The offset into the buffer where the disk image data
     * starts.
     */
    constructor(buffer: ArrayBuffer, options?: DiskViewInitDict, byteOffset?: number=0);
    /**
     * Retrieves a `Uint8Array` containing the bytes of a single track
     * @param track The track to fetch
     * @param side The side containing the track
     */
    getTrack(track: number, side?: number=0): Uint8Array;
    /**
     * Returns a `Uint8Array` containing the bytes of a single sector
     * @param sector The sector to fetch
     * @param track The track containing the sector
     * @param side The side containing the sector
     */
    getSector(sector: number, track: number, side: number): Uint8Array;
    /**
     * Replaces the bytes in a sector with new data
     * @param sector The sector to fetch
     * @param track The track containing the sector
     * @param side The side containing the sector
     * @param buffer The new data for the sector. Array length must match
     * `bytesPerSector`
     */
    setSector(sector: number, track: number, side: number, buffer: Uint8Array): void;
    /**
     * Gets the underlying ArrayBuffer backing this view.
     */
    readonly buffer: ArrayBuffer;
    /**
     * The offset into the buffer where the disk image data starts.
     */
    readonly byteOffset: number;
    /**
     * Gets the number of bytes per sector.
     */
    readonly bytesPerSector: number;
    /**
     * Gets the number of configured tracks for the disk
     */
    readonly tracks: number;
    /**
     * Gets the number of configured sides for the disk
     */
    readonly sides: number;
  }
  
  /**
   * Represents a view over a FAT  directory entry in a given ArrayBuffer.
   * Allows reading and writing of file metadata such as filename, size, start
   * cluster, and attributes.
   */
  export class FatDirectoryEntryView {
    /**
     * Creates a new view of a FAT directory entry.
     * @param buffer The buffer containing the FAT directory entry.
     * @param byteOffset Offset into the buffer where the entry starts.
     */
    constructor(buffer: ArrayBuffer, byteOffset?: number=0);
    /**
     * Returns the filename of the entry the view represents
     */
    getName(): string;
    /**
     * Sets the filename of the entry the view represents. Changes are made to
     * the underlying `ArrayBuffer`
     * @param value The new filename.
     */
    setName(value: string): void;
    /**
     * Returns the number of the cluster containing the first chunk of data for
     * the entry's content.
     */
    getStartCluster(): number;
    /**
     * Sets the number of the cluster containing the first chunk of data for
     * the entry's content.
     * @param value The starting cluster number
     */
    setStartCluster(value: number): void;
    /**
     * Returns the attribute byte for the entry (e.g. archive, hidden, system,
     * etc).
     */
    getAttributes(): number;
    /**
     * Sets the attribute byte for the entry (e.g. archive, hidden, system,
     * etc).
     * @param value The attribute byte.
     */
    setAttributes(value: number): void;
    /**
     * Returns the file size in bytes stored in the entry.
     */
    getSize(): number;
    /**
     * Sets the file size in bytes stored in the entry.
     * @param value The file size in bytes.
     */
    setSize(value: number): void;
    /**
     * Gets the underlying ArrayBuffer.
     */
    readonly buffer: ArrayBuffer;
    /**
     * Gets the offset into the buffer where this view starts.
     */
    readonly byteOffset: number;
    /**
     * Gets the number of bytes in a FAT directory entry.
     */
    readonly byteLength: number;
  }
  
  /**
   * The FatDiskView view provides a low-level interface for reading from, and
   * writing to, files and directories on a FAT12 or FAT16 disk image stored in
   * a binary `ArrayBuffer`.
   */
  export class FatDiskView extends DiskView {
    /**
     * Creates a new `FatDiskView` instance
     * @param buffer An ArrayBuffer to use as the storage backing the new
     * FatDiskView
     * @param options The options for customising the new view instance
     * @param byteOffset The offset into the buffer where the disk image data
     * starts.
     */
    constructor(buffer: ArrayBuffer, options?: FatDiskViewInitDict, byteOffset?: number=0);
    /**
     * Returns the available free space on the disk, in bytes. The resulting
     * value is computed from the number of unused clusters in the FAT table,
     * so will be a multiple of the cluster size, as defined in the Bios
     * Paramater Block.
     */
    getFree(): number;
    /**
     * The total number of bytes that can be stored on the volume
     */
    getSize(): number;
    /**
     * Returns a `FatEntryDataView` interface for the file at the specified path
     */
    getFile(name: string, parentDirectory?: FatDirectoryEntryView=null): FatDirectoryEntryView;
    /**
     * Creates an empty file in the specified directory (or in the root
     * directory if none is provided) and returns a `FatDirectoryEntryView`
     * representing the new file.
     * @param name The file name of the file
     * @param parentDirectory A `FatDirectoryEntryView` interface representing
     * the directory that new file will be created in.
     */
    createFile(name: string, parentDirectory?: FatDirectoryEntryView=null): FatDirectoryEntryView;
    /**
     * Retrieves the contents of a file represented by the given directory
     * entry.
     *
     * This method reads the FAT table to determine the chain of clusters used
     * by the file, then reads the data from each cluster and assembles it into
     * a single contiguous buffer.
     * @param entry The directory entry representing the file to read.
     */
    getFileContents(entry: FatDirectoryEntryView): Uint8Array;
    /**
     * Sets the binary content of a file represented by the given directory
     * entry.
     * @param entry The directory entry representing the file to write to.
     * @param contents A byte array or string containing the new contents.
     */
    setFileContents(entry: FatDirectoryEntryView, contents: Uint8Array): void;
    /**
     * Retrieves a directory entry by name from the specified parent directory.
     * If no parent is provided, the root directory is used.
     * @param name The name of the directory to retrieve.
     * @param parentDirectory The parent directory to search in. Defaults to
     * the root directory if not provided.
     */
    getDirectory(name: string, parentDirectory?: FatDirectoryEntryView=null): FatDirectoryEntryView;
    /**
     * Retrieves the directory entries from the specified parent directory. If
     * no parent is provided, the root directory is used.
     * @param directory The directory to fetch files from. If omitted, the root
     * directory is used
     */
    getDirectoryEntries(directory?: FatDirectoryEntryView=null): FatDirectoryEntryView[];
    /**
     * Creates a new subdirectory within a specified directory entry. If no
     * directory is specified, the subdirectory is created in the root
     * directory.
     * @param name The name of the new directory
     * @param parentDirectory The parent of the new directory. Root if omitted
     */
    createDirectory(name: string, parentDirectory?: FatDirectoryEntryView=null): FatDirectoryEntryView;
    /**
     * Returns a `FatDirectoryEntryView` interface for the file at the
     * specified path. If the file doesn't exist an exception is thrown.
     * @param path The path of the file to access
     */
    getFileAtPath(path: string): FatDirectoryEntryView;
    /**
     * Creates a new empty file at a fully qualified file path. The directory
     * structure must exist.
     * @param path The path of the file to create
     */
    createFileAtPath(path: string): FatDirectoryEntryView;
    /**
     * Returns a reference to an existing directory at a fully qualified path.
     * The parent directory structure must exist.
     * @param path The path of the directory to get a reference to
     */
    getDirectoryAtPath(path: string): FatDirectoryEntryView;
    /**
     * Creates a new empty directory at a fully qualified file path. The
     * directory structure must exist.
     * @param path The path of the directory to create
     */
    createDirectoryAtPath(path: string): FatDirectoryEntryView;
  }
  
  export class FatError extends Error {
    /**
     * @param message The error message
     * @param name The error name
     */
    constructor(message: string, name: "WriteError"|"NotFoundError");
    /**
     * The name of the error
     */
    readonly name: string;
  }
  /**
   * Configuration options for creating a new `DiskView` instance
   */
  export type DiskViewInitDict = {
    /**
     * the number of bytes in a single sector
     */
    bytesPerSector: number;
    /**
     * the number of sectors on each track
     */
    sectorsPerTrack: number;
    /**
     * the number of sides on the disk
     */
    sides: number;
    /**
     * the number of tracks on the disk
     */
    tracks: number;
  }
  
  /**
   * Configuration options for creating a new `FatDiskView` instance
   */
  export type FatDiskViewInitDict = {
    /**
     * The FAT format of the filesystem the view represents
     */
    format: "fat12"|"fat16";
  }
  
}
