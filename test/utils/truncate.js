const TRACE_IT_REGEX = /^(.*?at [a-zA-Z]+\..+?)\((.*?)(:\d+)(:\d+)?\)( \/\/ .*$)?/;

function matchAndTransfromItTrace(line) {
    let match = line.match(TRACE_IT_REGEX);

    if (match === null) {
        return line;
    }

    return [
        match[1],
        '(',
        '<path>',
        match[3].replace(/\d+/, '*'),
        match[4].replace(/\d+/, '*'),
        ')',
        match[5] || ''
    ].join('');
}

function truncate(output) {
    return output
        .split('\n')
        .map(matchAndTransfromItTrace)
        .join('\n');
}

module.exports = truncate;
