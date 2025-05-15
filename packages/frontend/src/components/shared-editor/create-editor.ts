// 本文件通过 @milkdown/plugin-collab 插件结合 yjs 实现多人协同编辑功能。
// 主要功能包括：
// 1. 多客户端内容实时同步（Sync between clients）
// 2. 远程光标显示（Remote cursor support）
// 3. 撤销/重做支持（Undo/Redo support）
// 4. 支持自定义房间切换、连接/断开、模板应用等操作

import { defaultValueCtx, Editor, rootCtx } from '@milkdown/kit/core';
import { commonmark } from '@milkdown/kit/preset/commonmark';
import { collab, CollabService, collabServiceCtx } from '@milkdown/plugin-collab';
import { nord } from '@milkdown/theme-nord';
import { WebsocketProvider } from 'y-websocket';
import { Doc } from 'yjs';

// 默认的 markdown 模板内容
const markdown = `
# Milkdown Vanilla Collab

> You're scared of a world where you're needed.

---

Now you can play!
`;
const name = ['Emma', 'Isabella', 'Emily', 'Madison', 'Ava'];

// 随机生成颜色，用于区分不同协作者
const randomColor = () => Math.floor(Math.random() * 16777215).toString(16);

// 生成协作者选项，每个名字分配一个随机颜色
const options = name.map(x => ({
	color: `#${randomColor()}`,
	name: x
}));

// 创建编辑器区域的 UI，包括模板输入、房间切换、连接/断开按钮等
const createArea = (area: HTMLElement) => {
	const templateForm = document.createElement('div');
	templateForm.classList.add('template-form');

	area.appendChild(templateForm);

	const textarea = document.createElement('textarea');
	textarea.classList.add('template');
	textarea.cols = 50;
	textarea.rows = 2;
	textarea.placeholder = 'Input some markdown here to apply template';
	templateForm.appendChild(textarea);
	const applyButton = document.createElement('button');
	applyButton.textContent = 'Apply';
	templateForm.appendChild(applyButton);

	const room = document.createElement('div');
	room.classList.add('room');
	area.appendChild(room);
	const toggleButton = document.createElement('button');
	toggleButton.textContent = 'Switch Room';
	room.appendChild(toggleButton);

	const roomDisplay = document.createElement('span');
	room.appendChild(roomDisplay);
	const roomValue = document.createElement('span');
	roomDisplay.appendChild(document.createTextNode('Room: '));
	roomDisplay.appendChild(roomValue);

	const buttonGroup = document.createElement('div');
	buttonGroup.classList.add('button-group');
	area.appendChild(buttonGroup);

	const connectButton = document.createElement('button');
	connectButton.textContent = 'Connect';
	buttonGroup.appendChild(connectButton);
	const disconnectButton = document.createElement('button');
	disconnectButton.textContent = 'Disconnect';
	buttonGroup.appendChild(disconnectButton);
	const status = document.createElement('span');
	status.classList.add('status');
	buttonGroup.appendChild(status);

	const statusValue = document.createElement('span');
	status.appendChild(document.createTextNode('Status: '));
	status.appendChild(statusValue);

	return {
		applyButton,
		textarea,
		toggleButton,
		connectButton,
		disconnectButton,
		status: statusValue,
		room: roomValue
	};
};

// WebSocket 服务器地址，实际部署时可切换为本地或线上
// const wsUrl = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${HOST}/__yjs__`;
const wsUrl = 'wss://demos.yjs.dev/ws';

// 协同管理器，封装了 yjs 文档、WebSocketProvider 及 collabService 的绑定与操作
class CollabManager {
	private room = 'milkdown'; // 当前房间名
	private doc!: Doc; // yjs 文档对象
	private wsProvider!: WebsocketProvider; // yjs websocket provider
	private area: HTMLElement; // 编辑器挂载区域
	public doms: {
		applyButton: HTMLButtonElement;
		textarea: HTMLTextAreaElement;
		toggleButton: HTMLButtonElement;
		connectButton: HTMLButtonElement;
		disconnectButton: HTMLButtonElement;
		status: HTMLSpanElement;
		room: HTMLSpanElement;
	};
	private readonly rndInt: number; // 随机分配的协作者身份
	constructor(
		private collabService: CollabService, // milkdown 协同服务
		area?: HTMLElement, // 编辑器挂载区域
		rndInt = Math.floor(Math.random() * 4) // 随机分配协作者身份
	) {
		this.area = area!;
		this.doms = createArea(area!); // 创建 UI 控件
		this.doms.room.textContent = this.room;
		this.rndInt = rndInt;
	}

	// 初始化/刷新协同文档与 provider，并应用模板
	flush(template: string) {
		this.doc?.destroy(); // 销毁旧的 yjs 文档
		this.wsProvider?.destroy(); // 销毁旧的 provider

		this.doc = new Doc(); // 新建 yjs 文档
		this.wsProvider = new WebsocketProvider(wsUrl, this.room, this.doc, { connect: true }); // 连接到指定房间
		// 设置本地协作者信息（用户名和颜色）
		this.wsProvider.awareness.setLocalStateField('user', options[this.rndInt]);
		// 监听连接状态变化，更新 UI
		this.wsProvider.on('status', (payload: { status: string }) => {
			this.doms.status.textContent = payload.status;
		});

		// 绑定 yjs 文档和协作者状态到 milkdown 协同服务
		this.collabService.bindDoc(this.doc).setAwareness(this.wsProvider.awareness);
		// 只在首次同步完成后应用模板，避免重复内容
		this.wsProvider.once('sync', async (isSynced: boolean) => {
			if (isSynced) {
				this.collabService.applyTemplate(template).connect();
			}
		});
	}

	// 手动连接协同服务
	connect() {
		this.wsProvider.connect();
		this.collabService.connect();
	}

	// 手动断开协同服务
	disconnect() {
		this.collabService.disconnect();
		this.wsProvider.disconnect();
	}

	// 应用新的模板内容（会断开再重连，强制覆盖）
	applyTemplate(template: string) {
		this.collabService
			.disconnect()
			.applyTemplate(template, () => true) // 始终应用模板
			.connect();
	}

	// 切换房间（可用于演示不同协同空间）
	toggleRoom() {
		this.room = this.room === 'milkdown' ? 'milkdown-sandbox' : 'milkdown';
		this.doms.room.textContent = this.room;

		const template = this.room === 'milkdown' ? markdown : '# Sandbox Room';
		this.disconnect();
		this.flush(template);
	}
}

// 创建并初始化 Milkdown 编辑器，挂载到指定 DOM
export const createEditor = async (root: string, area: string) => {
	const editor = await Editor.make()
		.config(ctx => {
			ctx.set(rootCtx, document.querySelector(root)); // 设置编辑器根节点
			ctx.set(defaultValueCtx, markdown); // 设置默认内容
		})
		.config(nord) // 使用 nord 主题
		.use(commonmark) // 支持 commonmark 语法
		.use(collab) // 启用协同插件
		.create();

	editor.action(ctx => {
		const collabService = ctx.get(collabServiceCtx); // 获取协同服务实例
		const collabManager = new CollabManager(
			collabService,
			document.querySelector(area) as HTMLElement
		);
		collabManager.flush(markdown); // 初始化协同文档

		// 绑定 UI 按钮事件
		collabManager.doms.connectButton.onclick = () => {
			collabManager.connect();
		};

		collabManager.doms.disconnectButton.onclick = () => {
			collabManager.disconnect();
		};

		collabManager.doms.applyButton.onclick = () => {
			collabManager.applyTemplate(collabManager.doms.textarea.value);
		};

		collabManager.doms.toggleButton.onclick = () => {
			collabManager.toggleRoom();
		};
	});

	return editor;
};
