// scripts/migrateGames.js
// Run: node scripts/migrateGames.js
require("dotenv").config();
const { ethers } = require("hardhat");

const NEW_PLATFORM_ADDRESS = process.env.VITE_PLATFORM_ADDRESS;

const PLATFORM_ABI = [
  "function adminRegisterAndApprove(uint256 specificGameId, address creator, string name, string iframeUrl, uint256 rewardRate) external",
  "function games(uint256) external view returns (uint256 gameId, string name, address creator, string iframeUrl, uint256 rewardRate, uint256 totalPlays, bool isActive)",
  "function nextGameId() external view returns (uint256)",
];

async function fetchGamesFromFirestore() {
  try {
    const admin = require("firebase-admin");
    const serviceAccount = require("./serviceAccountKey.json");
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
    const db = admin.firestore();
    const snap = await db.collection("games").where("status", "==", "approved").get();
    const games = snap.docs.map(d => {
      const data = d.data();
      return {
        gameId: data.gameId,
        name: data.name,
        creator: data.creator,
        iframeUrl: data.iframeUrl || "",
        rewardRate: data.rewardRate || 50,
      };
    });
    return games.sort((a, b) => a.gameId - b.gameId);
  } catch (err) {
    if (err.message?.includes("serviceAccountKey")) {
      console.log("\n⚠️  serviceAccountKey.json nahi mila!");
      console.log("Steps:");
      console.log("1. Firebase Console → Project Settings → Service Accounts");
      console.log("2. 'Generate new private key' → JSON download karo");
      console.log("3. File ko rename karke scripts/serviceAccountKey.json pe save karo\n");
    } else if (err.message?.includes("firebase-admin")) {
      console.log("\n⚠️  firebase-admin install karo:");
      console.log("npm install firebase-admin\n");
    } else {
      console.error("Firestore error:", err.message);
    }
    return null;
  }
}

async function main() {
  console.log("🔑 Platform Address:", NEW_PLATFORM_ADDRESS);
  if (!NEW_PLATFORM_ADDRESS) {
    console.error("❌ VITE_PLATFORM_ADDRESS .env mein set nahi hai!"); return;
  }

  console.log("\n📡 Firestore se games fetch ho rahe hain...");
  const GAMES = await fetchGamesFromFirestore();
  if (!GAMES) return;
  if (GAMES.length === 0) { console.log("❌ Koi approved game nahi mila!"); return; }

  console.log(`\n✅ ${GAMES.length} approved games mile:`);
  GAMES.forEach(g => console.log(`   #${g.gameId} — ${g.name} | ${g.rewardRate} ARCADE | creator: ${g.creator?.slice(0,12)}...`));

  const [admin] = await ethers.getSigners();
  console.log("\n👤 Admin wallet:", admin.address);

  const platform = new ethers.Contract(NEW_PLATFORM_ADDRESS, PLATFORM_ABI, admin);
  const nextId = await platform.nextGameId();
  console.log(`📊 Contract nextGameId: ${nextId}\n`);

  for (const game of GAMES) {
    console.log(`\n📋 Game #${game.gameId} — "${game.name}"`);
    try {
      const existing = await platform.games(game.gameId);
      if (existing.isActive) { console.log(`   ✅ Already active — skip`); continue; }

     const tx = await platform.adminRegisterAndApprove(
  game.gameId, game.creator, game.name, game.iframeUrl, game.rewardRate,
  { gasLimit: 5000000, type: 0 }  // 500000 → 1500000 (3x increase)
);
      console.log(`   ⏳ TX: ${tx.hash}`);
      await tx.wait();
      console.log(`   ✅ Registered & Approved!`);
    } catch (err) {
      console.error(`   ❌ Failed: ${err.reason || err.shortMessage || err.message}`);
    }
  }

  const finalNextId = await platform.nextGameId();
  console.log(`\n🎮 Migration complete! nextGameId: ${finalNextId}`);
  console.log("✅ Saare games naye contract pe live hain!");
}

main().catch(err => { console.error(err); process.exit(1); });