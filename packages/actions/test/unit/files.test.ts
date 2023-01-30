import { expect } from "chai"
import {
    directoryExists,
    writeFile,
    readFile,
    getFileStats,
    getDirFilesSubPaths,
    deleteDir,
    cleanDir,
    checkAndMakeNewDirectoryIfNonexistent,
    readJSONFile,
    writeLocalJsonFile,
    downloadFileFromUrl
} from "../../src"

describe("Files", () => {
    const existingDirName = "/tmp/thisDirExists"
    const nonExistingDirName = "/tmp/I-dont-exist"
    const filePath = `${existingDirName}/test-file.txt`
    const fileContent = "test content"
    const fileContentJSON: any = { test: "test" }
    const overwrittenContent = "new content"
    beforeAll(() => {
        checkAndMakeNewDirectoryIfNonexistent(existingDirName)
    })
    describe("directoryExists", () => {
        it("should return true if directory exists", () => {
            expect(directoryExists(existingDirName)).to.be.true
        })
        it("should return false if directory does not exist", () => {
            expect(directoryExists(nonExistingDirName)).to.be.false
        })
    })
    describe("writeFile", () => {
        it("should write a file", () => {
            writeFile(filePath, Buffer.from(fileContent))
            expect(readFile(filePath)).to.equal(fileContent)
        })
        it("should overwrite a file", () => {
            writeFile(filePath, Buffer.from(overwrittenContent))
            expect(readFile(filePath)).to.equal(overwrittenContent)
        })
        it("should fail to write a file to a non-existent directory", () => {})
    })
    describe("readFile", () => {
        const filePathForReading = `${existingDirName}/test-file.txt`
        it("should read a file", () => {
            writeFile(filePathForReading, Buffer.from(fileContent))
            expect(readFile(filePathForReading)).to.equal(fileContent)
        })
        it("should fail to read a file from a non-existent directory", () => {
            expect(() => readFile(`${nonExistingDirName}/a-file.txt`)).to.throw(
                `ENOENT: no such file or directory, open '${nonExistingDirName}/a-file.txt'`
            )
        })
    })
    describe("getFileStats", () => {
        const filePathForStats = `${existingDirName}/test-file.txt`
        it("should get file stats", () => {
            writeFile(filePathForStats, Buffer.from(fileContent))
            expect(getFileStats(filePathForStats)).to.be.an("object")
        })
        it("should fail to get file stats from a non-existent directory", () => {
            const filePathNonExisting = `${nonExistingDirName}/a-file.txt`
            expect(() => getFileStats(filePathNonExisting)).to.throw(
                `ENOENT: no such file or directory, stat '${filePathNonExisting}'`
            )
        })
    })
    describe("getDirFilesSubPaths", () => {
        it("should get sub paths for files in a directory", () => {
            expect(getDirFilesSubPaths(existingDirName)).to.not.be.null
        })
        it("should fail to get sub paths for files in a non-existent directory", async () => {
            try {
                await getDirFilesSubPaths(nonExistingDirName)
            } catch (error: any) {
                expect(error.toString()).to.be.eq(
                    `Error: ENOENT: no such file or directory, scandir '${nonExistingDirName}'`
                )
            }
        })
    })
    describe("deleteDir", () => {
        it("should delete a directory", () => {
            checkAndMakeNewDirectoryIfNonexistent(existingDirName)
            deleteDir(existingDirName)
            expect(directoryExists(existingDirName)).to.be.false
        })
    })
    describe("checkAndMakeNewDirectoryIfNonexistent", () => {
        it("should create a directory", () => {
            checkAndMakeNewDirectoryIfNonexistent(existingDirName)
            expect(directoryExists(existingDirName)).to.be.true
        })
        it("should fail to create a directory in a non-existent directory", () => {
            expect(() => checkAndMakeNewDirectoryIfNonexistent(`${nonExistingDirName}/newDir/`)).to.throw(
                `ENOENT: no such file or directory, mkdir '${nonExistingDirName}/newDir/'`
            )
        })
    })
    describe("cleanDir", () => {
        it("should clean a directory", () => {
            checkAndMakeNewDirectoryIfNonexistent(existingDirName)
            cleanDir(existingDirName)
            expect(directoryExists(existingDirName)).to.be.true
        })
        it("should create a new directory if trying to clean a non-existent directory", () => {
            expect(cleanDir(nonExistingDirName)).to.be.undefined
            expect(directoryExists(nonExistingDirName)).to.be.true
        })
        // clean up after test
        afterAll(() => {
            deleteDir(nonExistingDirName)
        })
    })
    describe("readJSONFile", () => {
        const filePathForReadingJSON = `${existingDirName}/test.json`
        it("should read a JSON file", () => {
            writeLocalJsonFile(filePathForReadingJSON, fileContentJSON)
            expect(readJSONFile(filePathForReadingJSON)).to.deep.equal(fileContentJSON)
        })
        it("should fail to read a JSON file from a non-existent directory", () => {
            expect(() => readJSONFile(`${nonExistingDirName}/test.json`)).to.throw("File not found")
        })
        afterAll(() => {
            deleteDir(filePathForReadingJSON)
        })
    })
    describe("writeLocalJsonFile", () => {
        it("should write a JSON file", () => {
            const filePathForWritingJSON = `${existingDirName}/test.json`
            writeLocalJsonFile(filePathForWritingJSON, fileContentJSON)
            expect(readJSONFile(filePathForWritingJSON)).to.deep.equal(fileContentJSON)
        })
        it("should fail to write a JSON file to a non-existent directory", () => {
            const filePathForWritingJSON = `${nonExistingDirName}/test.json`
            expect(() => writeLocalJsonFile(filePathForWritingJSON, fileContentJSON)).to.throw(
                `ENOENT: no such file or directory, open '${filePathForWritingJSON}'`
            )
        })
    })
    describe("downloadFileFromUrl", () => {
        const url =
            "https://maci-develop-fra.s3.eu-central-1.amazonaws.com/v1.1.1-aa4ba27/10-2-1-2/TallyVotes_10-1-2_test.0.zkey"
        const filePathForDownload = `${existingDirName}/test-zkey.zkey`
        it("should download a file from a URL", async () => {
            await downloadFileFromUrl(filePathForDownload, url)
            expect(directoryExists(filePathForDownload)).to.be.true
        })
        it("should fail to download a file from a non-existent URL", () => {
            const invalidUrl =
                "https://maci-develop-fra.s3.eu-central-1.amazonaws.com/v1.1.1-aa4ba27/10-2-1-2/TallyVotes_10-1-2_test.0.zkey-invalid"
            expect(() => downloadFileFromUrl(filePathForDownload, invalidUrl)).to.throw
        })
        // clean up
        afterAll(() => {
            deleteDir(filePathForDownload)
        })
    })
    // clean up
    afterAll(() => {
        deleteDir(existingDirName)
    })
})
