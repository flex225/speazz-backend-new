const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  name: String
})

const usersLocationsSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    suggestedUser: { type: Schema.Types.ObjectId, ref: 'User' },
    place: String,
    placeName: String,
})

module.exports = { 
    user: mongoose.model('user', userSchema),
    usersLocations: mongoose.model('users_location', usersLocationsSchema),
}
