import styled from 'styled-components';

export const SheardEditorWrapper = styled.div`
	.milkdown {
		background-color: rgb(26, 26, 26);
		padding: 1rem 0.5rem;
		margin: 1.25rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.25rem;
	}

	.editor {
		margin-left: auto;
		margin-right: auto;
	}

	.template-form {
		display: flex;
		gap: 0.5rem;
		margin: 1.25rem;
	}

	.template-form textarea {
		padding: 0.5rem;
		background-color: rgb(26, 26, 26);
		border: 1px solid #e2e8f0;
		border-radius: 0.25rem;
		width: 100%;
	}

	.room {
		margin: 1.25rem;
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.button-group {
		margin: 1.25rem;
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	button {
		background-color: rgb(26, 26, 26);
		color: rgb(30, 41, 59);
		font-weight: 700;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
	}

	button:hover {
		background-color: rgb(26, 26, 26);
	}

	/* this is a rough fix for the first cursor position when the first paragraph is empty */
	.ProseMirror > .ProseMirror-yjs-cursor:first-child {
		margin-top: 16px;
	}
	.ProseMirror p:first-child,
	.ProseMirror h1:first-child,
	.ProseMirror h2:first-child,
	.ProseMirror h3:first-child,
	.ProseMirror h4:first-child,
	.ProseMirror h5:first-child,
	.ProseMirror h6:first-child {
		margin-top: 16px;
	}
	/* This gives the remote user caret. The colors are automatically overwritten*/
	.ProseMirror-yjs-cursor {
		position: relative;
		margin-left: -1px;
		margin-right: -1px;
		border-left: 1px solid black;
		border-right: 1px solid black;
		border-color: orange;
		word-break: normal;
		pointer-events: none;
	}
	/* This renders the username above the caret */
	.ProseMirror-yjs-cursor > div {
		position: absolute;
		top: -1.05em;
		left: -1px;
		font-size: 13px;
		background-color: rgb(250, 129, 0);
		font-family: serif;
		font-style: normal;
		font-weight: normal;
		line-height: normal;
		user-select: none;
		color: white;
		padding-left: 2px;
		padding-right: 2px;
		white-space: nowrap;
	}
`;
