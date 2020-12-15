"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadAndUnzipVSCode = void 0;
var https = require("https");
var fs = require("fs");
var path = require("path");
var cp = require("child_process");
var request = require("./request");
var del = require("./del");
var util_1 = require("./util");
var extensionRoot = process.cwd();
var vscodeTestDir = path.resolve(extensionRoot, '.vscode-test');
var vscodeStableReleasesAPI = "https://update.code.visualstudio.com/api/releases/stable";
function fetchLatestStableVersion() {
    return __awaiter(this, void 0, void 0, function () {
        var versions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request.getJSON(vscodeStableReleasesAPI)];
                case 1:
                    versions = _a.sent();
                    if (!versions || !Array.isArray(versions) || !versions[0]) {
                        throw Error('Failed to get latest VS Code version');
                    }
                    return [2 /*return*/, versions[0]];
            }
        });
    });
}
function isValidVersion(version) {
    return __awaiter(this, void 0, void 0, function () {
        var validVersions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request.getJSON(vscodeStableReleasesAPI)];
                case 1:
                    validVersions = _a.sent();
                    return [2 /*return*/, version === 'insiders' || validVersions.indexOf(version) !== -1];
            }
        });
    });
}
/**
 * Download a copy of VS Code archive to `.vscode-test`.
 *
 * @param version The version of VS Code to download such as '1.32.0'. You can also use
 * `'stable'` for downloading latest stable release.
 * `'insiders'` for downloading latest Insiders.
 */
function downloadVSCodeArchive(version, platform) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!fs.existsSync(vscodeTestDir)) {
                fs.mkdirSync(vscodeTestDir);
            }
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var downloadUrl = util_1.getVSCodeDownloadUrl(version, platform);
                    console.log("Downloading VS Code " + version + " from " + downloadUrl);
                    var requestOptions = util_1.urlToOptions(downloadUrl);
                    https.get(requestOptions, function (res) {
                        if (res.statusCode !== 302) {
                            reject('Failed to get VS Code archive location');
                        }
                        var archiveUrl = res.headers.location;
                        if (!archiveUrl) {
                            reject('Failed to get VS Code archive location');
                            return;
                        }
                        var archiveRequestOptions = util_1.urlToOptions(archiveUrl);
                        if (archiveUrl.endsWith('.zip')) {
                            var archivePath_1 = path.resolve(vscodeTestDir, "vscode-" + version + ".zip");
                            var outStream_1 = fs.createWriteStream(archivePath_1);
                            outStream_1.on('close', function () {
                                resolve(archivePath_1);
                            });
                            https
                                .get(archiveRequestOptions, function (res) {
                                res.pipe(outStream_1);
                            })
                                .on('error', function (e) { return reject(e); });
                        }
                        else {
                            var zipPath_1 = path.resolve(vscodeTestDir, "vscode-" + version + ".tgz");
                            var outStream_2 = fs.createWriteStream(zipPath_1);
                            outStream_2.on('close', function () {
                                resolve(zipPath_1);
                            });
                            https
                                .get(archiveRequestOptions, function (res) {
                                res.pipe(outStream_2);
                            })
                                .on('error', function (e) { return reject(e); });
                        }
                    });
                })];
        });
    });
}
/**
 * Unzip a .zip or .tar.gz VS Code archive
 */
function unzipVSCode(vscodeArchivePath) {
    // The 'vscode-1.32' out of '.../vscode-1.32.zip'
    var dirName = path.parse(vscodeArchivePath).name;
    var extractDir = path.resolve(vscodeTestDir, dirName);
    var res;
    if (vscodeArchivePath.endsWith('.zip')) {
        if (process.platform === 'win32') {
            res = cp.spawnSync('powershell.exe', [
                '-NoProfile',
                '-ExecutionPolicy',
                'Bypass',
                '-NonInteractive',
                '-NoLogo',
                '-Command',
                "Microsoft.PowerShell.Archive\\Expand-Archive -Path \"" + vscodeArchivePath + "\" -DestinationPath \"" + extractDir + "\""
            ]);
        }
        else {
            res = cp.spawnSync('unzip', [vscodeArchivePath, '-d', "" + extractDir]);
        }
    }
    else {
        // tar does not create extractDir by default
        if (!fs.existsSync(extractDir)) {
            fs.mkdirSync(extractDir);
        }
        res = cp.spawnSync('tar', ['-xzf', vscodeArchivePath, '-C', extractDir]);
    }
    if (res && !(res.status === 0 && res.signal === null)) {
        throw Error("Failed to unzip downloaded vscode at " + vscodeArchivePath);
    }
}
/**
 * Download and unzip a copy of VS Code in `.vscode-test`. The paths are:
 * - `.vscode-test/vscode-<VERSION>`. For example, `./vscode-test/vscode-1.32.0`
 * - `.vscode-test/vscode-insiders`.
 *
 * *If a local copy exists at `.vscode-test/vscode-<VERSION>`, skip download.*
 *
 * @param version The version of VS Code to download such as `1.32.0`. You can also use
 * `'stable'` for downloading latest stable release.
 * `'insiders'` for downloading latest Insiders.
 * When unspecified, download latest stable version.
 *
 * @returns Pormise of `vscodeExecutablePath`.
 */
function downloadAndUnzipVSCode(version, platform) {
    return __awaiter(this, void 0, void 0, function () {
        var downloadedPath, _a, currentHash, currentDate, _b, latestHash, latestTimestamp, err_1, vscodeArchivePath, err_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!version) return [3 /*break*/, 5];
                    if (!(version === 'stable')) return [3 /*break*/, 2];
                    return [4 /*yield*/, fetchLatestStableVersion()];
                case 1:
                    version = _c.sent();
                    return [3 /*break*/, 4];
                case 2:
                    if (!!fs.existsSync(path.resolve(vscodeTestDir, "vscode-" + version))) return [3 /*break*/, 4];
                    return [4 /*yield*/, isValidVersion(version)];
                case 3:
                    if (!(_c.sent())) {
                        throw Error("Invalid version " + version);
                    }
                    _c.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, fetchLatestStableVersion()];
                case 6:
                    version = _c.sent();
                    _c.label = 7;
                case 7:
                    downloadedPath = path.resolve(vscodeTestDir, "vscode-" + version);
                    if (!fs.existsSync(downloadedPath)) return [3 /*break*/, 14];
                    if (!(version === 'insiders')) return [3 /*break*/, 13];
                    _a = util_1.insidersDownloadDirMetadata(downloadedPath), currentHash = _a.version, currentDate = _a.date;
                    return [4 /*yield*/, util_1.getLatestInsidersMetadata(util_1.systemDefaultPlatform)];
                case 8:
                    _b = _c.sent(), latestHash = _b.version, latestTimestamp = _b.timestamp;
                    if (!(currentHash === latestHash)) return [3 /*break*/, 9];
                    console.log("Found .vscode-test/vscode-insiders matching latest Insiders release. Skipping download.");
                    return [2 /*return*/, Promise.resolve(util_1.insidersDownloadDirToExecutablePath(downloadedPath))];
                case 9:
                    _c.trys.push([9, 11, , 12]);
                    console.log("Remove outdated Insiders at " + downloadedPath + " and re-downloading.");
                    console.log("Old: " + currentHash + " | " + currentDate);
                    console.log("New: " + latestHash + " | " + new Date(parseInt(latestTimestamp, 10)).toISOString());
                    return [4 /*yield*/, del.rmdir(downloadedPath)];
                case 10:
                    _c.sent();
                    console.log("Removed " + downloadedPath);
                    return [3 /*break*/, 12];
                case 11:
                    err_1 = _c.sent();
                    console.error(err_1);
                    throw Error("Failed to remove outdated Insiders at " + downloadedPath + ".");
                case 12: return [3 /*break*/, 14];
                case 13:
                    console.log("Found .vscode-test/vscode-" + version + ". Skipping download.");
                    return [2 /*return*/, Promise.resolve(util_1.downloadDirToExecutablePath(downloadedPath))];
                case 14:
                    _c.trys.push([14, 16, , 17]);
                    return [4 /*yield*/, downloadVSCodeArchive(version, platform)];
                case 15:
                    vscodeArchivePath = _c.sent();
                    if (fs.existsSync(vscodeArchivePath)) {
                        unzipVSCode(vscodeArchivePath);
                        console.log("Downloaded VS Code " + version + " into .vscode-test/vscode-" + version);
                        // Remove archive
                        fs.unlinkSync(vscodeArchivePath);
                    }
                    return [3 /*break*/, 17];
                case 16:
                    err_2 = _c.sent();
                    console.error(err_2);
                    throw Error("Failed to download and unzip VS Code " + version);
                case 17:
                    if (version === 'insiders') {
                        return [2 /*return*/, Promise.resolve(util_1.insidersDownloadDirToExecutablePath(path.resolve(vscodeTestDir, "vscode-" + version)))];
                    }
                    else {
                        return [2 /*return*/, util_1.downloadDirToExecutablePath(path.resolve(vscodeTestDir, "vscode-" + version))];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.downloadAndUnzipVSCode = downloadAndUnzipVSCode;