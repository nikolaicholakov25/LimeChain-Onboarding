import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

const question = "How Are You?";
const answers = ["sure", "no", "yes"];
const answer = answers[2];
const salt = "RANDOM3102I31I2SALT";

const oneEther = ethers.parseEther("1");
const almostOneEther = ethers.parseEther("0.01");

describe("Quiz", function () {
  async function deployQuizContractFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, acc1, acc2] = await hre.ethers.getSigners();

    const Quiz = await hre.ethers.getContractFactory("Quiz");
    const quiz = await Quiz.deploy(question, answer, answers, salt, {
      value: oneEther,
    });

    return { quiz, owner, acc1, acc2 };
  }

  describe("Deployment", function () {
    it("Should set the state variables", async function () {
      const { quiz } = await loadFixture(deployQuizContractFixture);

      const answers = await quiz.getAnswers();

      expect(await quiz.question()).to.equals(question);
      expect(answers[0]).to.equals(answers[0]);
      expect(answers[1]).to.equals(answers[1]);
      expect(answers[2]).to.equals(answers[2]);
    });

    it("Should accept ethereum on contruction", async function () {
      const { quiz } = await loadFixture(deployQuizContractFixture);

      expect(await quiz.getCurrentQuizBalance()).to.equals(oneEther);
    });
  });

  describe("Should have correct logic for guessing answers", function () {
    it("Should emit QuizNotGuessed on wrong answer", async function () {
      const { quiz, owner } = await loadFixture(deployQuizContractFixture);

      await expect(quiz.guess(answers[0]))
        .to.emit(quiz, "QuizNotQuessed")
        .withArgs(owner.address);
    });
    it("Should emit QuizAnswered on correct answer", async function () {
      const { quiz, owner } = await loadFixture(deployQuizContractFixture);

      await expect(quiz.guess(answers[2]))
        .to.emit(quiz, "QuizQuessed")
        .withArgs(owner.address, await quiz.getCurrentQuizBalance());
    });
    it("Should update the winner on correct answer", async function () {
      const { quiz, owner } = await loadFixture(deployQuizContractFixture);

      await quiz.guess(answers[2]);

      expect(await quiz.winner()).to.equals(owner.address);
    });
    it("Should revert if the quiz has been guesed already", async function () {
      const { quiz, owner } = await loadFixture(deployQuizContractFixture);

      await quiz.guess(answers[2]);
      await expect(quiz.guess(answers[1])).to.be.revertedWith(
        "The quiz has already been guessed!"
      );
    });
  });

  describe("Should have correct claimPrize() logic", function () {
    it("Should revert if a non winner tries to claim the reward", async function () {
      const { quiz, acc1 } = await loadFixture(deployQuizContractFixture);

      await quiz.guess(answers[2]);

      await expect(quiz.connect(acc1).claimPrize()).to.be.revertedWith(
        "You are not the winner"
      );
    });
    it("Should sent the prize to the winner", async function () {
      const { quiz, owner, acc1 } = await loadFixture(
        deployQuizContractFixture
      );

      await quiz.guess(answers[2]);

      await expect(quiz.claimPrize()).to.changeEtherBalances(
        [quiz, owner],
        [-oneEther, oneEther]
      );
    });
    it("Should revert if the prize pool is empty", async function () {
      const { quiz } = await loadFixture(deployQuizContractFixture);

      await quiz.guess(answers[2]);

      await quiz.claimPrize();

      await expect(quiz.claimPrize()).to.be.revertedWith(
        "The quiz reward pool is empty"
      );
    });
  });

  describe("Should allow eth deposits to the quiz", function () {
    it("Should increase quiz balance on deposit via receive()", async function () {
      const { quiz, owner, acc1, acc2 } = await loadFixture(
        deployQuizContractFixture
      );

      await expect(
        await owner.sendTransaction({ to: quiz, value: oneEther })
      ).to.changeEtherBalance(quiz, oneEther);
    });

    it("Should emit deposit event via receive()", async function () {
      const { quiz, owner, acc1, acc2 } = await loadFixture(
        deployQuizContractFixture
      );

      await expect(owner.sendTransaction({ to: quiz, value: oneEther }))
        .to.emit(quiz, "EthDeposited")
        .withArgs(oneEther);
    });
  });
});
