import {
	faCopy,
	faDollarSign,
	faDownload,
	faEdit,
	faTrash,
	faUser,
	faWalking,
} from "@fortawesome/free-solid-svg-icons";
import EntityList, { EntityListItem } from "@components/shared/entity-list";
import PdfDocument from "@components/invoices/pdf-document";
import { InvoiceFetchAllOutput } from "@server/routers/invoice-router";
import { getTotalCost } from "@utils/helpers";
import { trpc } from "@utils/trpc";
import dayjs from "dayjs";
import Skeleton from "react-loading-skeleton";
import { toast } from "react-toastify";

export default function InvoiceList() {
	const utils = trpc.useContext();
	const deleteInvoice = trpc.invoice.delete.useMutation();
	const invoices = trpc.invoice.list.useQuery({});

	if (invoices.error) {
		console.error(invoices.error);
		return <div>Error loading</div>;
	}

	if (!invoices.data) {
		return <div>Loading...</div>;
	}

	const generateEntity = (invoice?: InvoiceFetchAllOutput): EntityListItem => ({
		id: invoice?.id ?? "",
		ExpandedComponent: invoices
			? (index: number) => (
					<PdfDocument invoiceId={invoices.data.invoices[index].id} />
			  )
			: undefined,
		actions: invoice
			? [
					{
						value: "Download",
						type: "link",
						icon: faDownload,
						href: `/api/invoices/generate-pdf/${invoice.id}`,
					},
					{
						value: "Edit",
						type: "link",
						icon: faEdit,
						href: `/invoices/${invoice.id}?edit=true`,
					},
					{
						value: "Copy",
						type: "link",
						icon: faCopy,
						href: `/invoices/create?copyFrom=${invoice.id}`,
					},
					{
						value: "Delete",
						type: "button",
						icon: faTrash,
						onClick: () => {
							if (
								confirm(`Are you sure you want to delete ${invoice.invoiceNo}?`)
							) {
								deleteInvoice
									.mutateAsync({ id: invoice.id })
									.then(() => {
										utils.invoice.invalidate();

										toast.success("Invoice deleted");
									})
									.catch((error) => toast.error(error));
							}
						},
					},
			  ]
			: [],
		fields: [
			{
				value: invoice ? dayjs(invoice.date).format("DD/MM/YY") : <Skeleton />,
				type: "text",
				flex: "0 0 4.5em",
			},
			{
				value: invoice ? invoice.invoiceNo : <Skeleton />,
				type: "label",
				flex: "1 0 7em",
			},
			{
				value: invoice ? invoice.client?.name || "" : <Skeleton />,
				icon: faUser,
				type: "text",
				align: "left",
				flex: "1 1 100%",
			},
			{
				value: invoice ? invoice._count.activities.toString() : <Skeleton />,
				icon: faWalking,
				type: "text",
				flex: "0 0 2em",
			},
			{
				value: invoice ? (
					getTotalCost(invoice.activities).toLocaleString(undefined, {
						minimumFractionDigits: 2,
					})
				) : (
					<Skeleton />
				),
				icon: faDollarSign,
				type: "text",
				flex: "0 0 5.4em",
			},
		],
	});

	if (!invoices)
		return (
			<EntityList
				title="Invoices"
				entities={
					Array.from({ length: 1 }).fill(generateEntity()) as EntityListItem[]
				}
			/>
		);

	return (
		<EntityList
			title="Invoices"
			route="/invoices"
			entities={invoices.data.invoices.map((invoice) =>
				generateEntity(invoice)
			)}
			shouldExpand
		/>
	);
}