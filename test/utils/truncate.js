const TRACE_IT_REGEX = /^(.*?at [a-zA-Z]+\..+?)\((.*?)(:\d+)(:\d+)?\)/;
const TRACE_IT_REGEX_NODE_4 = /^(.*?at )(.*?)(:\d+)(:\d+)/;

function matchAndTransfromItTrace(line, isTranspiled = false) {
    let match = line.match(TRACE_IT_REGEX);

    if (match === null) {
        if (isTranspiled) {
            match = line.match(TRACE_IT_REGEX_NODE_4);
            if (match === null) return line;
        } else {
            return line;
        }
    }

    return [
        match[1],
        '(',
        '<path>',
        match[3].replace(/\d+/, '*'),
        match[4].replace(/\d+/, '*'),
        ')'
    ].join('');
}

function truncate(output) {
    return output.split('\n').map(matchAndTransfromItTrace).join('\n');
}

module.exports = truncate;

