import assert from 'assert';

import { createEmptyDisk } from '../disk.helpers.js';

import { FatDiskView, FatDirectoryEntryView } from '../../src/main.js';


/* 
----------------------------------------------------------------------------- */

{
  const disk = createEmptyDisk({ tracks: 80, sides: 2, sectorsPerTrack: 10 })
  const view = new FatDiskView(disk);

  assert.throws(
    () => view.getDirectory('NOTFOUND'),
    {
      name: 'NotFoundError'
    },
    'Should throw if a directory is not found'
  );

  assert.throws(
    () => view.getFile('NOTFOUND'),
    {
      name: 'NotFoundError'
    },
    'Should throw if a file is not found'
  );
}


/* Creating directories
----------------------------------------------------------------------------- */

{
  const buffer = createEmptyDisk({
    tracks: 10,
    sides: 2,
    sectorsPerTrack: 10
  });

  // Cluster 2 in the FAT table must be free
  assert.deepStrictEqual(
    new Uint8Array(buffer.slice(0x203, 0x205)),
    new Uint8Array([0x00,0x00])
  );

  const disk = new FatDiskView(buffer);

  // Create the directory (in the disk root)
  const dir = disk.createDirectory('TEST');

  assert.ok(
    dir instanceof FatDirectoryEntryView,
    'createDirectory() should return a FatDirectoryEntryView'
  );

  assert.equal(dir.getName(), 'TEST');
  assert.equal(dir.getSize(), 0);
  assert.equal(dir.getAttributes(), 0x10);
  assert.equal(dir.getStartCluster(), 2);

  // Check that cluster 2 in the FAT table is a terminator
  assert.deepStrictEqual(
    new Uint8Array(buffer.slice(0x203, 0x205)),
    new Uint8Array([0xff,0x0f]),
    'Directory should have a terminator at cluster 2'
  );

  // Create a subdirectory
  const subdir = disk.createDirectory('SUBDIR', dir);
  assert.equal(subdir.getName(), 'SUBDIR', 'Subdirectory should have correct name');
  assert.equal(subdir.getSize(), 0, 'Subdirectory should have zero file ength');
  assert.equal(subdir.getAttributes(), 0x10, 'Subdirectory should have the directory flag set');
  assert.equal(subdir.getStartCluster(), 3, 'Subdirectory should start at cluster 3');

  // Check that cluster 3 in the FAT table is now a terminator
  assert.deepStrictEqual(
    new Uint8Array(buffer.slice(0x204, 0x206)),
    new Uint8Array([0xff,0xff]),
    'Subdirectory should have a terminator at cluster 3'
  );
}


/* Creating files
----------------------------------------------------------------------------- */

{
  const buffer = createEmptyDisk({
    tracks: 10,
    sides: 2,
    sectorsPerTrack: 10
  });

  // Cluster 2 and 3 in the FAT table must be free
  assert.deepStrictEqual(
    new Uint8Array(buffer.slice(0x203, 0x206)),
    new Uint8Array([0x00,0x00,0x00])
  );

  const disk = new FatDiskView(buffer);
  const file = disk.createFile('TEST.DAT');

  assert.ok(
    file instanceof FatDirectoryEntryView,
    'createFile() should return a FatDirectoryEntryView'
  );

  assert.equal(file.getName(), 'TEST.DAT');
  assert.equal(file.getSize(), 0);
  assert.equal(file.getAttributes(), 0);
  assert.equal(file.getStartCluster(), 2);

  // Assert the FAT cluster entries are correct
  assert.deepStrictEqual(
    new Uint8Array(buffer.slice(0x203, 0x205)),
    new Uint8Array([0xff,0x0f]),
    'Cluster 2 in the FAT table should be a terminator'
  );

  // Assert a directory entry was written to the buffer
  assert.deepStrictEqual(
    new Uint8Array(buffer.slice(0x1620, 0x1640)),
    new Uint8Array([
      0x54,0x45,0x53,0x54,0x20,0x20,0x20,0x20,
      0x44,0x41,0x54,0x00,0x00,0x00,0x00,0x00,
      0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
      0x00,0x00,0x02,0x00,0x00,0x00,0x00,0x00
    ]),
    'Directory entry should be written to the buffer'
  );


  /* File properties
  --------------------------------------------------------------------------- */
  
  file.setName('RENAME.DAT')
  assert.deepStrictEqual(
    new Uint8Array(buffer.slice(0x1620, 0x162B)),
    new Uint8Array([
      0x52,0x45,0x4e,0x41,0x4d,0x45,0x20,0x20,
      0x44,0x41,0x54
    ]),
    'Directory entry should have new name'
  );


  file.setAttributes(0x02);
  assert.deepStrictEqual(
    new Uint8Array(buffer.slice(0x162B, 0x162C)),
    new Uint8Array([0x02]),
    'Directory entry should have new attributes'
  );


  file.setSize(123456)
  assert.deepStrictEqual(
    new Uint8Array(buffer.slice(0x163c, 0x1640)),
    new Uint8Array([0x40, 0xe2, 0x01, 0x00]),
    'Directory entry should have new size'
  );


  /* Write contents
  --------------------------------------------------------------------------- */
  
  // Write just under 1 clusters worth data to the file
  disk.setFileContents(file, 'Hello World!');

  // Check that FAT table entries
  assert.deepStrictEqual(
    new Uint8Array(buffer.slice(0x203, 0x205)),
    new Uint8Array([0xff,0x0f]),
    'Cluster 2 in the FAT table should be a terminator'
  );

  assert.equal(file.getSize(), 12);

  // Read the contents back
  assert.deepStrictEqual(
    new TextDecoder().decode(disk.getFileContents(file)),
    'Hello World!'
  );


  /* Replace contents with more data (FAT cluster allocation / chaining)
  --------------------------------------------------------------------------- */

  // Write just under 5 clusters (5120 bytes) worth of data
  disk.setFileContents(file, new Uint8Array(5000).fill(127));

  // Check that FAT table entries
  assert.deepStrictEqual(
    new Uint8Array(buffer.slice(0x203, 0x20b)),
    new Uint8Array([0x03,0x40,0x00,0x05,0x60,0x00,0xff,0x0f]),
    'Clusters 2-5 in the FAT table should be linked. Cluster 6 should be a terminator.'
  );

  assert.equal(
    file.getSize(),
    5000,
    'File size should be 5000 bytes'
  );


  /* Replace contents with less data (FAT cluster deallocation)
  --------------------------------------------------------------------------- */

  // Write just over 1 clusters (1024 bytes) worth of data
  disk.setFileContents(file, new Uint8Array(1500).fill(255));

  // Check that FAT table entries
  assert.deepStrictEqual(
    new Uint8Array(buffer.slice(0x203, 0x20b)),
    new Uint8Array([0x03,0xf0,0xff,0x00,0x00,0x00,0x00,0x00]),
    'Clusters 2 in the FAT table should be linked. Cluster 3 should be a terminator. Clusters 4-6 should be empty.'
  );

  assert.equal(
    file.getSize(),
    1500,
    'File size should be 1500 bytes'
  );


  /* Replace contents with content that won't fit on the disk
  --------------------------------------------------------------------------- */

  // setFileContents allocates FAT entries before writing content. This tests 
  // that those entries are deallocated on error.
  assert.throws(
    () => disk.setFileContents(file, new Uint8Array(100000).fill(255)),
    {
      name: 'WriteError',
      message: 'Disk full'
    },
    'Error is thrown if file cannot be stored in the remaining clusters'
  );

  // Check that FAT table entries
  assert.deepStrictEqual(
    new Uint8Array(buffer.slice(0x203, 0x20b)),
    new Uint8Array([0x03,0xf0,0xff,0x00,0x00,0x00,0x00,0x00]),
    'Cluster table should be unaffected.'
  );

  assert.equal(
    file.getSize(),
    1500,
    'File size should still be 1500 bytes'
  );

}
