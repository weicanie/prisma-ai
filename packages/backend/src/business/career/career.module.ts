import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CareerController } from './career.controller';
import { CareerService } from './career.service';
import { Career, CareerSchema } from './entities/career.entity';

@Module({
	imports: [MongooseModule.forFeature([{ name: Career.name, schema: CareerSchema }])],
	controllers: [CareerController],
	providers: [CareerService],
	exports: [CareerService]
})
export class CareerModule {}
