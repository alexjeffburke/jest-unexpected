const zipArgs = (strs, args) =>
    strs.map((str, i) => (i < args.length ? str + args[i] : str)).join('');

const trim = (strs, ...args) => {
    const str = zipArgs(strs, args);

    const firstIndentMatch = str.match(/^\n(\s+)/);
    const indent = firstIndentMatch !== null ? firstIndentMatch[1] : null;

    return str
        .split('\n')
        .map((str) => str.replace(indent, ''))
        .join('\n')
        .replace(/^\n/, '')
        .replace(/\n\s*$/, '');
};

module.exports = trim;
