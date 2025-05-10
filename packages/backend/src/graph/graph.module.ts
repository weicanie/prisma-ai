import { Module } from '@nestjs/common';
import { ChainModule } from '../chain/chain.module';
import { GraphService } from './graph.service';
@Module({
	controllers: [],
	providers: [GraphService],
	imports: [ChainModule]
})
export class GraphModule {}
