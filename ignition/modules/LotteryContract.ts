import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LotteryContract = buildModule("LotteryContract", (m) => {
  const lotteryContract = m.contract("LotteryContract");

  return { lotteryContract };
});

export default LotteryContract;
