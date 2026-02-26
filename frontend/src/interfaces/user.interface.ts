export interface IUserStats {
    total: number;
    agree: number;
    inWork: number;
    disagree: number; // Додаємо це поле
    new: number;
}

export interface IUser {
    _id: string;
    id?: string;
    email: string;
    name: string;
    surname: string;
    role: 'admin' | 'manager';
    is_active: boolean;
    is_banned: boolean;
    last_login: string | null;
    stats?: IUserStats;
}
