import { Controller } from '@nestjs/common';
import { UserMemoryService } from './user-memory.service';

@Controller('user-memory')
export class UserMemoryController {
	constructor(private readonly userMemoryService: UserMemoryService) {}
}
