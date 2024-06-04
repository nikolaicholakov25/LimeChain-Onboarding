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
const salt = "RANDSNI3I12NSDQSNKNSALT";

const oneEther = ethers.parseEther("1");
const almostOneEther = ethers.parseEther("0.01");

describe("Quiz", function () {
  async function deployQuizFactoryContractFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, acc1, acc2] = await hre.ethers.getSigners();

    const QuizFactory = await hre.ethers.getContractFactory("QuizFactory");
    const quizFactory = await QuizFactory.deploy();

    return { quizFactory, owner, acc1, acc2 };
  }

  describe("Deployment", function () {
    it("Should init with empty quizes state", async function () {
      const { quizFactory } = await loadFixture(
        deployQuizFactoryContractFixture
      );

      const quizes = await quizFactory.getAllQuizes();

      expect(quizes.length).to.equals(0);
    });
  });

  describe("Create Quiz", function () {
    it("Should be able to create quizes", async function () {
      const { quizFactory } = await loadFixture(
        deployQuizFactoryContractFixture
      );

      await quizFactory.createQuiz(question, answer, answers, salt, {
        value: oneEther,
      });
      await quizFactory.createQuiz(question, answer, answers, salt, {
        value: oneEther,
      });

      const quizes = await quizFactory.getAllQuizes();

      expect(quizes.length).to.equals(2);
    });
    it("Should revert if no ether is sent as a reward", async function () {
      const { quizFactory } = await loadFixture(
        deployQuizFactoryContractFixture
      );

      await expect(
        quizFactory.createQuiz(question, answer, answers, salt, {
          value: almostOneEther,
        })
      ).to.be.revertedWith("The Eth sent must be at least 0.01");
    });

    it("Should emit QuizCreated Event when a quiz is created", async function () {
      const { quizFactory } = await loadFixture(
        deployQuizFactoryContractFixture
      );

      await expect(
        quizFactory.createQuiz(question, answer, answers, salt, {
          value: oneEther,
        })
      ).to.emit(quizFactory, "QuizCreated");
    });
  });
});
