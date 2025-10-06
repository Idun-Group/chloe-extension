import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class ChloeApiService {
    constructor(private readonly configService: ConfigService) {}
    async getUserData(
        email: string,
        linkedinUrl: string,
        dataType: 'email' | 'phone',
    ): Promise<{ profileEmail?: string; profilePhone?: string } | undefined> {
        const payload = {
            query: 'Hello',
            session_id: randomUUID(),
            user_id: email,
            task_type: 'ENRICH_MAIL',
            linkedin_url: linkedinUrl,
            return_fields: ['profile'],
        };

        const payloadJson = JSON.stringify(payload);
        console.log('Chloe API request payload:', payloadJson);

        const response = await fetch(
            `https://sales-agent-api-102305464279.europe-west1.run.app/chat`,
            {
                method: 'POST',
                headers: {
                    'x-api-key': `${this.configService.get('CHLOE_API_SECRET_KEY')}`,
                    'Content-Type': 'application/json', // ✅ Indique que le body est du JSON
                },
                body: payloadJson,
            },
        );

        console.log('Chloe API raw response status:', response.status);

        if (!response.ok) {
            console.error('Chloe API error response:', await response.text());
            throw new Error(
                `Chloe API request failed with status ${response.status}`,
            );
        }

        console.log('Chloe API response OK, parsing JSON...');

        const result = (await response.json()) as {
            status: string;
            data: {
                profile: { email: string; phone: string };
            };
        };

        console.log('Chloe API response:', result);

        if (result.status === 'success') {
            return {
                email: { profileEmail: result.data.profile.email },
                phone: { profilePhone: result.data.profile.phone },
            }[dataType];
        }
    }
}
