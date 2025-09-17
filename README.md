# @keithclark/diskview Documentation

## DiskView Class

The DiskView view provides a low-level interface for reading from, and writing to, sectors on a CHS geometry disk image stored in an `ArrayBuffer`. 

### Example

```js
const data = readFileSync('my-disk.img');
const view = new DiskView(data.buffer, { tracks: 80, sides: 2, sectorsPerTrack: 10 });
const bootsector = view.getSector(1, 0, 0); // sector 1, track 0, side 0
```

### Constructor

#### `DiskView()`

Creates a new `DiskView` instance.  

##### Syntax

```js
instance = new DiskView(buffer)
instance = new DiskView(buffer, options)
instance = new DiskView(buffer, options, byteOffset)
```

##### Arguments


Name | Type | Description
-|-|-
`buffer` | ArrayBuffer | An ArrayBuffer to use as the storage backing the new DiskView.  
`options` (Optional) | DiskViewInitDict | The options for customising the new view instance.  
`byteOffset` (Optional) | number | The offset into the buffer where the disk image data starts. Defaults to `0`.  

### Instance Methods

#### `DiskView.getSector()`

Returns a `Uint8Array` containing the bytes of a single sector.  

##### Syntax

```js
result = myDiskView.getSector(sector, track, side)
```

##### Arguments


Name | Type | Description
-|-|-
`sector` | number | The sector to fetch.  
`track` | number | The track containing the sector.  
`side` | number | The side containing the sector.  

##### Returns

A Uint8Array.  A Uint8Array containing the sector data.  

#### `DiskView.getTrack()`

Retrieves a `Uint8Array` containing the bytes of a single track.  

##### Syntax

```js
result = myDiskView.getTrack(track)
result = myDiskView.getTrack(track, side)
```

##### Arguments


Name | Type | Description
-|-|-
`track` | number | The track to fetch.  
`side` (Optional) | number | The side containing the track.  Defaults to `0`.  

##### Returns

A Uint8Array.  An Uint8Array containing the track data.  

#### `DiskView.setSector()`

Replaces the bytes in a sector with new data.  

##### Syntax

```js
myDiskView.setSector(sector, track, side, buffer)
```

##### Arguments


Name | Type | Description
-|-|-
`sector` | number | The sector to fetch.  
`track` | number | The track containing the sector.  
`side` | number | The side containing the sector.  
`buffer` | Uint8Array | The new data for the sector. Array length must match `bytesPerSector`.  

### Instance Properties

#### `DiskView.buffer` (Read-only)

A ArrayBuffer.  Gets the underlying ArrayBuffer backing this view. 

#### `DiskView.byteOffset` (Read-only)

A number.  The offset into the buffer where the disk image data starts. 

#### `DiskView.bytesPerSector` (Read-only)

A number.  Gets the number of bytes per sector. 

#### `DiskView.sides` (Read-only)

A number.  Gets the number of configured sides for the disk.  

#### `DiskView.tracks` (Read-only)

A number.  Gets the number of configured tracks for the disk.  

## FatDirectoryEntryView Class

Represents a view over a FAT  directory entry in a given ArrayBuffer. Allows reading and writing of file metadata such as filename, size, start cluster, and attributes. 

### Constructor

#### `FatDirectoryEntryView()`

Creates a new view of a FAT directory entry. 

##### Syntax

```js
instance = new FatDirectoryEntryView(buffer)
instance = new FatDirectoryEntryView(buffer, byteOffset)
```

##### Arguments


Name | Type | Description
-|-|-
`buffer` | ArrayBuffer | The buffer containing the FAT directory entry. 
`byteOffset` (Optional) | number | Offset into the buffer where the entry starts. Defaults to `0`.  

### Instance Methods

#### `FatDirectoryEntryView.getAttributes()`

Returns the attribute byte for the entry (e.g. archive, hidden, system, etc). 

##### Syntax

```js
result = myFatDirectoryEntryView.getAttributes()
```

##### Returns

A number.  The attribute byte. 

#### `FatDirectoryEntryView.getName()`

Returns the filename of the entry the view represents.  

##### Syntax

```js
result = myFatDirectoryEntryView.getName()
```

##### Returns

A string.  The filename of the entry.  

#### `FatDirectoryEntryView.getSize()`

Returns the file size in bytes stored in the entry. 

##### Syntax

```js
result = myFatDirectoryEntryView.getSize()
```

##### Returns

A number.  The file size in bytes. 

#### `FatDirectoryEntryView.getStartCluster()`

Returns the number of the cluster containing the first chunk of data for the entry's content. 

##### Syntax

```js
result = myFatDirectoryEntryView.getStartCluster()
```

##### Returns

A number.  The starting cluster number.  

#### `FatDirectoryEntryView.setAttributes()`

Sets the attribute byte for the entry (e.g. archive, hidden, system, etc). 

##### Syntax

```js
myFatDirectoryEntryView.setAttributes(value)
```

##### Arguments


Name | Type | Description
-|-|-
`value` | number | The attribute byte. 

#### `FatDirectoryEntryView.setName()`

Sets the filename of the entry the view represents. Changes are made to the underlying `ArrayBuffer`.  

##### Syntax

```js
myFatDirectoryEntryView.setName(value)
```

##### Arguments


Name | Type | Description
-|-|-
`value` | string | The new filename. 

#### `FatDirectoryEntryView.setSize()`

Sets the file size in bytes stored in the entry. 

##### Syntax

```js
myFatDirectoryEntryView.setSize(value)
```

##### Arguments


Name | Type | Description
-|-|-
`value` | number | The file size in bytes. 

#### `FatDirectoryEntryView.setStartCluster()`

Sets the number of the cluster containing the first chunk of data for the entry's content. 

##### Syntax

```js
myFatDirectoryEntryView.setStartCluster(value)
```

##### Arguments


Name | Type | Description
-|-|-
`value` | number | The starting cluster number.  

### Instance Properties

#### `FatDirectoryEntryView.buffer` (Read-only)

A ArrayBuffer.  Gets the underlying ArrayBuffer. 

#### `FatDirectoryEntryView.byteLength` (Read-only)

A number.  Gets the number of bytes in a FAT directory entry. 

#### `FatDirectoryEntryView.byteOffset` (Read-only)

A number.  Gets the offset into the buffer where this view starts. 

## FatDiskView Class

The FatDiskView view provides a low-level interface for reading from, and writing to, files and directories on a FAT12 or FAT16 disk image stored in a binary `ArrayBuffer`. 

### Example

```js
const data = readFileSync('my-disk.img');
const view = new FatDiskView(data.buffer, { format: 'fat12' });
const rootDirEntries = view.getDirectoryContents();

console.log(rootDirEntries)
```
Extends DiskView.  
### Constructor

#### `FatDiskView()`

Creates a new `FatDiskView` instance.  

##### Syntax

```js
instance = new FatDiskView(buffer)
instance = new FatDiskView(buffer, options)
instance = new FatDiskView(buffer, options, byteOffset)
```

##### Arguments


Name | Type | Description
-|-|-
`buffer` | ArrayBuffer | An ArrayBuffer to use as the storage backing the new FatDiskView.  
`options` (Optional) | FatDiskViewInitDict | The options for customising the new view instance.  
`byteOffset` (Optional) | number | The offset into the buffer where the disk image data starts. Defaults to `0`.  

### Instance Methods

#### `FatDiskView.createDirectory()`

Creates a new subdirectory within a specified directory entry. If no directory is specified, the subdirectory is created in the root directory. 

##### Syntax

```js
result = myFatDiskView.createDirectory(name)
result = myFatDiskView.createDirectory(name, parentDirectory)
```

##### Arguments


Name | Type | Description
-|-|-
`name` | string | The name of the new directory.  
`parentDirectory` (Optional) | FatDirectoryEntryView | The parent of the new directory. Root if omitted.  Defaults to `null`.  

##### Returns

A FatDirectoryEntryView.  A `FatDirectoryEntryView` representing the new sub directory.  

#### `FatDiskView.createDirectoryAtPath()`

Creates a new empty directory at a fully qualified file path. The directory structure must exist. 

##### Syntax

```js
result = myFatDiskView.createDirectoryAtPath(path)
```

##### Arguments


Name | Type | Description
-|-|-
`path` | string | The path of the directory to create.  

##### Returns

A FatDirectoryEntryView.  A file reference.  

#### `FatDiskView.createFile()`

Creates an empty file in the specified directory (or in the root directory if none is provided) and returns a `FatDirectoryEntryView` representing the new file. 

##### Syntax

```js
result = myFatDiskView.createFile(name)
result = myFatDiskView.createFile(name, parentDirectory)
```

##### Arguments


Name | Type | Description
-|-|-
`name` | string | The file name of the file.  
`parentDirectory` (Optional) | FatDirectoryEntryView | A `FatDirectoryEntryView` interface representing the directory that new file will be created in. Defaults to `null`.  

##### Returns

A FatDirectoryEntryView.  A `FatDirectoryEntryView` for the new file entry.  

#### `FatDiskView.createFileAtPath()`

Creates a new empty file at a fully qualified file path. The directory structure must exist. 

##### Syntax

```js
result = myFatDiskView.createFileAtPath(path)
```

##### Arguments


Name | Type | Description
-|-|-
`path` | string | The path of the file to create.  

##### Returns

A FatDirectoryEntryView.  A file reference.  

#### `FatDiskView.getDirectory()`

Retrieves a directory entry by name from the specified parent directory. If no parent is provided, the root directory is used. 

##### Syntax

```js
result = myFatDiskView.getDirectory(name)
result = myFatDiskView.getDirectory(name, parentDirectory)
```

##### Arguments


Name | Type | Description
-|-|-
`name` | string | The name of the directory to retrieve. 
`parentDirectory` (Optional) | FatDirectoryEntryView | The parent directory to search in. Defaults to the root directory if not provided. Defaults to `null`.  

##### Returns

A FatDirectoryEntryView.  The directory entry corresponding to the specified name. 

#### `FatDiskView.getDirectoryAtPath()`

Returns a reference to an existing directory at a fully qualified path. The parent directory structure must exist. 

##### Syntax

```js
result = myFatDiskView.getDirectoryAtPath(path)
```

##### Arguments


Name | Type | Description
-|-|-
`path` | string | The path of the directory to get a reference to.  

##### Returns

A FatDirectoryEntryView.  The entry for the directory, or `null` if the path is resolves to the root directory. 

#### `FatDiskView.getDirectoryEntries()`

Retrieves the directory entries from the specified parent directory. If no parent is provided, the root directory is used. 

##### Syntax

```js
result = myFatDiskView.getDirectoryEntries()
result = myFatDiskView.getDirectoryEntries(directory)
```

##### Arguments


Name | Type | Description
-|-|-
`directory` (Optional) | FatDirectoryEntryView | The directory to fetch files from. If omitted, the root directory is used.  Defaults to `null`.  

##### Returns

A FatDirectoryEntryView[].  The entries for the directory.  

#### `FatDiskView.getFile()`

Returns a `FatEntryDataView` interface for the file at the specified path.  

##### Syntax

```js
result = myFatDiskView.getFile(name)
result = myFatDiskView.getFile(name, parentDirectory)
```

##### Arguments


Name | Type | Description
-|-|-
`name` | string |  
`parentDirectory` (Optional) | FatDirectoryEntryView |  Defaults to `null`.  

##### Returns

A FatDirectoryEntryView.  

#### `FatDiskView.getFileAtPath()`

Returns a `FatDirectoryEntryView` interface for the file at the specified path. If the file doesn't exist an exception is thrown. 

##### Syntax

```js
result = myFatDiskView.getFileAtPath(path)
```

##### Arguments


Name | Type | Description
-|-|-
`path` | string | The path of the file to access.  

##### Returns

A FatDirectoryEntryView.  A file reference.  

#### `FatDiskView.getFileContents()`

Retrieves the contents of a file represented by the given directory entry.

This method reads the FAT table to determine the chain of clusters used by the file, then reads the data from each cluster and assembles it into a single contiguous buffer. 

##### Syntax

```js
result = myFatDiskView.getFileContents(entry)
```

##### Arguments


Name | Type | Description
-|-|-
`entry` | FatDirectoryEntryView | The directory entry representing the file to read. 

##### Returns

A Uint8Array.  A byte array containing the file's contents. 

#### `FatDiskView.getFree()`

Returns the available free space on the disk, in bytes. The resulting value is computed from the number of unused clusters in the FAT table, so will be a multiple of the cluster size, as defined in the Bios Paramater Block. 

##### Syntax

```js
result = myFatDiskView.getFree()
```

##### Returns

A number.  

#### `FatDiskView.getSize()`

The total number of bytes that can be stored on the volume.  

##### Syntax

```js
result = myFatDiskView.getSize()
```

##### Returns

A number.  

#### `FatDiskView.setFileContents()`

Sets the binary content of a file represented by the given directory entry. 

##### Syntax

```js
myFatDiskView.setFileContents(entry, contents)
```

##### Arguments


Name | Type | Description
-|-|-
`entry` | FatDirectoryEntryView | The directory entry representing the file to write to. 
`contents` | Uint8Array | A byte array or string containing the new contents. 

## FatError Class
Extends Error.  
### Constructor

#### `FatError()`

##### Syntax

```js
instance = new FatError(message, name)
```

##### Arguments


Name | Type | Description
-|-|-
`message` | string | The error message.  
`name` | string | The error name.  Allowed values: `"WriteError"` or `"NotFoundError"`.  

### Instance Properties

#### `FatError.name` (Read-only)

A string.  The name of the error.  

## Type Definitions

### `DiskViewInitDict`

Configuration options for creating a new `DiskView` instance.  


Name | Type | Description
-|-|-
`bytesPerSector` (Optional) | number | The number of bytes in a single sector.  Defaults to `512`.  
`sectorsPerTrack` (Optional) | number | The number of sectors on each track.  Defaults to `9`.  
`sides` (Optional) | number | The number of sides on the disk.  Defaults to `2`.  
`tracks` (Optional) | number | The number of tracks on the disk.  Defaults to `80`.  

### `FatDiskViewInitDict`

Configuration options for creating a new `FatDiskView` instance.  


Name | Type | Description
-|-|-
`format` (Optional) | string | The FAT format of the filesystem the view represents.  Allowed values: `"fat12"` or `"fat16"`.  Defaults to `"fat12"`.
