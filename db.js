const mysql = require('mysql')


// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// })

// client.connect().then(async () => {
//   console.log('Connected to database')
//   try {
//     await migrate({client}, "./migrations")
//   } catch(ex) {
//     console.log("#art", "Error while migrating", ex)
//   }
// })

const client = mysql.createConnection(process.env.CLEARDB_DATABASE_URL)

client.connect();

console.log('Connected to database')


module.exports = client
