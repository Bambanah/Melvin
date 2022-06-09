import React, { FC } from "react";
import styled from "styled-components";
import Navbar from "@organisms/navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Loading from "@atoms/loading";
import { breakpoints } from "@styles/themes";

const Container = styled.div`
	display: flex;
	flex-direction: row;
	width: 100vw;
	height: 100vh;

	overflow: hidden;
`;

const Content = styled.div`
	flex: 1 1 auto;
	display: flex;
	flex-direction: column;

	overflow-y: auto;

	padding: 3rem;

	@media ${breakpoints.laptop} {
		padding: 3rem 0;
	}
`;

interface Props {
	children: React.ReactNode;
}

const Layout: FC<Props> = ({ children }) => {
	const session = useSession();
	const router = useRouter();

	if (session.status === "loading") {
		return <Loading />;
	}

	if (session.status === "unauthenticated") {
		router.push("/login");
		return <p>Redirecting...</p>;
	}

	return (
		<Container>
			<Navbar />

			<Content>{children}</Content>
		</Container>
	);
};

export default Layout;