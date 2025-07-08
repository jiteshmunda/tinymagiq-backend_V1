const { Pool } = require('pg');
// const fs = require('fs'); // No longer needed for reading CA from file
// const path = require('path'); // No longer needed for file path resolution
require('dotenv').config();

// Determine if we need to use SSL with CA certificate
// This condition is still good for local dev vs. production environment logic
const useSSLWithCA = process.env.NODE_ENV === 'production' || process.env.DB_USE_SSL_CA === 'true';

let sslConfig = false;
if (useSSLWithCA) {
    // In App Platform, we get the CA certificate content directly from an environment variable
    const caCert = process.env.DB_CA_CERT; // Get the CA certificate content from env var

    if (!caCert) {
        console.error('❌ DB_CA_CERT environment variable is not set!');
        throw new Error('DB_CA_CERT environment variable is required for SSL connection in production/SSL CA mode.');
    }

    sslConfig = {
        rejectUnauthorized: true,  // Enables certificate validation
        ca: caCert                 // DigitalOcean's CA certificate
    };
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