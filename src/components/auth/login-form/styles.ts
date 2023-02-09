import styled from "styled-components";

export const Form = styled.form`
	display: flex;
	flex-direction: column;
	width: 100%;
	align-items: stretch;
	text-align: center;

	gap: 0.9rem;

	button {
		margin-top: 0.5rem;
	}

	& > p {
		margin-bottom: 1rem;
	}
`;
