import type { Request, Response } from 'express';
import { AdminService } from '../services/admin.service.ts';

export const getAllManagers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const result = await AdminService.getAllManagers(page);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Помилка отримання списку менеджерів' });
    }
};

export const createManager = async (req: Request, res: Response) => {
    try {
        const newManager = await AdminService.createManager(req.body);
        res.status(201).json(newManager);
    } catch (error: any) {
        const status = error.message === 'Користувач вже існує' ? 400 : 500;
        res.status(status).json({ message: error.message });
    }
};

export const createActivationToken = async (req: Request, res: Response) => {
    try {
        const token = AdminService.generateActivationToken(req.params.id);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Помилка генерації токена' });
    }
};

export const banUser = async (req: Request, res: Response) => {
    try {
        await AdminService.setBanStatus(req.params.id, true);
        res.json({ message: 'Користувача заблоковано' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка при блокуванні' });
    }
};

export const unbanUser = async (req: Request, res: Response) => {
    try {
        await AdminService.setBanStatus(req.params.id, false);
        res.json({ message: 'Користувача розблоковано' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка при розблокуванні' });
    }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await AdminService.getGlobalStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Помилка статистики' });
    }
};