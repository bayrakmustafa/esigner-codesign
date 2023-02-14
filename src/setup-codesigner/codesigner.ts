import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

import { mkdirSync, readFileSync } from 'fs';
import os from 'os';
import path from 'path';
import {
    CODESIGNTOOL_UNIX_EXEC,
    CODESIGNTOOL_UNIX_SETUP,
    CODESIGNTOOL_WINDOWS_EXEC,
    CODESIGNTOOL_WINDOWS_SETUP,
    WINDOWS
} from '../constants';

import { extractZip, getPlatform } from '../util';

export class CodeSigner {
    constructor() {}

    public async install(): Promise<string> {
        let link = getPlatform() == WINDOWS ? CODESIGNTOOL_WINDOWS_SETUP : CODESIGNTOOL_UNIX_SETUP;
        let command = getPlatform() == WINDOWS ? CODESIGNTOOL_WINDOWS_EXEC : CODESIGNTOOL_UNIX_EXEC;
        core.info(`Downloading CodeSignTool from ${link}`);

        const codesigner = path.join(os.homedir(), 'codesign');
        core.info(`Creating CodeSignTool extract path ${codesigner}`);
        mkdirSync(codesigner);

        const downloadedPath = await tc.downloadTool(link);
        await extractZip(downloadedPath, codesigner);

        const execCommand = path.join(codesigner, command);
        const contents = readFileSync('conf/code_sign_tool.properties');

        return codesigner;
    }
}
