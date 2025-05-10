import '@ant-design/v5-patch-for-react-19';
import cs from 'classnames';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import './APP.css';
import { LoginMain } from './components/LoginModal';
import { RegisterMain } from './components/RegisterModal';
import Task from './Task';
import ArticleUploadForm from './views/Commit';
const AppWrapper = styled.div`
	/* 取消antd表单项前的'*' */
	label::before {
		display: none !important;
	}
	display: flex;

	.task {
		max-width: 900px;
	}

	.upload-from {
		min-width: 65vw;
	}

	@media screen and (max-width: 900px) {
		/* 768px以下的屏幕 */
		flex-direction: column;
		.task {
		}
		.upload-from {
		}
	}

	@media screen and (min-width: 1024px) {
		/* 1024px以上的屏幕 */
		.task {
		}
		.upload-from {
		}
	}
`;

function APP() {
	const [isLogin, setIsLogin] = useState(false);
	//未登录则弹出登录框
	useEffect(() => {
		const loginModal = document.getElementById('login_modal') as HTMLDialogElement;
		//@ts-ignore
		if (!localStorage.getItem('token')) {
			loginModal.showModal();
		} else {
			setIsLogin(true);
		}
	});

	/* tailwind 封装的css 实现响应式

	宽度控制：
		w-11/12: 在所有屏幕上，对话框宽度为视口宽度的 91.666%
		max-w-md: 在小屏幕上，最大宽度为 28rem (448px)
		md:max-w-lg: 在中等屏幕 (md ≥ 768px) 上，最大宽度为 32rem (512px)
		lg:max-w-xl: 在大屏幕 (lg ≥ 1024px) 上，最大宽度为 36rem (576px)

	内边距调整：
		p-6: 在小屏幕上，内边距为 1.5rem (24px)
		md:p-8: 在中等屏幕上，内边距增加到 2rem (32px)

	*/
	const response = 'modal-box w-11/12 max-w-md md:max-w-lg lg:max-w-xl p-6 md:p-8';
	return (
		<AppWrapper>
			{/* 提交题目的表单 */}
			<div className="upload-from">{isLogin && <ArticleUploadForm></ArticleUploadForm>}</div>
			{/* 任务情况 */}
			<div className="task">{isLogin && <Task></Task>}</div>
			{/* 登录、注册、修改密码弹出的modal */}
			<dialog id="login_modal" className="modal">
				<div className={cs('modal-box', response)}>
					<LoginMain setIsLogin={setIsLogin}></LoginMain>
				</div>
				<form method="dialog" className="modal-backdrop">
					<button>close</button>
				</form>
			</dialog>

			<dialog id="regist_modal" className="modal">
				<div className={cs('modal-box', response)}>
					<RegisterMain></RegisterMain>
				</div>
				<form method="dialog" className="modal-backdrop">
					<button>close</button>
				</form>
			</dialog>
		</AppWrapper>
	);
}
export default APP;
