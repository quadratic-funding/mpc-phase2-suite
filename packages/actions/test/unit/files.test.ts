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
    describe("directoryExists", () => {
        it("should return true if directory exists", () => {
            expect(directoryExists("packages/actions/test/unit")).to.be.true
        })
        it("should return false if directory does not exist", () => {
            expect(directoryExists("packages/actions/test/unit/does-not-exist")).to.be.false
        })
    })
    describe("writeFile", () => {
        it("should write a file", () => {
            const filePath = "packages/actions/test/unit/test-file.txt"
            const fileContent = "test content"
            writeFile(filePath, Buffer.from(fileContent))
            expect(readFile(filePath)).to.equal(fileContent)
        })
        it("should overwrite a file", () => {
            const filePath = "packages/actions/test/unit/test-file.txt"
            const fileContent = "test content"
            writeFile(filePath, Buffer.from(fileContent))
            expect(readFile(filePath)).to.equal(fileContent)
        })
        it("should fail to write a file to a non-existent directory", () => {})
    })
    describe("readFile", () => {
        it("should read a file", () => {
            const filePath = "packages/actions/test/unit/test-file.txt"
            const fileContent = "test content"
            writeFile(filePath, Buffer.from(fileContent))
            expect(readFile(filePath)).to.equal(fileContent)
        })
        it("should fail to read a file from a non-existent directory", () => {
            const filePath = "packages/actions/test/unit/does-not-exist/test-file.txt"
            expect(() => readFile(filePath)).to.throw(`ENOENT: no such file or directory, open '${filePath}'`)
        })
    })
    describe("getFileStats", () => {
        it("should get file stats", () => {
            const filePath = "packages/actions/test/unit/test-file.txt"
            const fileContent = "test content"
            writeFile(filePath, Buffer.from(fileContent))
            expect(getFileStats(filePath)).to.be.an("object")
        })
        it("should fail to get file stats from a non-existent directory", () => {
            const filePath = "packages/actions/test/unit/does-not-exist/test-file.txt"
            expect(() => getFileStats(filePath)).to.throw(`ENOENT: no such file or directory, stat '${filePath}'`)
        })
    })
    describe("getDirFilesSubPaths", () => {
        it("should get sub paths for files in a directory", () => {
            const dirPath = "packages/actions/test/unit"
            expect(getDirFilesSubPaths(dirPath)).to.not.be.null
        })
        it("should fail to get sub paths for files in a non-existent directory", async () => {
            const dirPath = "packages/actions/test/unit/does-not-exist"
            try {
                await getDirFilesSubPaths(dirPath)
            } catch (error: any) {
                expect(error.toString()).to.be.eq(`Error: ENOENT: no such file or directory, scandir '${dirPath}'`)
            }
        })
    })
    describe("deleteDir", () => {
        it("should delete a directory", () => {
            const dirPath = "packages/actions/test/unit/test-dir"
            checkAndMakeNewDirectoryIfNonexistent(dirPath)
            deleteDir(dirPath)
            expect(directoryExists(dirPath)).to.be.false
        })
    })
    describe("checkAndMakeNewDirectoryIfNonexistent", () => {
        it("should create a directory", () => {
            const dirPath = "packages/actions/test/unit/test-dir"
            checkAndMakeNewDirectoryIfNonexistent(dirPath)
            expect(directoryExists(dirPath)).to.be.true
        })
        it("should fail to create a directory in a non-existent directory", () => {
            const dirPath = "packages/actions/test/unit/does-not-exist/test-dir"
            expect(() => checkAndMakeNewDirectoryIfNonexistent(dirPath)).to.throw(
                `ENOENT: no such file or directory, mkdir '${dirPath}'`
            )
        })
    })
    describe("cleanDir", () => {
        it("should clean a directory", () => {
            const dirPath = "packages/actions/test/unit/test-dir"
            checkAndMakeNewDirectoryIfNonexistent(dirPath)
            cleanDir(dirPath)
            expect(directoryExists(dirPath)).to.be.true
        })
        it("should create a new directory if trying to clean a non-existent directory", () => {
            const dirPath = "packages/actions/test/unit/does-not-exist"
            expect(cleanDir(dirPath)).to.be.undefined
            expect(directoryExists(dirPath)).to.be.true
        })
    })
    describe("readJSONFile", () => {
        it("should read a JSON file", () => {
            const filePath = "packages/actions/test/unit/test-file.json"
            const fileContent: any = { test: "test" }
            writeLocalJsonFile(filePath, fileContent)
            expect(readJSONFile(filePath)).to.deep.equal(fileContent)
        })
        it("should fail to read a JSON file from a non-existent directory", () => {
            const filePath = "packages/actions/test/unit/does-not-exist/test-file.json"
            expect(() => readJSONFile(filePath)).to.throw("File not found")
        })
    })
    describe("writeLocalJsonFile", () => {
        it("should write a JSON file", () => {
            const filePath = "packages/actions/test/unit/test-file.json"
            const fileContent: any = { test: "test" }
            writeLocalJsonFile(filePath, fileContent)
            expect(readJSONFile(filePath)).to.deep.equal(fileContent)
        })
        it("should fail to write a JSON file to a non-existent directory", () => {
            const filePath = "packages/actions/test/unit/does-not-exist-2/test-file.json"
            const fileContent: any = { test: "test" }
            expect(() => writeLocalJsonFile(filePath, fileContent)).to.throw(
                `ENOENT: no such file or directory, open '${filePath}'`
            )
        })
    })
    describe("downloadFileFromUrl", () => {
        const url =
            "https://maci-develop-fra.s3.eu-central-1.amazonaws.com/v1.1.1-aa4ba27/10-2-1-2/TallyVotes_10-1-2_test.0.zkey"
        const filePath = "packages/actions/test/unit/test_download.zkey"
        it("should download a file from a URL", async () => {
            await downloadFileFromUrl(filePath, url)
            expect(directoryExists(filePath)).to.be.true
        })
        it("should fail to download a file from a non-existent URL", () => {
            const invalidUrl =
                "https://maci-develop-fra.s3.eu-central-1.amazonaws.com/v1.1.1-aa4ba27/10-2-1-2/TallyVotes_10-1-2_test.0.zkey-invalid"
            expect(() => downloadFileFromUrl(filePath, invalidUrl)).to.throw
        })
        // clean up
        afterAll(() => {
            deleteDir(filePath)
        })
    })
    // clean up
    afterAll(() => {
        deleteDir("packages/actions/test/unit/test-file.txt")
        deleteDir("packages/actions/test/unit/test-dir")
        deleteDir("packages/actions/test/unit/test-file.json")
        deleteDir("packages/actions/test/unit/does-not-exist")
    })
})
