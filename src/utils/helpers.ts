import { FormikErrors, FormikTouched, getIn } from "formik";
import dayjs from "dayjs";
import { Activity, Invoice, SupportItem } from "@prisma/client";
import { FormValues } from "@organisms/forms/CreateInvoiceForm";
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

export const formatDate = (date: Date) => {
	const YYYY = date.getFullYear();
	const MM = `0${date.getMonth() + 1}`.slice(-2);
	const DD = `0${date.getDate()}`.slice(-2);

	return `${DD}/${MM}/${YYYY}`;
};

export const getDuration = (startTime: string, endTime: string): number => {
	const startDate = dayjs(`1970-01-01T${startTime}`, "YYYY-MM-DDTHH:mm");
	const endDate = dayjs(`1970-01-01T${endTime}`, "YYYY-MM-DDTHH:mm");

	const diffInMinutes = Math.abs(startDate.diff(endDate, "minutes"));
	const diffInHours = diffInMinutes / 60;

	return Math.round(diffInHours * 1000) / 1000;
};

export const getPrettyDuration = (duration: number) => {
	const hourItem = dayjs()
		.set("hours", duration)
		.set("minutes", (duration % 1) * 60);

	let durationString = "";

	const hours = hourItem.get("hours");
	const minutes = hourItem.get("minutes");
	if (hours > 0) durationString += `${hours} hour${hours === 1 ? "" : "s"}`;

	if (minutes > 0)
		durationString = `${
			durationString.length > 0 ? `${durationString}, ` : ""
		}${minutes} min${minutes === 1 ? "" : "s"}`;

	return durationString;
};

export const getHighestInvoiceNo = (
	invoiceNumbers: string[]
): string | null => {
	if (!invoiceNumbers.length) {
		return null;
	}

	const getNumber = (invoiceNo: string): number | null => {
		const matches = invoiceNo.match(/\d+$/);

		return matches ? Number(matches[0]) : null;
	};

	const highest = invoiceNumbers.reduce((prev, current) => {
		if (getNumber(current) === null) return prev;

		return (getNumber(prev) || 0) > (getNumber(current) || 0) ? prev : current;
	});

	return getNumber(highest) ? highest : null;
};

export const getNextInvoiceNo = (
	previousInvoiceNumbers?: string[],
	clientInvoicePrefix?: string | null
): string => {
	if (!previousInvoiceNumbers?.length && !clientInvoicePrefix) return "";

	const latestInvoiceNo = previousInvoiceNumbers?.length
		? getHighestInvoiceNo(previousInvoiceNumbers)
		: null;

	const invoicePrefix =
		clientInvoicePrefix ?? latestInvoiceNo?.replace(/\d+$/, "") ?? "";

	const matches = latestInvoiceNo?.match(/\d+$/);

	return `${invoicePrefix.replace(/-+$/, "")}-${
		matches ? parseInt(matches[0]) + 1 : 1
	}`;
};

export const getRate = (
	activity: Activity & { supportItem: SupportItem }
): [code: string, rate: number] => {
	let rate = 0;
	let itemCode = "";

	if (
		dayjs(activity.date).day() === 6 &&
		activity.supportItem.saturdayRate &&
		activity.supportItem.saturdayCode?.length
	) {
		// Saturday
		rate =
			typeof activity.supportItem.saturdayRate === "string"
				? parseFloat(activity.supportItem.saturdayRate)
				: activity.supportItem.saturdayRate?.toNumber();
		itemCode = activity.supportItem.saturdayCode;
	} else if (
		dayjs(activity.date).day() === 0 &&
		activity.supportItem.sundayRate &&
		activity.supportItem.sundayRate &&
		activity.supportItem.sundayCode?.length
	) {
		// Sunday
		rate =
			typeof activity.supportItem.sundayRate === "string"
				? parseFloat(activity.supportItem.sundayRate)
				: activity.supportItem.sundayRate?.toNumber();
		itemCode = activity.supportItem.sundayCode;
	} else if (
		activity.endTime &&
		activity.supportItem.weeknightCode?.length &&
		activity.supportItem.weeknightRate &&
		dayjs(activity.endTime).isAfter(dayjs("1970-01-01T20:00"))
	) {
		// Day is a weekday and it's after 8pm
		rate =
			typeof activity.supportItem.weeknightRate === "string"
				? parseFloat(activity.supportItem.weeknightRate)
				: activity.supportItem.weeknightRate?.toNumber();
		itemCode = activity.supportItem.weeknightCode;
	} else {
		// Weekday before 8pm
		rate =
			typeof activity.supportItem.weekdayRate === "string"
				? parseFloat(activity.supportItem.weekdayRate)
				: activity.supportItem.weekdayRate?.toNumber();
		itemCode = activity.supportItem.weekdayCode;
	}

	return [itemCode, rate];
};

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const invoiceToValues = (
	invoice: Invoice & { activities: Activity[] }
): FormValues => ({
	id: invoice.id,
	invoiceNo: invoice.invoiceNo,
	clientId: invoice.clientId,
	billTo: invoice.billTo,
	date: dayjs(invoice.date).format("DD/MM/YYYY"),
	activities: invoice.activities.map((activity) => ({
		id: activity.id,
		supportItemId: activity.supportItemId ?? "",
		date: dayjs(activity.date).format("DD/MM/YYYY"),
		itemDistance: activity.itemDistance?.toString() ?? "",
		transitDistance: activity.transitDistance?.toString() ?? "",
		transitDuration: activity.transitDuration?.toString() ?? "",
		startTime: dayjs(activity.startTime).format("HH:mm"),
		endTime: dayjs(activity.endTime).format("HH:mm"),
	})),
});

export const valuesToInvoice = (values: FormValues) => ({
	invoice: {
		invoiceNo: values.invoiceNo,
		clientId: values.clientId,
		billTo: values.billTo,
		date: values.date ? dayjs(values.date, "DD/MM/YYYY").toDate() : new Date(),
	},
	activities: values.activities.map((activity) => ({
		id: activity.id,
		date: dayjs(activity.date, "DD/MM/YYYY").toDate(),
		itemDistance: Number(activity.itemDistance) || null,
		transitDistance: Number(activity.transitDistance) || null,
		transitDuration: Number(activity.transitDuration) || null,
		startTime: new Date(`1970-01-01T${activity.startTime}`),
		endTime: new Date(`1970-01-01T${activity.endTime}`),
		supportItemId: activity.supportItemId,
	})),
});

export const round = (numberToRound: number, decimalPlaces: number) =>
	Math.round(numberToRound * Math.pow(10, decimalPlaces)) /
	Math.pow(10, decimalPlaces);

export const getTotalCost = (
	activities: (Activity & { supportItem: SupportItem })[]
) => {
	const grandTotal = activities.reduce((total, activity) => {
		const [, rate] = getRate(activity);

		let subTotal = 0;

		const duration = getDuration(
			dayjs(activity.startTime).format("HH:mm"),
			dayjs(activity.endTime).format("HH:mm")
		);

		subTotal += round(duration * rate, 2);

		if (activity.transitDistance) {
			subTotal += round(activity.transitDistance * 0.85, 2);
		}

		if (activity.transitDuration) {
			subTotal += round(activity.transitDuration * (rate / 60), 2);
		}

		return subTotal + total;
	}, 0);

	return grandTotal;
};

// export const getTotalString = (invoiceId: string) =>
// 	getTotalCost(invoiceId).then((cost) => `$${cost.toFixed(2)}`);

export const errorIn = (
	errors: FormikErrors<unknown>,
	touched: FormikTouched<unknown>,
	value: string
): boolean => getIn(errors, value) !== undefined && getIn(touched, value);
