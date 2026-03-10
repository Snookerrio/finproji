import type {IComment} from "./comment.interface.ts";


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
    id:number;
}




