import { Module } from '@nestjs/common';
import { DataConverterService } from './data-converter.service';

@Module({
    providers: [DataConverterService],
    exports: [DataConverterService],
})
export class DataConverterModule {}
