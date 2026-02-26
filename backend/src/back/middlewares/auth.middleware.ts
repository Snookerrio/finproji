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


            const secret = process.env.JWT_ACCESS_SECRET;

            if (!secret) {
                console.error("CRITICAL ERROR: JWT_ACCESS_SECRET not found in .env");
                return res.status(500).json({ message: 'Server configuration error' });
            }


            const decoded = jwt.verify(token, secret);


            req.user = decoded;

            next();
        } catch (error) {
            console.error('JWT Verification Error:', error);
            return res.status(401).json({ message: 'Unauthorized, token is invalid' });
        }
    } else {
        return res.status(401).json({ message: 'Unauthorized, token is invalid' });
    }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Access denied: administrator rights required' });
    }
};