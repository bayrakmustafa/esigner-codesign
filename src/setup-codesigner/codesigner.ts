import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

import fs, { copyFileSync, mkdirSync } from 'fs';
import os from 'os';
import path from 'path';
import {
    CODESIGNTOOL_UNIX_EXEC,
    CODESIGNTOOL_UNIX_SETUP,
    CODESIGNTOOL_WINDOWS_EXEC,
    CODESIGNTOOL_WINDOWS_SETUP,
    PRODUCTION_ENVIRONMENT_NAME,
    INPUT_ENVIRONMENT_NAME,
    WINDOWS
} from '../constants';

import {extractZip, getPlatform, getTempDir} from '../util';

export class CodeSigner {
    constructor() {}

    public async install(): Promise<string> {
        let link = getPlatform() == WINDOWS ? CODESIGNTOOL_WINDOWS_SETUP : CODESIGNTOOL_UNIX_SETUP;
        let command = getPlatform() == WINDOWS ? CODESIGNTOOL_WINDOWS_EXEC : CODESIGNTOOL_UNIX_EXEC;
        core.info(`Downloading CodeSignTool from ${link}`);

        const codesigner = path.join(os.homedir(), 'codesign');
        core.info(`Creating CodeSignTool extract path ${codesigner}`);
        mkdirSync(codesigner);

        const downloadedPath = await tc.downloadTool(link, getTempDir());

        const extractedCodeSignPath = await extractZip(downloadedPath, codesigner);
        core.info(`Extract CodeSignTool from download path ${downloadedPath} to ${codesigner}`);

        const archiveName = fs.readdirSync(extractedCodeSignPath)[0];
        const archivePath = path.join(extractedCodeSignPath, archiveName);
        core.info(`Archive name: ${archiveName}, ${archivePath}`);

        fs.readdirSync(downloadedPath).forEach(file => {
            core.info(`File: ${file}`);
        });

        const environment = core.getInput(INPUT_ENVIRONMENT_NAME) ?? PRODUCTION_ENVIRONMENT_NAME;
        const sourceConfig =
            environment == PRODUCTION_ENVIRONMENT_NAME
                ? 'conf/code_sign_tool.properties'
                : 'conf/code_sign_tool_demo.properties';
        const destConfig = path.join(codesigner, 'conf/code_sign_tool.properties');

        core.info(`Copy CodeSignTool config file ${sourceConfig} to ${destConfig}`);
        copyFileSync(sourceConfig, destConfig);

        return path.join(codesigner, command);
    }
}
