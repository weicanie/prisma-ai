export function patchSchemaArrays(
	schema: any,
	options: {
		log?: boolean;
		defaultItems?: any;
	} = {}
): any {
	const { log, defaultItems = { type: 'object' } } = options;
	const newSchema = JSON.parse(JSON.stringify(schema));

	function processObject(node: any, path: string[]) {
		if (node?.properties) {
			Object.entries(node.properties).forEach(([key, prop]: [string, any]) => {
				if (Array.isArray(prop.type) && prop.type.length > 1) {
					prop.type = prop.type[0];
				}
				if (prop.type === 'array' && !prop.items) {
					prop.items = defaultItems;
					if (log) {
						console.log(`[SimplePatcher] 修补属性: ${path.join('.')}.${key}`, prop);
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
				console.log(`[SimplePatcher] 修补嵌套数组: ${path.join('.')}.items`, node.items);
			}
		}
	}

	if (newSchema.type === 'object') {
		processObject(newSchema, []);
	}

	return newSchema;
}
