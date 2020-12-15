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
exports.resolveCliPathFromVSCodeExecutablePath = exports.getLatestInsidersMetadata = exports.insidersDownloadDirMetadata = exports.insidersDownloadDirToExecutablePath = exports.downloadDirToExecutablePath = exports.urlToOptions = exports.getVSCodeDownloadUrl = exports.systemDefaultPlatform = void 0;
var path = require("path");
var url_1 = require("url");
var request = require("./request");
switch (process.platform) {
    case 'darwin':
        exports.systemDefaultPlatform = 'darwin';
        break;
    case 'win32':
        exports.systemDefaultPlatform = 'win32-archive';
        break;
    default:
        exports.systemDefaultPlatform = 'linux-x64';
}
function getVSCodeDownloadUrl(version, platform) {
    var downloadPlatform = platform || exports.systemDefaultPlatform;
    if (version === 'insiders') {
        return "https://update.code.visualstudio.com/latest/" + downloadPlatform + "/insider";
    }
    return "https://update.code.visualstudio.com/" + version + "/" + downloadPlatform + "/stable";
}
exports.getVSCodeDownloadUrl = getVSCodeDownloadUrl;
var HttpsProxyAgent = require('https-proxy-agent');
var HttpProxyAgent = require('http-proxy-agent');
var PROXY_AGENT = undefined;
var HTTPS_PROXY_AGENT = undefined;
if (process.env.npm_config_proxy) {
    PROXY_AGENT = new HttpProxyAgent(process.env.npm_config_proxy);
    HTTPS_PROXY_AGENT = new HttpsProxyAgent(process.env.npm_config_proxy);
}
if (process.env.npm_config_https_proxy) {
    HTTPS_PROXY_AGENT = new HttpsProxyAgent(process.env.npm_config_https_proxy);
}
function urlToOptions(url) {
    var options = url_1.parse(url);
    if (PROXY_AGENT && options.protocol.startsWith('http:')) {
        options.agent = PROXY_AGENT;
    }
    if (HTTPS_PROXY_AGENT && options.protocol.startsWith('https:')) {
        options.agent = HTTPS_PROXY_AGENT;
    }
    return options;
}
exports.urlToOptions = urlToOptions;
function downloadDirToExecutablePath(dir) {
    if (process.platform === 'win32') {
        return path.resolve(dir, 'Code.exe');
    }
    else if (process.platform === 'darwin') {
        return path.resolve(dir, 'Visual Studio Code.app/Contents/MacOS/Electron');
    }
    else {
        return path.resolve(dir, 'VSCode-linux-x64/code');
    }
}
exports.downloadDirToExecutablePath = downloadDirToExecutablePath;
function insidersDownloadDirToExecutablePath(dir) {
    if (process.platform === 'win32') {
        return path.resolve(dir, 'Code - Insiders.exe');
    }
    else if (process.platform === 'darwin') {
        return path.resolve(dir, 'Visual Studio Code - Insiders.app/Contents/MacOS/Electron');
    }
    else {
        return path.resolve(dir, 'VSCode-linux-x64/code-insiders');
    }
}
exports.insidersDownloadDirToExecutablePath = insidersDownloadDirToExecutablePath;
function insidersDownloadDirMetadata(dir) {
    var productJsonPath;
    if (process.platform === 'win32') {
        productJsonPath = path.resolve(dir, 'resources/app/product.json');
    }
    else if (process.platform === 'darwin') {
        productJsonPath = path.resolve(dir, 'Visual Studio Code - Insiders.app/Contents/Resources/app/product.json');
    }
    else {
        productJsonPath = path.resolve(dir, 'VSCode-linux-x64/resources/app/product.json');
    }
    var productJson = require(productJsonPath);
    return {
        version: productJson.commit,
        date: productJson.date
    };
}
exports.insidersDownloadDirMetadata = insidersDownloadDirMetadata;
function getLatestInsidersMetadata(platform) {
    return __awaiter(this, void 0, void 0, function () {
        var remoteUrl;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    remoteUrl = "https://update.code.visualstudio.com/api/update/" + platform + "/insider/latest";
                    return [4 /*yield*/, request.getJSON(remoteUrl)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getLatestInsidersMetadata = getLatestInsidersMetadata;
/**
 * Resolve the VS Code cli path from executable path returned from `downloadAndUnzipVSCode`.
 * You can use this path to spawn processes for extension management. For example:
 *
 * ```ts
 * const cp = require('child_process');
 * const { downloadAndUnzipVSCode, resolveCliPathFromExecutablePath } = require('vscode-test')
 * const vscodeExecutablePath = await downloadAndUnzipVSCode('1.36.0');
 * const cliPath = resolveCliPathFromExecutablePath(vscodeExecutablePath);
 *
 * cp.spawnSync(cliPath, ['--install-extension', '<EXTENSION-ID-OR-PATH-TO-VSIX>'], {
 *   encoding: 'utf-8',
 *   stdio: 'inherit'
 * });
 * ```
 *
 * @param vscodeExecutablePath The `vscodeExecutablePath` from `downloadAndUnzipVSCode`.
 */
function resolveCliPathFromVSCodeExecutablePath(vscodeExecutablePath) {
    if (process.platform === 'win32') {
        if (vscodeExecutablePath.endsWith('Code - Insiders.exe')) {
            return path.resolve(vscodeExecutablePath, '../bin/code-insiders.cmd');
        }
        else {
            return path.resolve(vscodeExecutablePath, '../bin/code.cmd');
        }
    }
    else if (process.platform === 'darwin') {
        return path.resolve(vscodeExecutablePath, '../../../Contents/Resources/app/bin/code');
    }
    else {
        if (vscodeExecutablePath.endsWith('code-insiders')) {
            return path.resolve(vscodeExecutablePath, '../bin/code-insiders');
        }
        else {
            return path.resolve(vscodeExecutablePath, '../bin/code');
        }
    }
}
exports.resolveCliPathFromVSCodeExecutablePath = resolveCliPathFromVSCodeExecutablePath;