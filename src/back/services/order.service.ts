import Order from '../models/order.model.ts';
import ExcelJS from 'exceljs';

export const OrderService = {

    buildQuery: (filters: any, userSurname: string) => {
        const query: any = {};
        const { my, name, surname, email, phone, age, course, status, group, course_format, course_type, start_date, end_date } = filters;

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
            query.created_at = {};
            if (start_date) query.created_at.$gte = new Date(start_date);
            if (end_date) {
                const end = new Date(end_date);
                end.setHours(23, 59, 59, 999);
                query.created_at.$lte = end;
            }
        }
        return query;
    },

    getAll: async (filters: any, userSurname: string) => {
        const query = OrderService.buildQuery(filters, userSurname);
        const { page = 1, sortBy = 'created_at', order = 'desc' } = filters;
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
        if (!order) throw new Error('Заявку не знайдено');

        const hasNoManager = !order.manager || order.manager === 'null';
        const isOwner = order.manager === user.surname;
        const isAdmin = user.role === 'admin';

        if (!hasNoManager && !isOwner && !isAdmin) {
            const error: any = new Error('Ви не можете редагувати чужу заявку');
            error.status = 403;
            throw error;
        }

        if (hasNoManager) {
            updateData.manager = user.surname;
            updateData.manager_id = user._id;
            if (!order.status || order.status === 'New') updateData.status = 'In work';
        }

        return Order.findByIdAndUpdate(id, updateData, { new: true });
    },

    addComment: async (id: string, text: string, user: any) => {
        const order = await Order.findById(id);
        if (!order) throw new Error('Заявку не знайдено');

        const canEdit = !order.manager || order.manager === 'null' || order.manager === user.surname || user.role === 'admin';
        if (!canEdit) {
            const error: any = new Error('Ви не можете коментувати чужу заявку');
            error.status = 403;
            throw error;
        }

        if (!order.manager || order.manager === 'null') {
            order.manager = user.surname;
            order.manager_id = user._id;
        }

        if (!order.status || order.status === 'New' || order.status === 'null') order.status = 'In work';

        if (!order.comments) order.comments = [];
        order.comments.push({ text, author: user.surname, date: new Date() });

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
        const query = OrderService.buildQuery(filters, userSurname);
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

        return workbook;
    }
};