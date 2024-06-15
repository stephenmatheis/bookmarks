const colors = {
    // Reset
    Reset: '\x1b[0m',

    // Terminal
    Bright: '\x1b[1m',
    Dim: '\x1b[2m',
    Underscore: '\x1b[4m',
    Blink: '\x1b[5m',
    Reverse: '\x1b[7m',
    Hidden: '\x1b[8m',

    // Foreground
    FgBlack: '\x1b[30m',
    FgRed: '\x1b[31m',
    FgGreen: '\x1b[32m',
    FgYellow: '\x1b[33m',
    FgBlue: '\x1b[34m',
    FgMagenta: '\x1b[35m',
    FgCyan: '\x1b[36m',
    FgWhite: '\x1b[37m',
    FgGray: '\x1b[90m',

    // Background
    BgBlack: '\x1b[40m',
    BgRed: '\x1b[41m',
    BgGreen: '\x1b[42m',
    BgYellow: '\x1b[43m',
    BgBlue: '\x1b[44m',
    BgMagenta: '\x1b[45m',
    BgCyan: '\x1b[46m',
    BgWhite: '\x1b[47m',
    BgGray: '\x1b[100m',
};

export function success() {
    return `${colors.FgGreen}✔${colors.Reset}`;
}

export function fail() {
    return `${colors.FgRed}✖${colors.Reset}`;
}

export function info() {
    return `${colors.FgCyan}ℹ${colors.Reset}`;
}

export function mod() {
    return `${colors.FgCyan}→${colors.Reset}`;
}

export function warn() {
    return `${colors.FgCyan}⚠${colors.Reset}`;
}

export function error() {
    return `${colors.FgCyan}⨂${colors.Reset}`;
}

export function cyan(text) {
    return `${colors.FgCyan}${text}${colors.Reset}`;
}

const log = {
    success,
    fail,
    info,
    mod,
    warn,
    error,
};

export default log;
