import { Activity } from "./activity";
import { Client } from "./client";

export interface Invoice {
	id: string;
	date: Date;
	billTo: string;
	invoiceNo: string;
	activities: Activity[];
	client?: Client;
}