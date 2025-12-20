module medical_system::core {
    use std::string::{Self, String};

    // 1. DOCTOR CAPABILITY
    public struct DoctorCap has key, store {
        id: UID,
        hospital_name: String,
    }

    // 2. MEDICAL RECORD (Hồ sơ bệnh án)
    public struct MedicalRecord has key {
        id: UID,
        owner: address,
        records: vector<String>, 
    }

    // 3. PRESCRIPTION (Đơn thuốc điện tử)
    public struct Prescription has key, store {
        id: UID,
        name: String,
        medication_hash: String,
        doctor_id: address,
        patient_id: address,
        is_used: bool,
    }

    // --- CÁC HÀM (FUNCTIONS) ---
    fun init(ctx: &mut TxContext) {
        let admin_cap = DoctorCap {
            id: object::new(ctx),
            hospital_name: string::utf8(b"Sui General Hospital"),
        };
        transfer::transfer(admin_cap, ctx.sender());
    }

    // Register
    public fun create_profile(ctx: &mut TxContext) {
        let record = MedicalRecord {
            id: object::new(ctx),
            owner: ctx.sender(),
            records: vector::empty(),
        };
        transfer::transfer(record, ctx.sender());
    }

    // Issue Prescription
    public fun create_prescription(
        _: &DoctorCap, 
        patient_addr: address,
        name_bytes: vector<u8>,
        ipfs_hash_bytes: vector<u8>,
        ctx: &mut TxContext
    ) {
        let prescription = Prescription {
            id: object::new(ctx),
            name: string::utf8(name_bytes),
            medication_hash: string::utf8(ipfs_hash_bytes),
            doctor_id: ctx.sender(),
            patient_id: patient_addr,
            is_used: false,
        };
        
        transfer::transfer(prescription, patient_addr);
    }

    // Use Prescription
    public fun use_prescription(prescription: &mut Prescription) {
        prescription.is_used = true;
    }
}