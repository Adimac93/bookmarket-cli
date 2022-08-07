import { db } from '../src/lib/database';
import { seedDatabase } from '../src/lib/database/seed';

async function main() {
	await seedDatabase(1000);
}
main()
	.then(async () => {
		await db.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await db.$disconnect();
		process.exit(1);
	});
