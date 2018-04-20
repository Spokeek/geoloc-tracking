// important modules
require('dotenv').config()
require('colors')
const uuid = require('uuid/v4')
const {log, logLevels, chunkArray, distanceInKmBetweenEarthCoordinates} = require(`${__dirname}/utils`)
const redis = require('redis')

// constants
const PORT = +process.env.PORT || 3000
const DEBUG_LEVEL = logLevels.includes(process.env.DEBUG_LEVEL) ? process.env.DEBUG_LEVEL : 'info' // not actually used for now
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1'
const REDIS_SAVE_INTERVAL = +process.env.REDIS_SAVE_INTERVAL || 60 * 0.5 // In seconds
const USER_EMIT_INFO = +process.env.USER_EMIT_INFO || 2 // In seconds
const MAP_DISPLAY_DISTANCE = +process.env.MAP_DISPLAY_DISTANCE || 50 // In kilometers
const GOOGLE_API_TOKEN = process.env.GOOGLE_API_TOKEN
if(!GOOGLE_API_TOKEN){
	log.error("You need to define the GOOGLE_API_TOKEN environement variable")
	process.exit(1)
}

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
		googleApiToken: GOOGLE_API_TOKEN
	})
})

let sockets_list = []
io.on('connection', (socket) => {
	log.debug('a user connected')
	
	socket.on('disconnect', () => {
		log.debug("user disconnected")
		sockets_list = sockets_list.filter(s => s.socket !== socket)
	})
	
	socket.on('data', (data) => {
		const {lat, lng} =  data
		log.debug(`user ${data.uuid} moved to "${lat}:${lng}"`)
		
		const m = redisClient.multi()
		m.sadd('uuids', data.uuid)
		m.setnx(`username_${data.uuid}`, 'anonymous')
		m.rpush(data.uuid, `${+new Date()}|${lat}|${lng}`, log.info)
		m.exec((err) => log.error(err))
		if(!sockets_list.find(s => s.uuid === data.uuid)){
			sockets_list = [...sockets_list, {uuid: data.uuid, socket}]
		}
	})
	
	socket.on('changeUsername', (data) => {
		const {username, uuid} = data
		log.debug(`${uuid} changed his username to ${username}`)
		redisClient.set(`username_${uuid}`, username)
	})
	
	setInterval(() => {
		redisClient.smembers('uuids', (err, uuids) => {
			if(err){
				log.error(err)
			}
			else if(uuids){
				//log.debug(uuids)
				const m = redisClient.multi()
				uuids.forEach((uuid) => {
					m.lrange(uuid, -1, -1)
					m.get(`username_${uuid}`)
				})
				m.exec((err, replies) => {
					replies = chunkArray(replies, 2)
					//log.debug(replies)
					const users_data = replies
						.map((r, i) => {
							//log.debug(r)
							if(r){
								let obj = r[0][0]
								obj = obj.split('|')
								return ({
									uuid: uuids[i],
									date: new Date(obj[0] * 1000),
									lat: obj[1],
									lng: obj[2],
									username: r[1]
								})
							}
							else{
								return null
							}
						})
						.filter(p => p !== null)
					users_data.forEach((p) => log.debug(`${p.uuid} => at ${p.date} sur ${p.lat}:${p.lng} par ${p.username}`))
					sockets_list.forEach(s => {
						const {lat, lng} = users_data.find(ud => ud.uuid === s.uuid)
						const users_data_filtred = users_data
							.filter(ud => distanceInKmBetweenEarthCoordinates(lat, lng, ud.lat, ud.lng) <= MAP_DISPLAY_DISTANCE)
						log.debug(`for ${s.uuid}, we send ${users_data_filtred.length} data`)
						s.socket.emit('users_data', users_data_filtred)
					})
				})
			}
			else{
				log.debug("uuids empty")
			}
		})
	}, USER_EMIT_INFO * 1000)

})

if(REDIS_SAVE_INTERVAL > 0){
	setInterval(() => {
		log.debug("Saving database")
		redisClient.save()
	}, REDIS_SAVE_INTERVAL * 1000)
}

http.listen(PORT, () => {
    log.info(`Client app started on port ${PORT} .`)
})
