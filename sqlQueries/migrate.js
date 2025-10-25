const { Client } = require('pg');
const fs = require('fs');

// PostgreSQL connection configuration
const client = new Client({
  host: 'dpg-d3okcuqli9vc73c7t2m0-a.oregon-postgres.render.com',
  port: 5432,
  user: 'growable_user',
  password: 'iARz9pp3QwGaTZBZba38bsRufHmQwqN5',
  database: 'growable', // default DB
  ssl: {
    rejectUnauthorized: false, // disables strict SSL certificate validation (useful for self-signed certs)
  },
});

async function runSQLFile(filePath) {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    
    // const sql = fs.readFileSync(filePath, 'utf-8');

    // const queries = sql
    //   .split(';')
    //   .map(q => q.trim())
    //   .filter(q => q.length);

    // for (const query of queries) {
    //   console.log(`Running query: ${query}`);
    //   await client.query(query);
    // }

    // console.log("All queries executed successfully.");
  } catch (err) {
    console.error("Error executing queries:", err);
  } finally {
    await client.end();
    console.log("Connection closed.");
  }
}

runSQLFile('./queries.sql');
