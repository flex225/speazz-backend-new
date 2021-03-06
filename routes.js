var express = require('express')
var router = express.Router()
const bodyParser = require('body-parser')
const withBody = bodyParser.json()
const client = require("./db")


router.post("/clear", async (req, res) => {
    try {
        await makeQuery(`DELETE FROM users_locations`)
        await makeQuery(`DELETE FROM users`)
        await makeQuery(`DELETE FROM locations`)
        res.json("success")
    } catch(ex) {
        res.json("error::" + JSON.stringify(ex))
    }
})

router.post('/user', withBody, async function (req, res) {
    try {
        const db = client()
        console.log(req.body)

        const {uuId} = req.body

        const userQuery = await makeQuery(`INSERT INTO users (uuid) VALUES (${db.escape(uuId)})`, [])

        console.log("#art", JSON.stringify(userQuery, null, 2))
        
        res.json("success")
    } catch(ex) {
        res.json("error::" + JSON.stringify(ex))
    }
    
})

router.post('/place', withBody, async function (req, res) {
    try {
        console.log(req.body)

        const db = client()
        const {
            userId,
            name: placeName,
            googlePlaceId,
            images,
            vincinity
        } = req.body

        let image = null

        if(images && images.length > 0) {
            image = images[0].photoReference
        }

        let place

        const placeQuery = await makeQuery(`SELECT id FROM locations WHERE google_id=${db.escape(googlePlaceId)}`)

        console.log("#art", placeQuery.rowCount)
        console.log("#art", JSON.stringify(placeQuery, null, 2))

        if (placeQuery.length > 0) {
            place = placeQuery[0]
        } else {
            const placeInsertQuery = await makeQuery(`INSERT INTO locations (name, google_id, image, address) VALUES (${db.escape(placeName)}, ${db.escape(googlePlaceId)}, ${db.escape(image)}, ${db.escape(vincinity)})`)
            
            console.log("#art:place:query", JSON.stringify(placeInsertQuery, null, 2))

            place = {id : placeInsertQuery.insertId}
        }

        
        
        const userQuery = await makeQuery(`SELECT * FROM users WHERE uuid=${db.escape(userId)}`)
        
        const user = userQuery[0]

        console.log("#art:user", JSON.stringify(user, null, 2))
        console.log("#art:place", JSON.stringify(place, null, 2))

        await makeQuery(`INSERT INTO users_locations (user_id, location_id) VALUES (${db.escape(user.id)},${db.escape(place.id)})`)

        res.json("success")
    } catch(ex) {
        res.json("error::" + JSON.stringify(ex))
    }
    
})

router.get('/trufflepig', async function (req, res) {

    try {
        const db = client()

        const { userId } = req.query

        const userQuery = await makeQuery(`SELECT * FROM users WHERE uuid=${db.escape(userId)}`)

        const user = userQuery[0]

        console.log("#art:user", JSON.stringify(user, null, 2))
        
        const userPlacesQuery = await makeQuery(`SELECT location_id FROM users_locations WHERE user_id=${db.escape(user.id)}`)

        const placesIds = userPlacesQuery.map(e => e.location_id)


        console.log("#art:places", JSON.stringify(placesIds, null, 2))


        const queryText = `
        SELECT locations.name, locations.id, locations.google_id, locations.image, locations.address, MAX(t1.times) as times
        FROM users_locations
        JOIN locations on users_locations.location_id = locations.id
        JOIN (
            SELECT COUNT(user_id) as times, user_id as curr_user
            FROM users_locations 
            WHERE users_locations.user_id not in (${db.escape(user.id)}) and users_locations.location_id in (${db.escape(placesIds)})
            GROUP BY user_id
        ) as t1 on users_locations.user_id = t1.curr_user
        WHERE 
        user_id in (
            SELECT users_locations.user_id
            FROM users_locations 
            WHERE users_locations.user_id not in (${db.escape(user.id)}) and users_locations.location_id in (${db.escape(placesIds)})
            GROUP BY user_id
        )
        AND users_locations.location_id not in (${db.escape(placesIds)})
        group by location_id
        order by times DESC;
        `.trim()

        const trufflepigQuery = await makeQuery(queryText)

        res.json({items: trufflepigQuery})
    } catch(ex) {
        res.json("error::" + JSON.stringify(ex))
    }
})


const makeQuery = async(queryText, params) => {
    return new Promise((res, rej) => {
        const db = client()
        db.query(queryText, function (err, rows) {
            if(err) {
                rej(err)
                return
            }
            res(rows)
        })
    })
}



module.exports = router
