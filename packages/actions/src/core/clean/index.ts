import fs from 'fs'

/**
 * Delete a directory specified at a given path.
 * @param dirPath <string> - the directory path.
 */
export const deleteDir = (dirPath: string): void => {
    fs.rmSync(dirPath, { recursive: true, force: true })
}

/**
 * Check a directory path
 * @param filePath <string> - the absolute or relative path.
 * @returns <boolean> true if the path exists, otherwise false.
 */
export const directoryExists = (filePath: string): boolean => fs.existsSync(filePath)