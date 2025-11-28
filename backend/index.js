import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from 'cors'; // CORS'u import etmeyi unutma

// Rota Dosyaları
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import routeRoutes from './routes/route.route.js';
import commentRoutes from './routes/comment.route.js';
import itineraryRoutes from './routes/itinerary.route.js';
import contactRoutes from './routes/contact.route.js';
import settingRoutes from './routes/settings.route.js';
import eventRoutes from './routes/event.route.js';
import messageRoutes from './routes/message.route.js';

// Veritabanı Bağlantısı
mongoose
    .connect(process.env.MONGO)
    .then(() => {
        console.log("✅ MongoDB is connected!");
    }).catch((err) => {
        console.log("❌ MongoDB Connection Error:", err);
    });

const app = express();
const port = process.env.PORT || 3000;

// --- CORS AYARLARI (Frontend ile İletişim İçin Şart) ---
app.use(cors({
    origin: 'http://localhost:5173', // Frontend adresin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Çerez/Token izni
}));

app.use(express.json());
app.use(cookieParser());

// --- ROTALAR ---
// (Verdiğin kodda /api/user tekil, /api/events çoğul kullanılmış. 
// Orijinal yapına sadık kalarak aynen ekliyorum)
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/setting', settingRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/messages', messageRoutes);

// --- HATA YAKALAMA ---
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error!';
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
});

// Sunucuyu Başlat (En sonda olması daha sağlıklıdır)
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});