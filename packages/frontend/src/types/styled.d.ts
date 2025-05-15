import 'styled-components';
import type { ThemeType } from '../assets/theme';
//让theme的类型正确推导
declare module 'styled-components' {
	export interface DefaultTheme extends ThemeType {}
}
