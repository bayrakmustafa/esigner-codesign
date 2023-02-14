import * as core from '@actions/core';
import * as exec from '@actions/exec';
import {
    INPUT_COMMAND,
    INPUT_CREDENTIAL_ID,
    INPUT_FILE_PATH,
    INPUT_MALWARE_BLOCK,
    INPUT_OUTPUT_PATH,
    INPUT_PASSWORD,
    INPUT_PROGRAM_NAME,
    INPUT_TOTP_SECRET,
    INPUT_USERNAME
} from './constants';
import { CodeSigner } from './setup-codesigner/codesigner';
import { JavaDistribution } from './setup-jdk/installer';

async function run(): Promise<void> {
    try {
        let command = '';
        command = `${command} ${core.getInput(INPUT_COMMAND)}`;
        //command = `${command} -username ${core.getInput(INPUT_USERNAME)}`;
        //command = `${command} -password ${core.getInput(INPUT_PASSWORD)}`;
        //command = `${command} -credential_id ${core.getInput(INPUT_CREDENTIAL_ID)}`;
        //command = `${command} -totp_secret ${core.getInput(INPUT_TOTP_SECRET)}`;
        //command = `${command} -program_name ${core.getInput(INPUT_PROGRAM_NAME)}`;
        //command = `${command} -input_file_path ${core.getInput(INPUT_FILE_PATH)}`;
        //command = `${command} -output_dir_path ${core.getInput(INPUT_OUTPUT_PATH)}`;
        //command = `${command} -malware_block=${core.getInput(INPUT_MALWARE_BLOCK)}`;

        core.debug('Run CodeSigner');
        core.debug('Running ESigner.com CodeSign Action ====>');

        const codesigner = new CodeSigner();
        const execCommand = await codesigner.install();

        command = `${execCommand} ${command}`;
        core.info(`CodeSigner Command: ${command}`);

        const distribution = new JavaDistribution();
        await distribution.setupJava();

        const result = await exec.exec(command);
        core.info(result.toString());

        core.setOutput('time', new Date().toTimeString());
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message);
    }
}

run().then();
