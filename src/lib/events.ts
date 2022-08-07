import chalk from 'chalk';
import { prompt } from 'inquirer';
import { createSpinner } from 'nanospinner';
import { isRemoteDb, isTestMode } from './database';
import { booksStorage } from './sessions';
import { colorValue } from './view';

export async function beforeStart() {
	console.log(
		`Connecting to ${
			isRemoteDb ? `🌐 ${chalk.magenta('remote')}` : `🧱 ${chalk.cyan('local')}`
		} database with ${
			isTestMode
				? `🧪 ${chalk.yellow(`test`)}`
				: `🚀 ${chalk.redBright(`production`)}`
		} mode`,
	);

	const spinner = createSpinner(`Syncing with database`).start();
	let syncStart = Date.now();
	try {
		await booksStorage.synch();
		let syncTime = colorValue((Date.now() - syncStart) / 10, 1500);
		spinner.success({
			text: `Synced with database in ${syncTime} ms`,
			mark: '💾',
		});
	} catch (err) {
		spinner.error({ text: 'Failed to sync with database', mark: '❌' });
	} finally {
		if (booksStorage.registered.size != booksStorage.books.length) {
			booksStorage.save();
			console.log(
				'🚧 Muliple locally saved books containing the same isbn! Using latest ones',
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
