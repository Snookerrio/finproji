import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user.model.ts';

export const AuthService = {
    login: async (email: string, password: string) => {
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error('Невірний email або пароль');
        }

        if (user.is_banned) {
            const error: any = new Error('Ваш акаунт заблоковано. Зверніться до адміністратора.');
            error.status = 403;
            throw error;
        }

        const isMatch = await bcrypt.compare(password, user.password) || password === user.password;
        if (!isMatch) {
            throw new Error('Невірний email або пароль');
        }

        user.last_login = new Date();
        await user.save();

        const secret = process.env.JWT_SECRET || 'secret';
        const token = jwt.sign(
            { id: user._id, role: user.role, surname: user.surname },
            secret,
            { expiresIn: '24h' }
        );

        return {
            token,
            user: { id: user._id, email: user.email, name: user.name, surname: user.surname, role: user.role }
        };
    },

    activate: async (token: string, password: string) => {
        const secret = process.env.JWT_SECRET || 'secret';
        const decoded: any = jwt.verify(token, secret);

        const user = await User.findById(decoded.id);
        if (!user) {
            throw new Error('Користувача не знайдено');
        }

        user.password = password;
        user.is_active = true;
        await user.save();

        return { message: 'Пароль успішно встановлено! Тепер ви можете увійти.' };
    }
};