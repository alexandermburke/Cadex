// If your Node environment doesn't support ES modules, switch import -> require statements.
const fs = require('fs');
const admin = require('firebase-admin');

// Load your Firebase service account credentials
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf-8'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Access Firestore
const db = admin.firestore();

// An array of 50 landmark U.S. Supreme Court cases with minimal data.
// Each entry has a unique caseNumber, an approximate decisionDate (year), the official citation (if known),
// and empty placeholders for content and volume. Feel free to customize these further.
const LANDMARK_CASES = [
  {
    caseNumber: "300001",
    title: "Marbury v. Madison",
    decisionDate: "1803",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "5 U.S. (1 Cranch) 137"
  },
  {
    caseNumber: "300002",
    title: "McCulloch v. Maryland",
    decisionDate: "1819",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "17 U.S. (4 Wheat.) 316"
  },
  {
    caseNumber: "300003",
    title: "Gibbons v. Ogden",
    decisionDate: "1824",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "22 U.S. (9 Wheat.) 1"
  },
  {
    caseNumber: "300004",
    title: "Dred Scott v. Sandford",
    decisionDate: "1857",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "60 U.S. (19 How.) 393"
  },
  {
    caseNumber: "300005",
    title: "Plessy v. Ferguson",
    decisionDate: "1896",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "163 U.S. 537"
  },
  {
    caseNumber: "300006",
    title: "Lochner v. New York",
    decisionDate: "1905",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "198 U.S. 45"
  },
  {
    caseNumber: "300007",
    title: "Schenck v. United States",
    decisionDate: "1919",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "249 U.S. 47"
  },
  {
    caseNumber: "300008",
    title: "Gitlow v. New York",
    decisionDate: "1925",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "268 U.S. 652"
  },
  {
    caseNumber: "300009",
    title: "Near v. Minnesota",
    decisionDate: "1931",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "283 U.S. 697"
  },
  {
    caseNumber: "300010",
    title: "Palko v. Connecticut",
    decisionDate: "1937",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "302 U.S. 319"
  },
  {
    caseNumber: "300011",
    title: "West Coast Hotel Co. v. Parrish",
    decisionDate: "1937",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "300 U.S. 379"
  },
  {
    caseNumber: "300012",
    title: "Minersville School District v. Gobitis",
    decisionDate: "1940",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "310 U.S. 586"
  },
  {
    caseNumber: "300013",
    title: "West Virginia State Board of Education v. Barnette",
    decisionDate: "1943",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "319 U.S. 624"
  },
  {
    caseNumber: "300014",
    title: "Korematsu v. United States",
    decisionDate: "1944",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "323 U.S. 214"
  },
  {
    caseNumber: "300015",
    title: "Everson v. Board of Education",
    decisionDate: "1947",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "330 U.S. 1"
  },
  {
    caseNumber: "300016",
    title: "Shelley v. Kraemer",
    decisionDate: "1948",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "334 U.S. 1"
  },
  {
    caseNumber: "300017",
    title: "Brown v. Board of Education",
    decisionDate: "1954",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "347 U.S. 483"
  },
  {
    caseNumber: "300018",
    title: "Mapp v. Ohio",
    decisionDate: "1961",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "367 U.S. 643"
  },
  {
    caseNumber: "300019",
    title: "Baker v. Carr",
    decisionDate: "1962",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "369 U.S. 186"
  },
  {
    caseNumber: "300020",
    title: "Gideon v. Wainwright",
    decisionDate: "1963",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "372 U.S. 335"
  },
  {
    caseNumber: "300021",
    title: "New York Times Co. v. Sullivan",
    decisionDate: "1964",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "376 U.S. 254"
  },
  {
    caseNumber: "300022",
    title: "Griswold v. Connecticut",
    decisionDate: "1965",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "381 U.S. 479"
  },
  {
    caseNumber: "300023",
    title: "Miranda v. Arizona",
    decisionDate: "1966",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "384 U.S. 436"
  },
  {
    caseNumber: "300024",
    title: "Terry v. Ohio",
    decisionDate: "1968",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "392 U.S. 1"
  },
  {
    caseNumber: "300025",
    title: "Tinker v. Des Moines Independent Community School District",
    decisionDate: "1969",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "393 U.S. 503"
  },
  {
    caseNumber: "300026",
    title: "Lemon v. Kurtzman",
    decisionDate: "1971",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "403 U.S. 602"
  },
  {
    caseNumber: "300027",
    title: "Roe v. Wade",
    decisionDate: "1973",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "410 U.S. 113"
  },
  {
    caseNumber: "300028",
    title: "United States v. Nixon",
    decisionDate: "1974",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "418 U.S. 683"
  },
  {
    caseNumber: "300029",
    title: "Buckley v. Valeo",
    decisionDate: "1976",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "424 U.S. 1"
  },
  {
    caseNumber: "300030",
    title: "Regents of the University of California v. Bakke",
    decisionDate: "1978",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "438 U.S. 265"
  },
  {
    caseNumber: "300031",
    title: "New Jersey v. T.L.O.",
    decisionDate: "1985",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "469 U.S. 325"
  },
  {
    caseNumber: "300032",
    title: "Hazelwood School District v. Kuhlmeier",
    decisionDate: "1988",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "484 U.S. 260"
  },
  {
    caseNumber: "300033",
    title: "Texas v. Johnson",
    decisionDate: "1989",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "491 U.S. 397"
  },
  {
    caseNumber: "300034",
    title: "Planned Parenthood of Southeastern Pennsylvania v. Casey",
    decisionDate: "1992",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "505 U.S. 833"
  },
  {
    caseNumber: "300035",
    title: "United States v. Lopez",
    decisionDate: "1995",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "514 U.S. 549"
  },
  {
    caseNumber: "300036",
    title: "Clinton v. City of New York",
    decisionDate: "1998",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "524 U.S. 417"
  },
  {
    caseNumber: "300037",
    title: "Bush v. Gore",
    decisionDate: "2000",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "531 U.S. 98"
  },
  {
    caseNumber: "300038",
    title: "Lawrence v. Texas",
    decisionDate: "2003",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "539 U.S. 558"
  },
  {
    caseNumber: "300039",
    title: "Kelo v. City of New London",
    decisionDate: "2005",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "545 U.S. 469"
  },
  {
    caseNumber: "300040",
    title: "District of Columbia v. Heller",
    decisionDate: "2008",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "554 U.S. 570"
  },
  {
    caseNumber: "300041",
    title: "Citizens United v. Federal Election Commission",
    decisionDate: "2010",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "558 U.S. 310"
  },
  {
    caseNumber: "300042",
    title: "National Federation of Independent Business v. Sebelius",
    decisionDate: "2012",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "567 U.S. 519"
  },
  {
    caseNumber: "300043",
    title: "Shelby County v. Holder",
    decisionDate: "2013",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "570 U.S. 529"
  },
  {
    caseNumber: "300044",
    title: "Burwell v. Hobby Lobby Stores, Inc.",
    decisionDate: "2014",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "573 U.S. 682"
  },
  {
    caseNumber: "300045",
    title: "Obergefell v. Hodges",
    decisionDate: "2015",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "576 U.S. 644"
  },
  {
    caseNumber: "300046",
    title: "Fisher v. University of Texas at Austin",
    decisionDate: "2016",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "579 U.S. 365"
  },
  {
    caseNumber: "300047",
    title: "Carpenter v. United States",
    decisionDate: "2018",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "585 U.S. ___"
  },
  {
    caseNumber: "300048",
    title: "Bostock v. Clayton County",
    decisionDate: "2020",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "590 U.S. ___"
  },
  {
    caseNumber: "300049",
    title: "Fulton v. City of Philadelphia",
    decisionDate: "2021",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "593 U.S. ___"
  },
  {
    caseNumber: "300050",
    title: "Dobbs v. Jackson Women’s Health Organization",
    decisionDate: "2022",
    jurisdiction: "U.S. Supreme Court",
    volume: "",
    content: "",
    citation: "597 U.S. ___"
  }
];

// Main function to upload each case doc to Firestore
async function main() {
  try {
    console.log(`Starting upload of ${LANDMARK_CASES.length} landmark cases to Firestore...`);

    for (const landmarkCase of LANDMARK_CASES) {
      // Use caseNumber as the Firestore doc ID, or auto-generate if you prefer:
      const docRef = db.collection('capCases').doc(landmarkCase.caseNumber);
      await docRef.set(landmarkCase);

      console.log(`Uploaded: ${landmarkCase.title} [ID: ${landmarkCase.caseNumber}]`);
    }

    console.log('All landmark cases have been uploaded successfully!');
  } catch (error) {
    console.error('Error uploading landmark cases:', error);
  }
}

// Execute the script
main();
