import "server-only";
import { cookies } from "next/headers";

export type Lang = "en" | "ta";

const en = {
  overview: "Overview", members: "Members", donors: "Donors", disbursements: "Disbursements", admin: "Admin",
  tagline: "Small contributions · Bigger impact",
  footer: "Supporting orphaned children through small, consistent contributions — with every rupee tracked openly.",
  founded: "Founded 05 Oct 2024",
  address: "Sivalingapuram, Alangulam, Tenkasi, Tamil Nadu",
  heroA: "Small contributions.", heroB: "A bigger impact.",
  seeStatus: "See member status", whereFunds: "Where funds went",
  availableBalance: "Available balance", thisMonth: "This month", paidFull: "members paid in full",
  totalCollected: "Total collected", memberContrib: "Member contributions", donorFunding: "Donor funding", fundsDonated: "Funds donated",
  monthlyInflow: "Monthly inflow", atAGlance: "At a glance", monthlyTarget: "Monthly target", perMember: "Per member / month",
  monthlyContrib: "Monthly contributions", month: "Month", member: "Member", totalPaid: "Total paid", status: "Status",
  Paid: "Paid", "Partially paid": "Partially paid", Pending: "Pending",
  externalDonations: "External donations", totalDonorFunding: "Total donor funding",
  whereTheFundsWent: "Where the funds went", totalDonated: "Total donated", proof: "Proof of donation", viewReceipt: "View receipt",
  history: "Payment history", backToMembers: "All members", monthsPaid: "Months paid", noPayments: "No payments recorded yet.", date: "Date", amount: "Amount", reference: "Reference",
  lang: "தமிழ்",
};

const ta: typeof en = {
  overview: "முகப்பு", members: "உறுப்பினர்கள்", donors: "நன்கொடையாளர்கள்", disbursements: "வழங்கல்கள்", admin: "நிர்வாகி",
  address: "சிவலிங்கபுரம், ஆலங்குளம், தென்காசி, தமிழ்நாடு",
  tagline: "சிறு பங்களிப்பு · பெரிய தாக்கம்",
  footer: "சிறு, தொடர்ச்சியான பங்களிப்புகளால் ஆதரவற்ற குழந்தைகளுக்கு உதவுகிறோம் — ஒவ்வொரு ரூபாயும் வெளிப்படையாக.",
  founded: "தொடக்கம் 05 அக் 2024",
  heroA: "சிறு பங்களிப்பு.", heroB: "பெரிய தாக்கம்.",
  seeStatus: "உறுப்பினர் நிலை", whereFunds: "நிதி எங்கே சென்றது",
  availableBalance: "இருப்புத் தொகை", thisMonth: "இந்த மாதம்", paidFull: "உறுப்பினர்கள் முழுவதும் செலுத்தினர்",
  totalCollected: "மொத்த வசூல்", memberContrib: "உறுப்பினர் பங்களிப்பு", donorFunding: "நன்கொடையாளர் நிதி", fundsDonated: "வழங்கிய நிதி",
  monthlyInflow: "மாதாந்திர வரவு", atAGlance: "ஒரே பார்வையில்", monthlyTarget: "மாத இலக்கு", perMember: "உறுப்பினருக்கு / மாதம்",
  monthlyContrib: "மாதாந்திர பங்களிப்புகள்", month: "மாதம்", member: "உறுப்பினர்", totalPaid: "மொத்தம் செலுத்தியது", status: "நிலை",
  Paid: "செலுத்தினார்", "Partially paid": "பகுதியாக", Pending: "நிலுவை",
  externalDonations: "வெளி நன்கொடைகள்", totalDonorFunding: "மொத்த நன்கொடையாளர் நிதி",
  whereTheFundsWent: "நிதி எங்கே சென்றது", totalDonated: "மொத்தம் வழங்கியது", proof: "வழங்கலுக்கான ஆதாரம்", viewReceipt: "ரசீதைப் பார்",
  history: "செலுத்தல் வரலாறு", backToMembers: "அனைத்து உறுப்பினர்கள்", monthsPaid: "செலுத்திய மாதங்கள்", noPayments: "இன்னும் எந்தப் பணமும் பதிவாகவில்லை.", date: "தேதி", amount: "தொகை", reference: "குறிப்பு",
  lang: "English",
};

export type Dict = typeof en;

export async function getLang(): Promise<Lang> {
  return (await cookies()).get("lang")?.value === "ta" ? "ta" : "en";
}

export async function getT(): Promise<{ t: Dict; lang: Lang }> {
  const lang = await getLang();
  return { t: lang === "ta" ? ta : en, lang };
}
