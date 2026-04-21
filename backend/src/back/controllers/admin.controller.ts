import type { Request, Response } from 'express';
import { AdminService } from '../services/admin.service.js';
import User from '../models/user.model.js';
import { authValidator } from '../validators/auth.validator.js';

export const getAllManagers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const result = await AdminService.getAllManagers(page);
        res.json(result);
    } catch (error: any) {

        res.status(400).json({ message: error.message || 'Error retrieving list of managers' });
    }
};

export const createManager = async (req: Request, res: Response) => {
    try {
        const { email, name, surname } = req.body;


        const emailError = authValidator.email(email);
        if (emailError) {
            return res.status(400).json({ message: emailError });
        }

        if (!name || name.length < 2 || !surname || surname.length < 2) {
            return res.status(400).json({ message: "Name and Surname must be at least 2 characters long" });
        }


        const newManager = await AdminService.createManager(req.body);
        res.status(201).json(newManager);
    } catch (error: any) {

        const status = error.message.includes('exists') || error.name === 'ValidationError' ? 400 : 500;
        res.status(status).json({ message: error.message });
    }
};

export const createActivationToken = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // @ts-ignore
        const user = await User.findById(id).exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let token;
        if (user.is_active) {
            token = await AdminService.generateRecoveryToken(id);
        } else {
            token = await AdminService.generateActivationToken(id);
        }

        res.json({ token });
    } catch (error: any) {

        res.status(400).json({ message: 'Invalid ID or Token generation error' });
    }
};

export const banUser = async (req: Request, res: Response) => {
    try {
        const result = await AdminService.setBanStatus(req.params.id, true);
        if (!result) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User blocked' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid ID for blocking' });
    }
};

export const unbanUser = async (req: Request, res: Response) => {
    try {
        const result = await AdminService.setBanStatus(req.params.id, false);
        if (!result) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User unblocked' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid ID for unlocking' });
    }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await AdminService.getGlobalStats();
        res.json(stats);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Statistics error' });
    }
};