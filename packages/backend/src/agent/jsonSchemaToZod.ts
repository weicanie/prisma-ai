import { z } from 'zod';

/**
 * 将 OpenAI 函数参数的 JSON Schema 转换为 Zod Schema
 */
export function jsonSchemaToZod(schema: any): z.ZodTypeAny {
  // 处理数组
  if (schema.type === 'array') {
    const itemSchema = schema.items ? jsonSchemaToZod(schema.items) : z.any();
    let arraySchema = z.array(itemSchema);

    if (schema.minItems !== undefined)
      arraySchema = arraySchema.min(schema.minItems);
    if (schema.maxItems !== undefined)
      arraySchema = arraySchema.max(schema.maxItems);

    return addDescription(arraySchema, schema.description);
  }

  // 处理对象
  if (schema.type === 'object' || schema.properties) {
    const shape: Record<string, z.ZodTypeAny> = {};
    const required = new Set(schema.required || []);

    Object.entries(schema.properties || {}).forEach(
      ([key, propSchema]: [string, any]) => {
        const zodProp = jsonSchemaToZod(propSchema);
        shape[key] = required.has(key) ? zodProp : zodProp.optional();
      },
    );

    let objectSchema: z.ZodObject<typeof shape>;
    if (schema.additionalProperties !== false) {
      objectSchema = z.object(shape).passthrough();
    } else objectSchema = z.object(shape);

    return addDescription(objectSchema, schema.description);
  }

  // 处理字符串
  if (schema.type === 'string') {
    let stringSchema = z.string();

    if (schema.minLength !== undefined)
      stringSchema = stringSchema.min(schema.minLength);
    if (schema.maxLength !== undefined)
      stringSchema = stringSchema.max(schema.maxLength);
    if (schema.pattern)
      stringSchema = stringSchema.regex(new RegExp(schema.pattern));
    if (schema.format === 'email') stringSchema = stringSchema.email();
    if (schema.format === 'uri') stringSchema = stringSchema.url();

    if (schema.enum) {
      return addDescription(z.enum(schema.enum), schema.description);
    }

    return addDescription(stringSchema, schema.description);
  }

  // 处理数字
  if (schema.type === 'number' || schema.type === 'integer') {
    let numberSchema =
      schema.type === 'integer' ? z.number().int() : z.number();

    if (schema.minimum !== undefined)
      numberSchema = numberSchema.min(schema.minimum);
    if (schema.maximum !== undefined)
      numberSchema = numberSchema.max(schema.maximum);
    if (schema.exclusiveMinimum !== undefined)
      numberSchema = numberSchema.gt(schema.exclusiveMinimum);
    if (schema.exclusiveMaximum !== undefined)
      numberSchema = numberSchema.lt(schema.exclusiveMaximum);

    return addDescription(numberSchema, schema.description);
  }

  // 处理布尔值
  if (schema.type === 'boolean') {
    return addDescription(z.boolean(), schema.description);
  }

  // 处理空值
  if (schema.type === 'null') {
    return addDescription(z.null(), schema.description);
  }

  // 处理联合类型
  if (Array.isArray(schema.type)) {
    const schemas = schema.type.map((type: string) => {
      return jsonSchemaToZod({ ...schema, type });
    });
    return z.union(schemas);
  }

  // 处理 anyOf
  if (Array.isArray(schema.anyOf)) {
    const schemas = schema.anyOf.map(jsonSchemaToZod);
    return z.union(schemas);
  }

  // 处理 allOf
  if (Array.isArray(schema.allOf)) {
    // 这里简化处理，实际上可能需要更复杂的合并逻辑
    const merged = schema.allOf.reduce(
      (acc: any, curr: any) => ({ ...acc, ...curr }),
      {},
    );
    return jsonSchemaToZod(merged);
  }

  // 默认情况
  return z.any();
}

// 辅助函数：添加描述
function addDescription<T extends z.ZodTypeAny>(
  schema: T,
  description?: string,
): T {
  return description ? schema.describe(description) : schema;
}
