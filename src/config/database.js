const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Determine if we need to use SSL with CA certificate
const useSSLWithCA = process.env.NODE_ENV === 'production' || process.env.DB_USE_SSL_CA === 'true';

let sslConfig = false;
if (useSSLWithCA) {
    try {
        // Read CA certificate from root of project
        const caPath = path.resolve(process.cwd(), 'ca-certificate.crt');
        const caCert = fs.readFileSync(caPath).toString();
        
        sslConfig = {
            rejectUnauthorized: true,  // Enables certificate validation
            ca: caCert                 // DigitalOcean's CA certificate
        };
    } catch (error) {
        console.error('❌ Failed to read CA certificate:', error.message);
        throw new Error('CA certificate is required for SSL connection');
    }
}

// Create connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig,  // Use SSL config based on environment
    max: 100,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Test connection function
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Database connected successfully');
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Connection URL format:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'));
        return false;
    }
};

module.exports = { pool, testConnection };