import { prompt } from 'inquirer';
import { createSpinner } from 'nanospinner';
import { booksStorage } from './sessions';

export async function beforeStart() {
	const spinner = createSpinner('Syncing with database').start();
	try {
		await booksStorage.synch();
		spinner.success({ text: 'Synced with database', mark: '💾' });
	} catch (err) {
		spinner.error({ text: 'Failed to sync with database', mark: '❌' });
	} finally {
		if (booksStorage.registered.size != booksStorage.books.length) {
			booksStorage.save();
			console.log(
				'🚧 Muliple locally saved books containing the same id! Using latest ones',
			);
		}
	}
}
export async function promptExit() {
	const options = await prompt([
		{
			name: 'exit',
			message: 'Choose exit option',
			choices: [{ name: 'exit & synch', value: 'synch' }, 'exit'],
			type: 'list',
		},
		{
			name: 'synch',
			message: 'Push?',
			type: 'confirm',
			when: (p) => p.exit == 'synch',
		},
	]);

	if (options.synch) {
		const isPush = options.synch == true;
		booksStorage.synch(isPush);
		console.log(`Synced with ${isPush ? 'push' : 'update'} mode`);
	}
}
