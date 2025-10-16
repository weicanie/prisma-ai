import { Module } from '@nestjs/common';
import { TaskQueueModule } from '../../task-queue/task-queue.module';
import { ManageNotifactionService } from './manage-notifaction.service';
import { ManageServiceService } from './manage-service.service';
import { ManageUserService } from './manage-user.service';
import { ManageController } from './manage.controller';

@Module({
	controllers: [ManageController],
	providers: [ManageUserService, ManageServiceService, ManageNotifactionService],
	imports: [TaskQueueModule],
	exports: [ManageUserService, ManageServiceService, ManageNotifactionService]
})
export class ManageModule {}
