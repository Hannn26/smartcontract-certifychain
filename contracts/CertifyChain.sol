// SPDX-License-Identifier: MIT  // Ini adalah identifikasi lisensi standar MIT
pragma solidity ^0.8.9;  // Menentukan versi kompiler Solidity yang digunakan (versi 0.8.9 atau lebih tinggi)

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";  // Mengimpor kontrak dasar ERC721 NFT
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";  // Ekstensi untuk menyimpan URI metadata
import "@openzeppelin/contracts/access/AccessControl.sol";  // Mengimpor fitur kontrol akses berbasis peran
import "@openzeppelin/contracts/utils/Counters.sol";  // Utilitas penghitung untuk ID token

/**
 * @title CertifyChain
 * @dev Kontrak ERC721 untuk sertifikat ijazah universitas sebagai NFT
 * Alur meliputi: Auth, Login by Address, Verifikasi Whitelist, 
 * Upload oleh Universitas, dan Tampilan oleh Mahasiswa/Publik
 */
contract CertifyChain is ERC721, ERC721URIStorage, AccessControl {  // Kontrak utama yang mewarisi ERC721, ERC721URIStorage, dan AccessControl
    using Counters for Counters.Counter;  // Menggunakan library Counters untuk tipe data Counter
    Counters.Counter private _tokenIdCounter;  // Penghitung ID token yang unik

    // Mendefinisikan peran-peran dalam sistem
    bytes32 public constant UNIVERSITY_ROLE = keccak256("UNIVERSITY_ROLE");  // Peran untuk universitas (dapat menerbitkan ijazah)
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");  // Peran untuk admin (dapat mendaftarkan universitas)

    // Melacak alamat yang sudah terdaftar dalam whitelist yang dapat menerbitkan/mengunggah sertifikat
    mapping(address => bool) public isWhitelisted;  // Pemetaan alamat ke status whitelist (true/false)
    
    // Memetakan dompet mahasiswa ke universitas mereka
    mapping(address => address) public studentToUniversity;  // Pemetaan alamat mahasiswa ke alamat universitas
    
    // Memetakan alamat mahasiswa ke ID token sertifikat
    mapping(address => uint256) public studentCertificate;  // Pemetaan alamat mahasiswa ke tokenId ijazah

    // Memetakan tokenId ke detail sertifikat
    struct Certificate {  // Struktur data untuk menyimpan detail sertifikat
        string studentName;  // Nama mahasiswa
        string universityName;  // Nama universitas
        uint256 graduationYear;  // Tahun kelulusan
        string major;  // Jurusan/program studi
        bool isVerified;  // Status verifikasi (true jika sudah diverifikasi)
    }
    mapping(uint256 => Certificate) public certificates;  // Pemetaan tokenId ke data sertifikat

    // Events (peristiwa) untuk mencatat aktivitas penting
    event UniversityRegistered(address indexed universityAddress, string name);  // Event saat universitas didaftarkan
    event AddressWhitelisted(address indexed whitelistedAddress, address indexed university);  // Event saat alamat ditambahkan ke whitelist
    event CertificateMinted(address indexed to, uint256 indexed tokenId, string tokenURI);  // Event saat sertifikat diterbitkan

    // Konstruktor - dijalankan sekali saat kontrak dikerahkan
    constructor() ERC721("CertifyChain", "CTC") {  // Inisialisasi ERC721 dengan nama dan simbol
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);  // Memberikan peran admin default ke pengirim (deployer)
        _grantRole(ADMIN_ROLE, msg.sender);  // Memberikan peran ADMIN ke pengirim (deployer)
    }

    /**
     * @dev Mendaftarkan universitas baru dengan hak untuk menerbitkan ijazah
     * @param universityAddress Alamat dompet universitas
     * @param universityName Nama universitas
     */
    function registerUniversity(address universityAddress, string memory universityName) 
        public onlyRole(ADMIN_ROLE) {  // Hanya admin yang dapat memanggil fungsi ini
        _grantRole(UNIVERSITY_ROLE, universityAddress);  // Memberikan peran universitas
        isWhitelisted[universityAddress] = true;  // Menandai alamat universitas sebagai whitelisted
        emit UniversityRegistered(universityAddress, universityName);  // Memancarkan event pendaftaran
    }

    /**
     * @dev Menambahkan alamat mahasiswa ke whitelist agar dapat menerima sertifikat
     * @param studentAddress Alamat dompet yang akan ditambahkan ke whitelist
     */
    function whitelistAddress(address studentAddress) 
        public onlyRole(UNIVERSITY_ROLE) {  // Hanya universitas yang dapat memanggil fungsi ini
        isWhitelisted[studentAddress] = true;  // Menandai alamat mahasiswa sebagai whitelisted
        studentToUniversity[studentAddress] = msg.sender;  // Menautkan mahasiswa ke universitas yang memanggilnya
        emit AddressWhitelisted(studentAddress, msg.sender);  // Memancarkan event whitelist
    }

    /**
     * @dev Menerbitkan sertifikat NFT sebagai universitas
     * @param to Alamat penerima (mahasiswa)
     * @param tokenURI URI metadata sertifikat
     * @param studentName Nama mahasiswa
     * @param universityName Nama universitas
     * @param graduationYear Tahun kelulusan
     * @param major Jurusan/bidang studi
     */
    function mintCertificate(
        address to,  // Alamat penerima
        string memory tokenURI,  // URI metadata
        string memory studentName,  // Nama mahasiswa
        string memory universityName,  // Nama universitas
        uint256 graduationYear,  // Tahun kelulusan
        string memory major  // Jurusan
    ) public onlyRole(UNIVERSITY_ROLE) {  // Hanya universitas yang dapat memanggil fungsi ini
        require(isWhitelisted[to], "Student address is not whitelisted");  // Memastikan alamat mahasiswa sudah dalam whitelist
        require(studentToUniversity[to] == msg.sender, "Student not registered with this university");  // Memastikan mahasiswa terdaftar di universitas ini
        
        uint256 tokenId = _tokenIdCounter.current();  // Mendapatkan ID token berikutnya
        _tokenIdCounter.increment();  // Menambah penghitung token
        
        _safeMint(to, tokenId);  // Menerbitkan NFT ke alamat mahasiswa
        _setTokenURI(tokenId, tokenURI);  // Menetapkan URI metadata
        
        // Menyimpan detail sertifikat
        certificates[tokenId] = Certificate({
            studentName: studentName,
            universityName: universityName,
            graduationYear: graduationYear,
            major: major,
            isVerified: true  // Otomatis terverifikasi karena diterbitkan oleh universitas
        });
        
        studentCertificate[to] = tokenId;  // Mencatat ID token mahasiswa
        
        emit CertificateMinted(to, tokenId, tokenURI);  // Memancarkan event penerbitan
    }

    /**
     * @dev Mendapatkan detail sertifikat berdasarkan tokenId
     */
    function getCertificateDetails(uint256 tokenId) public view returns (
        string memory studentName,  // Nama mahasiswa
        string memory universityName,  // Nama universitas
        uint256 graduationYear,  // Tahun kelulusan
        string memory major,  // Jurusan
        bool isVerified  // Status verifikasi
    ) {
        Certificate memory cert = certificates[tokenId];  // Mengambil data sertifikat
        return (  // Mengembalikan semua detail sertifikat
            cert.studentName,  // Nama mahasiswa
            cert.universityName,  // Nama universitas
            cert.graduationYear,  // Tahun kelulusan
            cert.major,  // Jurusan
            cert.isVerified  // Status verifikasi
        );
    }

    /**
     * @dev Mendapatkan tokenId sertifikat berdasarkan alamat mahasiswa
     */
    function getStudentCertificate(address studentAddress) public view returns (uint256) {
        return studentCertificate[studentAddress];  // Mengembalikan ID token sertifikat mahasiswa
    }

    /**
     * @dev Memeriksa apakah alamat sudah masuk whitelist
     */
    function checkWhitelisted(address addr) public view returns (bool) {
        return isWhitelisted[addr];  // Mengembalikan status whitelist alamat
    }

    // Override yang diperlukan untuk ERC721URIStorage
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);  // Memanggil fungsi _burn dari kontrak induk
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);  // Memanggil fungsi tokenURI dari kontrak induk
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)  // Fungsi override dari kedua kontrak induk
        returns (bool)
    {
        return super.supportsInterface(interfaceId);  // Memanggil fungsi dari kontrak induk
    }
}
