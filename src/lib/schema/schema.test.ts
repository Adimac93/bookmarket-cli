import { Grade, Subject } from '@prisma/client';
import { BooksSchema } from '.';
import * as fs from 'node:fs';

describe('Schema state session storage', () => {
	const savePath = './src/lib/schema/test.schema.json';
	let schemaStorage: BooksSchema;
	let defaults: Subject[] = ['PHYSICS', 'CIVICS'];

	beforeAll(() => {
		if (fs.existsSync(savePath)) fs.unlinkSync(savePath);
		schemaStorage = new BooksSchema(savePath, defaults);
	});

	it('add one schema', () => {
		schemaStorage.set(Grade.FIRST, ['BIOLOGY', 'MATH', 'PHYSICS', ...defaults]);
		expect(schemaStorage.schema.FIRST).toHaveLength(5);
	});
	it('save schema', () => {
		schemaStorage.save();
	});
	it('load schema from file', () => {
		schemaStorage = new BooksSchema(savePath);
		expect(schemaStorage.schema.FIRST).toHaveLength(3 + defaults.length);
		expect(schemaStorage.schema.SECOND).toHaveLength(defaults.length);
		expect(schemaStorage.schema.THIRD).toHaveLength(defaults.length);
		expect(schemaStorage.schema.FOURTH).toHaveLength(defaults.length);
	});
});
