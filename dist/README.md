# @keithclark/diskview Documentation

## Fat12DirectoryEntryView Class

Represents a view over a FAT12 directory entry in a given ArrayBuffer. Allows reading and writing of file metadata such as filename, size, start cluster, and attributes. 

### Constructor

#### `Fat12DirectoryEntryView()`

Creates a new view of a FAT12 directory entry. 

##### Syntax

```js
instance = new Fat12DirectoryEntryView(buffer, byteOffset)
```

##### Arguments


Name | Type | Description
-|-|-
`buffer` | ArrayBuffer | The buffer containing the FAT12 directory entry. 
`byteOffset` | number | Offset into the buffer where the entry starts. 

### Instance Methods

#### `Fat12DirectoryEntryView.getAttributes()`

Returns the attribute byte for the entry (e.g. archive, hidden, system, etc). 

##### Syntax

```js
result = myFat12DirectoryEntryView.getAttributes()
```

##### Returns

A number.  The attribute byte. 

#### `Fat12DirectoryEntryView.getName()`

Returns the filename of the entry the view represents.  

##### Syntax

```js
result = myFat12DirectoryEntryView.getName()
```

##### Returns

A string.  The filename of the entry.  

#### `Fat12DirectoryEntryView.getSize()`

Returns the file size in bytes stored in the entry. 

##### Syntax

```js
result = myFat12DirectoryEntryView.getSize()
```

##### Returns

A number.  The file size in bytes. 

#### `Fat12DirectoryEntryView.getStartCluster()`

Returns the number of the cluster containing the first chunk of data for the entry's content. 

##### Syntax

```js
result = myFat12DirectoryEntryView.getStartCluster()
```

##### Returns

A number.  The starting cluster number.  

#### `Fat12DirectoryEntryView.setAttributes()`

Sets the attribute byte for the entry (e.g. archive, hidden, system, etc). 

##### Syntax

```js
myFat12DirectoryEntryView.setAttributes(value)
```

##### Arguments


Name | Type | Description
-|-|-
`value` | number | The attribute byte. 

#### `Fat12DirectoryEntryView.setName()`

Sets the filename of the entry the view represents. Changes are made to the underlying `ArrayBuffer`.  

##### Syntax

```js
myFat12DirectoryEntryView.setName(value)
```

##### Arguments


Name | Type | Description
-|-|-
`value` | string | The new filename. 

#### `Fat12DirectoryEntryView.setSize()`

Sets the file size in bytes stored in the entry. 

##### Syntax

```js
myFat12DirectoryEntryView.setSize(value)
```

##### Arguments


Name | Type | Description
-|-|-
`value` | number | The file size in bytes. 

#### `Fat12DirectoryEntryView.setStartCluster()`

Sets the number of the cluster containing the first chunk of data for the entry's content. 

##### Syntax

```js
myFat12DirectoryEntryView.setStartCluster(value)
```

##### Arguments


Name | Type | Description
-|-|-
`value` | number | The starting cluster number.  

### Instance Properties

#### `Fat12DirectoryEntryView.buffer` (Read-only)

A ArrayBuffer.  Gets the underlying ArrayBuffer. 

#### `Fat12DirectoryEntryView.byteLength` (Read-only)

A number.  Gets the number of bytes in a FAT12 directory entry. 

#### `Fat12DirectoryEntryView.byteOffset` (Read-only)

A number.  Gets the offset into the buffer where this view starts. 

## Fat12DiskView Class

The Fat12DiskView view provides a low-level interface for reading and writing to files and directories in a binary `ArrayBuffer` containing a FAT12 disk image. 
Extends DiskView.  
### Constructor

#### `Fat12DiskView()`

Creates a new `Fat12DiskView` instance.  

##### Syntax

```js
instance = new Fat12DiskView(buffer)
```

##### Arguments


Name | Type | Description
-|-|-
`buffer` | ArrayBuffer | The buffer containin a FAT12 formatted disk image.  

### Instance Methods

#### `Fat12DiskView.createDirectory()`

Creates a new subdirectory within a specified directory entry. If no directory is specified, the subdirectory is created in the root directory. 

##### Syntax

```js
result = myFat12DiskView.createDirectory(name, parentDirectory)
```

##### Arguments


Name | Type | Description
-|-|-
`name` | string | The name of the new directory.  
`parentDirectory` | Fat12DirectoryEntryView | The parent of the new directory. Root if omitted.  

##### Returns

A Fat12DirectoryEntryView.  A `Fat12DirectoryEntryView` representing the new sub directory.  

#### `Fat12DiskView.createDirectoryAtPath()`

Creates a new empty directory at a fully qualified file path. The directory structure must exist. 

##### Syntax

```js
result = myFat12DiskView.createDirectoryAtPath(path)
```

##### Arguments


Name | Type | Description
-|-|-
`path` | string | The path of the directory to create.  

##### Returns

A Fat12DirectoryEntryView.  A file reference.  

#### `Fat12DiskView.createFile()`

Creates an empty file in the specified directory (or in the root directory if none is provided) and returns a `Fat12DirectoryEntryView` representing the new file. 

##### Syntax

```js
result = myFat12DiskView.createFile(name, parentDirectory)
```

##### Arguments


Name | Type | Description
-|-|-
`name` | string | The file name of the file.  
`parentDirectory` | Fat12DirectoryEntryView | A `Fat12DirectoryEntryView` interface for the directory that file will be created in.  

##### Returns

A Fat12DirectoryEntryView.  A `Fat12DirectoryEntryView` for the new file entry.  

#### `Fat12DiskView.createFileAtPath()`

Creates a new empty file at a fully qualified file path. The directory structure must exist. 

##### Syntax

```js
result = myFat12DiskView.createFileAtPath(path)
```

##### Arguments


Name | Type | Description
-|-|-
`path` | string | The path of the file to create.  

##### Returns

A Fat12DirectoryEntryView.  A file reference.  

#### `Fat12DiskView.getDirectory()`

Retrieves a directory entry by name from the specified parent directory. If no parent is provided, the root directory is used. *.  

##### Syntax

```js
result = myFat12DiskView.getDirectory(name, parentDirectory)
```

##### Arguments


Name | Type | Description
-|-|-
`name` | string | The name of the directory to retrieve. 
`parentDirectory` | Fat12DirectoryEntryView | The parent directory to search in. Defaults to the root directory if not provided. 

##### Returns

A Fat12DirectoryEntryView.  The directory entry corresponding to the specified name. 

#### `Fat12DiskView.getDirectoryAtPath()`

Returns a reference to an existing directory at a fully qualified path. The parent directory structure must exist. 

##### Syntax

```js
result = myFat12DiskView.getDirectoryAtPath(path)
```

##### Arguments


Name | Type | Description
-|-|-
`path` | string | The path of the directory to create.  

##### Returns

A Fat12DirectoryEntryView.  A file reference.  

#### `Fat12DiskView.getDirectoryEntries()`

Retrieves the directory entries from the specified parent directory. If no parent is provided, the root directory is used. 

##### Syntax

```js
result = myFat12DiskView.getDirectoryEntries(directory)
```

##### Arguments


Name | Type | Description
-|-|-
`directory` | Fat12DirectoryEntryView | The directory to fetch files from. If omitted, the root directory is used.  

##### Returns

A Fat12DirectoryEntryView[].  The entries for the directory.  

#### `Fat12DiskView.getFile()`

Returns a `Fat12EntryDataView` interface for the file at the specified path.  

##### Syntax

```js
result = myFat12DiskView.getFile(name, parentDirectory)
```

##### Arguments


Name | Type | Description
-|-|-
`name` | string | .  
`parentDirectory` | Fat12DirectoryEntryView | .  

##### Returns

A Fat12DirectoryEntryView.  

#### `Fat12DiskView.getFileAtPath()`

Returns a `Fat12EntryDataView` interface for the file at the specified path.  

##### Syntax

```js
result = myFat12DiskView.getFileAtPath(path)
```

##### Arguments


Name | Type | Description
-|-|-
`path` | string | .  

##### Returns

A Fat12DirectoryEntryView.  

#### `Fat12DiskView.getFileContents()`

Retrieves the contents of a file represented by the given directory entry. * This method reads the FAT table to determine the chain of clusters used by the file, then reads the data from each cluster and assembles it into a single contiguous buffer. *.  

##### Syntax

```js
result = myFat12DiskView.getFileContents(entry)
```

##### Arguments


Name | Type | Description
-|-|-
`entry` | Fat12DirectoryEntryView | The directory entry representing the file to read. 

##### Returns

A Uint8Array.  A byte array containing the file's contents. 

#### `Fat12DiskView.getFree()`

Returns the available free space on the disk, in bytes. The resulting value is computed from the number of unused clusters in the FAT table, so will be a multiple of the cluster size, as defined in the Bios Paramater Block. 

##### Syntax

```js
result = myFat12DiskView.getFree()
```

##### Returns

A number.  

#### `Fat12DiskView.getSize()`

The total number of bytes that can be stored on the volume.  

##### Syntax

```js
result = myFat12DiskView.getSize()
```

##### Returns

A number.  

#### `Fat12DiskView.setFileContents()`

Sets the binary content of a file represented by the given directory entry. 

##### Syntax

```js
myFat12DiskView.setFileContents(entry, contents)
```

##### Arguments


Name | Type | Description
-|-|-
`entry` | Fat12DirectoryEntryView | The directory entry representing the file to write to. 
`contents` | Uint8Array | A byte array or string containing the new contents.
