import '@ant-design/v5-patch-for-react-19';
import { AppWrapper } from './App.style';
import './index.css';
import LoginRegist from './views/LoginRegist/LoginRegist';

function APP() {
	return (
		<AppWrapper>
			<LoginRegist></LoginRegist>
		</AppWrapper>
	);
}
export default APP;
