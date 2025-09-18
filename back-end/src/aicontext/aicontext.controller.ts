import {
    Body,
    Controller,
    Get,
    Post,
    Put,
    Req,
    UseGuards,
} from '@nestjs/common';
import { AicontextService } from './aicontext.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateAIContextDto } from './dto/aicontext.dto';

@Controller('aicontext')
export class AicontextController {
    constructor(private readonly aicontextService: AicontextService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async getAIContexts(@Req() request) {
        const ownerId = request.user.id;
        return this.aicontextService.getAIContextsByOwner(ownerId);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createAIContext(@Req() request, @Body() body: CreateAIContextDto) {
        const ownerId = request.user.id;

        const { title, content, isDefault } = body;

        try {
            const newContext = await this.aicontextService.createAIContext(
                title,
                content,
                isDefault,
                ownerId,
            );

            if (isDefault) {
                // Optionally, you can implement logic to unset previous default contexts
                await this.aicontextService.setOtherContextsNonDefault(ownerId);
            }

            return newContext;
        } catch (error) {
            throw new Error('Failed to create AI context');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put('update')
    async updateAIContext(
        @Req() request,
        @Body()
        body: {
            contextId: string;
            title: string;
            content: string;
            isDefault: boolean;
        },
    ) {
        const ownerId = request.user.id;
        const { contextId, title, content, isDefault } = body;

        try {
            const updatedContext = await this.aicontextService.updateAIContext(
                contextId,
                title,
                content,
                ownerId,
                isDefault,
            );
            return updatedContext;
        } catch (error) {
            throw new Error('Failed to update AI context');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('delete')
    async deleteAIContext(@Req() request, @Body() body: { contextId: string }) {
        const ownerId = request.user.id;
        const { contextId } = body;

        try {
            const deletedContext = await this.aicontextService.deleteAIContext(
                contextId,
                ownerId,
            );
            return deletedContext;
        } catch (error) {
            throw new Error('Failed to delete AI context');
        }
    }
}
