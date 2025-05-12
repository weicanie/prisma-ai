import styled from 'styled-components';

const AppWrapper = styled.div`
	display: flex;
	/* 900px以下的屏幕 */
	@media screen and (max-width: 900px) {
		flex-direction: column;
	}
`;
export { AppWrapper };
