import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
	freeSession,
	llmSessionKey,
	modelKey,
	pathKey,
	sessionStatusKey
} from '../../../services/sse/sse';
import { eventBusService, EventList } from '../../../utils/EventBus/event-bus.service';
/**
 * 释放用户当前会话。用户同一时间只能持有一个llm会话。可以用于手动清理无效的会话。
 */
function resetStatus() {
	localStorage.removeItem(sessionStatusKey);
	localStorage.removeItem(llmSessionKey);
	localStorage.removeItem(pathKey);
	localStorage.removeItem(modelKey);
}
export function FreeSession() {
	const curSessionId = localStorage.getItem(llmSessionKey);
	const navigate = useNavigate();
	return (
		<>
			{curSessionId && (
				<Button
					variant={'ghost'}
					onClick={() => {
						if (curSessionId) {
							//释放后端用户会话
							freeSession(curSessionId);
						}
						//释放前端用户会话
						resetStatus();
						eventBusService.emit(EventList.sessionFree);
						navigate('#next-action');
					}}
					className="dark:text-zinc-200 font-semibold"
				>
					<Eraser></Eraser>
					清除当前对话
				</Button>
			)}
		</>
	);
}
