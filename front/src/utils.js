const logLevels = {
	info: 'bgBlue',
	warning: 'bgYellow',
	error: 'bgRed',
	debug: 'bgMagenta'
}

const log = Object.keys(logLevels)
	.reduce((acc, curr) => ({
		...acc,
		[curr]: (message) => console.log(`[${curr}] ${typeof message == 'object' ? JSON.stringify(message) : message}`[logLevels[curr]])
	}), {})

const chunkArray = (myArray, chunk_size) => {
    var results = [];
    
    while (myArray.length) {
        results.push(myArray.splice(0, chunk_size))
    }
    
    return results
}

const distanceInKmBetweenEarthCoordinates = (lat1, lon1, lat2, lon2) => {
	const degreesToRadians = (degrees) => degrees * Math.PI / 180

	const earthRadiusKm = 6371
	const dLat = degreesToRadians(lat2-lat1)
	const dLon = degreesToRadians(lon2-lon1)

	lat1 = degreesToRadians(lat1)
	lat2 = degreesToRadians(lat2)

	const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
	return earthRadiusKm * c
}



module.exports = {log, logLevels: Object.keys(logLevels), chunkArray, distanceInKmBetweenEarthCoordinates}