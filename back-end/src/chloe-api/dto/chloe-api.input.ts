import { IsUrl } from 'class-validator';

export class ChloeGetContactInput {
    @IsUrl()
    linkedinUrl: string;
}
