/* eslint-disable no-undef */

describe('second test first description', () => {
	it('test', () => {
		expect(true).toBe(true);
	});
});

describe ('second test second description', () => {
	it('another test', () => {
		expect(true).toBe(true);
	});
});

describe.only('second test third description', () => {
	it('another test', () => {
		expect(true).toBe(true);
	});
});

describe.only ('second test fourth description', () => {
	it('another test', () => {
		expect(true).toBe(true);
	});
});
