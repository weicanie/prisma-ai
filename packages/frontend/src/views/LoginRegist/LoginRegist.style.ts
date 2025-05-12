import styled from 'styled-components';

const LoginRegistWrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100vh;

	@media screen and (min-width: 1024px) {
		/* 1024px以上的屏幕 */
		flex-direction: row;
		.card-text {
			font-size: 2.5rem;
		}
		.card-login,
		.card-prism,
		.card-text {
			flex: 1;
		}
		/* 防止棱镜过大 */
		.card-prism {
			max-width: 40rem;
		}
	}
	@media screen and (max-width: 1024px) {
		/* 
		设置100vw,因为浏览器右侧滚动条占据视口宽度,会有横向滚动条（需要动态计算浏览器右侧滚动条才能消除）
		用100%则没有这个问题,
		因为body的宽度默认保持为视口宽度-右侧滚动条宽度
		*/
		.card-prism {
			width: 100%;
		}
		.card-text {
			font-size: 2.5rem;
		}
	}

	.card-text {
		width: 100%;
		/* 开启硬件加速 */
		/* transform: rotateZ(0deg); */
	}
	.card-login,
	.card-text {
		opacity: 0;
		transition:
			opacity 1s ease-in-out,
			height 1s ease-in-out;
		min-width: 25rem;
		margin-bottom: 5vw;
	}
	.card-login {
		max-width: 20rem;
	}
	.card-show {
		opacity: 1;
	}
	/* 
		属性变化 -> 过渡动画
		
		组件切换动画实现原理
			卸载的组件添加 "exit exit-active"（在下一帧（通常是用 requestAnimationFrame）添加 -active 类）通过css的层叠引发属性变化触发过渡动画
			添加的组件添加 "enter enter-active"通过css的层叠引发属性变化触发过渡动画

		（以"active"的最终样式复用为done即可,除非需要最终样式发生突变）
	*/
	/* Form transition animations */
	.form-transition-enter {
		opacity: 0;
	}
	.form-transition-enter-active {
		opacity: 1;
		/* 需要和timeout参数保持相同 */
		transition: opacity 500ms;
	}
	.form-transition-exit {
		opacity: 1;
	}
	.form-transition-exit-active {
		opacity: 0;
		transition: opacity 500ms;
	}
`;
export const comfortablyNumbLyrics: string[] = [
	'', //实现延迟渲染效果
	'Hello ?',
	'Is there anybody in there ?',
	'Just nod if you can hear me',
	'Is there anyone at home ?',
	'Come on now',
	"I hear you're feeling down",
	'Well I can ease your pain',
	'Get you on your feet again',
	'Relax',
	"I'll need some information first",
	'Just the basic facts',
	'Can you show me where it hurts ?',
	'There is no pain you are receding',
	'A distant ship, smoke on the horizon',
	'You are only coming through in waves',
	"Your lips move but I can't hear what you're saying",
	'When I was a child I had a fever',
	'My hands felt just like two balloons',
	"Now I've got that feeling once again",
	"I can't explain you would not understand",
	'This is not how I am',
	'I have become comfortably numb',
	'I have become comfortably numb',
	'OK',
	'Just a little pinprick',
	"There'll be no more aaaaaaaaah !",
	'But you may feel a little sick',
	'Can you stand up ?',
	"I do believe it's working, good",
	"That'll keep you going through the show",
	"Come on it's time to go",
	'There is no pain you are receding',
	'A distant ship, smoke on the horizon',
	'You are only coming through in waves',
	"Your lips move but I can't hear what you're saying",
	'When I was a child',
	'I caught a fleeting glimpse',
	'Out of the corner of my eye',
	'I turned to look but it was gone',
	'I cannot put my finger on it now',
	'The child is grown',
	'The dream is gone',
	'I have become comfortably numb'
];
export const timeLyrics: string[] = [
	'',
	'Ticking away',
	'The moments that make up a dull day',
	'You fritter and waste the hours',
	'In an offhand way',
	'Kicking around on a piece of ground',
	'In your hometown',
	'Waiting for someone',
	'Or something to show you the way',
	'Tired of lying in the sunshine',
	'Staying home to watch the rain',
	'You are young and life is long',
	'And there is time to kill today',
	'And then one day you find',
	'Ten years have got behind you',
	'No one told you when to run',
	'You missed the starting gun',
	'And you run, and you run',
	"To catch up with the sun, but it's sinking",
	'And racing around',
	'To come up behind you again',
	'The sun is the same in a relative way',
	"But you're older",
	'Shorter of breath',
	'And one day closer to death',
	'Every year is getting shorter',
	'Never seem to find the time',
	'Plans that either come to naught',
	'Or half a page of scribbled lines',
	'Hanging on in quiet desperation',
	'Is the English way',
	'The time is gone, the song is over',
	"Thought I'd something more to say",
	'Home, home again',
	'I like to be here when I can',
	'When I come home cold and tired',
	"It's good to warm my bones beside the fire",
	'Far away across the field',
	'The tolling of the iron bell',
	'Calls the faithful to their knees',
	'To hear the softly spoken magic spells'
];
export { LoginRegistWrapper };
