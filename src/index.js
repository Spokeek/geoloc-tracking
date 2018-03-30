// important modules
require('dotenv').config()
require('colors')
const uuid = require('uuid/v4')
const {log, logLevels} = require(`${__dirname}/utils`)

// constants
const PORT = process.env.PORT || 3000
const DEBUG_LEVEL = logLevels.includes(process.env.DEBUG_LEVEL) ? process.env.DEBUG_LEVEL : 'info' // not actually used for now

// modules express
const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
app.use('/js-cookie', express.static(`${__dirname}/../node_modules/js-cookie/src`))
app.use('/public', express.static(`${__dirname}/../public`))
app.engine('handlebars', exphbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')
const http = require('http').Server(app)
const io = require('socket.io')(http)

// actual code
app.get('/', (req, res) => {
		res.render('home', {
		title: "Client",
		uuid: uuid(),
		intervalUpdate: (15 * 1000) // in ms
	})
})

io.on('connection', (socket) => {
	log.info('a user connected')
	
	socket.on('data', (data) => {
		log.info(`user ${data.uuid} sended "${data.data}"`)
	})
})

http.listen(PORT, () => {
		log.info(`Client app started on port ${PORT} .`)
})