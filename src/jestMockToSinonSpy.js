const sinon = require('sinon');

function incrementCallCount() {
    this.called = true;
    this.callCount += 1;
    this.notCalled = false;
    this.calledOnce = this.callCount === 1;
    this.calledTwice = this.callCount === 2;
    this.calledThrice = this.callCount === 3;
}

module.exports = function jestMockToSinonSpy(fn) {
    const sinonSpy = sinon.spy().named(fn.getMockName());

    sinonSpy.args = fn.mock.calls.map((callArgs, callIndex) => {
        sinonSpy.callIds.push(callIndex + 1);
        incrementCallCount.call(sinonSpy);
        return callArgs;
    });

    fn.mock.results.forEach(result => {
        let returnValue;
        let exception;

        if (result.isThrow) {
            exception = result.value;
        } else {
            returnValue = result.value;
        }

        sinonSpy.returnValues.push(returnValue);
        sinonSpy.exceptions.push(exception);
    });

    return sinonSpy;
};
