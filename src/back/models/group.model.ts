import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
});

export default mongoose.model('Group', GroupSchema);