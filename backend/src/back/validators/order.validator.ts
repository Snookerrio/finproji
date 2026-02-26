export const orderValidator = {
    age: (age: number): string | null => {
        if (age < 0 || age > 120) return "Age must be between 0 and 120";
        return null;
    },


    price: (total: number, paid: number): string | null => {
        if (paid > total) return "Payment cannot exceed the amount";
        return null;
    }
};