import { promptEditSchema } from './lib/editor';
import { promptFetchBook, promptSearchBooks } from './lib/search';

import { prompt } from 'inquirer';
import { promptViewBooks } from './lib/view';
import { promptExit, beforeStart } from './lib/events';

async function main() {
	await beforeStart();
	while (true) {
		const options = await prompt({
			name: 'menu',
			message: 'Choose menu',
			choices: [
				{ name: 'schema editor', value: 'schema' },
				{ name: 'book loader', value: 'books' },
				{ name: 'book browser', value: 'search' },
				{ name: 'view books', value: 'view' },
				{ name: 'exit and save', value: 'exit' },
			],
			type: 'list',
		});
		if (options.menu == 'schema') {
			await promptEditSchema();
		} else if (options.menu == 'books') {
			await promptFetchBook();
		} else if (options.menu == 'search') {
			await promptSearchBooks();
		} else if (options.menu == 'view') {
			await promptViewBooks();
		} else if (options.menu == 'exit') {
			await promptExit();
			break;
		}
	}
}

main();
