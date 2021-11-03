import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
	const user = await prisma.user.findFirst({
		where: { email: "lachlanu@gmail.com" },
	});

	if (!user) throw new Error("Must create a user first");

	const client = await prisma.client.upsert({
		where: { id: "John" },
		create: {
			firstName: "John",
			lastName: "Smith",
			number: "123456789",
			ownerId: user.id,
		},
		update: {},
	});

	let supportItem = await prisma.supportItem.findFirst({
		where: { ownerId: client.id },
	});

	if (!supportItem) {
		supportItem = await prisma.supportItem.create({
			data: {
				description: "Access Community, Social And Rec Activities - Standard",
				rateType: "HOUR",
				weekdayCode: "04_104_0125_6_1",
				weekdayRate: 54.3,
				weeknightCode: "04_103_0125_6_1",
				weeknightRate: 61.05,
				saturdayCode: "04_105_0125_6_1",
				saturdayRate: 77.81,
				sundayCode: "04_106_0125_6_1",
				sundayRate: 100.16,
				ownerId: user.id,
			}
		});
	}

	let invoice = await prisma.invoice.findFirst({
		where: { ownerId: client.id },
	});

	if (!invoice) {
		invoice = await prisma.invoice.create({
			data: {
				invoiceNo: "Test1",
				billTo: "Test Enterprise",
				date: new Date(),
				clientId: client.id,
				ownerId: user.id,
				activities: {
					create: [
						{
							date: new Date(),
							startTime: new Date(),
							endTime: new Date(),
							itemDuration: 2,
							supportItemId: supportItem.id
						}
					]
				}
			}
		})
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
