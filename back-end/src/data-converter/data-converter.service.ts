import { Injectable } from '@nestjs/common';
import { stringify } from 'csv-stringify';

@Injectable()
export class DataConverterService {
    listToCSV<T extends Record<string, any>>(data: T[]): Promise<string> {
        return new Promise((resolve, reject) => {
            stringify(
                data,
                {
                    header: true, // Ajoute automatiquement les noms des colonnes
                    delimiter: ',', // Séparateur virgule
                    quoted: true, // Met les valeurs entre guillemets si nécessaire
                },
                (err, output) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(output);
                },
            );
        });
    }
}
