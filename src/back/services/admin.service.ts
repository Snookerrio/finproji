import User from '../models/user.model.ts';
import Order from '../models/order.model.ts';
import jwt from 'jsonwebtoken';

export const AdminService = {
    getAllManagers: async (page: number, limit: number = 5) => {
        const skip = (page - 1) * limit;

        const [managers, total] = await Promise.all([
            User.find({ role: 'manager' })
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments({ role: 'manager' })
        ]);

        const managersWithStats = await Promise.all(managers.map(async (manager) => {

            const [totalCount, agreeCount, inWorkCount] = await Promise.all([
                Order.countDocuments({ manager_id: manager._id }),
                Order.countDocuments({ manager_id: manager._id, status: 'Agree' }),
                Order.countDocuments({ manager_id: manager._id, status: 'In work' })
            ]);

            return {
                ...manager.toObject(),
                stats: { total: totalCount, agree: agreeCount, inWork: inWorkCount }
            };
        }));

        return {
            users: managersWithStats,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    },

    createManager: async (userData: { email: string; name: string; surname: string }) => {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) throw new Error('Користувач вже існує');

        const newManager = new User({
            ...userData,
            role: 'manager',
            is_active: false,
            is_banned: false
        });

        return newManager.save();
    },

    generateActivationToken: (id: string) => {
        const secret = process.env.JWT_SECRET || 'secret_key_fallback';

        return jwt.sign({ id, type: 'activate' }, secret, { expiresIn: '30m' });
    },

    setBanStatus: (id: string, isBanned: boolean) => {
        return User.findByIdAndUpdate(id, { is_banned: isBanned });
    },

    getGlobalStats: async () => {
        const [total, inWork, nullStatus, agree, disagree, dubbing, newStatus] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ status: 'In work' }),
            Order.countDocuments({ status: null }),
            Order.countDocuments({ status: 'Agree' }),
            Order.countDocuments({ status: 'Disagree' }),
            Order.countDocuments({ status: 'Dubbing' }),
            Order.countDocuments({ status: 'New' })
        ]);

        return { total, inWork, nullStatus, agree, disagree, dubbing, newStatus };
    }
};