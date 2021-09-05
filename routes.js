var express = require('express')
var router = express.Router()
const bodyParser = require('body-parser')
const withBody = bodyParser.json()
const db = require("./db")


router.post("/clear", async (req, res) => {


    await db.query(`DELETE FROM users_locations`)
    await db.query(`DELETE FROM users`)
    await db.query(`DELETE FROM locations`)

    res.json("success")
})

router.post('/user', withBody, async function (req, res) {
    console.log(req.body)

    const {uuid} = req.body

    const userQuery = await db.query(`INSERT INTO users (uuid) VALUES ($1)`, [uuid])

    console.log("#art", JSON.stringify(userQuery, null, 2))
    
    res.json("success")
    
})

router.post('/place', withBody, async function (req, res) {
    console.log(req.body)

    const {
        userId,
        name: placeName,
        googlePlaceId,
    } = req.body


    let place

    const placeQuery = await db.query(`SELECT id FROM locations WHERE google_id=$1`, [googlePlaceId])

    console.log("#art", placeQuery.rowCount)
    console.log("#art", JSON.stringify(placeQuery, null, 2))

    if (placeQuery.rowCount > 0) {
        place = placeQuery.rows[0]
    } else {
        const placeInsertQuery = await db.query(`INSERT INTO locations (name, google_id) VALUES ($1, $2) RETURNING id`, [placeName, googlePlaceId])
        place = placeInsertQuery.rows[0]
    }

    console.log("#art:place", JSON.stringify(place, null, 2))


    const userQuery = await db.query(`SELECT * FROM users WHERE uuid=$1`, [userId])

    const user = userQuery.rows[0]

    await db.query(`INSERT INTO users_locations (user_id, location_id) VALUES ($1,$2)`, [user.id, place.id])

    res.json("success")
    
})

router.get('/trufflepig', async function (req, res, next) {

    const { userId } = req.query

    const userQuery = await db.query(`SELECT * FROM users WHERE uuid=$1`, [userId])

    const user = userQuery.rows[0]
    
    const userPlacesQuery = await db.query(`SELECT id FROM users_locations WHERE user_id=$1`, [user.id])

    const placesIds = userPlacesQuery.rows.map(e => e.id).join(',')


    const queryText = `
    SELECT locations.name, locations.id, t1.times
    FROM users_locations
    JOIN locations on users_locations.location_id = locations.id
    JOIN (
        SELECT COUNT(user_id) as times, user_id as curr_user
        FROM users_locations 
        WHERE users_locations.user_id not in ($2) and users_locations.location_id in ($1)
        GROUP BY user_id
    ) as t1 on users_locations.user_id = t1.curr_user
    WHERE 
    user_id in (
        SELECT users_locations.user_id
        FROM users_locations 
        WHERE users_locations.user_id not in ($2) and users_locations.location_id in ($1)
        GROUP BY user_id
    )
    AND users_locations.location_id not in ($1)
    group by location_id
    order by times DESC;
    `.trim()

    const trufflepigQuery = await query.query(queryText, [placesIds, user.id])

    res.json({items: trufflepigQuery.rows})
})



module.exports = router
