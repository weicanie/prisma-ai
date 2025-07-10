from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from .state import input_queues, output_storage, output_storage_lock

# 创建一个 FastAPI APIRouter 实例，并设置统一的前缀 /agent
router = APIRouter(prefix="/agent")

# Pydantic 模型，用于验证 /input 接口的请求体
class InputPayload(BaseModel):
    data: str

# Pydantic 模型，用于定义 /output 接口的响应体
class OutputResponse(BaseModel):
    output: str


@router.post("/input/{session_id}", status_code=status.HTTP_202_ACCEPTED)
async def provide_input(session_id: str, payload: InputPayload):
    """
    接收外部输入并将其放入相应会话的队列中。
    这个接口是非阻塞的；它将输入放入队列后立即返回。
    """
    print(payload.data)
    # 将输入数据放入指定会话ID的队列中
    await input_queues[session_id].put(payload.data)
    print('input_queue',input_queues[session_id])
    return {"message": "Input received and queued."}


@router.get("/output/{session_id}", response_model=OutputResponse)
async def get_output(session_id: str):
    """
    获取指定会话的输出。
    如果输出已准备就绪，则返回输出并将其从存储中移除。
    否则，返回 404 Not Found 状态码。
    """
    # 使用锁确保对共享资源 output_storage 的并发访问是线程安全的
    async with output_storage_lock:
        # 尝试从存储中弹出（获取并删除）指定会话的输出
        output = output_storage.pop(session_id, None)

    if output is not None:
        # 如果找到输出，则返回它
        return {"output": output}
    else:
        # 如果未找到输出，则抛出 HTTP 404 异常
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Output not available for this session.",
        ) 