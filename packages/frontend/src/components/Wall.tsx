import React from 'react';
import styled from 'styled-components';

interface WallAProps {
	play: boolean;
	duration?: number; // duration in milliseconds
	delay?: number;
	width?: number;
	height?: number;
}
const WallWrapper = styled.div`
	.wallGrid {
		display: grid;
		width: 100%;
		height: 100vh;
		background-color: transparent;
		position: absolute;
		overflow: hidden;
		z-index: -1;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;

		filter: url(#roughpaper);
	}

	.gridCell {
		border-bottom: 2px solid rgb(151, 170, 184);
	}

	.withBorder {
		border-right: 2px solid rgb(151, 170, 184);
	}
`;
const Wall: React.FC<WallAProps> = ({ play, duration = 1500, delay = 1000 }) => {
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
		<svg style={{ position: 'absolute', width: 0, height: 0 }}>
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
		<WallWrapper>
			<SvgFilter />
			<div
				className="wallGrid"
				style={{
					gridTemplateRows: `repeat(${rows}, 1fr)`,
					gridTemplateColumns: `repeat(${cols}, 1fr)`,
					opacity: play ? 1 : 0,
					transition: `opacity ${duration}ms ease-in-out ${delay}ms`
				}}
			>
				{Array.from({ length: getEvenRows() * getEvenCols() }).map((_, index) => {
					const isEvenRow = Math.floor(index / getEvenCols()) % 2 === 0;
					const isGap = isEvenRow ? index % 2 === 1 : index % 2 === 0;

					return <div key={index} className={`gridCell ${!isGap ? 'withBorder' : ''}`} />;
				})}
			</div>
		</WallWrapper>
	);
};

export default Wall;
