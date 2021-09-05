var express = require('express')
var router = express.Router()
const bodyParser = require('body-parser')
const withBody = bodyParser.json()
const db = require("./db")


router.post("/clear", async () => {


    await db.query(`TRUNCATE TABLE  users`)
    await db.query(`TRUNCATE TABLE  locations`)
    await db.query(`TRUNCATE TABLE  users_locations`)
    
    res.json("success")
})

router.post('/user', withBody, async function (req, res) {
    console.log(req.body)

    const {uuid} = req.body

    await db.query(`INSERT INTO users (uuid) VALUES (${uuid})`)
    
    res.json("success")
    
})

router.post('/place', withBody, async function (req, res) {
    console.log(req.body)

    const {
        userId,
        name: placeName,
        googlePlaceId,
    } = req.body

    const placeQuery = await db.query(`INSERT INTO locations (name, google_id) VALUES (${placeName}, ${googlePlaceId})`)

    const place = placeQuery.rows[0]

    const userQuery = await db.query(`SELECT * FROM users WHERE uuid=${userId}`)

    const user = userQuery.rows[0]

    await db.query(`INSERT INTO users_locations (user_id, location_id) VALUES (${place.id}, ${user.id})`)

    res.json("success")
    
})

router.get('/trufflepig', async function (req, res, next) {

    const { userId } = req.query

    const userQuery = await db.query(`SELECT * FROM users WHERE uuid=${userId}`)

    const user = userQuery.rows[0]
    
    const userPlacesQuery = await db.query(`SELECT * FROM users_locations WHERE user_id=${user.id}`)

    const placesIds = userPlacesQuery.rows.map(e => e.id).join(',')


    const queryText = `
    SELECT locations.name, locations.id, t1.times
    FROM users_locations
    JOIN locations on users_locations.location_id = locations.id
    JOIN (
        SELECT COUNT(user_id) as times, user_id as curr_user
        FROM users_locations 
        WHERE users_locations.user_id not in (1) and users_locations.location_id in (${placesIds})
        GROUP BY user_id
    ) as t1 on users_locations.user_id = t1.curr_user
    WHERE 
    user_id in (
        SELECT users_locations.user_id
        FROM users_locations 
        WHERE users_locations.user_id not in (1) and users_locations.location_id in (${placesIds})
        GROUP BY user_id
    )
    AND users_locations.location_id not in (${placesIds})
    group by location_id
    order by times DESC;
    `.trim()

    const trufflepigQuery = await query.query(queryText)

    res.json({items: trufflepigQuery.rows})
})



module.exports = router
