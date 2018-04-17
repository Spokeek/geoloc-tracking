const logLevels = {
	info: 'bgBlue',
	warning: 'bgYellow',
	error: 'bgRed',
	debug: 'bgMagenta'
}

const log = Object.keys(logLevels)
	.reduce((acc, curr) => ({
		...acc,
		[curr]: (message) => console.log(`[${curr}] ${message}`[logLevels[curr]])
	}), {})

module.exports = {log, logLevels: Object.keys(logLevels)}