// campus enum
const CampusEnum = Object.freeze({
  SHAH_ALAM: "UiTM Shah Alam",
  KOTA_KINABALU: "UiTM Kampus Kota Kinabalu",
  TAWAU: "UiTM Kampus Tawau",
  MACHANG: "UiTM Kampus Machang",
  KOTA_BHARU: "UiTM Kampus Kota Bharu",
  SAMARAHAN: "UiTM Kampus Samarahan",
  SAMARAHAN_2: "UiTM Kampus Samarahan 2",
  MUKAH: "UiTM Kampus Mukah",
  ARAU: "UiTM Kampus Arau",
  DUNGUN: "UiTM Kampus Dungun",
  CHENDERING: "UiTM Kampus Chendering",
  BUKIT_BESI: "UiTM Kampus Bukit Besi",
  SEGAMAT: "UiTM Kampus Segamat",
  PASIR_GUDANG: "UiTM Kampus Pasir Gudang",
  JENGKA: "UiTM Kampus Jengka",
  RAUB: "UiTM Kampus Raub",
  ALOR_GAJAH: "UiTM Kampus Alor Gajah",
  JASIN: "UiTM Kampus Jasin",
  BANDARAYA_MELAKA: "UiTM Kampus Bandaraya Melaka",
  SERI_ISKANDAR: "UiTM Seri Iskandar",
  TAPAH: "UiTM Kampus Tapah",
  SUNGAI_PETANI: "UiTM Kampus Sg. Petani",
  BUKIT_MERTAJAM: "UiTM Kampus Bukit Mertajam",
  BERTAM: "UiTM Kampus Bertam",
  KUALA_PILAH: "UiTM Kampus Kuala Pilah",
  SEREMBAN: "UiTM Kampus Seremban 3",
  PUNCAK_PERDANA: "UiTM Kampus Puncak Perdana",
  PUNCAK_ALAM: "UiTM Puncak Alam",
  SUNGAI_BULOH: "UiTM Kampus Sungai Buloh",
});

const FacultyEnum = Object.freeze({
  // GUGUSAN SAINS & TEKNOLOGI
  APPLIED_SCIENCE: "Fakulti Sains Gunaan",
  COMPUTER_SCIENCE_MATH: "Fakulti Sains Komputer dan Matematik",
  ARCHITECTURE_SURVEY: "Fakulti Senibina, Perancangan dan Ukur",
  SPORTS_SCIENCE: "Fakulti Sains Sukan dan Rekreasi",
  MEDICINE: "Fakulti Perubatan",
  DENTISTRY: "Fakulti Pergigian",
  HEALTH_SCIENCES: "Fakulti Sains Kesihatan",
  PHARMACY: "Fakulti Farmasi",
  ENGINEERING: "Kolej Pengajian Kejuruteraan",
  AGROTECHNOLOGY: "Fakulti Perladangan dan Agroteknologi",

  // GUGUSAN SAINS SOSIAL & KEMANUSIAAN
  LAW: "Fakulti Undang-Undang",
  ADMIN_POLICY: "Fakulti Sains Pentadbiran dan Pengajian Polisi",
  COMMUNICATION_MEDIA: "Fakulti Komunikasi dan Pengajian Media",
  CREATIVE_ARTS: "Kolej Pengajian Seni Kreatif",
  EDUCATION: "Fakulti Pendidikan",

  // GUGUSAN PENGURUSAN & PERNIAGAAN
  ACCOUNTANCY: "Fakulti Perakaunan",
  BUSINESS_MANAGEMENT: "Fakulti Pengurusan Perniagaan",
  HOTEL_TOURISM: "Fakulti Pengurusan Hotel dan Perlancongan",
  INFORMATION_MANAGEMENT: "Fakulti Pengurusan Maklumat",

  // PUSAT AKADEMIK
  LANGUAGE_STUDIES: "Akademi Pengajian Bahasa",
  ISLAMIC_STUDIES: "Akademi Pengajian Islam Kontemporari",
});

const StateEnum = Object.freeze({
  // States
  JOHOR: "Johor",
  KEDAH: "Kedah",
  KELANTAN: "Kelantan",
  MELAKA: "Melaka",
  NEGERI_SEMBILAN: "Negeri Sembilan",
  PAHANG: "Pahang",
  PERAK: "Perak",
  PERLIS: "Perlis",
  PULAU_PINANG: "Pulau Pinang",
  SABAH: "Sabah",
  SARAWAK: "Sarawak",
  SELANGOR: "Selangor",
  TERENGGANU: "Terengganu",

  // Federal Territories
  KUALA_LUMPUR: "Kuala Lumpur", // ? idk yet if i should set the "wilayah persekutuan" or just "kuala lumpur"
  LABUAN: "Labuan",
  PUTRAJAYA: "Putrajaya",
});

module.exports = {
  CampusEnum,
  FacultyEnum,
  StateEnum,
};
