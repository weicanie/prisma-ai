# Anki 配置

## 安装和插件配置

没有使用过prisma-ai的anki集成功能的，请先按[anki配置教程](../教程：7、面试题库和%20anki集成教程.md)进行安装和配置。

然后在面试题2.0卡片模板中新增这两个字段：

![image-20250801081551946](C:\Users\user\Desktop\项目：简历到offer\prisma-ai\doc\hub\assets\image-20250801081551946.png)



## 开启 CORS

点击工具，点击插件。选中AnkiConnect，再点击右下角的插件设置。

![image-20250801081637276](C:\Users\user\Desktop\项目：简历到offer\prisma-ai\doc\hub\assets\image-20250801081637276.png)



用以下内容替换掉原内容：

```json
{
    "apiKey": null,
    "apiLogPath": null,
    "ignoreOriginList": [],
    "webBindAddress": "127.0.0.1",
    "webBindPort": 8765,
    "webCorsOriginList": [
        "http://localhost",
        "http://localhost:5173",
        "https://pinkprisma.com"
    ]
}
```

这是为了让prisma-ai hub的浏览器网页可以将你的面试题导入到你本地的Anki。
