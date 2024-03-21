import Button from "@atoms/button";
import ConfirmDialog from "@atoms/confirm-dialog";
import Heading from "@atoms/heading";
import Loading from "@atoms/loading";
import AccountForm from "@components/account/account-form";
import Layout from "@components/shared/layout";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { trpc } from "@utils/trpc";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";

const EditAccountPage = () => {
	const router = useRouter();

	const [isAdvancedExpanded, setAdvancedExpanded] = useState(false);
	const [isAccountResetDialogOpen, setAccountResetDialogOpen] = useState(false);

	const { data: user, error } = trpc.user.fetch.useQuery();
	const resetAccountMutation = trpc.user.reset.useMutation();
	const trpcContext = trpc.useContext();

	const resetAccount = () => {
		resetAccountMutation
			.mutateAsync()
			.then(() => {
				toast.error("Account has been reset.");
				trpcContext.user.fetch.invalidate();
				router.reload();
			})
			.catch((error) => {
				toast.error("An error occured. Please try again.");
				console.error(error);
			});
	};

	if (error) {
		return <div>Error</div>;
	}
	if (!user) {
		return (
			<Layout>
				<Loading />
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="mx-auto flex w-full max-w-xl flex-col items-center">
				<AccountForm existingUser={user} />
				<ConfirmDialog
					title="Are you sure you want to reset your account?"
					description="This is a destructive action and cannot be undone."
					isOpen={isAccountResetDialogOpen}
					setIsOpen={setAccountResetDialogOpen}
					confirmAction={resetAccount}
				/>
				<div className="mx-auto w-full">
					<button
						type="button"
						onClick={() => setAdvancedExpanded(!isAdvancedExpanded)}
						className="mb-5 flex items-center gap-2"
					>
						<FontAwesomeIcon
							icon={faChevronRight}
							className={classNames([
								"duration-75",
								isAdvancedExpanded ? "rotate-90" : "",
							])}
						/>
						<Heading size="small">Advanced Options</Heading>
					</button>
					{isAdvancedExpanded && (
						<div>
							<Button
								variant="danger"
								onClick={() => setAccountResetDialogOpen(true)}
							>
								Reset Account
							</Button>
						</div>
					)}
				</div>
			</div>
		</Layout>
	);
};

export default EditAccountPage;