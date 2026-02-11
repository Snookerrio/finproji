import type { Request, Response } from 'express';
import User from '../models/user.model.ts';
import Order from '../models/order.model.ts';
import jwt from 'jsonwebtoken';


export const getAllManagers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;


        const managers = await User.find({ role: 'manager' })
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments({ role: 'manager' });


        const managersWithStats = await Promise.all(managers.map(async (manager) => {
            const stats = {
                total: await Order.countDocuments({ manager_id: manager._id }),
                agree: await Order.countDocuments({ manager_id: manager._id, status: 'Agree' }),
                inWork: await Order.countDocuments({ manager_id: manager._id, status: 'In work' })
            };
            return { ...manager.toObject(), stats };
        }));

        res.json({
            users: managersWithStats,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: 'Помилка отримання списку менеджерів' });
    }
};


export const createManager = async (req: Request, res: Response) => {
    try {
        const { email, name, surname } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Користувач вже існує' });

        const newManager = new User({
            email, name, surname,
            role: 'manager',
            is_active: false,
            is_banned: false
        });

        await newManager.save();
        res.status(201).json(newManager);
    } catch (error) {
        res.status(500).json({ message: 'Помилка при створенні менеджера' });
    }
};


export const createActivationToken = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const secret = process.env.JWT_SECRET || 'secret_key_fallback';

        const token = jwt.sign(
            { id, type: 'activate' },
            secret,
            { expiresIn: '30m' }
        );

        res.json({ token });
    } catch (error: any) {
        res.status(500).json({ message: 'Помилка генерації токена' });
    }
};


export const banUser = async (req: Request, res: Response) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { is_banned: true });
        res.json({ message: 'Користувача заблоковано' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка при блокуванні' });
    }
};

export const unbanUser = async (req: Request, res: Response) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { is_banned: false });
        res.json({ message: 'Користувача розблоковано' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка при розблокуванні' });
    }
};



export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = {
            total: await Order.countDocuments(),
            inWork: await Order.countDocuments({ status: 'In work' }),
            nullStatus: await Order.countDocuments({ status: null }),
            agree: await Order.countDocuments({ status: 'Agree' }),
            disagree: await Order.countDocuments({ status: 'Disagree' }),
            dubbing: await Order.countDocuments({ status: 'Dubbing' }),
            newStatus: await Order.countDocuments({ status: 'New' })
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Помилка статистики' });
    }
};