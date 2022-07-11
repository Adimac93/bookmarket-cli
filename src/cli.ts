import { promptEditSchema } from './lib/editor';
import { promptFetchBook, promptSearchBooks } from './lib/search';

import { prompt } from 'inquirer';
import { promptViewBooks } from './lib/view';

async function main() {
	while (true) {
		const options = await prompt({
			name: 'menu',
			message: 'Choose menu',
			choices: [
				{ name: 'schema editor', value: 'schema' },
				{ name: 'book loader', value: 'books' },
				{ name: 'book browser', value: 'search' },
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
		} else if (options.menu == 'exit') {
			break;
		}
	}
}

main();
