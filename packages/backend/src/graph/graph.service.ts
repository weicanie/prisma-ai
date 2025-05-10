import { Injectable } from '@nestjs/common';
import { ChainService } from '../chain/chain.service';

@Injectable()
export class GraphService {
	constructor(private chainService: ChainService) {}
}
