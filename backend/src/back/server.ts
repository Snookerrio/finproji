// @ts-ignore
import express from 'express';
import mongoose from 'mongoose';
// @ts-ignore
import cors from 'cors';
import * as dotenv from 'dotenv';
// @ts-ignore
import swaggerUi from 'swagger-ui-express';
// @ts-ignore
import fs from 'fs';
// @ts-ignore
import path from 'path';
import { fileURLToPath } from 'url';


dotenv.config();

import authRoutes from './routes/auth.route.js';
import orderRoutes from './routes/order.route.js';
import adminRoutes from './routes/admin.route.js';
import { initAdmin } from './utils/initAdmin.util.js';

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = (express as any).default ? (express as any).default() : express();

try {
    const swaggerPath = path.join(__dirname, 'swagger.json');
    if (fs.existsSync(swaggerPath)) {
        const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    }
} catch (error) {
    console.error('❌ Failed to load swagger.json:', error);
}

app.use(cors({
    origin: ['http://localhost:5175', 'http://127.0.0.1:5175', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


const jsonParser = (express as any).json ? (express as any).json() : express.json();
app.use(jsonParser);

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 9000;


const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crm';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        await initAdmin();
        app.listen(Number(PORT), '0.0.0.0', () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
            console.log(`📄 Documentation available at http://localhost:${PORT}/api-docs`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        console.log('💡');
    });