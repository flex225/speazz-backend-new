const mongoose = require("mongoose")
const { user, usersLocations } = require("./models")

const initMongoose = async () => {
  try {
    const dbUrl = 'mongodb://localhost:27017/speazz-test'
    const connection = await mongoose.connect(dbUrl)

    
    console.log('Connected to DB successfully')
    
    return connection.connection.db
  } catch (ex) {
    console.error('DB connection problem', ex)
  }
}

const init = async () => {
  try {
    await initMongoose()
    await query()
  } catch(ex) {
    console.error('#art:error', ex)
  }
}

const query = async () => {
  const dav = await user.findOne({name: "Dav"})
  console.log("#art", dav)

  const place = { place: "4", placeName: "Alaska" }

  const userPlaces = (await usersLocations.find({
    user: dav._id, 
    place: {$ne : place.place },
    suggestedUser: {$exists: false}
  })).map(e=> e.place)

  console.log("#art:1", userPlaces)

  const users = await usersLocations.find(
    {
      user: {$ne: dav._id}, 
      place : place.place, 
      exists: { $exists: false }
    }, 
    {
      user: 1
    }
  )

  const userIds = users.map(e => (e.user))

  const places = await usersLocations.aggregate()
  .match({ 
    place: {$nin: [...userPlaces, place.place] },
    user: { $in: userIds },
  })
  .group({
    _id: "$place",
    place: { $last: "$place"},
    placeName: { $last: "$placeName" },
    users: { $push: "$user" },
  })

  console.log("#at", JSON.stringify(places, null, 2))
}

init()


// const [art, gog, hayk, dav] = await user.find({})
//   usersLocations.create([
//     {
//       user: art._id,
//       place: "1",
//       placeName: "Doc",
//     },
//     {
//       user: art._id,
//       place: "2",
//       placeName: "Level",
//     },
//     {
//       user: art._id,
//       place: "3",
//       placeName: "S.Ch.",
//     },
//     {
//       user: gog._id,
//       place: "1",
//       placeName: "Doc",
//     },
//     {
//       user: gog._id,
//       place: "2",
//       placeName: "Level",
//     },
//     {
//       user: hayk._id,
//       place: "1",
//       placeName: "Doc",
//     },
//     {
//       user: hayk._id,
//       place: "3",
//       placeName: "S.Ch.",
//     },
//     {
//       user: hayk._id,
//       place: "4",
//       placeName: "Alaska",
//     },
//   ])