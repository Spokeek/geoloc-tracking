// important modules
require('dotenv').config()
require('colors')
const {log, logLevels} = require(`${__dirname}/utils`)

// constants
const PORT = process.env.PORT || 3000
const DEBUG_LEVEL = logLevels.includes(process.env.DEBUG_LEVEL) ? process.env.DEBUG_LEVEL : 'info' // not actually used for now

//modules
const express = require('express')
const app = express()

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(3000, function () {
    log.info(`Client app started on port ${PORT} .`)
})