// important modules
require('dotenv').config()
require('colors')
const uuid = require('uuid/v4')
const {log, logLevels} = require(`${__dirname}/utils`)
const redis = require('redis')

// constants
const PORT = +process.env.PORT || 3000
const DEBUG_LEVEL = logLevels.includes(process.env.DEBUG_LEVEL) ? process.env.DEBUG_LEVEL : 'info' // not actually used for now
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1'
const REDIS_SAVE_INTERVAL = +process.env.REDIS_SAVE_INTERVAL || 5//60 * 3 // In seconds
const USER_EMIT_INFO = +process.env.USER_EMIT_INFO || 10 // In seconds

// modules configuration
const redisClient = redis.createClient({host: REDIS_HOST})
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
		uuid: uuid(),
	})
})

io.on('connection', (socket) => {
	log.info('a user connected')
	
	socket.on('data', (data) => {
		const {lat, lng} =  data
		log.debug(`user ${data.uuid} moved to "${lat}:${lng}"`)
		
		redisClient.sadd('uuids', data.uuid)
		redisClient.lpush(data.uuid, `${+new Date()}|${lat}|${lng}`, redis.print)
	})
})


setInterval(() => {
	log.debug("Sending positions to users")
	redisClient.smembers('uuids', (err, uuids) => {
		log.debug(`uuids: ${uuids}`)
		const m = redisClient.multi()
		uuids.forEach((uuid) => m.lrange(uuid, -1, 1))
		m.exec((err, replies) => {
			log.info(`replies: ${replies}`)
			
			//.forEach((p,i) => log.info(`${uuids[i]} => at ${p.date} sur ${p.lat}:${p.lng}`))
		})
	})
}, USER_EMIT_INFO * 1000)

if(REDIS_SAVE_INTERVAL > 0){
	setInterval(() => {
		log.debug("Saving database")
		redisClient.save()
	}, REDIS_SAVE_INTERVAL * 1000)
}

http.listen(PORT, () => {
    log.info(`Client app started on port ${PORT} .`)
})
