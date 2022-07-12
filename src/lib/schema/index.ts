import { Grade, Subject } from '@prisma/client';
import { ChoiceCollection } from 'inquirer';
import { File } from '../common';

export class BooksSchema extends File {
	schema: Record<Grade, Subject[]>;

	constructor(filePath: string) {
		super(filePath);
		this.schema = super.load() || {
			FIRST: [],
			SECOND: [],
			THIRD: [],
			FOURTH: [],
		};
	}

	get(grade: Grade) {
		const subjects = this.schema[grade];
		if (!subjects) {
			return Object.keys(Subject);
		}
		const choices: ChoiceCollection = Object.keys(Subject).map((subject) => {
			return { value: subject, checked: subjects.includes(subject as Subject) };
		});
		return choices;
	}

	set(grade: Grade, subjects: Subject[]) {
		this.schema[grade] = subjects;
	}

	save() {
		super.save(this.schema);
	}
}

export const booksSchema = new BooksSchema('./schema.json');
