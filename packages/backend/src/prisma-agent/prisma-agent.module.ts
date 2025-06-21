import { Module } from '@nestjs/common';
import { EventBusModule } from '../EventBus/event-bus.module';
import { ClientModule } from '../mcp-client/mcp-client.module';
import { ModelModule } from '../model/model.module';
import { OssModule } from '../oss/oss.module';
import { PromptModule } from '../prompt/prompt.module';
import { TaskQueueModule } from '../task-queue/task-queue.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';
import { KnowledgeVDBService } from './data_base/konwledge_vdb.service';
import { ProjectCodeVDBService } from './data_base/project_code_vdb.service';
import { PrismaAgentService } from './prisma-agent.service';

@Module({
	controllers: [],
	providers: [PrismaAgentService, ProjectCodeVDBService, KnowledgeVDBService],
	imports: [
		ModelModule,
		PromptModule,
		ClientModule,
		VectorStoreModule,
		TaskQueueModule,
		OssModule,
		EventBusModule
	],
	exports: [PrismaAgentService, ProjectCodeVDBService, KnowledgeVDBService]
})
export class PrismaAgentModule {}
