import { forwardRef, Module } from '@nestjs/common';

import { ChainModule } from '../../chain/chain.module';
import { EventBusModule } from '../../EventBus/event-bus.module';
import { SseSessionManagerModule } from '../../manager/sse-session-manager/sse-session-manager.module';
import { ClientModule } from '../../mcp-client/mcp-client.module';
import { ModelModule } from '../../model/model.module';
import { OssModule } from '../../oss/oss.module';
import { PromptModule } from '../../prompt/prompt.module';
import { TaskQueueModule } from '../../task-queue/task-queue.module';
import { VectorStoreModule } from '../../vector-store/vector-store.module';
import { ProjectModule } from '../project/project.module';
import { AgentConversationService } from './agent-conversation.service';
import { CRetrieveAgentService } from './c_retrieve_agent/c_retrieve_agent.service';
import { KnowledgeVDBService } from './data_base/konwledge_vdb.service';
import { ProjectCodeVDBService } from './data_base/project_code_vdb.service';
import { PlanExecuteAgentService } from './plan_execute_agent/plan_execute_agent.service';
import { PlanStepAgentService } from './plan_step_agent/plan_step_agent.service';
import { PrismaAgentController } from './prisma-agent.controller';
import { PrismaAgentService } from './prisma-agent.service';
import { ReflectAgentService } from './reflect_agent/reflect_agent.service';
/**
 * 1、项目亮点实现 agent
 * 2、项目代码知识库、项目文档知识库
 */
@Module({
	controllers: [PrismaAgentController],
	providers: [
		PrismaAgentService,
		ProjectCodeVDBService,
		KnowledgeVDBService,
		CRetrieveAgentService,
		PlanExecuteAgentService,
		PlanStepAgentService,
		ReflectAgentService,
		AgentConversationService
	],
	imports: [
		ModelModule,
		PromptModule,
		ClientModule,
		VectorStoreModule,
		OssModule,
		EventBusModule,
		TaskQueueModule,
		SseSessionManagerModule,
		forwardRef(() => ProjectModule),
		forwardRef(() => ChainModule)
	],
	exports: [
		PrismaAgentService,
		KnowledgeVDBService,
		ProjectCodeVDBService,
		CRetrieveAgentService,
		ReflectAgentService
	]
})
export class PrismaAgentModule {}
