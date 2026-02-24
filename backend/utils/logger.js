const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

class Logger {
  info(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`${colors.blue}[INFO]${colors.reset} ${timestamp} - ${message}`);
    if (data) console.log(data);
  }

  error(message, data = null) {
    const timestamp = new Date().toISOString();
    console.error(`${colors.red}[ERROR]${colors.reset} ${timestamp} - ${message}`);
    if (data) console.error(data);
  }

  warn(message, data = null) {
    const timestamp = new Date().toISOString();
    console.warn(`${colors.yellow}[WARN]${colors.reset} ${timestamp} - ${message}`);
    if (data) console.warn(data);
  }

  success(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`${colors.green}[SUCCESS]${colors.reset} ${timestamp} - ${message}`);
    if (data) console.log(data);
  }
}

module.exports = new Logger();
