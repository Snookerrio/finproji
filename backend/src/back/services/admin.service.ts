import User from '../models/user.model.js';
import Order from '../models/order.model.js';

// @ts-ignore
import jwt from 'jsonwebtoken';
const sign = (jwt as any).default?.sign || jwt.sign;

import { authValidator } from "../validators/auth.validator.js";

export const AdminService = {

    getAllManagers: async (page: number, limit: number = 5) => {
        try {
            const skip = (page - 1) * limit;
            const queryFilter = { role: { $in: ['manager', 'admin'] } };


            const users = await (User as any).find(queryFilter)
                .select('-password')
                .sort({ role: 1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec();

            const total = await (User as any).countDocuments(queryFilter).exec();

            const usersWithStats = await Promise.all(users.map(async (userItem: any) => {
                const statsQuery = {
                    $or: [
                        { manager_id: userItem._id },
                        { manager: userItem.surname }
                    ]
                };

                const [totalCount, agreeCount, inWorkCount, disagreeCount, newCount] = await Promise.all([
                    (Order as any).countDocuments(statsQuery).exec(),
                    (Order as any).countDocuments({ ...statsQuery, status: 'Agree' }).exec(),
                    (Order as any).countDocuments({ ...statsQuery, status: 'In work' }).exec(),
                    (Order as any).countDocuments({ ...statsQuery, status: 'Disagree' }).exec(),
                    (Order as any).countDocuments({ ...statsQuery, status: 'New' }).exec()
                ]);

                return {
                    ...userItem,
                    stats: {
                        total: totalCount,
                        agree: agreeCount,
                        inWork: inWorkCount,
                        disagree: disagreeCount,
                        new: newCount
                    }
                };
            }));

            return {
                users: usersWithStats,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            };
        } catch (error: any) {
            console.error("🔥 Error in AdminService.getAllManagers:", error.message);
            throw error;
        }
    },

    createManager: async (userData: { email: string; name: string; surname: string }) => {
        const emailError = authValidator.email(userData.email);
        if (emailError) throw new Error(emailError);

        const nameRegex = /^[A-Z][a-z]*$/;
        if (!nameRegex.test(userData.name)) {
            throw new Error("The name must be in English and start with a capital letter.");
        }
        if (!nameRegex.test(userData.surname)) {
            throw new Error("The last name must be in English and begin with a capital letter.");
        }

        const existingUser = await (User as any).findOne({ email: userData.email.toLowerCase() }).exec();
        if (existingUser) throw new Error('A user with this Email already exists.');

        const newManager = new User({
            ...userData,
            role: 'manager',
            is_active: false,
            is_banned: false
        });

        return newManager.save();
    },

    generateActivationToken: async (id: string) => {
        const secret = process.env.JWT_ACCESS_SECRET || 'secret_key_fallback';
        const token = sign({ id, type: 'activate' }, secret, { expiresIn: '30m' });

        await (User as any).findByIdAndUpdate(id, { $set: { action_token: token } }).exec();
        return token;
    },

    generateRecoveryToken: async (id: string) => {
        const secret = process.env.JWT_ACCESS_SECRET || 'secret';
        const token = sign({ id, type: 'recovery' }, secret, { expiresIn: '30m' });

        await (User as any).findByIdAndUpdate(id, { $set: { action_token: token } }).exec();
        return token;
    },

    setBanStatus: async (id: string, isBanned: boolean) => {
        return (User as any).findByIdAndUpdate(id, { is_banned: isBanned }, { new: true }).exec();
    },

    getGlobalStats: async () => {
        const [total, inWork, nullStatus, agree, disagree, dubbing, newOrders] = await Promise.all([
            (Order as any).countDocuments().exec(),
            (Order as any).countDocuments({ status: 'In work' }).exec(),
            (Order as any).countDocuments({ status: null }).exec(),
            (Order as any).countDocuments({ status: 'Agree' }).exec(),
            (Order as any).countDocuments({ status: 'Disagree' }).exec(),
            (Order as any).countDocuments({ status: 'Dubbing' }).exec(),
            (Order as any).countDocuments({ status: 'New' }).exec()
        ]);

        return {
            total,
            inWork,
            nullStatus,
            agree,
            disagree,
            dubbing,
            new: newOrders
        };
    }
};