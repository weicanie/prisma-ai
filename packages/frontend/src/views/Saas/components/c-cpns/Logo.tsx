export function Logo(props: React.ComponentPropsWithoutRef<'svg'>) {
	return (
		<svg viewBox="0 0 1200 400" className="size-20" {...props}>
			<defs>
				<filter id="dirtyGlass">
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.15"
						numOctaves="4"
						seed="10"
						result="noise1"
					></feTurbulence>
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.8"
						numOctaves="2"
						seed="3"
						result="grainNoise"
					></feTurbulence>
					<feDisplacementMap
						in="SourceGraphic"
						scale="8"
						xChannelSelector="R"
						yChannelSelector="G"
						result="displaced"
					></feDisplacementMap>
					<feDisplacementMap
						in="displaced"
						in2="noise1"
						scale="3"
						xChannelSelector="B"
						yChannelSelector="A"
						result="dirtyTexture"
					></feDisplacementMap>
				</filter>
			</defs>
			<g>
				<path d="M 50,350 L 200,80 L 350,350  Z" fill="rgb(0, 0, 0)" opacity="1"></path>
				<path
					d="M 50,350 L 200,80 L 350,350  Z"
					stroke="rgba(139, 171, 171, 0.777)"
					strokeWidth="27"
					opacity="1"
				></path>
				<path
					d="M 50,350 L 200,80 L 350,350  Z"
					stroke="rgba(42, 41, 41, 0.9)"
					strokeWidth="4"
					fill="rgb(0, 0, 0)"
					filter="url(#dirtyGlass)"
					opacity="1"
				></path>
				<path
					d="M 105,227 L 200, 210 L 195,244 L 103,235 Z"
					stroke="rgba(119, 138, 133, 0.4)"
					strokeWidth="0.5"
					strokeOpacity="0.5"
					fill="rgba(144, 163, 154, 0.582)"
					filter="url(#dirtyGlass)"
					opacity="1"
					pathLength="1"
					strokeDashoffset="0px"
					strokeDasharray="1px 1px"
				></path>
			</g>
			<text
				x="290"
				y="230"
				fontFamily="mono"
				fontSize="170"
				fontWeight="600"
				dominantBaseline="middle"
				textAnchor="start"
			>
				<tspan fill="rgb(234,27,52)">P</tspan>
				<tspan fill="rgb(242,104,35)">ri</tspan>
				{/* <tspan fill="rgb(209, 196, 7)">i</tspan> */}
				<tspan fill="rgb(42,181,70)">s</tspan>
				<tspan fill="rgb(44,162,190)">m</tspan>
				<tspan fill="rgb(116,100,144)">a</tspan>
				<tspan fill="rgb(86,145,225)">AI</tspan>
			</text>
		</svg>
	);
}
