const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

const { increaseTime } = require('./utils.js');

const OneToken = new BigNumber(web3.toWei(1, "ether"));

const ERC777TokenTimelock = artifacts.require("ERC777TokenTimelock");
const ReferenceToken = artifacts.require("ReferenceToken");

contract('ERC777 Token Timelock', async accounts => {
    const admin = accounts[0];
    const user1 = accounts[1];
    let token;
    let timelock;
    let now;
    const duration = 60; // seconds

    before(async () => {
        token = await ReferenceToken.new("ERC777 Token Test", "ERC777Test", 1);

        now = await web3.eth.getBlock('latest').timestamp;
        timelock = await ERC777TokenTimelock.new(token.address, user1, now + duration);

        await token.mint(timelock.address, OneToken, '');
    });

    it('timelock should hold tokens', async () => (await token.balanceOf(timelock.address)).should.be.bignumber.equal(OneToken));

    it('user should not have tokens', async () => (await token.balanceOf(user1)).should.be.bignumber.equal(0));

    it('should not release tokens before specified date', async () => await timelock.release().should.be.rejected);

    it('should release tokens after date', async () => {
        await increaseTime(duration);

        await timelock.release();

        (await token.balanceOf(timelock.address)).should.be.bignumber.equal(0);
        (await token.balanceOf(user1)).should.be.bignumber.equal(OneToken);
    });

    it ('should not allow release twice', async () => await timelock.release().should.be.rejected);
});