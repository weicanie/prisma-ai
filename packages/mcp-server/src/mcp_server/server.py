from .state import input_queues, output_storage, output_storage_lock
from fastmcp import FastMCP
server = FastMCP()
# TODO cursor 解析不出来参数的描述
@server.tool
async def get_input(session_id: str) -> str:
    """
    Agent调用此工具以获取用户输入。

    它会为指定的会话ID异步等待输入。当用户通过 /agent/input/{session_id} 接口进行输入后，
    此函数将返回收到的用户输入。

    :param session_id: 唯一的会话标识符。
    :return: 用户提供的输入字符串。
    """
    print('aaabbb!!!',session_id)
    # 从对应会话的队列中异步获取输入
    # 如果队列为空，`await` 将暂停此协程，直到有项目可用
    print('input_queue',input_queues[session_id])
    input_data = await input_queues[session_id].get()
    print('input_data',input_data)
    # 通知队列任务已完成
    input_queues[session_id].task_done()
    return input_data

@server.tool
async def return_output(session_id: str, output: str) -> str:
    """
    Agent调用此工具以返回输出。

    它会将 Agent 的输出存储在共享的哈希表中，键为会话ID。
    存储后的数据可以通过 /agent/output/{session_id} 接口供用户获取获取。

    :param session_id: 唯一的会话标识符。
    :param output: Agent 生成的输出字符串。
    :return: 一个确认消息，表示输出已成功接收和存储。
    """
    print('output',output)
    # 使用锁确保对共享资源 output_storage 的并发访问是线程安全的
    async with output_storage_lock:
        output_storage[session_id] = output
    print('output_storage',output_storage)
    return "Output received and stored." 

if __name__ == "__main__":
    server.run(transport='stdio')