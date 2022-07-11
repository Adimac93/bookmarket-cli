import { prompt } from 'inquirer';
import { booksStorage } from './sessions';

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
		console.log(`Synched with ${isPush ? 'push' : 'update'} mode`);
	}
}
