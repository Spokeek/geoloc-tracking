Geoloc-tracking
---

an collaborative application to help you localize your firends

Environnements variables:

- PORT => port of the express front
- GOOGLE_API_TOKEN => Google token used for Google Maps
- DEBUG_LEVEL => can be [info, warning, error, debug] # Not implemented yet
- REDIS_HOST = redis host used in the application
- REDIS_SAVE_INTERVAL = Redis persisance loop time
- USER_EMIT_INFO => Duration used to send to all clients the new positions of the users
- MAP_DISPLAY_DISTANCE => Distance witch under we will display the entries # In kilometers
- MAP_NOTIF_DISTANCE => Distance witch under will generate a notification # In meters
- TIME_BETWEEN_NOTIFY => Waiting time between notifications 

