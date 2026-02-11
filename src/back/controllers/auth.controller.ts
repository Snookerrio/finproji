import type { Request, Response } from 'express';

import { AuthService } from '../services/auth.service.ts';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        res.json(result);
    } catch (error: any) {
        const status = error.status || 401;
        res.status(status).json({ message: error.message });
    }
};

export const activateManager = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, password } = req.body;
        const result = await AuthService.activate(token, password);
        res.json(result);
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Час дії посилання вичерпано (30 хв)' });
            return;
        }
        res.status(500).json({ message: 'Помилка: ' + error.message });
    }
};