import { prompt } from 'inquirer';
import { createSpinner } from 'nanospinner';
import { booksStorage } from './sessions';

export async function beforeStart() {
	const spinner = createSpinner('Syncing with database').start();
	await booksStorage
		.synch()
		.then(() => {
			spinner.success();
		})
		.catch(() => spinner.error())
		.finally(() => {
			if (booksStorage.registered.size != booksStorage.books.length) {
				console.log('Muliple books containing the same id, using latest ones');
			}
		});
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
