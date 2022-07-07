import { promptEditSchema } from './lib/editor';
import { promptFetchBook, promptSearchBooks } from './lib/search';

import { prompt } from 'inquirer';

async function main() {
	const options = await prompt({
		name: 'menu',
		message: 'Choose menu',
		choices: [
			{ name: 'schema editor', value: 'schema' },
			{ name: 'book loader', value: 'books' },
			{ name: 'book browser', value: 'search' },
		],
		type: 'list',
	});
	if (options.menu == 'schema') {
		await promptEditSchema();
	} else if (options.menu == 'books') {
		await promptFetchBook();
	} else if (options.menu == 'search') {
		await promptSearchBooks();
	}
}

main();
