import Button from "@atoms/button";
import Input from "@atoms/input";
import React from "react";
import * as Styles from "./styles";

const LoginForm = () => {
	return (
		<Styles.Form>
			<p>Log in to Melvin to continue</p>
			<Input placeholder="Email Address" />
			<Input placeholder="Password" />
			<a>Forgot password?</a>
			<Button primary>Continue</Button>
		</Styles.Form>
	);
};

export default LoginForm;