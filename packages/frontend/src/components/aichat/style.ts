import { createStyles } from 'antd-style';

export const useStyle = createStyles(({ token, css }) => {
	return {
		layout: css`
			width: 100%;
			min-width: 1000px;
			height: 100vh;
			display: flex;
			background: ${token.colorBgContainer};
			font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;
		`,
		// sider 样式
		sider: css`
			background: ${token.colorBgLayout}80;
			width: 280px;
			height: 100%;
			display: flex;
			flex-direction: column;
			padding: 0 12px;
			box-sizing: border-box;
		`,
		logo: css`
			display: flex;
			align-items: center;
			justify-content: start;
			padding: 0 24px;
			box-sizing: border-box;
			gap: 8px;
			margin: 24px 0;

			span {
				font-weight: bold;
				color: ${token.colorText};
				font-size: 16px;
			}
		`,
		addBtn: css`
			background: #1677ff0f;
			border: 1px solid #1677ff34;
			height: 40px;
		`,
		conversations: css`
			flex: 1;
			overflow-y: auto;
			margin-top: 12px;
			padding: 0;

			.ant-conversations-list {
				padding-inline-start: 0;
			}
		`,
		siderFooter: css`
			border-top: 1px solid ${token.colorBorderSecondary};
			height: 40px;
			display: flex;
			align-items: center;
			justify-content: space-between;
		`,
		// chat list 样式
		chat: css`
			height: 100%;
			width: 100%;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			padding-block: ${token.paddingLG}px;
			gap: 16px;
		`,
		chatPrompt: css`
			.ant-prompts-label {
				color: #000000e0 !important;
			}
			.ant-prompts-desc {
				color: #000000a6 !important;
				width: 100%;
			}
			.ant-prompts-icon {
				color: #000000a6 !important;
			}
		`,
		chatList: css`
			flex: 1;
			overflow: auto;
		`,
		loadingMessage: css`
			background-image: linear-gradient(90deg, #ff6b23 0%, #af3cb8 31%, #53b6ff 89%);
			background-size: 100% 2px;
			background-repeat: no-repeat;
			background-position: bottom;
		`,
		placeholder: css`
			padding-top: 32px;
		`,
		// sender 样式
		sender: css`
			width: 100%;
			max-width: 700px;
			margin: 0 auto;
		`,
		speechButton: css`
			font-size: 18px;
			color: ${token.colorText} !important;
		`,
		senderPrompt: css`
			width: 100%;
			max-width: 700px;
			margin: 0 auto;
			color: ${token.colorText};
		`
	};
});
