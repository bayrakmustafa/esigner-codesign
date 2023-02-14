import * as core from '@actions/core'
import {wait} from './wait'
import {CorrettoDistribution, } from './setup-jdk/installer';

async function run(): Promise<void> {
    try {
        const ms: string = core.getInput('milliseconds')
        core.debug(`Waiting ${ms} milliseconds ...`)

        core.info(new Date().toTimeString())
        await wait(parseInt(ms, 10))
        core.debug(new Date().toTimeString())

        const distribution = new CorrettoDistribution();
        const result = await distribution.setupJava();

        core.setOutput('time', new Date().toTimeString())
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

run()
