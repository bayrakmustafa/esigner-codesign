import os from 'os';
import path from 'path';
import * as fs from 'fs';
import * as semver from 'semver';
import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import { MACOS, UNIX, WINDOWS } from './constants';

export function getTempDir() {
    return process.env['RUNNER_TEMP'] || os.tmpdir();
}

export function getBooleanInput(inputName: string, defaultValue: boolean = false) {
    return (core.getInput(inputName) || String(defaultValue)).toUpperCase() === 'TRUE';
}

export async function extractJdkFile(toolPath: string, extension?: string) {
    if (!extension) {
        extension = toolPath.endsWith('.tar.gz') ? 'tar.gz' : path.extname(toolPath);
        if (extension.startsWith('.')) {
            extension = extension.substring(1);
        }
    }

    switch (extension) {
        case 'tar.gz':
        case 'tar':
            return await tc.extractTar(toolPath);
        case 'zip':
            return await tc.extractZip(toolPath);
        default:
            return await tc.extract7z(toolPath);
    }
}

export async function extractZip(toolPath: string, destPath: string) {
    return await tc.extractZip(toolPath, destPath);
}

export function getDownloadArchiveExtension() {
    return process.platform === 'win32' ? 'zip' : 'tar.gz';
}

export function isVersionSatisfies(range: string, version: string): boolean {
    if (semver.valid(range)) {
        const semRange = semver.parse(range);
        if (semRange && semRange.build?.length > 0) {
            return semver.compareBuild(range, version) === 0;
        }
    }

    return semver.satisfies(version, range);
}

export function getToolCachePath(toolName: string, version: string, architecture: string) {
    const toolCacheRoot = process.env['RUNNER_TOOL_CACHE'] ?? '';
    const fullPath = path.join(toolCacheRoot, toolName, version, architecture);
    if (fs.existsSync(fullPath)) {
        return fullPath;
    }

    return null;
}

export function getPlatform(): string {
    switch (process.platform) {
        case 'darwin':
            return MACOS;
        case 'win32':
            return WINDOWS;
        default:
            return UNIX;
    }
}

export function listFiles(path: string, debug: boolean = false): void {
    const files = fs.readdirSync(path);
    if (debug) {
        files.forEach(file => {
            core.debug(`File: ${file}`);
        });
    }
}
