export const authValidator = {

    password: (password: string): string | null => {
        if (password.length < 8) return "Password must be at least 8 characters long.";
        if (!/[A-Z]/.test(password)) return "Add at least one capital letter";
        if (!/[0-9]/.test(password)) return "Add at least one digit";
        if (!/[!@#$%^&*]/.test(password)) return "Add a special character (!@#$%^&*)";
        return null;
    },


    email: (email: string): string | null => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return "Incorrect email format";
        return null;
    }
};