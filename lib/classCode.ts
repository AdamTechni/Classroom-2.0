// Utility function to generate random class codes
export function generateClassCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

// Format code for display (XXX-XXX)
export function formatClassCode(code: string): string {
    if (code.length !== 6) return code;
    return `${code.slice(0, 3)}-${code.slice(3)}`;
}

// Validate class code format
export function isValidClassCodeFormat(code: string): boolean {
    const cleanCode = code.replace(/-/g, '').toUpperCase();
    return /^[A-Z0-9]{6}$/.test(cleanCode);
}
