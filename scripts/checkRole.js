// scripts/debugCall.js
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const platform = await ethers.getContractAt("Platform", process.env.VITE_PLATFORM_ADDRESS);

  try {
    await platform.adminRegisterAndApprove.staticCall(
      8,
      "0xB6D0C5f1D3A025FfE2C352Cc9d35B4b22636d7D8",
      "Air Fight Master",
      "https://air-fight-master-xcra.vercel.app/",
      70
    );
    console.log("✅ Static call succeeded — no revert!");
  } catch (err) {
    console.log("Full error object:");
    console.log(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  }
}

main().catch(console.error);