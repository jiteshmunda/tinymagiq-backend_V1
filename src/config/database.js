const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { 
        rejectUnauthorized: false 
    } : false,
    max: 200,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

// Test connection function
const testConnection = async () => {
    let client;
    const maxAttempts = 5;
    const delay = 5000; // 5 seconds between retries
  
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔌 Testing database connection (attempt ${attempt}/${maxAttempts})...`);
        client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time');
        console.log('✅ Database connection successful!');
        console.log(`⏰ Current time: ${result.rows[0].current_time}`);
        return true;
      } catch (error) {
        console.error(`❌ Connection attempt ${attempt} failed: ${error.message}`);
        if (attempt < maxAttempts) {
          console.log(`⌛ Retrying in ${delay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } finally {
        if (client) client.release();
      }
    }
    console.error('💥 All connection attempts failed');
    return false;
  };

module.exports = { pool, testConnection };