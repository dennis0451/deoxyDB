const { Pool } = require('pg');

const pool = new Pool({
  user: 'dennis',    
  host: 'localhost',
  database: 'deoxyDB',      
  password: 'password',  
  port: 5432,
});

module.exports = pool;
