import { forwardRef, Module } from '@nestjs/common';
import { EventBusModule } from '../EventBus/event-bus.module';
import { ClientModule } from '../mcp-client/mcp-client.module';
import { ModelModule } from '../model/model.module';
import { OssModule } from '../oss/oss.module';
import { PromptModule } from '../prompt/prompt.module';
import { TaskQueueModule } from '../task-queue/task-queue.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';
import { CRetrieveAgentService } from './c_retrieve_agent/c_retrieve_agent.service';
import { KnowledgeVDBService } from './data_base/konwledge_vdb.service';
import { ProjectCodeVDBService } from './data_base/project_code_vdb.service';
import { PlanExecuteAgentService } from './plan_execute_agent/plan_execute_agent.service';
import { PlanStepAgentService } from './plan_step_agent/plan_step_agent.service';
import { PrismaAgentService } from './prisma-agent.service';
import { ReflectAgentService } from './reflact_agent/reflact_agent.service';

@Module({
	controllers: [],
	providers: [
		PrismaAgentService,
		ProjectCodeVDBService,
		KnowledgeVDBService,
		CRetrieveAgentService,
		PlanExecuteAgentService,
		PlanStepAgentService,
		ReflectAgentService
	],
	imports: [
		ModelModule,
		PromptModule,
		ClientModule,
		VectorStoreModule,
		forwardRef(() => TaskQueueModule),
		OssModule,
		forwardRef(() => EventBusModule)
	],
	exports: [PrismaAgentService, KnowledgeVDBService]
})
export class PrismaAgentModule {}
