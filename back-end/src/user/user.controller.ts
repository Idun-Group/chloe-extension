import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserService } from './user.service';
import type { Request } from 'express';
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Req() req: Request) {
        const profile = this.userService.findByLinkedinId((req.user as { linkedinId: string }).linkedinId);
        return profile;
    }
}
