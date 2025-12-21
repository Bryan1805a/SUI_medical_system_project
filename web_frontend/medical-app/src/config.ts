// src/config.ts
import { getFullnodeUrl } from "@mysten/sui.js/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

export const NETWORK = "devnet";

// Thay thế bằng ID vừa lấy được ở trên
export const PACKAGE_ID = "0xb308c263113d92ce78941ea4bfb624124bf7c253c5e249674814dfe08a894efc"; 
export const DOCTOR_CAP_ID = "0x0bc41b0e3df7f4daefd1a9c173ad8ab5f8f1b19c02d01977dc56fd8bd5db2faa";
export const MODULE_NAME = "core"; // Tên module trong file Move

export const { networkConfig } = createNetworkConfig({
	devnet: { url: getFullnodeUrl("devnet") },
});