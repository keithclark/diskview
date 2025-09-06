declare module "@keithclark/diskview" {
  /**
   * Represents a view over a FAT12 directory entry in a given ArrayBuffer.
   * Allows reading and writing of file metadata such as filename, size, start
   * cluster, and attributes.
   */
  export class Fat12DirectoryEntryView {
    /**
     * Creates a new view of a FAT12 directory entry.
     * @param buffer The buffer containing the FAT12 directory entry.
     * @param byteOffset Offset into the buffer where the entry starts.
     */
    constructor(buffer: ArrayBuffer, byteOffset: number=0);
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
     * Gets the number of bytes in a FAT12 directory entry.
     */
    readonly byteLength: number;
  }
  
  /**
   * The Fat12DiskView view provides a low-level interface for reading and
   * writing to files and directories in a binary `ArrayBuffer` containing a
   * FAT12 disk image.
   */
  export default class Fat12DiskView extends DiskView {
    /**
     * Creates a new `Fat12DiskView` instance
     * @param buffer The buffer containin a FAT12 formatted disk image
     */
    constructor(buffer: ArrayBuffer);
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
     * Returns a `Fat12EntryDataView` interface for the file at the specified
     * path
     */
    getFile(name: string, parentDirectory: Fat12DirectoryEntryView=null): Fat12DirectoryEntryView;
    /**
     * Creates an empty file in the specified directory (or in the root
     * directory if none is provided) and returns a `Fat12DirectoryEntryView`
     * representing the new file.
     * @param name The file name of the file
     * @param parentDirectory A `Fat12DirectoryEntryView` interface for the
     * directory that file will be created in
     */
    createFile(name: string, parentDirectory: Fat12DirectoryEntryView=null): Fat12DirectoryEntryView;
    /**
     * Retrieves the contents of a file represented by the given directory
     * entry. * This method reads the FAT table to determine the chain of
     * clusters used by the file, then reads the data from each cluster and
     * assembles it into a single contiguous buffer. *
     * @param entry The directory entry representing the file to read.
     */
    getFileContents(entry: Fat12DirectoryEntryView): Uint8Array;
    /**
     * Sets the binary content of a file represented by the given directory
     * entry.
     * @param entry The directory entry representing the file to write to.
     * @param contents A byte array or string containing the new contents.
     */
    setFileContents(entry: Fat12DirectoryEntryView, contents: Uint8Array): void;
    /**
     * Retrieves a directory entry by name from the specified parent directory.
     * If no parent is provided, the root directory is used. *
     * @param name The name of the directory to retrieve.
     * @param parentDirectory The parent directory to search in. Defaults to
     * the root directory if not provided.
     */
    getDirectory(name: string, parentDirectory: Fat12DirectoryEntryView=null): Fat12DirectoryEntryView;
    /**
     * Retrieves the directory entries from the specified parent directory. If
     * no parent is provided, the root directory is used.
     * @param directory The directory to fetch files from. If omitted, the root
     * directory is used
     */
    getDirectoryEntries(directory: Fat12DirectoryEntryView=null): Fat12DirectoryEntryView[];
    /**
     * Creates a new subdirectory within a specified directory entry. If no
     * directory is specified, the subdirectory is created in the root
     * directory.
     * @param name The name of the new directory
     * @param parentDirectory The parent of the new directory. Root if omitted
     */
    createDirectory(name: string, parentDirectory: Fat12DirectoryEntryView=null): Fat12DirectoryEntryView;
    /**
     * Returns a `Fat12EntryDataView` interface for the file at the specified
     * path
     */
    getFileAtPath(path: string): Fat12DirectoryEntryView;
    /**
     * Creates a new empty file at a fully qualified file path. The directory
     * structure must exist.
     * @param path The path of the file to create
     */
    createFileAtPath(path: string): Fat12DirectoryEntryView;
    /**
     * Returns a reference to an existing directory at a fully qualified path.
     * The parent directory structure must exist.
     * @param path The path of the directory to create
     */
    getDirectoryAtPath(path: string): Fat12DirectoryEntryView;
    /**
     * Creates a new empty directory at a fully qualified file path. The
     * directory structure must exist.
     * @param path The path of the directory to create
     */
    createDirectoryAtPath(path: string): Fat12DirectoryEntryView;
  }
  
}
