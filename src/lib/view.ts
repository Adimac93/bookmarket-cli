import { Book, Grade } from '@prisma/client';
import { prompt } from 'inquirer';
import { booksStorage } from './sessions';

export async function promptViewBooks() {
	const options = await prompt({
		name: 'grade',
		message: 'Choose grade',
		choices: Object.keys(Grade),
		type: 'list',
	});

	const books = booksStorage.get({ grade: options.grade });
	console.log(books || `No books for grade ${options.grade}`);
}
