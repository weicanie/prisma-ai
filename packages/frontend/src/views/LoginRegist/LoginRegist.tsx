import classNames from 'classnames';
import { memo, useEffect, useRef, useState } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import Prism from '../../components/Prism';
import Wall from '../../components/Wall';
import { LoginForm } from './c-cpns/LoginForm';
import { RegistForm } from './c-cpns/RegistForm';

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
		<div className="flex h-screen w-full flex-col items-center justify-center bg-background z-0 lg:flex-row">
			<div className="w-full lg:max-w-[40rem] lg:flex-1">
				<Prism light={isLight} />
			</div>
			<div
				className={classNames(
					'min-w-[25rem] max-w-xs mb-[5vw] font-[Shadows_Into_Light_Two] transition-opacity duration-1000 ease-in-out lg:flex-1',
					{
						'opacity-100': isFormShow,
						'opacity-0': !isFormShow
					}
				)}
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
			<div
				className={classNames(
					'w-full text-5xl lg:text-[2.5rem] min-w-[25rem] mb-[5vw] lg:flex-1 transition-opacity duration-1000 ease-in-out',
					{
						'opacity-100': isFormShow,
						'opacity-0': !isFormShow
					}
				)}
			>
				{/* <MorphingText texts={comfortablyNumbLyrics} /> */}
			</div>
			<Wall play={isLight} duration={1500} delay={2500}></Wall>
		</div>
	);
}
export default memo(LoginRegist);
