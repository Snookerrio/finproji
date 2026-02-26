import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
    email: string;
    password?: string;
    name: string;
    surname: string;
    role: 'admin' | 'manager';
    is_active: boolean;
    is_banned: boolean;
    last_login: Date | null;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager'], default: 'manager' }, //
    is_active: { type: Boolean, default: false },
    is_banned: { type: Boolean, default: false },
    last_login: { type: Date, default: null }
}, { timestamps: true });


UserSchema.pre<IUser>('save', async function(next) {

    if (!this.isModified('password') || !this.password) {
        return next();
    }

    try {

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err: any) {
        next(err);
    }
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;

    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);