import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";
import hre from "hardhat";

const { parseUnits } = ethers.utils;

import {
  VeToken,
  ERC20Mock
} from '../typechain';

describe("VeToken unit tests", function () {
  let veToken: VeToken;
  let token: ERC20Mock;

  let ownerSigner: Signer, user1Signer: Signer, user2Signer: Signer;
  let owner: string, user1: string, user2: string;
  
  const dayInSec = 24 * 3600;
  const week = 7 * dayInSec;

  before(async() => {
    [ownerSigner, user1Signer, user2Signer] = await ethers.getSigners();
    owner = await ownerSigner.getAddress();
    user1 = await user1Signer.getAddress();
    user2 = await user2Signer.getAddress();

    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    token = await ERC20Mock.deploy();
    await token.deployed();
    
    const VeToken = await ethers.getContractFactory("VeToken");
    veToken = await VeToken.deploy(token.address);
    await veToken.deployed();
  });

  describe("Deployment", () => {
    it("Should return right name", async() => {
      expect(await veToken.name()).to.equal("Vote-escrow Token");
    });

    it("Should return right symbol", async() => {
      expect(await veToken.symbol()).to.equal("veToken");
    });

    it("Should return right token address", async() => {
      expect(await veToken.Token()).to.equal(token.address);
    });

    it("Should return zero locked amount", async() => {
      expect(await veToken.totalTokenLocked()).to.equal(0);
    });

    it("Should return zero epoch", async() => {
      expect(await veToken.epoch()).to.equal(0);
    });
  });

  describe("Create lock", () => {
    let unlockTime;
    const lockAmount = ethers.utils.parseUnits("1000", 18);
    const currentBlockTimestamp = 1651449600; // 05/02/2022

    beforeEach(async() => {
      await token.mint(user1, lockAmount);
      await token.connect(user1Signer).approve(
        veToken.address, lockAmount
      );
    });

    it("Should revert if the lock amount is zero", async() => {
      unlockTime = currentBlockTimestamp + 7 * dayInSec;
      await expect(
        veToken.createLock(0, unlockTime, true)
      ).to.be.revertedWith("Cannot lock 0 tokens");
    });

    it("Should revert if the unlock time is past", async() => {
      unlockTime = currentBlockTimestamp - 7 * dayInSec;
      await expect(
        veToken.createLock(lockAmount, unlockTime, true)
      ).to.be.revertedWith("Cannot lock in the past");
    });

    it("Should revert if the unlock time is beyond max time", async() => {
      unlockTime = currentBlockTimestamp + 5 * 365 * dayInSec;
      await expect(
        veToken.createLock(lockAmount, unlockTime, true)
      ).to.be.revertedWith("Voting lock can be 4 years max");
    });

    it("Should be able to create lock", async() => {
      unlockTime = currentBlockTimestamp + 365 * dayInSec;
      const unlockTimeInWeeks = Math.floor(unlockTime / week) * week;

      await expect(
        veToken.connect(user1Signer).createLock(lockAmount, unlockTime, true)
      ).to.emit(veToken, "UserCheckpoint")
      .withArgs(1, true, user1, lockAmount, unlockTimeInWeeks);
    });
  });
});
