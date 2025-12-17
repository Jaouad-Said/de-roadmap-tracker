import { promises as fs } from 'fs';
import path from 'path';

// Base data directory path
const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

/**
 * Ensures a directory exists, creating it if necessary
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Reads and parses a JSON file from the data directory
 */
export async function readJSON<T>(filename: string): Promise<T> {
  await ensureDirectoryExists(DATA_DIR);
  const filePath = path.join(DATA_DIR, filename);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    // If file doesn't exist, try to read from seed
    const seedPath = path.join(DATA_DIR, 'seed', filename.replace('.json', '.template.json'));
    try {
      const seedContent = await fs.readFile(seedPath, 'utf-8');
      const data = JSON.parse(seedContent) as T;
      // Save to main data directory
      await writeJSON(filename, data);
      return data;
    } catch {
      throw new Error(`File not found: ${filename}`);
    }
  }
}

/**
 * Writes data to a JSON file in the data directory
 */
export async function writeJSON<T>(filename: string, data: T): Promise<void> {
  await ensureDirectoryExists(DATA_DIR);
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Creates a timestamped backup of all JSON files
 */
export async function backupData(): Promise<string> {
  await ensureDirectoryExists(BACKUP_DIR);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, timestamp);
  await ensureDirectoryExists(backupPath);
  
  const files = ['roadmap.json', 'progress.json', 'notes.json', 'resources.json'];
  
  for (const file of files) {
    try {
      const sourcePath = path.join(DATA_DIR, file);
      const destPath = path.join(backupPath, file);
      await fs.copyFile(sourcePath, destPath);
    } catch {
      // Skip if file doesn't exist
    }
  }
  
  // Clean up old backups (keep last 7)
  await cleanupOldBackups(7);
  
  return backupPath;
}

/**
 * Removes old backups, keeping only the most recent ones
 */
async function cleanupOldBackups(keepCount: number): Promise<void> {
  try {
    const entries = await fs.readdir(BACKUP_DIR, { withFileTypes: true });
    const dirs = entries
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .sort()
      .reverse();
    
    for (let i = keepCount; i < dirs.length; i++) {
      const dirPath = path.join(BACKUP_DIR, dirs[i]);
      await fs.rm(dirPath, { recursive: true });
    }
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Ensures upload directory exists for a section
 */
export async function ensureUploadDir(sectionId: string): Promise<string> {
  const uploadPath = path.join(UPLOADS_DIR, sectionId);
  await ensureDirectoryExists(uploadPath);
  return uploadPath;
}

/**
 * Saves an uploaded file
 */
export async function saveUploadedFile(
  sectionId: string,
  filename: string,
  buffer: Buffer
): Promise<string> {
  const uploadDir = await ensureUploadDir(sectionId);
  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, buffer);
  return `/uploads/${sectionId}/${filename}`;
}

/**
 * Deletes an uploaded file
 */
export async function deleteUploadedFile(
  sectionId: string,
  filename: string
): Promise<void> {
  const filePath = path.join(UPLOADS_DIR, sectionId, filename);
  try {
    await fs.unlink(filePath);
    
    // Clean up empty directory
    const dirPath = path.join(UPLOADS_DIR, sectionId);
    const files = await fs.readdir(dirPath);
    if (files.length === 0) {
      await fs.rmdir(dirPath);
    }
  } catch {
    // Ignore if file doesn't exist
  }
}

/**
 * Lists all files in a section's upload directory
 */
export async function listUploads(sectionId: string): Promise<string[]> {
  const uploadDir = path.join(UPLOADS_DIR, sectionId);
  try {
    const files = await fs.readdir(uploadDir);
    return files.map(f => `/uploads/${sectionId}/${f}`);
  } catch {
    return [];
  }
}

/**
 * Checks if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the full path for a data file
 */
export function getDataFilePath(filename: string): string {
  return path.join(DATA_DIR, filename);
}

/**
 * Initializes data directory with seed files if needed
 */
export async function initializeData(): Promise<void> {
  await ensureDirectoryExists(DATA_DIR);
  await ensureDirectoryExists(BACKUP_DIR);
  await ensureDirectoryExists(UPLOADS_DIR);
  
  const seedDir = path.join(DATA_DIR, 'seed');
  const files = [
    { seed: 'roadmap.template.json', target: 'roadmap.json' },
    { seed: 'progress.template.json', target: 'progress.json' },
    { seed: 'notes.template.json', target: 'notes.json' },
    { seed: 'resources.template.json', target: 'resources.json' },
  ];
  
  for (const file of files) {
    const targetPath = path.join(DATA_DIR, file.target);
    const exists = await fileExists(targetPath);
    
    if (!exists) {
      const seedPath = path.join(seedDir, file.seed);
      try {
        await fs.copyFile(seedPath, targetPath);
      } catch {
        // Seed file doesn't exist, will be created when first accessed
      }
    }
  }
}
