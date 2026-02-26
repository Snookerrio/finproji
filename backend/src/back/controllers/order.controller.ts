import type { Request, Response } from 'express';

import Group from '../models/group.model.js';
import {OrderService} from "../services/order.service.js";

export const getOrders = async (req: any, res: Response) => {
    try {
        const result = await OrderService.getAll(req.query, req.user.surname);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error while receiving applications' });
    }
};

export const exportToExcel = async (req: any, res: Response) => {
    try {
        const workbook = await OrderService.generateExcel(req.query, req.user.surname);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=orders_export.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: 'Excel export failed' });
    }
};

export const updateOrder = async (req: any, res: Response) => {
    try {
        const result = await OrderService.update(req.params.id, req.body, req.user);
        res.json(result);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

export const addComment = async (req: any, res: Response) => {
    try {
        const { text } = req.body;
        const result = await OrderService.addComment(req.params.id, text, req.user);
        res.json(result);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

export const getStatistics = async (req: Request, res: Response) => {
    try {
        const stats = await OrderService.getStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Statistics error' });
    }
};

export const getGroups = async (req: Request, res: Response) => {
    try {
        res.json(await Group.find());
    } catch (error) {
        res.status(500).json({ message: 'Error loading groups' });
    }
};

export const createGroup = async (req: Request, res: Response) => {
    try {
        const newGroup = new Group({ name: req.body.name });
        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (e) {
        res.status(400).json({ message: "The group name must be unique." });
    }
};