const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
    
    fg: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        crimson: "\x1b[38m"
    },
    
    bg: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
        crimson: "\x1b[48m"
    }
};

/**
 * Định dạng thời gian hiện tại
 * @returns {string} Thời gian định dạng HH:MM:SS
 */
const getTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
};

/**
 * Định dạng đối tượng thành chuỗi JSON đẹp
 * @param {Object} obj - Đối tượng cần định dạng
 * @returns {string} Chuỗi JSON đẹp
 */
const formatObject = (obj) => {
    if (typeof obj === 'object' && obj !== null) {
        return JSON.stringify(obj, null, 2);
    }
    return obj;
};

const logger = {
    /**
     * Log thông tin
     * @param {string} message - Thông điệp cần log
     * @param {Object} [data] - Dữ liệu bổ sung (tùy chọn)
     */
    info: (message, data) => {
        console.log(`${colors.fg.cyan}[INFO]${colors.reset} ${colors.dim}[${getTime()}]${colors.reset} ${message}`);
        if (data) {
            console.log(`${colors.fg.cyan}[DATA]${colors.reset} ${formatObject(data)}`);
        }
    },

    /**
     * Log thành công
     * @param {string} message - Thông điệp cần log
     * @param {Object} [data] - Dữ liệu bổ sung (tùy chọn)
     */
    success: (message, data) => {
        console.log(`${colors.fg.green}[SUCCESS]${colors.reset} ${colors.dim}[${getTime()}]${colors.reset} ${message}`);
        if (data) {
            console.log(`${colors.fg.green}[DATA]${colors.reset} ${formatObject(data)}`);
        }
    },

    /**
     * Log cảnh báo
     * @param {string} message - Thông điệp cần log
     * @param {Object} [data] - Dữ liệu bổ sung (tùy chọn)
     */
    warn: (message, data) => {
        console.log(`${colors.fg.yellow}[WARNING]${colors.reset} ${colors.dim}[${getTime()}]${colors.reset} ${message}`);
        if (data) {
            console.log(`${colors.fg.yellow}[DATA]${colors.reset} ${formatObject(data)}`);
        }
    },

    /**
     * Log lỗi
     * @param {string} message - Thông điệp cần log
     * @param {Error|Object} [error] - Đối tượng lỗi (tùy chọn)
     */
    error: (message, error) => {
        console.log(`${colors.fg.red}[ERROR]${colors.reset} ${colors.dim}[${getTime()}]${colors.reset} ${message}`);
        if (error) {
            if (error instanceof Error) {
                console.log(`${colors.fg.red}[STACK]${colors.reset} ${error.stack}`);
            } else {
                console.log(`${colors.fg.red}[DATA]${colors.reset} ${formatObject(error)}`);
            }
        }
    },

    /**
     * Log debug
     * @param {string} message - Thông điệp cần log
     * @param {Object} [data] - Dữ liệu bổ sung (tùy chọn)
     */
    debug: (message, data) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`${colors.fg.magenta}[DEBUG]${colors.reset} ${colors.dim}[${getTime()}]${colors.reset} ${message}`);
            if (data) {
                console.log(`${colors.fg.magenta}[DATA]${colors.reset} ${formatObject(data)}`);
            }
        }
    },

    /**
     * Log HTTP request
     * @param {Object} req - Express request object
     * @param {string} [message] - Thông điệp bổ sung (tùy chọn)
     */
    http: (req, message = '') => {
        const method = req.method;
        let methodColor;
        
        switch (method) {
            case 'GET':
                methodColor = colors.fg.green;
                break;
            case 'POST':
                methodColor = colors.fg.yellow;
                break;
            case 'PUT':
            case 'PATCH':
                methodColor = colors.fg.blue;
                break;
            case 'DELETE':
                methodColor = colors.fg.red;
                break;
            default:
                methodColor = colors.fg.white;
        }
        
        console.log(
            `${colors.fg.cyan}[HTTP]${colors.reset} ${colors.dim}[${getTime()}]${colors.reset} ` +
            `${methodColor}${method}${colors.reset} ${req.originalUrl || req.url} ${message}`
        );
    }
};

module.exports = logger;
