import classNames from 'classnames';
import { memo, useEffect, useRef, useState } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import Prism from '../../components/Prism';
import Wall from '../../components/Wall';
import { LoginForm } from './c-cpns/LoginForm';
import { RegistForm } from './c-cpns/RegistForm';
import { LoginRegistWrapper } from './LoginRegist.style';
function LoginRegist() {
	const [isLoginCard, setIsLoginCard] = useState(true);
	const [isLight, setIsLight] = useState(false);
	const [isFormShow, setIsFormShow] = useState(false);

	const nodeRef = useRef(null);

	useEffect(() => {
		setTimeout(() => {
			setIsLight(true);
			setTimeout(() => setIsFormShow(true), 1000);
		}, 1000);
	}, []);

	return (
		<LoginRegistWrapper>
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
							{isLoginCard ? (
								<LoginForm setIsLoginCard={setIsLoginCard} />
							) : (
								<RegistForm setIsLoginCard={setIsLoginCard} />
							)}
						</div>
					</CSSTransition>
				</SwitchTransition>
			</div>
			<div className={classNames('card-text', { 'card-show': isFormShow })}>
				{/* <MorphingText texts={comfortablyNumbLyrics} /> */}
			</div>
			<Wall play={isLight} duration={1500} delay={2500}></Wall>
		</LoginRegistWrapper>
	);
}
export default memo(LoginRegist);
