// src/config.ts
import { getFullnodeUrl } from "@mysten/sui.js/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

export const NETWORK = "testnet"; // Đổi sang testnet

// IDs cho Medical System v3 trên testnet (có AdminCap để mint DoctorCap)
export const PACKAGE_ID = "0x970ec846e6e195d9ad7685e0532ceadf4c6878563eb4854348736df901cb04ac"; // ✅ PackageID v3 (có AdminCap)
export const LOBBY_ID   = "0x8f74091310eba9d0af3928e864cf3a66b4f51bb40b6dc019eb96706cdaa933a2"; // ✅ Lobby (Shared Object) v3
export const MODULE_NAME = "core"; // Tên module trong file Move

export const { networkConfig } = createNetworkConfig({
	devnet: { url: getFullnodeUrl("devnet") },
	testnet: { url: getFullnodeUrl("testnet") },
	mainnet: { url: getFullnodeUrl("mainnet") },
});