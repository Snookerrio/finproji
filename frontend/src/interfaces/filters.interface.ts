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
