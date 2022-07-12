import { Grade } from '@prisma/client';
import { BooksSchema } from '.';
import * as fs from 'node:fs';

describe('Schema state session storage', () => {
	const savePath = './src/lib/schema/test.schema.json';
	let schemaStorage: BooksSchema;

	beforeAll(() => {
		if (fs.existsSync(savePath)) fs.unlinkSync(savePath);
		schemaStorage = new BooksSchema(savePath);
	});

	it('add one schema', () => {
		schemaStorage.set(Grade.FIRST, ['BIOLOGY', 'MATH', 'PHYSICS']);
		expect(schemaStorage.schema.FIRST).toHaveLength(3);
	});
	it('save schema', () => {
		schemaStorage.save();
	});
	it('load schema from file', () => {
		schemaStorage = new BooksSchema(savePath);
		expect(schemaStorage.schema.FIRST).toHaveLength(3);
	});
});
