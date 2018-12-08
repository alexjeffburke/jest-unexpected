const expect = require('unexpected').clone();
const jestMock = require('jest-mock');

const jestMockToSinonSpy = require('../src/jestMockToSinonSpy');

describe('jestMockToSinonSpy', () => {
    it('should convert simple calls', () => {
        const mockFunction = jestMock.fn().mockName('callback');
        mockFunction('a', 'a');
        mockFunction('a', 'b');

        const sinonSpy = jestMockToSinonSpy(mockFunction);

        expect(sinonSpy.callCount, 'to equal', 2);
        expect(sinonSpy.getCall(0).args, 'to equal', ['a', 'a']);
        expect(sinonSpy.getCall(1).args, 'to equal', ['a', 'b']);
    });

    it('should convert returned values', () => {
        const mockFunction = jestMock
            .fn((...args) => args)
            .mockName('callback');
        mockFunction('a', 'a');
        mockFunction('a', 'b');

        const sinonSpy = jestMockToSinonSpy(mockFunction);

        expect(sinonSpy.callCount, 'to equal', 2);
        expect(sinonSpy.getCall(0).returnValue, 'to equal', ['a', 'a']);
        expect(sinonSpy.getCall(1).returnValue, 'to equal', ['a', 'b']);
    });

    it('should convert thrown exceptions', () => {
        const expectedError = new Error();
        const mockFunction = jestMock
            .fn(() => {
                throw expectedError;
            })
            .mockName('callback');
        try {
            mockFunction('a', 'a');
        } catch (e) {}
        try {
            mockFunction('a', 'a');
        } catch (e) {}

        const sinonSpy = jestMockToSinonSpy(mockFunction);

        expect(sinonSpy.callCount, 'to equal', 2);
        expect(sinonSpy.getCall(0).exception, 'to equal', expectedError);
        expect(sinonSpy.getCall(1).exception, 'to equal', expectedError);
    });
});
