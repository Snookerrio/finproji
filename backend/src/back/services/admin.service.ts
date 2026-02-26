import User from '../models/user.model.js';
import Order from '../models/order.model.js';
import jwt from 'jsonwebtoken';
import {authValidator} from "../validators/auth.validator.js";



export const AdminService = {

    getAllManagers: async (page: number, limit: number = 5) => {
        const skip = (page - 1) * limit;
        const queryFilter = { role: { $in: ['manager', 'admin'] } };

        const [users, total] = await Promise.all([
            User.find(queryFilter)
                .select('-password')
                .sort({ role: 1, createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(queryFilter)
        ]);

        const usersWithStats = await Promise.all(users.map(async (userItem) => {
            const statsQuery = {
                $or: [
                    { manager_id: userItem._id },
                    { manager: userItem.surname }
                ]
            };

            const [totalCount, agreeCount, inWorkCount, disagreeCount, newCount] = await Promise.all([
                Order.countDocuments(statsQuery),
                Order.countDocuments({ ...statsQuery, status: 'Agree' }),
                Order.countDocuments({ ...statsQuery, status: 'In work' }),
                Order.countDocuments({ ...statsQuery, status: 'Disagree' }),
                Order.countDocuments({ ...statsQuery, status: 'New' })
            ]);

            return {
                ...userItem.toObject(),
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


        const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
        if (existingUser) throw new Error('A user with this Email already exists.');

        const newManager = new User({
            ...userData,
            role: 'manager',
            is_active: false,
            is_banned: false
        });

        return newManager.save();
    },


    generateActivationToken: (id: string) => {
        const secret = process.env.JWT_ACCESS_SECRET || 'secret_key_fallback';
        return jwt.sign({ id, type: 'activate' }, secret, { expiresIn: '30m' });
    },


    generateRecoveryToken: (id: string) => {
        const secret = process.env.JWT_ACCESS_SECRET || 'secret_key_fallback';
        return jwt.sign({ id, type: 'recovery' }, secret, { expiresIn: '30m' });
    },


    setBanStatus: (id: string, isBanned: boolean) => {
        return User.findByIdAndUpdate(id, { is_banned: isBanned }, { new: true });
    },


    getGlobalStats: async () => {
        const [total, inWork, nullStatus, agree, disagree, dubbing, newOrders] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ status: 'In work' }),
            Order.countDocuments({ status: null }),
            Order.countDocuments({ status: 'Agree' }),
            Order.countDocuments({ status: 'Disagree' }),
            Order.countDocuments({ status: 'Dubbing' }),
            Order.countDocuments({ status: 'New' })
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