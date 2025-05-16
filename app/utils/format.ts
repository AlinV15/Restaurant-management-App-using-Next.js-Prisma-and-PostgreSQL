// /app/utils/format.ts
export function formatCurrency(value: number): string {
    return value.toLocaleString('ro-RO', {
        style: 'currency',
        currency: 'RON'
    });
}

export function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ro-RO');
}

export function convertToISO8601(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString();
}
