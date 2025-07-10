from asyncio import Lock
from collections import defaultdict
from asyncio import Queue
from typing import Any, DefaultDict


# 使用 defaultdict 为每个会话自动创建输入队列
# 键是会话 ID (str)，值是对应的 asyncio.Queue
input_queues: DefaultDict[str, Queue] = defaultdict(Queue)

# 使用字典来存储每个会话的输出
# 键是会话 ID (str)，值是 o_tool 返回的输出
output_storage: dict[str, Any] = {}

# 用于线程安全访问 output_storage 的锁
output_storage_lock = Lock() 