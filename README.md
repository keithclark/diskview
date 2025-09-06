## Reading a file from a disk

```js
import { readFile } from 'fs/promises';
import Fat12DiskView from '@keithclark/fat12diskview';

// Load a disk image
const diskImage = await readFile('disk.img');

// Create a view so we can access the file system
const view = new Fat12DiskView(diskImage.buffer);

// Now grab a file reference
const file = view.getFile('/DOCS/README.NOW');

// And load its contents
const fileData = view.getFileContents(file);

// A Uint8Array
consile.log(fileData);
```


## Writing a file to a disk

```js
import { readFile, writeFile } from 'fs/promises';
import Fat12DiskView from '@keithclark/fat12diskview';

// Load a disk image
const diskImage = await readFile('disk.img');

// Create a view so we can access the file system
const view = new Fat12DiskView(diskImage.buffer);

// Let's create `/TEST/README.TXT` and populate it with a message.
const dir = view.createDirectory('TEST');
const file = view.createFile('README.TXT', dir);
view.setFileContents(file, 'Hello world!');

// Save the disk to a new file.
await writeFile('disk-out.img', diskImage);
```
