import * as fs from 'fs';

/**
 * @description 可视化工作流图
 */
export async function visualizeGraph(compiledGraph: any, filename: string) {
	const representation = await compiledGraph.getGraphAsync();
	const image = await representation.drawMermaidPng();
	const arrayBuffer = await image.arrayBuffer();
	const buffer = new Uint8Array(arrayBuffer);
	//写入文件
	fs.writeFileSync(`./graph_img/${filename}.png`, buffer);
}
