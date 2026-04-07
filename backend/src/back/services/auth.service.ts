// @ts-ignore
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const AuthService = {

    generateTokens: (payload: object) => {
        const accessSecret = process.env.JWT_ACCESS_SECRET as string;
        const refreshSecret = process.env.JWT_REFRESH_SECRET as string;

        const accessToken = jwt.sign(payload, accessSecret, {
            expiresIn: process.env.JWT_ACCESS_LIFETIME || '15m'
        });
        const refreshToken = jwt.sign(payload, refreshSecret, {
            expiresIn: process.env.JWT_REFRESH_LIFETIME || '7d'
        });

        return { accessToken, refreshToken };
    },

    login: async (credentials: { email: string; password: string }) => {
        const { email, password } = credentials;

        console.log('--- Login attempt ---');
        // @ts-ignore
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            throw new Error('Incorrect email or password');
        }

        if (!user.is_active) {
            throw new Error('The account has not yet been activated.');
        }

        if (user.is_banned) {
            const error: any = new Error('Your account has been blocked.');
            error.status = 403;
            throw error;
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Incorrect email or password');
        }

        user.last_login = new Date();
        await user.save();

        const tokens = AuthService.generateTokens({
            id: user._id,
            role: user.role,
            surname: user.surname
        });

        return {
            ...tokens,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                surname: user.surname,
                role: user.role
            }
        };
    },

    refresh: async (token: string) => {
        try {
            const refreshSecret = process.env.JWT_REFRESH_SECRET as string;
            const decoded: any = jwt.verify(token, refreshSecret);

            // @ts-ignore
            const user = await User.findById(decoded.id);
            if (!user || user.is_banned) throw new Error('Unauthorized');

            return AuthService.generateTokens({
                id: user._id,
                role: user.role,
                surname: user.surname
            });
        } catch (e) {
            throw new Error('Refresh token invalid or expired');
        }
    },


    activate: async (token: string, password: string) => {
        const accessSecret = process.env.JWT_ACCESS_SECRET as string;


        const decoded: any = jwt.verify(token, accessSecret);


        // @ts-ignore
        const user = await User.findById(decoded.id);
        if (!user) throw new Error('User not found');



        if (!user.action_token || user.action_token !== token) {
            const error: any = new Error('This link is invalid or has already been used.');
            error.status = 410;
            throw error;
        }


        if (decoded.type === 'activate' && user.is_active) {
            const error: any = new Error('This account has already been activated.');
            error.status = 400;
            throw error;
        }


        user.password = password;
        user.is_active = true;


        user.action_token = null;

        await user.save();
        console.log(`Success: Password for ${user.email} updated. Token invalidated.`);

        return { message: 'Password successfully updated!' };
    }
};