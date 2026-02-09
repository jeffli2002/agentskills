// Shared ZIP file creation utility
// Extracted from composer.ts for reuse across routes

import type { GeneratedResource } from './skillComposer';

// Interface for files to include in ZIP
interface ZipFile {
  path: string;
  content: string;
}

// CRC32 calculation helper
function calculateCrc32(data: Uint8Array): number {
  const crc32Table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crc32Table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = crc32Table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Helper function to create a ZIP file containing multiple files
export function createSkillZip(skillMdContent: string, resources?: GeneratedResource[]): Uint8Array {
  const now = new Date();
  const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
  const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;

  // Collect all files to include
  const files: ZipFile[] = [
    { path: 'SKILL.md', content: skillMdContent }
  ];

  // Add resource files if present
  if (resources && resources.length > 0) {
    for (const resource of resources) {
      files.push({ path: resource.path, content: resource.content });
    }
  }

  // Calculate total size needed
  let totalLocalSize = 0;
  let totalCentralSize = 0;
  const fileData: { pathBytes: Uint8Array; contentBytes: Uint8Array; crc: number }[] = [];

  for (const file of files) {
    const pathBytes = new TextEncoder().encode(file.path);
    const contentBytes = new TextEncoder().encode(file.content);
    const crc = calculateCrc32(contentBytes);
    fileData.push({ pathBytes, contentBytes, crc });
    totalLocalSize += 30 + pathBytes.length + contentBytes.length;
    totalCentralSize += 46 + pathBytes.length;
  }

  // Create ZIP buffer
  const zipBuffer = new Uint8Array(totalLocalSize + totalCentralSize + 22);
  let localOffset = 0;
  let centralOffset = totalLocalSize;
  const fileOffsets: number[] = [];

  // Write local file headers and file data
  for (let i = 0; i < files.length; i++) {
    const { pathBytes, contentBytes, crc } = fileData[i];
    fileOffsets.push(localOffset);

    // Local file header
    const localHeader = new Uint8Array(30 + pathBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true); // Local file header signature
    localView.setUint16(4, 20, true); // Version needed
    localView.setUint16(6, 0, true); // General purpose bit flag
    localView.setUint16(8, 0, true); // Compression method (stored)
    localView.setUint16(10, dosTime, true);
    localView.setUint16(12, dosDate, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, contentBytes.length, true); // Compressed size
    localView.setUint32(22, contentBytes.length, true); // Uncompressed size
    localView.setUint16(26, pathBytes.length, true);
    localView.setUint16(28, 0, true); // Extra field length
    localHeader.set(pathBytes, 30);

    zipBuffer.set(localHeader, localOffset);
    localOffset += localHeader.length;
    zipBuffer.set(contentBytes, localOffset);
    localOffset += contentBytes.length;
  }

  // Write central directory headers
  for (let i = 0; i < files.length; i++) {
    const { pathBytes, contentBytes, crc } = fileData[i];

    const centralHeader = new Uint8Array(46 + pathBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true); // Central directory signature
    centralView.setUint16(4, 20, true); // Version made by
    centralView.setUint16(6, 20, true); // Version needed
    centralView.setUint16(8, 0, true); // General purpose bit flag
    centralView.setUint16(10, 0, true); // Compression method
    centralView.setUint16(12, dosTime, true);
    centralView.setUint16(14, dosDate, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, contentBytes.length, true); // Compressed size
    centralView.setUint32(24, contentBytes.length, true); // Uncompressed size
    centralView.setUint16(28, pathBytes.length, true);
    centralView.setUint16(30, 0, true); // Extra field length
    centralView.setUint16(32, 0, true); // File comment length
    centralView.setUint16(34, 0, true); // Disk number start
    centralView.setUint16(36, 0, true); // Internal file attributes
    centralView.setUint32(38, 0, true); // External file attributes
    centralView.setUint32(42, fileOffsets[i], true); // Relative offset of local header
    centralHeader.set(pathBytes, 46);

    zipBuffer.set(centralHeader, centralOffset);
    centralOffset += centralHeader.length;
  }

  // End of central directory record
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true); // End of central directory signature
  endView.setUint16(4, 0, true); // Disk number
  endView.setUint16(6, 0, true); // Disk with central directory
  endView.setUint16(8, files.length, true); // Entries on this disk
  endView.setUint16(10, files.length, true); // Total entries
  endView.setUint32(12, totalCentralSize, true); // Central directory size
  endView.setUint32(16, totalLocalSize, true); // Central directory offset
  endView.setUint16(20, 0, true); // Comment length

  zipBuffer.set(endRecord, centralOffset);

  return zipBuffer;
}
