import Order from '../models/order.model.js';
import ExcelJS from 'exceljs';

export const OrderService = {

    buildQuery: (filters: any, userSurname: string) => {
        const query: any = {};
        const {
            my, name, surname, email, phone, age, course,
            status, group, course_format, course_type,
            start_date, end_date
        } = filters;

        if (my === 'true') query.manager = userSurname;

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
            query.createdAt = {};
            if (start_date) query.createdAt.$gte = new Date(start_date);
            if (end_date) {
                const end = new Date(end_date);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }
        return query;
    },


    getAll: async (filters: any, userSurname: string) => {
        const query = OrderService.buildQuery(filters, userSurname);
        const { page = 1, sortBy = 'id', order = 'desc' } = filters;
        const limit = 25;

        const data = await Order.find(query)
            .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
            .skip((Number(page) - 1) * limit)
            .limit(limit);

        const total = await Order.countDocuments(query);

        return { data, total };
    },


    update: async (id: string, updateData: any, user: any) => {
        const order = await Order.findById(id);
        if (!order) throw new Error('Application not found');

        const isOwner = order.manager === user.surname;
        const isAdmin = user.role === 'admin';
        const hasNoManager = !order.manager || order.manager === 'null' || order.manager === 'NULL';


        if (updateData.status === 'New') {
            updateData.manager = null;
            updateData.manager_id = null;
        }

        else if (hasNoManager) {
            updateData.manager = user.surname;
            updateData.manager_id = user._id;


            if (!updateData.status || updateData.status === 'New' || !order.status || order.status === 'New') {
                updateData.status = 'In work';
            }
        }

        else if (!isOwner && !isAdmin) {
            const error: any = new Error('Forbidden: You cannot edit this application');
            error.status = 403;
            throw error;
        }

        return Order.findByIdAndUpdate(id, updateData, { new: true });
    },


    addComment: async (id: string, text: string, user: any) => {
        const order = await Order.findById(id);
        if (!order) throw new Error('Application not found');

        if (!order.manager || order.manager === 'null') {
            order.manager = user.surname;
            order.manager_id = user._id;
            order.status = 'In work';
        }

        if (!order.comments) order.comments = [];
        order.comments.push({
            text,
            author: user.surname,
            date: new Date()
        });

        return order.save();
    },


    getStats: async () => {
        const [total, inWork, allNull, agree, disagree, dubbing, newOrders] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ status: 'In work' }),
            Order.countDocuments({ status: null }),
            Order.countDocuments({ status: 'Agree' }),
            Order.countDocuments({ status: 'Disagree' }),
            Order.countDocuments({ status: 'Dubbing' }),
            Order.countDocuments({ status: 'New' })
        ]);

        return { total, inWork, allNull, agree, disagree, dubbing, new: newOrders };
    },


    generateExcel: async (filters: any, userSurname: string) => {
        try {
            const query = OrderService.buildQuery(filters, userSurname);
            const orders = await Order.find(query).sort({ createdAt: -1 }).lean();


            const WorkbookClass: any = (ExcelJS as any).Workbook || (ExcelJS as any).default?.Workbook;

            if (!WorkbookClass) {
                throw new Error("Could not find ExcelJS Workbook constructor");
            }

            const workbook = new WorkbookClass();
            const worksheet = workbook.addWorksheet('Orders');

            worksheet.columns = [
                { header: '№', key: 'display_id', width: 8 },
                { header: 'Name', key: 'name', width: 20 },
                { header: 'Surname', key: 'surname', width: 20 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'Phone', key: 'phone', width: 20 },
                { header: 'Course', key: 'course', width: 15 },
                { header: 'Status', key: 'status', width: 15 },
                { header: 'Manager', key: 'manager', width: 15 },
                { header: 'Date', key: 'createdAt', width: 20 }
            ];

            orders.forEach((order: any, index: number) => {
                worksheet.addRow({
                    display_id: orders.length - index,
                    name: order.name || '—',
                    surname: order.surname || '—',
                    email: order.email || '—',
                    phone: order.phone || '—',
                    course: order.course || '—',
                    status: order.status || 'New',
                    manager: order.manager || '—',
                    createdAt: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'
                });
            });

            // @ts-ignore
            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4CAF50' } };
            });

            return workbook;
        } catch (error) {
            console.error('❌ EXCEL SERVICE ERROR:', error);
            throw error;
        }
    }
};