import Layout from "@layouts/common/layout";
import ClientForm from "@organisms/forms/client-form";
import Head from "next/head";
import React from "react";

const CreateClient = () => {
	return (
		<Layout>
			<Head>
				<title>Create Invoice - Melvin</title>
			</Head>
			<ClientForm />
		</Layout>
	);
};

export default CreateClient;