import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'], // 入口文件
	format: ['esm', 'cjs'], // 输出格式：ESM和CommonJS
	dts: true, // 生成类型声明文件
	splitting: false, // 禁用代码分割
	sourcemap: true, // 生成源码映射文件
	clean: true // 构建前清理输出目录
});
