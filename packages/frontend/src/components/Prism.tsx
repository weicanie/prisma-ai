import classNames from 'classnames';
import { motion } from 'motion/react';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';

interface PrismProps {
	light?: boolean;
	className?: string;
	onClick?: () => void;
}

const Prism: React.FC<PrismProps> = ({ light: externalLight = false, className, onClick }) => {
	const [showLight, setShowLight] = useState(externalLight);
	//用于控制动画从左到右完成
	const [animationComplete, setAnimationComplete] = useState(false);
	const { theme } = useTheme();
	//FIXME 现在会保持system
	const lightColor = theme === 'dark' ? 'rgb(233, 251, 251)' : 'rgb(233, 251, 251)';
	useEffect(() => {
		setShowLight(externalLight);
		if (!externalLight) {
			setAnimationComplete(false);
		}
	}, [externalLight]);

	const handleClick = () => {
		setShowLight(showLight => {
			if (!showLight) {
				setAnimationComplete(false);
			}
			return !showLight;
		});
		if (onClick) onClick();
	};
	const entryPoint = { x: 310, y: 230 };
	const exitPoint = { x: 450, y: 200 };

	const spectrumColors = [
		{ color: 'rgb(242,30,56)', angle: -9, width: 15 },
		{ color: 'rgb(245,101,34)', angle: -11, width: 15 },
		{ color: 'rgb(247,230,0)', angle: -13, width: 15 },
		{ color: 'rgb(34,179,71)', angle: -15, width: 15 },
		{ color: 'rgb(28,160,188)', angle: -16.5, width: 11 },
		{ color: 'rgb(109,90,139)', angle: -18, width: 12 }
	];

	const getRainbowEndpoint = (angle: number) => {
		const distance = 500;
		const radians = (angle * Math.PI) / 180;
		return {
			x: exitPoint.x + Math.cos(radians) * distance,
			y: exitPoint.y - Math.sin(radians) * distance
		};
	};

	return (
		// svg容器
		<div
			className={classNames('relative w-full aspect-[4/2] cursor-pointer', className)}
			onClick={handleClick}
		>
			<svg viewBox="0 0 800 400" className="w-full h-full" style={{ background: 'tansparent' }}>
				{/* 定义滤镜 */}

				<defs>
					<filter id="dirtyGlass">
						{/* 创建噪点 - 模拟污渍和划痕 */}
						<feTurbulence
							type="fractalNoise"
							baseFrequency="0.15"
							numOctaves="4"
							seed="10"
							result="noise1"
						/>

						{/* 创建细微纹理 */}
						<feTurbulence
							type="fractalNoise"
							baseFrequency="0.8"
							numOctaves="2"
							seed="3"
							result="grainNoise"
						/>

						{/* 扭曲主体形状 - 使用主噪点 */}
						<feDisplacementMap
							in="SourceGraphic"
							scale="8"
							xChannelSelector="R"
							yChannelSelector="G"
							result="displaced"
						/>

						{/* 应用污渍纹理 - 使用次级噪点 */}
						<feDisplacementMap
							in="displaced"
							in2="noise1"
							scale="3"
							xChannelSelector="B"
							yChannelSelector="A"
							result="dirtyTexture"
						/>
					</filter>
				</defs>
				{/* 左侧光线 */}
				<motion.path
					d={`M 0,290 L ${entryPoint.x},${entryPoint.y}`}
					stroke={`${lightColor}`}
					strokeWidth="7"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{
						pathLength: showLight ? 1 : 0,
						opacity: showLight ? 1 : 0
					}}
					transition={{ duration: 0.5, ease: 'easeInOut' }}
					onAnimationComplete={() => {
						if (showLight) setAnimationComplete(true);
					}}
				/>
				{/* 三角棱镜 */}
				<motion.path
					d="M 250,350 L 400,80 L 550,350  Z"
					fill="rgb(0, 0, 0)"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.8 }}
				/>

				{/* 右侧发散光线 */}
				{showLight && animationComplete && (
					<>
						{spectrumColors.map((spectrum, index) => {
							const endPoint = getRainbowEndpoint(spectrum.angle);
							return (
								<motion.path
									key={index}
									d={`M ${exitPoint.x},${exitPoint.y + index * 9} L ${endPoint.x},${endPoint.y}`}
									stroke={spectrum.color}
									strokeWidth={spectrum.width}
									initial={{ pathLength: 0, opacity: 0 }}
									animate={{ pathLength: 1, opacity: 1 }}
									transition={{
										delay: 0.1,
										duration: 0.7,
										ease: 'easeOut'
									}}
								/>
							);
						})}
					</>
				)}
				{/* 三角棱镜（在内部覆盖右侧发散光线） */}
				<motion.path
					d="M 250,350 L 400,80 L 550,350  Z"
					stroke="rgba(139, 171, 171, 0.777)"
					strokeWidth="27"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.8 }}
				/>
				{/* 内部遮挡，形成层次 */}
				<motion.path
					d="M 250,350 L 400,80 L 550,350  Z"
					stroke="rgba(42, 41, 41, 0.9)"
					strokeWidth="4"
					fill="rgb(0, 0, 0)"
					filter="url(#dirtyGlass)" // 应用滤镜
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.8 }}
				/>
				{/* 内部光线梯形：到一半版 */}
				{showLight && animationComplete && (
					<motion.path
						d={`M ${entryPoint.x - 5},${entryPoint.y - 3} L 400, 210 L 395,244 L ${entryPoint.x - 7},${entryPoint.y + 5} Z`}
						stroke="rgba(119, 138, 133, 0.4)"
						strokeWidth="0.5"
						strokeOpacity={0.5}
						fill="rgba(144, 163, 154, 0.582)"
						filter="url(#dirtyGlass)" // 应用滤镜
						initial={{ pathLength: 0, opacity: 0 }}
						animate={{ pathLength: 1, opacity: 1 }}
						transition={{
							delay: 0,
							duration: 0.7,
							ease: 'easeOut'
						}}
					/>
				)}
				{/* 内部光线梯形：完全穿过版 */}
				{/* {showLight && animationComplete && (
					<motion.path
						d={`M ${entryPoint.x - 5},${entryPoint.y - 3} L 473, 197 L 520,264 L ${entryPoint.x - 7},${entryPoint.y + 5} Z`}
						stroke="rgba(119, 138, 133, 0.4)"
						strokeWidth="0.5"
						strokeOpacity={0.5}
						fill="rgba(144, 163, 154, 0.582)"
						filter="url(#dirtyGlass)" // 应用滤镜
						initial={{ pathLength: 0, opacity: 0 }}
						animate={{ pathLength: 1, opacity: 1 }}
						transition={{
							delay: 0,
							duration: 0.7,
							ease: 'easeOut'
						}}
					/>
				)} */}
			</svg>
		</div>
	);
};

export default Prism;
