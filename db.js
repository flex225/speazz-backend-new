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

let client

function handleDisconnect() {
  client = mysql.createConnection(process.env.CLEARDB_DATABASE_URL)
                                                

  client.connect(function(err) {             
    if(err) {                                    
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);
    } else {                                    
      console.log('Connected to database')
    }
  });                                    
                                        
  client.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();                        
    } else {                                     
      throw err;                                 
    }
  });
}

handleDisconnect();



module.exports = () => client
