import core from '@actions/core';
import github from '@actions/github';
import { log, debug } from '../common/log.js';

async function run() {
    const token = core.getInput('token');
    const repo = core.getInput('repository');
    const ageInput = core.getInput('age');
    const utcOffsetInput = core.getInput('utcOffset');
    const api = core.getInput('githubApi');

    const age = parseAge(ageInput);
    const utcOffset = parseOffset(utcOffsetInput);

    const actor = core.getInput('actor') || '';
    const branch = core.getInput('branch') || '';
    const event = core.getInput('event') || '';
    const status = core.getInput('status') || '';

    var currentDateTime = new Date();
    currentDateTime.setHours(currentDateTime.getUTCHours() + utcOffset - age);
    const iso8601DateTime = currentDateTime.toISOString();

    const octokit = new Octokit({
        baseUrl: api,
        auth: token
    });

    const runsUrl = `/repos/${repo}/actions/runs`
    const response = await octokit.request('GET {url}', {
        url: runsUrl,
        actor: actor,
        branch: branch,
        event: event,
        status: status,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });
}

function parseAge(ageInput) {
    const age = parseInt(ageInput);

    if (isNaN(age)) {
        core.setFailed('Specified input \"age\" must be a number.')
    } else if (age < 0) {
        core.setFailed('Specified input \"age\" cannot be negative.')
    } else {
        return age;
    }
}

function parseOffset(utcOffsetInput) {
    const utcOffset = parseInt(utcOffsetInput);

    if (isNaN(utcOffset)) {
        core.setFailed('Specified input \"utcOffset\" must be a number.')
    } else if (utcOffset < -12 || utcOffset > 12) {
        core.setFailed('Specified input \"utcOffset\" must be in range of -12 to +12.')
    } else {
        return utcOffset;
    }
}

run();
