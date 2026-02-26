import User from '../models/user.model.js';
import bcrypt from 'bcrypt';


export const initAdmin = async () => {
    try {
        const adminEmail = 'admin@gmail.com';


        const hashedPassword = await bcrypt.hash('admin', 10);



        await User.findOneAndUpdate(
            { email: adminEmail },
            {
                $set: {
                    password: hashedPassword,
                    name: 'Admin',
                    surname: 'Adminych',
                    role: 'admin',
                    is_active: true,
                    is_banned: false
                }
            },
            { upsert: true, new: true }
        );

        console.log('🚀 Admin account synchronized: admin@gmail.com / admin');
    } catch (error) {
        console.error('❌ Error initializing admin:', error);
    }
};