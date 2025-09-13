(function (global) {
	var iframe = null;

	function render(props) {
		console.log('props', props);
		var container = props && props.container ? props.container : document.body;
		var url = (props && props.url) || '/app';

		// 创建 iframe，挂载 Next 应用
		iframe = document.createElement('iframe');
		iframe.src = url;
		iframe.style.border = '0';
		iframe.style.width = (props && props.iframeWidth) || '100%';
		iframe.style.height = (props && props.iframeHeight) || '100vh';
		iframe.setAttribute('title', 'magic-resume-next');

		// iframe 加载完成后，发送 token 到微应用
		iframe.onload = function () {
			try {
				if (iframe.contentWindow) {
					// 发送 token 到 Next应用 内
					iframe.contentWindow.postMessage(
						{
							type: 'SET_TOKEN',
							token: props.token || window.localStorage.getItem('token')
						},
						'*'
					);
				}
			} catch (e) {
				console.warn('无法发送 token 到微应用:', e);
			}
		};

		container.appendChild(iframe);
		return Promise.resolve();
	}

	global['magic-resume'] = {
		bootstrap: function () {
			return Promise.resolve();
		},
		mount: function (props) {
			/* 基于全局state进行通信 */
			props.onGlobalStateChange((state, prev) => {
				// 将主应用的 token 同步到微应用
				if (state.token && iframe && iframe.contentWindow) {
					try {
						iframe.contentWindow.postMessage(
							{
								type: 'SET_TOKEN',
								token: state.token
							},
							'*'
						);
					} catch (e) {
						console.warn('同步 token 到微应用失败:', e);
					}
				}
				console.log('全局状态变化:', state, prev);
			}, true);
			return render(props || {});
		},
		unmount: function () {
			if (iframe && iframe.parentNode) {
				iframe.parentNode.removeChild(iframe);
			}
			iframe = null;
			return Promise.resolve();
		}
	};
})(window);
