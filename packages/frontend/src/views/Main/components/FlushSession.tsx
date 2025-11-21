import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { sseUtil } from '../../../services/sse/util';
import { eventBusService, EventList } from '../../../utils/EventBus/event-bus.service';
/**
 * 释放用户当前会话。用户同一时间只能持有一个llm会话。可以用于手动清理无效的会话。
 */
function resetStatus() {
	localStorage.removeItem(sseUtil.sessionStatusKey);
	localStorage.removeItem(sseUtil.llmSessionKey);
	localStorage.removeItem(sseUtil.pathKey);
	localStorage.removeItem(sseUtil.modelKey);
}
export function FreeSession({ className }: { className?: string }) {
	const curSessionId = localStorage.getItem(sseUtil.llmSessionKey);
	const navigate = useNavigate();
	return (
		<>
			{curSessionId && (
				<Button
					variant={'ghost'}
					onClick={() => {
						if (curSessionId) {
							//释放后端用户会话
							sseUtil.freeSession(curSessionId);
						}
						//释放前端用户会话
						resetStatus();
						eventBusService.emit(EventList.sessionFree);
						navigate('#next-action');
					}}
					className={cn('dark:text-zinc-200 font-semibold', className)}
				>
					<Eraser></Eraser>
					释放当前对话
				</Button>
			)}
		</>
	);
}
