import assert from 'assert';
import { FatDirectoryEntryView } from '../../src/main.js';
import { logBuffer } from '../disk.helpers.js';


/* Filename
----------------------------------------------------------------------------- */
{
  const data = new Uint8Array(32);
  const view = new FatDirectoryEntryView(data.buffer);

  view.setName('FILENAME.EXT');

  // Check the underyling buffer contains the new data
  assert.deepStrictEqual(
    data,
    new Uint8Array([
      0x46, 0x49, 0x4c, 0x45, 0x4e, 0x41, 0x4d, 0x45, 
      0x45, 0x58, 0x54, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ])
  );

  // Read back the value
  assert.deepStrictEqual(
    view.getName(),
    'FILENAME.EXT'
  );


  // Filename validation
  assert.throws(() => view.setName('FILENAME_'));
  assert.throws(() => view.setName('FILENAME_.EXT'));
  assert.throws(() => view.setName('X.EXT_'));
  assert.throws(() => view.setName('X.'));
  assert.throws(() => view.setName('.EXT'));
  assert.throws(() => view.setName('.'));
  assert.throws(() => view.setName('..'));
  assert.throws(() => view.setName('/'));
}

/* Filesize
----------------------------------------------------------------------------- */
{
  const data = new Uint8Array(32);
  const view = new FatDirectoryEntryView(data.buffer);

  view.setSize(123456789);

  // Check the underyling buffer contains the new data
  assert.deepStrictEqual(
    data,
    new Uint8Array([
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0x15, 0xcd, 0x5b, 0x07
    ])
  );

  // Read back the value
  assert.deepStrictEqual(
    view.getSize(),
    123456789
  );
}
