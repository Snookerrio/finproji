export const managerValidator = {

    name: (value: string, fieldName: string = "Поле"): string | null => {
        const nameRegex = /^[A-Z][a-z]*$/;

        if (!value) return `${fieldName} required to fill in`;

        if (!nameRegex.test(value)) {
            return `${fieldName} must be in English and start with a capital letter (for example: Ivan)`;
        }

        return null;
    }
};