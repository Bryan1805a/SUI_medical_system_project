// src/config.ts
import { getFullnodeUrl } from "@mysten/sui.js/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

export const NETWORK = "testnet"; // Đổi sang testnet

// IDs cho Medical System v3 trên testnet (có AdminCap để mint DoctorCap)
export const PACKAGE_ID = "0x5020b2073780e44c582daa9c8ba54a2097c83acbac5f68583faf76b5bf890016";

export const ADMIN_CAP_ID = "0xef5c886f07e92e5328b9656f29756d5f8a51583b83d318ebfd9c34916aaaf88e";

export const LOBBY_ID = "0x855a126091a8356f5eefae886cbd57d3ff18447a3476ecf8b8c18c01d574591a";

export const MODULE_NAME = "core"; // Tên module trong file Move

export const { networkConfig } = createNetworkConfig({
	devnet: { url: getFullnodeUrl("devnet") },
	testnet: { url: getFullnodeUrl("testnet") },
	mainnet: { url: getFullnodeUrl("mainnet") },
});