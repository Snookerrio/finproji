import type { Request, Response } from 'express';
import Order from '../models/order.model.ts';
import Group from '../models/group.model.ts';
import ExcelJS from 'exceljs';


export const getOrders = async (req: any, res: Response) => {
    try {
        const {
            page = 1, sortBy = 'created_at', order = 'desc', my,
            name, surname, email, phone, age, course, status, group,
            course_format, course_type, start_date, end_date
        } = req.query;

        const limit = 25;
        const query: any = {};
        const currentUserSurname = req.user.surname;


        if (my === 'true') query.manager = currentUserSurname;


        if (name) query.name = { $regex: name, $options: 'i' };
        if (surname) query.surname = { $regex: surname, $options: 'i' };
        if (email) query.email = { $regex: email, $options: 'i' };
        if (phone) query.phone = { $regex: phone, $options: 'i' };


        if (age) query.age = Number(age);
        if (course) query.course = course;
        if (course_format) query.course_format = course_format;
        if (course_type) query.course_type = course_type;


        if (status) query.status = status === 'null' ? null : status;
        if (group) query.group = group === 'null' ? null : group;


        if (start_date || end_date) {
            query.created_at = {};
            if (start_date) query.created_at.$gte = new Date(start_date as string);
            if (end_date) {
                const end = new Date(end_date as string);
                end.setHours(23, 59, 59, 999);
                query.created_at.$lte = end;
            }
        }

        const sortOrder = order === 'asc' ? 1 : -1;
        const orders = await Order.find(query)
            .sort({ [sortBy as string]: sortOrder })
            .skip((Number(page) - 1) * limit)
            .limit(limit);

        const total = await Order.countDocuments(query);
        res.json({ data: orders, total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Помилка при отриманні заявок' });
    }
};


export const exportToExcel = async (req: any, res: Response) => {
    try {
        const { my, name, surname, email, phone, course, status, group, start_date, end_date } = req.query;
        const query: any = {};

        if (my === 'true') query.manager = req.user.surname;
        if (name) query.name = { $regex: name, $options: 'i' };
        if (surname) query.surname = { $regex: surname, $options: 'i' };
        if (email) query.email = { $regex: email, $options: 'i' };
        if (phone) query.phone = { $regex: phone, $options: 'i' };
        if (course) query.course = course;
        if (status) query.status = status === 'null' ? null : status;
        if (group) query.group = group === 'null' ? null : group;

        if (start_date || end_date) {
            query.created_at = {};
            if (start_date) query.created_at.$gte = new Date(start_date as string);
            if (end_date) {
                const end = new Date(end_date as string);
                end.setHours(23, 59, 59, 999);
                query.created_at.$lte = end;
            }
        }

        const orders = await Order.find(query).sort({ created_at: -1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Orders');

        worksheet.columns = [
            { header: 'ID', key: 'id_old', width: 10 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Surname', key: 'surname', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Phone', key: 'phone', width: 20 },
            { header: 'Course', key: 'course', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Manager', key: 'manager', width: 15 },
            { header: 'Created At', key: 'created_at', width: 20 }
        ];

        orders.forEach(order => {
            worksheet.addRow({
                id_old: (order as any).id_old || '',
                name: order.name,
                surname: order.surname,
                email: order.email,
                phone: order.phone,
                course: order.course,
                status: order.status,
                manager: order.manager,
                created_at: (order as any).created_at ? new Date((order as any).created_at).toLocaleString() : ''
            });
        });

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4CAF50' } };
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=orders_export.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Excel export failed' });
    }
};


export const updateOrder = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        const { surname: currentUserSurname, _id: currentUserId, role } = req.user;

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Заявку не знайдено' });

        const hasNoManager = !order.manager || order.manager === 'null';
        const isOwner = order.manager === currentUserSurname;
        const isAdmin = role === 'admin';


        if (!hasNoManager && !isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Ви не можете редагувати чужу заявку' });
        }


        if (hasNoManager) {
            updateData.manager = currentUserSurname;
            updateData.manager_id = currentUserId;
            if (!order.status || order.status === 'New') {
                updateData.status = 'In work';
            }
        }

        const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true });
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Помилка при оновленні' });
    }
};


export const addComment = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const { surname: currentUserSurname, _id: currentUserId, role } = req.user;

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Заявку не знайдено' });

        const hasNoManager = !order.manager || order.manager === 'null';
        const isOwner = order.manager === currentUserSurname;
        const isAdmin = role === 'admin';


        if (!hasNoManager && !isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Ви не можете коментувати чужу заявку' });
        }


        if (hasNoManager) {
            order.manager = currentUserSurname;
            order.manager_id = currentUserId;
        }


        if (!order.status || order.status === 'New' || order.status === 'null') {
            order.status = 'In work';
        }


        if (!order.comments) order.comments = [];
        order.comments.push({
            text,
            author: currentUserSurname,
            date: new Date()
        });

        await order.save();
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Помилка додавання коментаря' });
    }
};


export const getStatistics = async (req: Request, res: Response) => {
    try {
        res.json({
            total: await Order.countDocuments(),
            inWork: await Order.countDocuments({ status: 'In work' }),
            allNull: await Order.countDocuments({ status: null }),
            agree: await Order.countDocuments({ status: 'Agree' }),
            disagree: await Order.countDocuments({ status: 'Disagree' }),
            dubbing: await Order.countDocuments({ status: 'Dubbing' }),
            new: await Order.countDocuments({ status: 'New' })
        });
    } catch (error) {
        res.status(500).json({ message: 'Помилка статистики' });
    }
};


export const getGroups = async (req: Request, res: Response) => {
    try {
        const groups = await Group.find();
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Помилка завантаження груп' });
    }
};

export const createGroup = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const newGroup = new Group({ name });
        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (e) {
        res.status(400).json({ message: "Назва групи має бути унікальною" });
    }
};