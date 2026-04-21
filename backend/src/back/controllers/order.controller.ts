import { Request, Response } from 'express';
import { OrderService } from '../services/order.service.js';
import Group from '../models/group.model.js';

export const getOrders = async (req: any, res: Response) => {
    try {

        const result = await OrderService.getAll(req.query, req.user.surname);
        res.json(result);
    } catch (error: any) {

        res.status(400).json({ message: error.message || 'Error while receiving applications' });
    }
};

export const exportToExcel = async (req: any, res: Response) => {
    try {
        const workbook = await OrderService.generateExcel(req.query, req.user.surname);

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=orders.xlsx'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error: any) {
        console.error('❌ EXPORT ERROR:', error);

        res.status(400).json({ message: 'Excel export failed', error: error.message });
    }
};

export const updateOrder = async (req: any, res: Response) => {
    try {

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "No update data provided" });
        }

        const result = await OrderService.update(req.params.id, req.body, req.user);

        if (!result) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(result);
    } catch (error: any) {

        const status = error.status || 400;
        res.status(status).json({ message: error.message });
    }
};

export const addComment = async (req: any, res: Response) => {
    try {
        const { text } = req.body;
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ message: "Comment text cannot be empty" });
        }

        const result = await OrderService.addComment(req.params.id, text, req.user);
        res.json(result);
    } catch (error: any) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

export const getStatistics = async (req: Request, res: Response) => {
    try {
        const stats = await OrderService.getStats();
        res.json(stats);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Statistics error' });
    }
};

export const getGroups = async (req: Request, res: Response) => {
    try {
        const groups = await Group.find().exec();
        res.json(groups);
    } catch (error) {
        res.status(400).json({ message: 'Error loading groups' });
    }
};

export const createGroup = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ message: "Group name must be at least 2 characters long" });
        }

        const newGroup = new Group({ name: name.trim() });
        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (e: any) {

        res.status(400).json({ message: "The group name must be unique." });
    }
};