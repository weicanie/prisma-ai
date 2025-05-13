import classNames from 'classnames';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { LoginForm } from '../../components/LoginForm';
import { MagicCardWrapper } from '../../components/MagicCard';
import { MorphingText } from '../../components/magicui/morphing-text';
import Prism from '../../components/Prism';
import { RegistForm } from '../../components/RegistForm';
import Wall from '../../components/Wall';
import { comfortablyNumbLyrics, LoginRegistWrapper } from './LoginRegist.style';
function LoginRegist() {
	const [isLoginCard, setIsLoginCard] = useState(true);
	const [isLight, setIsLight] = useState(false);
	const [isFormShow, setIsFormShow] = useState(false);
	const { theme, setTheme } = useTheme();
	// TODO 主题切换按钮
	setTheme('dark');
	const nodeRef = useRef(null);

	useEffect(() => {
		setTimeout(() => {
			setIsLight(true);
			setTimeout(() => setIsFormShow(true), 1000);
		}, 1000);
	}, []);

	// TODO 暗色主题适配（wall、字体颜色太鲜艳）, 加一个白色背景不就行了
	// TODO 歌词组件性能差,换
	return (
		<LoginRegistWrapper theme={theme}>
			<div className="card-prism ">
				<Prism light={isLight} />
			</div>
			<div
				className={classNames('card-login', 'font-[Shadows_Into_Light]', {
					'card-show': isFormShow
				})}
			>
				<SwitchTransition mode="out-in">
					<CSSTransition
						key={isLoginCard ? 'login' : 'register'}
						nodeRef={nodeRef}
						timeout={500}
						classNames="form-transition"
						unmountOnExit
					>
						<div ref={nodeRef}>
							<MagicCardWrapper cardTitle={isLoginCard ? 'Login' : 'Register'}>
								{isLoginCard ? (
									<LoginForm setIsLoginCard={setIsLoginCard} />
								) : (
									<RegistForm setIsLoginCard={setIsLoginCard} />
								)}
							</MagicCardWrapper>
						</div>
					</CSSTransition>
				</SwitchTransition>
			</div>
			<div className={classNames('card-text', { 'card-show': isFormShow })}>
				<MorphingText texts={comfortablyNumbLyrics} />
			</div>
			<Wall play={isLight} duration={1500} delay={2500}></Wall>
		</LoginRegistWrapper>
	);
}
export default LoginRegist;
