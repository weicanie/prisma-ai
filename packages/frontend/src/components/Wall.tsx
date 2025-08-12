import classNames from 'classnames';
import React from 'react';

interface WallAProps {
	className?: string;
	play: boolean;
	duration?: number; // duration in milliseconds
	delay?: number;
	width?: number;
	height?: number;
}
const Wall: React.FC<WallAProps> = ({ play, duration = 1500, delay = 1000, className }) => {
	const rows = 30;
	const cols = 24;
	/*开销太大
	 	useEffect(() => {
		const calculate = () => {
			setRows(Math.floor(window.innerHeight / 40));
			setCols(Math.floor(window.innerWidth / 40));
		};
		calculate();
		window.addEventListener('resize', debounce(calculate, 500));
		return () => window.removeEventListener('resize', calculate);
	}, []); */

	// 行数和列数都取偶数
	//FIXME 为什么有一个为奇数就显示异常
	const getEvenRows = () => {
		return rows % 2 === 0 ? rows : rows - 1;
	};
	const getEvenCols = () => {
		return cols % 2 === 0 ? cols : cols - 1;
	};
	//墙体线条手写效果
	const SvgFilter = () => (
		<svg className="absolute h-0 w-0">
			<filter id="roughpaper">
				{/* 创建噪点 - 模拟污渍和划痕 */}
				<feTurbulence
					type="fractalNoise"
					baseFrequency="0.15"
					numOctaves="4"
					seed="10"
					result="noise1"
				/>

				{/* 扭曲主体形状 - 使用主噪点 */}
				<feDisplacementMap
					in="SourceGraphic"
					scale="0.1"
					xChannelSelector="R"
					yChannelSelector="G"
					result="displaced"
				/>

				{/* 应用污渍纹理 - 使用次级噪点 */}
				<feDisplacementMap
					in="displaced"
					in2="noise1"
					scale="1.8"
					xChannelSelector="B"
					yChannelSelector="A"
					result="dirtyTexture"
				/>
			</filter>
		</svg>
	);
	return (
		<div className={className}>
			<SvgFilter />
			<div
				className={classNames(
					'grid h-screen w-full absolute top-0 bottom-0 left-0 right-0 z-[-1] overflow-hidden bg-transparent [filter:url(#roughpaper)] transition-opacity ease-in-out',
					{ 'opacity-100': play, 'opacity-0': !play }
				)}
				style={{
					gridTemplateRows: `repeat(${rows}, 1fr)`,
					gridTemplateColumns: `repeat(${cols}, 1fr)`,
					transitionDuration: `${duration}ms`,
					transitionDelay: `${delay}ms`
				}}
			>
				{Array.from({ length: getEvenRows() * getEvenCols() }).map((_, index) => {
					const isEvenRow = Math.floor(index / getEvenCols()) % 2 === 0;
					const isGap = isEvenRow ? index % 2 === 1 : index % 2 === 0;

					return (
						<div
							key={index}
							className={classNames('border-b-2 border-[rgb(151,170,184)]', {
								'border-r-2': !isGap
							})}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default Wall;
