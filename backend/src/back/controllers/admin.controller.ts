import type { Request, Response } from 'express';
import { AdminService } from '../services/admin.service.js';
import User from '../models/user.model.js';

export const getAllManagers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const result = await AdminService.getAllManagers(page);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving list of managers' });
    }
};

export const createManager = async (req: Request, res: Response) => {
    try {
        const newManager = await AdminService.createManager(req.body);
        res.status(201).json(newManager);
    } catch (error: any) {
        const status = error.message === 'User already exists' ? 400 : 500;
        res.status(status).json({ message: error.message });
    }
};


export const createActivationToken = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        let token;

        if (user.is_active) {
            token = AdminService.generateRecoveryToken(id);
        } else {

            token = AdminService.generateActivationToken(id);
        }

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Token generation error' });
    }
};

export const banUser = async (req: Request, res: Response) => {
    try {
        await AdminService.setBanStatus(req.params.id, true);
        res.json({ message: 'User blocked' });
    } catch (error) {
        res.status(500).json({ message: 'Blocking error' });
    }
};

export const unbanUser = async (req: Request, res: Response) => {
    try {
        await AdminService.setBanStatus(req.params.id, false);
        res.json({ message: 'User unblocked' });
    } catch (error) {
        res.status(500).json({ message: 'Error while unlocking' });
    }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await AdminService.getGlobalStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Statistics error' });
    }
};