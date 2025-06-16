import { Controller } from '@nestjs/common';
import { AutoflowService } from './autoflow.service';

@Controller('autoflow')
export class AutoflowController {
  constructor(private readonly autoflowService: AutoflowService) {}
}
