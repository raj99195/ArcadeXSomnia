// scripts/estimateGas.js
require("dotenv").config();
const { ethers } = require("hardhat");

const PLATFORM_ADDRESS = process.env.VITE_PLATFORM_ADDRESS;

async function main() {
  const platform = await ethers.getContractAt("Platform", PLATFORM_ADDRESS);
  const [admin] = await ethers.getSigners();

  const TEST_GAME_ID = 9999;

  console.log("Estimating gas for adminRegisterAndApprove...\n");

  try {
    const estimate = await platform.adminRegisterAndApprove.estimateGas(
      TEST_GAME_ID,
      "0xB6D0C5f1D3A025FfE2C352Cc9d35B4b22636d7D8",
      "Gas Estimate Test",
      "https://example.com",
      70
    );
    console.log("✅ Estimated gas:", estimate.toString());
    console.log("   Recommended gasLimit (with 30% buffer):", Math.ceil(Number(estimate) * 1.3));
  } catch (err) {
    console.log("❌ Estimation failed (this itself is informative):");
    console.log(err.reason || err.shortMessage || err.message);
  }

  const feeData = await ethers.provider.getFeeData();
  console.log("\nCurrent gas price:", feeData.gasPrice?.toString(), "wei");
}

main().catch(console.error);