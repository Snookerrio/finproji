import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';

export const login = async (req: Request, res: Response) => {
    try {

        const result = await AuthService.login(req.body);
        res.json(result);
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
};


export const refresh = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(401).json({ message: 'Refresh token is required' });
            return;
        }

        const tokens = await AuthService.refresh(refreshToken);
        res.json(tokens);
    } catch (error: any) {
        res.status(401).json({ message: error.message || 'Invalid refresh token' });
    }
};

export const activateManager = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, password } = req.body;
        const result = await AuthService.activate(token, password);
        res.json(result);
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Link has expired. (30 хв)' });
            return;
        }
        res.status(500).json({ message: 'Error: ' + error.message });
    }
};
