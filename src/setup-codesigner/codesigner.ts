import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

import fs, { copyFileSync, mkdirSync } from 'fs';
import os from 'os';
import path from 'path';
import {
    CODESIGNTOOL_UNIX_RUN_CMD,
    CODESIGNTOOL_UNIX_SETUP,
    CODESIGNTOOL_WINDOWS_RUN_CMD,
    CODESIGNTOOL_WINDOWS_SETUP,
    PRODUCTION_ENVIRONMENT_NAME,
    INPUT_ENVIRONMENT_NAME,
    WINDOWS
} from '../constants';

import { extractZip, getPlatform, listFiles, userShell } from '../util';

export class CodeSigner {
    constructor() {}

    public async setup(): Promise<string> {
        let link = getPlatform() == WINDOWS ? CODESIGNTOOL_WINDOWS_SETUP : CODESIGNTOOL_UNIX_SETUP;
        let cmd = getPlatform() == WINDOWS ? CODESIGNTOOL_WINDOWS_RUN_CMD : CODESIGNTOOL_UNIX_RUN_CMD;
        core.info(`Downloading CodeSignTool from ${link}`);

        const codesigner = path.join(os.homedir(), 'codesign');
        core.info(`Creating CodeSignTool extract path ${codesigner}`);
        mkdirSync(codesigner);

        const downloadedFile = await tc.downloadTool(link);
        const extractedCodeSignPath = await extractZip(downloadedFile, codesigner);
        core.info(`Extract CodeSignTool from download path ${downloadedFile} to ${codesigner}`);

        const archiveName = fs.readdirSync(extractedCodeSignPath)[0];
        const archivePath = path.join(extractedCodeSignPath, archiveName);
        core.info(`Archive name: ${archiveName}, ${archivePath}`);
        listFiles(archivePath);

        const environment = core.getInput(INPUT_ENVIRONMENT_NAME) ?? PRODUCTION_ENVIRONMENT_NAME;
        const sourceConfig =
            environment == PRODUCTION_ENVIRONMENT_NAME
                ? 'conf/code_sign_tool.properties'
                : 'conf/code_sign_tool_demo.properties';
        const destConfig = path.join(archivePath, 'conf/code_sign_tool.properties');

        core.info(`Copy CodeSignTool config file ${sourceConfig} to ${destConfig}`);
        copyFileSync(sourceConfig, destConfig);

        core.info(`Set CODE_SIGN_TOOL_PATH env variable: ${archivePath}`);
        process.env['CODE_SIGN_TOOL_PATH'] = archivePath;

        let execCmd = path.join(archivePath, cmd);
        fs.chmodSync(execCmd, '0755');

        const shellCmd = userShell();
        core.info(`Shell Cmd: ${shellCmd}`);
        execCmd = shellCmd + ' ' + execCmd;
        execCmd = execCmd.trimStart().trimEnd();
        return execCmd;
    }
}
