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
