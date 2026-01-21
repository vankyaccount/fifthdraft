// Local filesystem storage service
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const STORAGE_BASE = process.env.STORAGE_PATH || './data/recordings';

export interface UploadResult {
  path: string;
  error?: string;
}

export interface DownloadResult {
  data: Buffer | null;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export class LocalStorage {
  // Ensure directory exists
  private static async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error: unknown) {
      // Directory might already exist
      const e = error as { code?: string };
      if (e.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  // Get the full path for a storage path
  private static getFullPath(storagePath: string): string {
    return path.join(STORAGE_BASE, storagePath);
  }

  // Upload file
  static async upload(
    userId: string,
    fileName: string,
    data: Buffer | Blob,
    _contentType?: string
  ): Promise<UploadResult> {
    try {
      const userDir = path.join(STORAGE_BASE, userId);
      await this.ensureDir(userDir);

      // Generate unique filename
      const ext = path.extname(fileName) || '.webm';
      const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
      const filePath = path.join(userDir, uniqueName);

      // Convert Blob to Buffer if needed
      const buffer = data instanceof Blob ? Buffer.from(await data.arrayBuffer()) : data;

      await fs.writeFile(filePath, buffer);

      // Return relative path for database storage
      return { path: `${userId}/${uniqueName}` };
    } catch (error: unknown) {
      console.error('Storage upload error:', error);
      return { path: '', error: (error as Error).message };
    }
  }

  // Download file
  static async download(storagePath: string): Promise<DownloadResult> {
    try {
      const fullPath = this.getFullPath(storagePath);
      const data = await fs.readFile(fullPath);
      return { data };
    } catch (error: unknown) {
      console.error('Storage download error:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  // Check if file exists
  static async exists(storagePath: string): Promise<boolean> {
    try {
      const fullPath = this.getFullPath(storagePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  // Get file size
  static async getSize(storagePath: string): Promise<number | null> {
    try {
      const fullPath = this.getFullPath(storagePath);
      const stats = await fs.stat(fullPath);
      return stats.size;
    } catch {
      return null;
    }
  }

  // Delete file
  static async delete(storagePath: string): Promise<DeleteResult> {
    try {
      const fullPath = this.getFullPath(storagePath);
      await fs.unlink(fullPath);
      return { success: true };
    } catch (error: unknown) {
      console.error('Storage delete error:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Delete multiple files
  static async deleteMany(storagePaths: string[]): Promise<{ deleted: number; errors: string[] }> {
    const errors: string[] = [];
    let deleted = 0;

    for (const storagePath of storagePaths) {
      const result = await this.delete(storagePath);
      if (result.success) {
        deleted++;
      } else if (result.error) {
        errors.push(`${storagePath}: ${result.error}`);
      }
    }

    return { deleted, errors };
  }

  // Delete user's entire directory
  static async deleteUserDirectory(userId: string): Promise<DeleteResult> {
    try {
      const userDir = path.join(STORAGE_BASE, userId);
      await fs.rm(userDir, { recursive: true, force: true });
      return { success: true };
    } catch (error: unknown) {
      console.error('Storage delete directory error:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Get file URL (for serving via API route)
  static getFileUrl(storagePath: string): string {
    return `/api/storage/${encodeURIComponent(storagePath)}`;
  }

  // Get content type from extension
  static getContentType(storagePath: string): string {
    const ext = path.extname(storagePath).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.webm': 'audio/webm',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.m4a': 'audio/mp4',
      '.ogg': 'audio/ogg',
      '.flac': 'audio/flac',
      '.aac': 'audio/aac',
    };
    return contentTypes[ext] || 'application/octet-stream';
  }

  // List files in user directory
  static async listUserFiles(userId: string): Promise<string[]> {
    try {
      const userDir = path.join(STORAGE_BASE, userId);
      const files = await fs.readdir(userDir);
      return files.map((file) => `${userId}/${file}`);
    } catch {
      return [];
    }
  }

  // Get total storage used by user
  static async getUserStorageUsed(userId: string): Promise<number> {
    try {
      const files = await this.listUserFiles(userId);
      let total = 0;
      for (const file of files) {
        const size = await this.getSize(file);
        if (size) total += size;
      }
      return total;
    } catch {
      return 0;
    }
  }
}
