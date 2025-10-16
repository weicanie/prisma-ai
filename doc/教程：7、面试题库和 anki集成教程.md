# 集成面试题库和 anki

## 一、安装和配置 anki

### 安装anki

打开 [anki官网](https://apps.ankiweb.net/) 安装anki客户端。

### 安装插件

打开anki客户端，打开工具-插件

点击获取插件，依次输入以下数字代码并点击确定：
<br>

2055492159：[AnkiConnect](https://ankiweb.net/shared/info/2055492159)
<br>

728482867：[Anki X Markdown X MindMap](https://ankiweb.net/shared/info/728482867)
<br>

2100166052：[Better Markdown Anki](https://ankiweb.net/shared/info/2100166052)
<br>

全部安装完毕后重启anki。

### 配置

点击文件-导入，导入项目中的[anki配置文件](./anki配置.colpkg)即可。

## 二、获取面试题库

## 流程

```
前端题库域名: https://fe.ecool.fun,
前端题库数据列表页: https://fe.ecool.fun/topic-list,
后端题库域名: https://java.mid-life.vip,
后端题库数据列表页: https://java.mid-life.vip/topic-list
```

<br>
打开客户端的面向offer学习/集成面试题库和 anki页面，
填写表单并提交，然后耐心等待数据导入完毕即可。

## 须知

建议在弹出的自动化浏览器窗口中点击免费题目标签，以只导入免费题目。
<br>

否则会因为未登录或者没有vip（一周七八块）而导致数据导入失败。
<br>

**如果你登录了并且是vip，理论上可以导入你能访问的任意题目**，但这会有什么后果呢？
<br>

作者并没有发现上述题库网站有什么用户协议，也没有发现上述题库网站有规范爬虫行为的robots.txt，所以无法给出判断和建议。
<br>

那没有限制岂不是无限制？这也未必，**比如你拿来自己学习可能一点问题都没有**，但你拿人家题库数据去卖钱，我觉得很可能会被法律制裁。

## 三、生成题目思维导图

llm生成思维导图，token消耗会比较大，建议在晚上00:30~8:30的打折时段进行，并准备充足的deepseek余额。
<br>

参考余额

- 白天：前端题库9元左右，后端题库6元左右
- 晚上打折时间段：前端题库5元左右，后端题库3元左右

<br>

思维导图生成完全是可选的，但思维导图对于面试题的理解和记忆帮助是相当大的，所以建议还是生成！

## 四、题库上传 anki

保持anki软件打开即可。

因为anki要打开才能连里边数据库。
