/* eslint-disable no-undef */

describe('first test first description', () => {
	it('test', () => {
		expect(true).toBe(true);
	});
});

describe ('first test second description', () => {
	it('another test', () => {
		expect(true).toBe(true);
	});
});

describe.only('first test third description', () => {
	it('another test', () => {
		expect(true).toBe(true);
	});
});

describe.only ('first test fourth description', () => {
	it('another test', () => {
		expect(true).toBe(true);
	});
});
