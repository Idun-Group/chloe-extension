import { IsOptional, IsString, IsUrl } from 'class-validator';

export default class CreatePeopleProfileDto {
    @IsString() profileListId!: string;

    @IsUrl() linkedinUrl!: string;

    @IsOptional() @IsString() job?: string;
    @IsString() fullName!: string;
    @IsString() location!: string;
    @IsOptional() @IsString() phone?: string;
    @IsOptional() @IsString() email?: string;
}
