/**
 * JSON Schema 修复函数
 * 1、修复 JSON Schema中异常的数组定义, 确保每个数组都有items属性
 * （实际开发中，很多 schema 可能遗漏 items 字段，导致部分工具或 AI 模型无法正确解析或推理数据结构）。
 * 2、兼容性处理：将 type 属性数组替换为其第一个元素
 * （为了兼容性,有些工具和平台不支持数组type。
 *  type: ["string", "null"] 表示可以为字符串或 null, 转换为 type: "string"）。
 * @param schema 原始JSON Schema
 * @param options 配置项（可选）
 * @returns 修补后的Schema
 * @example
 * ```ts
 * const toolsResult = await this.client.listTools();
 * toolsResult.tools.map((tool: MCPTool) => ({
				type: 'function',
				function: {
					name: tool.name,
					description: tool.description,
					parameters: patchSchemaArrays(tool.inputSchema) || {}
				}
			}));
	下面是一个需要修补的 schema 示例，它存在修复函数要解决的两类问题
	{
  "type": "object",
  "properties": {
    "tags": {
      "type": "array"
      // 缺少 items 字段
    },
    "name": {
      "type": ["string", "null"] // type 为数组
    },
    "children": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "values": {
            "type": "array"
            // 这里也缺少 items 字段
          }
        }
      }
    }
  }
}
	修补后：
{
  "type": "object",
  "properties": {
    "tags": {
      "type": "array",
      "items": "undefined" // 这里会被修补为 defaultItems,默认为 undefined
    },
    "name": {
      "type": "string"
    },
    "children": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "values": {
            "type": "array",
            "items": "undefined" 
          }
        }
      }
    }
  }
}
 * ```
 */
export function patchSchemaArrays(
  schema: any,
  options: {
    defaultItems?: any; // 无 items 属性,则以 defaultItems 作为 items 属性
    log?: boolean;
  } = { log: true, defaultItems: undefined },
): any {
  const { log, defaultItems } = options;
  const newSchema = JSON.parse(JSON.stringify(schema));

  /**
   *
   * @param node 用于递归处理对象
   * @param path 用于记录路径
   */
  function processObject(node: any, path: string[]) {
    if (node?.properties) {
      Object.entries(node.properties).forEach(([key, prop]: [string, any]) => {
        if (Array.isArray(prop.type) && prop.type.length > 1) {
          prop.type = prop.type[0];
        }
        if (prop.type === 'array' && !prop.items) {
          prop.items = defaultItems;
          if (log) {
            console.log(
              `[SimplePatcher] 修补属性: ${path.join('.')}.${key}`,
              prop,
            );
          }
        }
        if (prop.type === 'object') {
          processObject(prop, [...path, key]);
        }
      });
    }

    if (node?.items && node.items.type === 'array' && !node.items.items) {
      node.items.items = defaultItems;
      if (log) {
        console.log(
          `[SimplePatcher] 修补嵌套数组: ${path.join('.')}.items`,
          node.items,
        );
      }
    }
  }

  if (newSchema.type === 'object') {
    processObject(newSchema, []);
  }

  return newSchema;
}
