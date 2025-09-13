import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EducationController } from './education.controller';
import { EducationService } from './education.service';
import { Education, EducationSchema } from './entities/education.entity';

@Module({
	imports: [MongooseModule.forFeature([{ name: Education.name, schema: EducationSchema }])],
	controllers: [EducationController],
	providers: [EducationService],
	exports: [EducationService]
})
export class EducationModule {}
