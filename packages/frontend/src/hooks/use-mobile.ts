import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * 检测设备是否为移动设备的现代化方案
 * 结合多种检测方法提高准确性：
 * 1. 触摸点检测 (navigator.maxTouchPoints)
 * 2. 指针精度检测 (pointer: coarse)
 * 3. 屏幕尺寸检测 (响应式断点)
 * 4. User Agent 回退检测
 */
function detectMobileDevice(): boolean {
	// 服务端渲染时返回 false
	if (typeof window === 'undefined' || typeof navigator === 'undefined') {
		return false;
	}

	// 1. 优先使用触摸点检测 - 最可靠的现代方法
	if ('maxTouchPoints' in navigator) {
		return navigator.maxTouchPoints > 0;
	}

	// 2. 兼容旧版 IE/Edge 的触摸点检测
	if ('msMaxTouchPoints' in (navigator as Navigator)) {
		return (navigator as Navigator & { msMaxTouchPoints: number }).msMaxTouchPoints > 0;
	}

	// 3. 使用媒体查询检测指针精度
	if (window.matchMedia) {
		// 检测指针精度是否为粗粒度
		const coarsePointer = window.matchMedia('(pointer: coarse)');
		if (coarsePointer.media === '(pointer: coarse)') {
			return coarsePointer.matches;
		}

		// 检测是否支持触摸操作
		const touchSupport = window.matchMedia('(hover: none) and (pointer: coarse)');
		if (touchSupport.media === '(hover: none) and (pointer: coarse)') {
			return touchSupport.matches;
		}
	}

	// 4. 检查 orientation 属性（已废弃但可作为回退）
	if ('orientation' in window) {
		return true;
	}

	// 5. 最后的回退方案：User Agent 检测
	try {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			(navigator as Navigator).userAgent
		);
	} catch {
		return false;
	}
}

/**
 * 现代化的移动设备检测 Hook
 * 结合设备特性检测（优先）和屏幕尺寸检测（回退），提供更准确的移动端判断
 */
export function useIsMobile() {
	const [isMobileDevice] = React.useState<boolean>(() => detectMobileDevice());
	const [isSmallScreen, setIsSmallScreen] = React.useState<boolean | undefined>(undefined);

	React.useEffect(() => {
		// 检测屏幕尺寸变化
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const onChange = () => {
			setIsSmallScreen(window.innerWidth < MOBILE_BREAKPOINT);
		};
		mql.addEventListener('change', onChange);
		setIsSmallScreen(window.innerWidth < MOBILE_BREAKPOINT);

		return () => mql.removeEventListener('change', onChange);
	}, []);

	// 综合判断：移动设备特性 OR 小屏幕尺寸
	return isMobileDevice || (isSmallScreen ?? false);
}

/**
 * 检测是否为触摸设备
 */
// export function useIsTouchDevice() {
// 	const [isTouchDevice] = React.useState<boolean>(() => {
// 		if (typeof window === 'undefined') return false;

// 		// 检测触摸点支持
// 		if ('maxTouchPoints' in navigator) {
// 			return navigator.maxTouchPoints > 0;
// 		}

// 		if ('msMaxTouchPoints' in navigator) {
// 			return (navigator as Navigator & { msMaxTouchPoints: number }).msMaxTouchPoints > 0;
// 		}

// 		// 检测触摸事件支持
// 		return 'ontouchstart' in window || 'ontouchstart' in document.documentElement;
// 	});

// 	return isTouchDevice;
// }

/**
 * 检测设备类型的详细信息
 */
// export function useDeviceType() {
// 	const [deviceInfo, setDeviceInfo] = React.useState(() => {
// 		if (typeof window === 'undefined') {
// 			return {
// 				isMobile: false,
// 				isTablet: false,
// 				isDesktop: true,
// 				isTouch: false,
// 				screenSize: 'desktop' as const
// 			};
// 		}

// 		const isTouchDevice = detectMobileDevice();
// 		const screenWidth = window.innerWidth;

// 		return {
// 			isMobile: isTouchDevice && screenWidth < 768,
// 			isTablet: isTouchDevice && screenWidth >= 768 && screenWidth < 1024,
// 			isDesktop: !isTouchDevice || screenWidth >= 1024,
// 			isTouch: isTouchDevice,
// 			screenSize:
// 				screenWidth < 640
// 					? ('sm' as const)
// 					: screenWidth < 768
// 						? ('md' as const)
// 						: screenWidth < 1024
// 							? ('lg' as const)
// 							: screenWidth < 1280
// 								? ('xl' as const)
// 								: ('2xl' as const)
// 		};
// 	});

// 	React.useEffect(() => {
// 		const handleResize = () => {
// 			const isTouchDevice = detectMobileDevice();
// 			const screenWidth = window.innerWidth;

// 			setDeviceInfo({
// 				isMobile: isTouchDevice && screenWidth < 768,
// 				isTablet: isTouchDevice && screenWidth >= 768 && screenWidth < 1024,
// 				isDesktop: !isTouchDevice || screenWidth >= 1024,
// 				isTouch: isTouchDevice,
// 				screenSize:
// 					screenWidth < 640
// 						? 'sm'
// 						: screenWidth < 768
// 							? 'md'
// 							: screenWidth < 1024
// 								? 'lg'
// 								: screenWidth < 1280
// 									? 'xl'
// 									: '2xl'
// 			});
// 		};

// 		window.addEventListener('resize', handleResize);
// 		return () => window.removeEventListener('resize', handleResize);
// 	}, []);

// 	return deviceInfo;
// }
