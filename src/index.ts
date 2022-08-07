import { promptEditSchema } from './lib/editor';
import { promptFetchBook, promptSearchBooks } from './lib/search';

import { prompt } from 'inquirer';
import { promptViewBooks } from './lib/view';
import { promptExit, beforeStart } from './lib/events';
import * as gradient from 'gradient-string';
import { promptSeedDatabase } from './lib/database/seed';

async function main() {
	console.log(gradient.passion(logo));
	await beforeStart();
	while (true) {
		console.log('---------------------');
		const options = await prompt({
			name: 'menu',
			message: 'Choose menu',
			choices: [
				{ name: '🔨 schema editor', value: 'schema' },
				{ name: '🚚 book loader', value: 'books' },
				{ name: '📡 book browser', value: 'search' },
				{ name: '📚 view books', value: 'view' },
				{ name: '🌱 seed database', value: 'seed' },
				{ name: '🧰 exit and save', value: 'exit' },
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
		} else if (options.menu == 'seed') {
			await promptSeedDatabase();
		} else if (options.menu == 'exit') {
			await promptExit();
			break;
		}
	}
}

const logo = `
	.---.                        .---.
    .---|___|            .---.       |~~~|
.---|===|---|_           |___|       |~~~|---.
|   |===|   |  \\     .---!~~~|   .---|   |---|
|   |   |   |   \\    |===|   |---|%%%|   |   |
| B | O | O |\\ K \\   | M | A | R | K | E | T |
|   |   |   | \\   \\  |===|   |===|   |   |   |
|   |   |___|  \\   \\ |   |___|___|   |~~~|___|
|   |===|---|   \\   \\|===|~~~|---|%%%|~~~|---|
'---^---^---'    \`---\'---^---^---^---^---'---' A powerful tool for changing the world...
`;

main();
