
export function serializeData<T>(data: T): T {
    if (data === null || data === undefined) {
        return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(item => serializeData(item)) as unknown as T;
    }

    // Handle objects (excluding Date which is handled specially)
    if (typeof data === 'object' && !(data instanceof Date)) {
        const serialized: Record<string, any> = {};

        for (const [key, value] of Object.entries(data)) {
            // Special handling for Decimal objects - they have a 'toNumber' or 'toString' method
            if (value !== null &&
                typeof value === 'object' &&
                'toNumber' in value &&
                typeof value.toNumber === 'function') {
                serialized[key] = value.toNumber();
            } else {
                serialized[key] = serializeData(value);
            }
        }

        return serialized as T;
    }

    // Return primitive values and Date objects unchanged
    return data;
}