import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: any;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;


    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];

            if (!process.env.JWT_SECRET) {
                return res.status(500).json({ message: 'Помилка конфігурації сервера (JWT_SECRET)' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            console.error('JWT Verification Error:', error);
            return res.status(401).json({ message: 'Неавторизовано, токен недійсний' });
        }
    } else {
        return res.status(401).json({ message: 'Неавторизовано, токен відсутній' });
    }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Доступ заборонено: потрібні права адміністратора' });
    }
};