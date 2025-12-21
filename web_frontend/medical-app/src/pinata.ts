// src/pinata.ts
import axios from "axios";

// Member 4 dán cái mã JWT dài ngoằng vào đây nhé!
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyNjE3NjYxMy00YTQ3LTQwYTktYTA5Ny0xYjcyMDljYjM1ZmYiLCJlbWFpbCI6ImJ1dW5nb2MxODA1QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI3NTlhNmIwOWI4NDExZGZjOGJiYyIsInNjb3BlZEtleVNlY3JldCI6Ijg0Njg5ODUxOThlOWY5OGQ1YmMwMWNjODE3NmUzMWE4ODQwNjEwZWU2MGUwZDJkOTQ0ODY0YzRlY2U0NjU3MjUiLCJleHAiOjE3OTc4NjI5NDh9.o1IwdOFtCm7gHS4VwVH38LIEZCtRuxJ0nJtyr6C_lv0";

export async function uploadToPinata(file: File) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  let data = new FormData();
  data.append("file", file);

  const metadata = JSON.stringify({
    name: "Medical_Prescription",
  });
  data.append("pinataMetadata", metadata);

  const options = JSON.stringify({
    cidVersion: 0,
  });
  data.append("pinataOptions", options);

  try {
    const res = await axios.post(url, data, {
      // Xóa dòng maxBodyLength (Trình duyệt không cần giới hạn này)
      headers: {
        // Xóa dòng Content-Type thủ công. 
        // Axios trên trình duyệt sẽ TỰ ĐỘNG nhận diện FormData và thêm boundary chuẩn.
        Authorization: `Bearer ${PINATA_JWT}`,
      },
    });
    
    // Trả về mã Hash (CID)
    return res.data.IpfsHash;
  } catch (error) {
    console.error("Lỗi upload IPFS:", error);
    return null;
  }
}