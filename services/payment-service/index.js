require('dotenv').config();
const app = require('./src/app');
const { connectDatabase } = require('./src/config/database');

const PORT = process.env.PORT || 8004;

async function start() {
    try {
        // Connect to database
        await connectDatabase();
        console.log('Database connected');

        // Start workers
        console.log('Starting payment and webhook workers...');
        // Workers are automatically started when imported

        // Start HTTP server
        app.listen(PORT, () => {
            console.log(`Payment service listening on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('Failed to start service:', error);
        process.exit(1);
    }
}

start();
