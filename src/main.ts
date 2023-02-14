import * as core from '@actions/core';
import { INPUT_COMMAND } from './constants';
import { CodeSigner } from './setup-codesigner/codesigner';
import { JavaDistribution } from './setup-jdk/installer';

async function run(): Promise<void> {
    try {
        const inputCommand: string = core.getInput(INPUT_COMMAND);
        core.debug('Run CodeSigner');
        core.debug('Running ESigner.com CodeSign Action ====>');

        const codesigner = new CodeSigner();
        const command = await codesigner.install();
        core.info(`Command: ${command}`);

        const distribution = new JavaDistribution();
        await distribution.setupJava();

        core.setOutput('time', new Date().toTimeString());
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message);
    }
}

run().then();
