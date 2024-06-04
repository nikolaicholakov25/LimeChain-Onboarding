import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const QuizFactory = buildModule("QuizFactory", (m) => {
  const quizFactory = m.contract("QuizFactory");

  return { quizFactory };
});

export default QuizFactory;
