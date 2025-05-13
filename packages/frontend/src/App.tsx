import '@ant-design/v5-patch-for-react-19';
import { createGlobalStyle } from 'styled-components';
import { AppWrapper } from './App.style';
import './index.css';
import LoginRegist from './views/LoginRegist/LoginRegist';

export const GlobalStyle = createGlobalStyle`
  html {
    background-color: ${({ theme }) => (theme === 'dark' ? '#000' : '#8f4242')};
  }
`;

function APP() {
	return (
		<AppWrapper>
			<GlobalStyle />
			<LoginRegist></LoginRegist>
		</AppWrapper>
	);
}
export default APP;
