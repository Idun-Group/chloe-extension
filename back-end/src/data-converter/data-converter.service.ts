import { Injectable } from '@nestjs/common';
import { stringify } from 'csv-stringify';

@Injectable()
export class DataConverterService {
    listToCSV<T extends Record<string, any>>(data: T[]): Promise<string> {
        return new Promise((resolve, reject) => {
            stringify(
                data,
                {
                    header: true, // Ajoute automatiquement les noms des colonnes (UTF-8)
                    delimiter: ',', // Séparateur virgule
                    quoted: true, // Met les valeurs entre guillemets si nécessaire
                    encoding: 'utf8', // Force l'encodage UTF-8
                    bom: true, // Ajoute le BOM UTF-8 pour une meilleure compatibilité Excel
                },
                (err, output) => {
                    if (err) {
                        return reject(err);
                    }
                    // Assure que la sortie est bien en UTF-8
                    resolve(output);
                },
            );
        });
    }
}
