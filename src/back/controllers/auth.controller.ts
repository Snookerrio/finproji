import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user.model.ts';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({ message: 'Невірний email або пароль' });


        if (user.is_banned) {
            return res.status(403).json({ message: 'Ваш акаунт заблоковано. Зверніться до адміністратора.' });
        }

        const isMatch = await bcrypt.compare(password, user.password) || password === user.password;
        if (!isMatch) return res.status(401).json({ message: 'Невірний email або пароль' });

        user.last_login = new Date();
        await user.save();

        const signFn = (jwt as any).sign || jwt;
        const token = signFn(
            { id: user._id, role: user.role, surname: user.surname },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user._id, email: user.email, name: user.name, surname: user.surname, role: user.role }
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

export const activateManager = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;
        const secret = process.env.JWT_SECRET || 'secret';

        const verifyFn = (jwt as any).verify || jwt;
        const decoded: any = verifyFn(token, secret);

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });


        user.password = password;
        user.is_active = true;
        await user.save();

        res.json({ message: 'Пароль успішно встановлено! Тепер ви можете увійти.' });
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Час дії посилання вичерпано (30 хв)' });
        }
        res.status(500).json({ message: 'Помилка: ' + error.message });
    }
};