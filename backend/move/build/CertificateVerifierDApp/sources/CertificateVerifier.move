module certificate_addr::CertificateVerifier {
    use std::vector;
    use std::signer;
    use aptos_framework::event;
    use aptos_framework::account;
    use aptos_framework::timestamp;

    struct Certificate has key, store, drop, copy {
        id: u64,
        recipient: address,
        ipfs_cid: vector<u8>,
        issuer: address,
        issued_at: u64,
    }

    struct CertificateStore has key {
        certificates: vector<Certificate>,
        set_certificate_event: event::EventHandle<Certificate>,
    }

    public entry fun initialize(account: &signer) {
        let certificate_store = CertificateStore {
            certificates: vector::empty(),
            set_certificate_event: account::new_event_handle<Certificate>(account),
        };
        move_to(account, certificate_store);
    }

    public entry fun issue_certificate(
        issuer: &signer,
        recipient: address,
        ipfs_cid: vector<u8>
    ) acquires CertificateStore {
        let issuer_addr = signer::address_of(issuer);
        let certificate_store = borrow_global_mut<CertificateStore>(issuer_addr);
        
        let certificate = Certificate {
            id: vector::length(&certificate_store.certificates),
            recipient,
            ipfs_cid,
            issuer: issuer_addr,
            issued_at: timestamp::now_seconds(),
        };
        
        vector::push_back(&mut certificate_store.certificates, certificate);
        event::emit_event(&mut certificate_store.set_certificate_event, certificate);
    }

    public fun verify_certificate(
        issuer: address,
        recipient: address,
        ipfs_cid: vector<u8>
    ): bool acquires CertificateStore {
        let certificate_store = borrow_global<CertificateStore>(issuer);
        let certificates = &certificate_store.certificates;
        let i = 0;
        let len = vector::length(certificates);
        
        while (i < len) {
            let cert = vector::borrow(certificates, i);
            if (cert.recipient == recipient && cert.ipfs_cid == ipfs_cid) {
                return true
            };
            i = i + 1;
        };
        false
    }
}