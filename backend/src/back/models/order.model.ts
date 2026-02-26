import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    name: { type: String, default: null },
    surname: { type: String, default: null },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    age: { type: Number, default: null },
    course: {
        type: String,
        enum: ['FS', 'QACX', 'JCX', 'JSCX', 'FE', 'PCX', null],
        default: null
    },
    course_format: {
        type: String,
        enum: ['static', 'online', null],
        default: null
    },
    course_type: {
        type: String,
        enum: ['pro', 'minimal', 'premium', 'incubator', 'vip', null],
        default: null
    },
    status: {
        type: String,
        enum: ['In work', 'New', 'Agree', 'Disagree', 'Dubbing', null],
        default: 'New'
    },
    sum: { type: Number, default: null },
    alreadyPaid: { type: Number, default: null },
    group: { type: String, default: null },

    manager: { type: String, default: null },

    manager_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    utm: { type: String, default: null },
    msg: { type: String, default: null },

    comments: [{
        text: String,
        author: String,
        date: { type: Date, default: Date.now }
    }]
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});


const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order;