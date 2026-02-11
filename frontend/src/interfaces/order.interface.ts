
export interface IUserStats {
    total: number;
    agree: number;
    inWork: number;
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


export interface IComment {
    _id?: string;
    text: string;
    author: string;
    date: string | Date;
}

export interface IOrder {
    _id: string;
    id_old?: number;
    name: string;
    surname: string;
    email: string;
    phone: string;
    age: number;
    course: string;
    course_format: string;
    course_type: string;
    status: string | null;
    sum: number | null;
    alreadyPaid: number | null;
    group: string | null;
    manager: string | null;
    comments: IComment[];
    created_at: string;
    utm?: string;
    msg?: string;
}


export interface IStats {
    total: number;
    inWork: number;
    allNull: number;
    agree: number;
    disagree: number;
    dubbing: number;
    new: number;
}

export interface IFilters {
    page: number;
    sortBy: string;
    order: 'asc' | 'desc';
    name: string;
    surname: string;
    email: string;
    phone: string;
    age: string;
    course: string;
    course_format: string;
    course_type: string;
    status: string;
    group: string;
    start_date: string;
    end_date: string;
    my: boolean;
}

export interface IGroup {
    _id?: string;
    name: string;
}