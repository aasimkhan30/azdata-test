/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';
import * as request from './request';
import { getVSCodeDownloadUrl, urlToOptions, downloadDirToExecutablePath } from './util';

const extensionRoot = process.cwd();
const vscodeTestDir = path.resolve(extensionRoot, '.vscode-test');

const vscodeStableReleasesAPI = `https://update.code.visualstudio.com/api/releases/stable`;

async function fetchLatestStableRelease(): Promise<VSCodeVersion> {
	const versions = await request.getJSON(vscodeStableReleasesAPI);
	if (!versions || !Array.isArray(versions) || !versions[0]) {
		throw Error('Failed to get latest VS Code version');
	}

	return versions[0] as VSCodeVersion;
}

export type VSCodeVersion =
	| 'insiders'
	| '1.32.2'
	| '1.32.1'
	| '1.32.0'
	| '1.31.1'
	| '1.31.0'
	| '1.30.2'
	| '1.30.1'
	| '1.30.0'
	| '1.29.1'
	| '1.29.0'
	| '1.28.2'
	| '1.28.1'
	| '1.28.0'
	| '1.27.2'
	| '1.27.1'
	| '1.27.0'
	| '1.26.1'
	| '1.26.0'
	| '1.25.1'
	| '1.25.0'
	| '1.24.1'
	| '1.24.0'
	| '1.23.1'
	| '1.23.0'
	| '1.22.2'
	| '1.22.1'
	| '1.22.0'
	| '1.21.1'
	| '1.21.0'
	| '1.20.1'
	| '1.20.0'
	| '1.19.3'
	| '1.19.2'
	| '1.19.1'
	| '1.19.0'
	| '1.18.1'
	| '1.18.0'
	| '1.17.2'
	| '1.17.1'
	| '1.17.0'
	| '1.16.1'
	| '1.16.0'
	| '1.15.1'
	| '1.15.0'
	| '1.14.2'
	| '1.14.1'
	| '1.14.0';

/**
 * Download a copy of VS Code archive to `.vscode-test`.
 *
 * @param version The version of VS Code to download such as '1.32.0'. You can also use
 * 'insiders' for downloading latest Insiders.
 */
async function downloadVSCodeArchive(version: VSCodeVersion): Promise<string> {
	if (!fs.existsSync(vscodeTestDir)) {
		fs.mkdirSync(vscodeTestDir, { recursive: true });
	}

	return new Promise((resolve, reject) => {
		const requestOptions = urlToOptions(getVSCodeDownloadUrl(version));

		https.get(requestOptions, res => {
			if (res.statusCode !== 302) {
				reject('Failed to get VS Code archive location');
			}
			const archiveUrl = res.headers.location;
			if (!archiveUrl) {
				reject('Failed to get VS Code archive location');
				return;
			}

			const archiveRequestOptions = urlToOptions(archiveUrl)
			if (archiveUrl.endsWith('.zip')) {
				const archivePath = path.resolve(vscodeTestDir, `vscode-${version}.zip`);
				const outStream = fs.createWriteStream(archivePath);
				outStream.on('close', () => {
					resolve(archivePath);
				});
				https.get(archiveRequestOptions, res => {
					res.pipe(outStream);
				});
			} else {
				const zipPath = path.resolve(vscodeTestDir, `vscode-${version}.tgz`);
				const outStream = fs.createWriteStream(zipPath);
				https.get(archiveRequestOptions, res => {
					res.pipe(outStream);
				});
				outStream.on('close', () => {
					resolve(zipPath);
				});
			}
		});
	});
}

/**
 * Unzip a .zip or .tar.gz VS Code archive
 */
function unzipVSCode(vscodeArchivePath: string) {
	// The 'vscode-1.32' out of '.../vscode-1.32.zip'
	const dirName = path.parse(vscodeArchivePath).name;
	const extractDir = path.resolve(vscodeTestDir, dirName);

	if (vscodeArchivePath.endsWith('.zip')) {
		if (process.platform === 'win32') {
			cp.spawnSync('powershell.exe', [
				'-Command',
				`Expand-Archive -Path ${vscodeArchivePath} -DestinationPath ${extractDir}`
			]);
		} else {
			cp.spawnSync('unzip', [vscodeArchivePath, '-d', `${extractDir}`]);
		}
	} else {
		cp.spawnSync('tar', ['-xzf', vscodeArchivePath, '-C', extractDir]);
	}
}

/**
 * Download and unzip a copy of VS Code in `.vscode-test`. The paths are:
 * - `.vscode-test/vscode-<VERSION>`. For example, `./vscode-test/vscode-1.32.0`
 * - `./vscode-test/vscode-insiders`.
 *
 * @param version The version of VS Code to download such as '1.32.0'. You can also use
 * 'insiders' for downloading latest Insiders.
 */
export async function downloadAndUnzipVSCode(version?: VSCodeVersion): Promise<string> {
	if (!version) {
		version = await fetchLatestStableRelease();
	}

	if (fs.existsSync(path.resolve(vscodeTestDir, `vscode-${version}`))) {
		console.log(`Found .vscode-test/vscode-${version}. Skipping download.`);
		return Promise.resolve(downloadDirToExecutablePath(path.resolve(vscodeTestDir, `vscode-${version}`)));
	}

	console.log(`Downloading VS Code ${version}`);
	const vscodeArchivePath = await downloadVSCodeArchive(version);
	if (fs.existsSync(vscodeArchivePath)) {
		unzipVSCode(vscodeArchivePath);
		console.log(`Downloaded VS Code ${version}`);
		// Remove archive
		fs.unlinkSync(vscodeArchivePath);
	}

	return downloadDirToExecutablePath(path.resolve(vscodeTestDir, `vscode-${version}`));
}