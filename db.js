const { Client } = require('pg')
const { migrate } = require("postgres-migrations")


const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

client.connect().then(async () => {
  console.log('Connected to database')
  try {
    await migrate({client}, "./migrations")
  } catch(ex) {
    console.log("#art", "Error while migrating", ex)
  }
})

module.exports = client
