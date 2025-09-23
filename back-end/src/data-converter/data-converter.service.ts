import { Injectable } from '@nestjs/common';

@Injectable()
export class DataConverterService {
    listToCSV<T extends Record<string, any>>(data: T[]): string {
        if (data.length === 0) return '';

        // Récupère les clés (en-têtes)
        const headers = Object.keys(data[0]).join(',');

        // Génère les lignes
        const rows = data.map((row) =>
            Object.values(row)
                .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`) // échappe guillemets + null/undefined
                .join(','),
        );

        return [headers, ...rows].join('\n');
    }
}
