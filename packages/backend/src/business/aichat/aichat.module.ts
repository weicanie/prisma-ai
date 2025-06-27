import { forwardRef, Module } from '@nestjs/common';
import { ChainModule } from '../../chain/chain.module';
import { AichatController } from './aichat.controller';
import { AichatService } from './aichat.service';

@Module({
	controllers: [AichatController],
	providers: [AichatService],
	exports: [AichatService],
	imports: [forwardRef(() => ChainModule)]
})
export class AichatModule {}
