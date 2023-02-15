import * as core from '@actions/core';
import * as exec from '@actions/exec';

import { CodeSigner } from './setup-codesigner/codesigner';
import { JavaDistribution } from './setup-jdk/installer';
import { inputCommands } from './util';

async function run(): Promise<void> {
    try {
        let command = inputCommands();
        core.info(`Input Commands: ${command}`);

        core.debug('Run CodeSigner');
        core.debug('Running ESigner.com CodeSign Action ====>');

        const codesigner = new CodeSigner();
        const execCommand = await codesigner.setup();

        command = `${execCommand} ${command}`;
        core.info(`CodeSigner Command: ${command}`);

        const distribution = new JavaDistribution();
        await distribution.setup();

        const result = await exec.getExecOutput(command);
        core.info(result.stdout);

        core.setOutput('time', new Date().toTimeString());
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message);
    }
}

run().then();
