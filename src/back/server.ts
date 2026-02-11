import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();


import authRoutes from './routes/auth.route.ts';
import orderRoutes from './routes/order.route.ts';
import adminRoutes from './routes/admin.route.ts';
import { initAdmin } from './utils/initAdmin.util.ts';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


try {
    const swaggerPath = path.join(__dirname, 'swagger.json');
    const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
    console.error('❌ Failed to load swagger.json:', error);
}

app.use(cors({
    origin: ['http://localhost:5175', 'http://127.0.0.1:5175', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 9000;
const MONGO_URI = process.env.MONGO_URI || '';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB Atlas');
        await initAdmin();
        app.listen(Number(PORT), '0.0.0.0', () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
            console.log(`📄 Documentation available at http://localhost:${PORT}/api-docs`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
    });