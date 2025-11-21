import { Toolbar } from 'markmap-toolbar';
import 'markmap-toolbar/dist/style.css';
import { Markmap } from 'markmap-view';
import React, { useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallbackWithReset } from '../ErrorFallbackWithReset';
import { transformer } from './markmap';

const initValue = `没有传入文本的默认显示`;

function renderToolbar(mm: Markmap, wrapper: HTMLElement) {
	while (wrapper?.firstChild) wrapper.firstChild.remove();
	if (mm && wrapper) {
		const toolbar = new Toolbar();
		toolbar.attach(mm);
		// Register custom buttons
		toolbar.register({
			id: 'alert',
			title: 'Click to show an alert',
			content: 'Alert',
			onClick: () => alert('You made it!')
		});
		toolbar.setItems([...Toolbar.defaultItems, 'alert']);
		wrapper.append(toolbar.render());
	}
}

interface MarkmapHooksProps {
	text?: string;
	isEditorOpen?: boolean;
	isEditFallback?: boolean; //是否是编辑时的回退到milkdown
}

function MarkmapHooks(props: MarkmapHooksProps) {
	const { text, isEditorOpen = false, isEditFallback = false } = props;
	const [value, setValue] = useState(text ?? initValue);
	// Ref for SVG element
	const refSvg = useRef<SVGSVGElement>();
	// Ref for markmap object
	const refMm = useRef<Markmap>();
	// Ref for toolbar wrapper
	const refToolbar = useRef<HTMLDivElement>();

	useEffect(() => {
		// Create markmap and save to refMm
		if (refMm.current) return;
		const mm = Markmap.create(refSvg.current!);
		refMm.current = mm;
		renderToolbar(refMm.current, refToolbar.current!);
	}, [refSvg.current]);

	useEffect(() => {
		// Update data for markmap once value is changed
		const mm = refMm.current;
		if (!mm) return;
		const { root } = transformer.transform(value);
		mm.setData(root)
			.then(() => {
				mm.fit();
			})
			.catch(error => {
				console.error('MarkmapHooks~Error setting data:', error);
			});
	}, [refMm.current, value]);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setValue(e.target.value);
	};

	const view = (
		<React.Fragment>
			{isEditorOpen && (
				<div className="w-full">
					<textarea
						className="w-full h-full border border-gray-400"
						value={value}
						onChange={handleChange}
					/>
				</div>
			)}
			{/* 思维导图 */}
			<svg
				className="w-full h-150 dark:text-white!"
				ref={refSvg as React.RefObject<SVGSVGElement>}
			/>
			{/* 工具栏 */}
			{/* <div ref={refToolbar as React.RefObject<HTMLDivElement>}></div> */}
		</React.Fragment>
	);

	if (isEditFallback) {
		return <ErrorBoundary FallbackComponent={ErrorFallbackWithReset}>{view}</ErrorBoundary>;
	}

	return <ErrorBoundary fallback={<div>{value}</div>}>{view}</ErrorBoundary>;
}
export default React.memo(MarkmapHooks);
