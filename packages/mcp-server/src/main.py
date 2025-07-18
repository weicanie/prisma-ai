import uvicorn
from fastapi import FastAPI
from mcp_server.api import router as api_router
from mcp_server.server import server as mcp_server

mcp_asgi_app = mcp_server.http_app(path='/sse',transport='sse')

app = FastAPI(
    title="MCP IO Server",
    description="一个通过MCP工具和REST API提供输入/输出功能的服务器。",
    version="1.0.0",
    lifespan=mcp_asgi_app.lifespan,
)

app.include_router(api_router)
app.mount("/mcp-server", mcp_asgi_app)


@app.get("/")
def read_root():
    """
    根路径，提供一个简单的欢迎信息，可用于健康检查。
    """
    return {"message": "Welcome to the MCP IO Server!"}


def main():
    """
    服务主入口函数。
    使用 uvicorn 启动 FastAPI 应用。
    """
    uvicorn.run("main:app", host="0.0.0.0", port=7123, reload=False)


if __name__ == "__main__":
    main() 