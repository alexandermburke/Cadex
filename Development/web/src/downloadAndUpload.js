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
    "caseNumber": "300351",
    "title": "Abbott v. Beth Israel Medical Center",
    "decisionDate": "1978",
    "jurisdiction": "New York Supreme Court, Appellate Division",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300352",
    "title": "Adams v. Lindblad Travel, Inc.",
    "decisionDate": "1980",
    "jurisdiction": "7th Circuit",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300353",
    "title": "Addie v. Dumbreck",
    "decisionDate": "1929",
    "jurisdiction": "House of Lords (Scotland)",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300354",
    "title": "Adler v. Board of Education",
    "decisionDate": "1952",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300355",
    "title": "Alaska Packers' Assn. v. Domenico",
    "decisionDate": "1902",
    "jurisdiction": "9th Circuit",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300356",
    "title": "Allen v. Wright",
    "decisionDate": "1984",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300357",
    "title": "Allison Engine Co. v. United States ex rel. Sanders",
    "decisionDate": "2008",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300358",
    "title": "Anderson v. Liberty Lobby, Inc.",
    "decisionDate": "1986",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300359",
    "title": "Armory v. Delamirie",
    "decisionDate": "1722",
    "jurisdiction": "King's Bench (England)",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300360",
    "title": "Ashby v. White",
    "decisionDate": "1703",
    "jurisdiction": "King's Bench (England)",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300361",
    "title": "Baker v. Weedon",
    "decisionDate": "1972",
    "jurisdiction": "Mississippi Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300362",
    "title": "Baker v. State",
    "decisionDate": "1999",
    "jurisdiction": "Vermont Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300363",
    "title": "Baltimore & Ohio R.R. v. Goodman",
    "decisionDate": "1927",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300364",
    "title": "Bane v. Ferguson",
    "decisionDate": "1991",
    "jurisdiction": "8th Circuit",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300365",
    "title": "Barton v. Bee Line, Inc.",
    "decisionDate": "1936",
    "jurisdiction": "New York Supreme Court, Appellate Division",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300366",
    "title": "Beachcomber Coins, Inc. v. Boskett",
    "decisionDate": "1979",
    "jurisdiction": "New Jersey Superior Court, Appellate Division",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300367",
    "title": "Beardsley v. State",
    "decisionDate": "1907",
    "jurisdiction": "Michigan Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300368",
    "title": "Beavers v. Haubert",
    "decisionDate": "1905",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300369",
    "title": "Bernstein v. Nemeyer",
    "decisionDate": "1990",
    "jurisdiction": "Connecticut Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300370",
    "title": "Bethel School District v. Fraser",
    "decisionDate": "1986",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300371",
    "title": "Board of Curators of the University of Missouri v. Horowitz",
    "decisionDate": "1978",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300372",
    "title": "Boddie v. Connecticut",
    "decisionDate": "1971",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300373",
    "title": "Boggs v. Boggs",
    "decisionDate": "1997",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300374",
    "title": "Bouligny, Inc. v. United Steelworkers",
    "decisionDate": "1965",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300375",
    "title": "Bradshaw v. Daniel",
    "decisionDate": "1993",
    "jurisdiction": "Tennessee Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300376",
    "title": "Breedlove v. Suttles",
    "decisionDate": "1937",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300377",
    "title": "Brooks v. Robinson",
    "decisionDate": "1972",
    "jurisdiction": "Indiana Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300378",
    "title": "Brown v. Legal Foundation of Washington",
    "decisionDate": "2003",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300379",
    "title": "Bryant v. Zimmerman",
    "decisionDate": "1928",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300380",
    "title": "Bush v. Vera",
    "decisionDate": "1996",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300381",
    "title": "Caldwell v. United States",
    "decisionDate": "1928",
    "jurisdiction": "9th Circuit",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300382",
    "title": "Callano v. Oakwood Park Homes Corp.",
    "decisionDate": "1966",
    "jurisdiction": "New Jersey Superior Court, Appellate Division",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300383",
    "title": "Cameron v. State",
    "decisionDate": "1955",
    "jurisdiction": "Texas Court of Criminal Appeals",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300384",
    "title": "Campbell v. S.S. Kresge Co.",
    "decisionDate": "1931",
    "jurisdiction": "Michigan Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300385",
    "title": "Cannon v. University of Chicago",
    "decisionDate": "1979",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300386",
    "title": "Chaplinsky v. New Hampshire",
    "decisionDate": "1942",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300387",
    "title": "Church of Lukumi Babalu Aye v. City of Hialeah",
    "decisionDate": "1993",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300388",
    "title": "City of Cleburne v. Cleburne Living Center",
    "decisionDate": "1985",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300389",
    "title": "City of Philadelphia v. New Jersey",
    "decisionDate": "1978",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300390",
    "title": "Cloverleaf Butter Co. v. Patterson",
    "decisionDate": "1942",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300391",
    "title": "Cole v. Stein",
    "decisionDate": "1960",
    "jurisdiction": "Maine Supreme Judicial Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300392",
    "title": "Colegrove v. Green",
    "decisionDate": "1946",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300393",
    "title": "Collins v. Eli Lilly Co.",
    "decisionDate": "1984",
    "jurisdiction": "Indiana Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300394",
    "title": "Commonwealth v. Malone",
    "decisionDate": "1946",
    "jurisdiction": "Pennsylvania Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300395",
    "title": "Connor v. Finch",
    "decisionDate": "1977",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300396",
    "title": "Cooper v. Pate",
    "decisionDate": "1964",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300397",
    "title": "County of Oneida v. Oneida Indian Nation",
    "decisionDate": "1985",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300398",
    "title": "Craigmile v. Sorensen",
    "decisionDate": "1972",
    "jurisdiction": "Utah Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300399",
    "title": "Crawford v. Marion County Election Board",
    "decisionDate": "2008",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300400",
    "title": "Creasy v. Rusk",
    "decisionDate": "2000",
    "jurisdiction": "Indiana Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300401",
    "title": "Cunningham v. Hamilton County",
    "decisionDate": "1999",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300402",
    "title": "Daubert v. Merrell Dow Pharmaceuticals, Inc.",
    "decisionDate": "1993",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300403",
    "title": "Davis v. Bandemer",
    "decisionDate": "1986",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300404",
    "title": "DeFunis v. Odegaard",
    "decisionDate": "1974",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300405",
    "title": "Desnick v. American Broadcasting Companies, Inc.",
    "decisionDate": "1995",
    "jurisdiction": "7th Circuit",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300406",
    "title": "Dickerson v. United States",
    "decisionDate": "2000",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300407",
    "title": "Doe v. Bolton",
    "decisionDate": "1973",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300408",
    "title": "Doland v. Clark",
    "decisionDate": "1952",
    "jurisdiction": "South Dakota Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300409",
    "title": "Donnelly v. DeChristoforo",
    "decisionDate": "1974",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300410",
    "title": "Edwards v. Arizona",
    "decisionDate": "1981",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300411",
    "title": "Elonis v. United States",
    "decisionDate": "2015",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300412",
    "title": "Equal Employment Opportunity Commission v. Abercrombie & Fitch Stores, Inc.",
    "decisionDate": "2015",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300413",
    "title": "Evans v. Newton",
    "decisionDate": "1966",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300414",
    "title": "Ex parte Young",
    "decisionDate": "1908",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300415",
    "title": "Farwell v. Boston & Worcester R.R. Corp.",
    "decisionDate": "1842",
    "jurisdiction": "Massachusetts Supreme Judicial Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300416",
    "title": "Fay v. Noia",
    "decisionDate": "1963",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300417",
    "title": "Fisher v. Carrousel Motor Hotel, Inc.",
    "decisionDate": "1967",
    "jurisdiction": "Texas Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300418",
    "title": "Flemming v. Nestor",
    "decisionDate": "1960",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300419",
    "title": "Florida Bar v. Went For It, Inc.",
    "decisionDate": "1995",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300420",
    "title": "Ford v. Revlon, Inc.",
    "decisionDate": "1987",
    "jurisdiction": "Arizona Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300421",
    "title": "Foster v. Chatman",
    "decisionDate": "2016",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300422",
    "title": "Fountaine v. Stein",
    "decisionDate": "1953",
    "jurisdiction": "Missouri Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300423",
    "title": "Frigaliment Importing Co. v. B.N.S. International Sales Corp.",
    "decisionDate": "1960",
    "jurisdiction": "U.S. District Court, S.D. New York",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300424",
    "title": "Fry v. Napoleon Community Schools",
    "decisionDate": "2017",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300425",
    "title": "Garcia v. San Antonio Metropolitan Transit Authority",
    "decisionDate": "1985",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300426",
    "title": "Gideon v. Brown",
    "decisionDate": "1974",
    "jurisdiction": "Alabama Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300427",
    "title": "Goldwater v. Carter",
    "decisionDate": "1979",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300428",
    "title": "Gregg v. Georgia",
    "decisionDate": "1976",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300429",
    "title": "Groves v. John Wunder Co.",
    "decisionDate": "1939",
    "jurisdiction": "Minnesota Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300430",
    "title": "Hamer v. Neighborhood Housing Services of Chicago",
    "decisionDate": "2017",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300431",
    "title": "Hawthorne v. Kober",
    "decisionDate": "1982",
    "jurisdiction": "Montana Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300432",
    "title": "Hodel v. Irving",
    "decisionDate": "1987",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300433",
    "title": "Holmes v. South Carolina",
    "decisionDate": "2006",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300434",
    "title": "Horowitz v. Horowitz",
    "decisionDate": "1975",
    "jurisdiction": "Florida Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300435",
    "title": "In re Baby M",
    "decisionDate": "1988",
    "jurisdiction": "New Jersey Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300436",
    "title": "In re Quinlan",
    "decisionDate": "1976",
    "jurisdiction": "New Jersey Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300437",
    "title": "In re Winship",
    "decisionDate": "1970",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300438",
    "title": "Indianapolis v. Edmond",
    "decisionDate": "2000",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300439",
    "title": "Ivey v. Swope",
    "decisionDate": "1954",
    "jurisdiction": "California Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300440",
    "title": "Jackson v. Metropolitan Edison Co.",
    "decisionDate": "1974",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300441",
    "title": "Jacob & Youngs, Inc. v. Kent",
    "decisionDate": "1921",
    "jurisdiction": "New York Court of Appeals",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300442",
    "title": "Jefferson v. City of Anchorage",
    "decisionDate": "1982",
    "jurisdiction": "Alaska Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300443",
    "title": "Johnson v. State",
    "decisionDate": "1987",
    "jurisdiction": "Maryland Court of Appeals",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300444",
    "title": "Jones v. U.S. Secret Service",
    "decisionDate": "1992",
    "jurisdiction": "D.C. Circuit",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300445",
    "title": "Kahn v. Shevin",
    "decisionDate": "1974",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300446",
    "title": "Kaiser Aetna v. United States",
    "decisionDate": "1979",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300447",
    "title": "Kamen v. Kemper Financial Services, Inc.",
    "decisionDate": "1991",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300448",
    "title": "Keller v. State Bar of California",
    "decisionDate": "1990",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300449",
    "title": "Kendall v. Ernest Pestana, Inc.",
    "decisionDate": "1985",
    "jurisdiction": "California Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300450",
    "title": "Kerr v. Hickenlooper",
    "decisionDate": "2014",
    "jurisdiction": "10th Circuit",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300451",
    "title": "Keyishian v. Board of Regents",
    "decisionDate": "1967",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300452",
    "title": "Kieffer v. Sears, Roebuck & Co.",
    "decisionDate": "1973",
    "jurisdiction": "Minnesota Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300453",
    "title": "Knapp v. State",
    "decisionDate": "1907",
    "jurisdiction": "Indiana Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300454",
    "title": "Koehring Co. v. Hyde Construction Co.",
    "decisionDate": "1968",
    "jurisdiction": "5th Circuit",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300455",
    "title": "Konigsberg v. State Bar of California",
    "decisionDate": "1961",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300456",
    "title": "Kotch v. Board of River Port Pilot Commissioners",
    "decisionDate": "1947",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300457",
    "title": "Kovacs v. Cooper",
    "decisionDate": "1949",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300458",
    "title": "Krasniqi v. Dallas Co.",
    "decisionDate": "1995",
    "jurisdiction": "Texas Court of Appeals",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300459",
    "title": "Kyllo v. Panzer",
    "decisionDate": "1987",
    "jurisdiction": "North Dakota Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300460",
    "title": "Lampf, Pleva, Lipkind, Prupis & Petigrow v. Gilbertson",
    "decisionDate": "1991",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300461",
    "title": "Lawrence County v. Lead-Deadwood School Dist.",
    "decisionDate": "1985",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300462",
    "title": "Lewis v. Casey",
    "decisionDate": "1996",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300463",
    "title": "Linzer v. EMI Blackwood Music, Inc.",
    "decisionDate": "2016",
    "jurisdiction": "2d Circuit",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300464",
    "title": "Loretto v. Teleprompter CATV Corp.",
    "decisionDate": "1982",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300465",
    "title": "Madden v. Kentucky",
    "decisionDate": "1940",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300466",
    "title": "Malloy v. Hogan",
    "decisionDate": "1964",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300467",
    "title": "Manley v. State",
    "decisionDate": "1915",
    "jurisdiction": "Georgia Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300468",
    "title": "Mann Act Cases",
    "decisionDate": "1913",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300469",
    "title": "Marshall v. Barlow's, Inc.",
    "decisionDate": "1978",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300470",
    "title": "Martin v. Franklin Capital Corp.",
    "decisionDate": "2005",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300471",
    "title": "Massachusetts v. Environmental Protection Agency",
    "decisionDate": "2007",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300472",
    "title": "Matsushita Electric Industrial Co. v. Zenith Radio Corp.",
    "decisionDate": "1986",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300473",
    "title": "McCoy v. Louisiana",
    "decisionDate": "2018",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300474",
    "title": "McFadden v. United States",
    "decisionDate": "2015",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300475",
    "title": "McIntyre v. Ohio Elections Commission",
    "decisionDate": "1995",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300476",
    "title": "Meyer v. Grant",
    "decisionDate": "1988",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300477",
    "title": "Michel v. Louisiana",
    "decisionDate": "1955",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300478",
    "title": "Miller v. Schoene",
    "decisionDate": "1928",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300479",
    "title": "Milliken v. Bradley",
    "decisionDate": "1974",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300480",
    "title": "Milkovich v. Lorain Journal Co.",
    "decisionDate": "1990",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300481",
    "title": "Mirabito v. Liccardi",
    "decisionDate": "1970",
    "jurisdiction": "New York Supreme Court, Appellate Division",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300482",
    "title": "Mississippi University for Women v. Hogan",
    "decisionDate": "1982",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300483",
    "title": "Moore v. Regents of the University of Iowa",
    "decisionDate": "1995",
    "jurisdiction": "Iowa Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300484",
    "title": "Morgan v. United States",
    "decisionDate": "1936",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300485",
    "title": "Morris v. USS Akron",
    "decisionDate": "1967",
    "jurisdiction": "Ohio Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300486",
    "title": "Morton v. Mancari",
    "decisionDate": "1974",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300487",
    "title": "Munn v. Hotchkiss School",
    "decisionDate": "2015",
    "jurisdiction": "2d Circuit",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300488",
    "title": "National Collegiate Athletic Association v. Tarkanian",
    "decisionDate": "1988",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300489",
    "title": "Newport News Shipbuilding & Dry Dock Co. v. EEOC",
    "decisionDate": "1983",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300490",
    "title": "Nixon v. Fitzgerald",
    "decisionDate": "1982",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300491",
    "title": "North Carolina Dept. of Revenue v. Kimberley Rice Kaestner 1992 Family Trust",
    "decisionDate": "2019",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300492",
    "title": "Northern Securities Co. v. United States",
    "decisionDate": "1904",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300493",
    "title": "Ohio v. Clark",
    "decisionDate": "2015",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300494",
    "title": "Olin Mathieson Chemical Corp. v. Francis",
    "decisionDate": "1961",
    "jurisdiction": "6th Circuit",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300495",
    "title": "Palko v. State of Maine",
    "decisionDate": "1969",
    "jurisdiction": "Maine Supreme Judicial Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300496",
    "title": "Panhandle Eastern Pipe Line Co. v. State Highway Commission",
    "decisionDate": "1942",
    "jurisdiction": "Kansas Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300497",
    "title": "Parris v. State",
    "decisionDate": "1977",
    "jurisdiction": "Tennessee Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300498",
    "title": "People v. La Voie",
    "decisionDate": "1964",
    "jurisdiction": "Colorado Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300499",
    "title": "People v. Watson",
    "decisionDate": "1981",
    "jurisdiction": "California Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300500",
    "title": "Perdue v. Crocker National Bank",
    "decisionDate": "1985",
    "jurisdiction": "California Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300501",
    "title": "Phillips Petroleum Co. v. Shutts",
    "decisionDate": "1985",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300502",
    "title": "Pickering v. Board of Education",
    "decisionDate": "1968",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300503",
    "title": "Poe v. Ullman",
    "decisionDate": "1961",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300504",
    "title": "Poller v. Columbia Broadcasting System, Inc.",
    "decisionDate": "1962",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300505",
    "title": "Powell v. McCormack",
    "decisionDate": "1969",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300506",
    "title": "Providence & Worcester Co. v. Chevron U.S.A. Inc.",
    "decisionDate": "1988",
    "jurisdiction": "1st Circuit",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300507",
    "title": "Quill Corp. v. North Dakota",
    "decisionDate": "1992",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300508",
    "title": "Raytheon Co. v. Hernandez",
    "decisionDate": "2003",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300509",
    "title": "Reed v. Town of Gilbert",
    "decisionDate": "2015",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300510",
    "title": "Reid v. Covert",
    "decisionDate": "1957",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300511",
    "title": "Reno v. Condon",
    "decisionDate": "2000",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300512",
    "title": "Renton v. Playtime Theatres, Inc.",
    "decisionDate": "1986",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300513",
    "title": "Rhinehart v. Seattle Times Co.",
    "decisionDate": "1984",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300514",
    "title": "Richards v. Jefferson County",
    "decisionDate": "1996",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300515",
    "title": "Roberts v. United States Jaycees",
    "decisionDate": "1984",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300516",
    "title": "Roper v. Simmons",
    "decisionDate": "2005",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300517",
    "title": "Rowe v. Wade County",
    "decisionDate": "1981",
    "jurisdiction": "Kentucky Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300518",
    "title": "Russell v. Place",
    "decisionDate": "1876",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300519",
    "title": "Safeco Insurance Co. of America v. Burr",
    "decisionDate": "2007",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300520",
    "title": "Santa Clara Pueblo v. Martinez",
    "decisionDate": "1978",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300521",
    "title": "Schnell v. Nell",
    "decisionDate": "1861",
    "jurisdiction": "Indiana Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300522",
    "title": "Sherbert v. Verner",
    "decisionDate": "1963",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300523",
    "title": "Shuttlesworth v. City of Birmingham",
    "decisionDate": "1969",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300524",
    "title": "Silver v. New York Central R.R.",
    "decisionDate": "1944",
    "jurisdiction": "New York Court of Appeals",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300525",
    "title": "Simpson v. State",
    "decisionDate": "1983",
    "jurisdiction": "Oklahoma Court of Criminal Appeals",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300526",
    "title": "Smith v. State",
    "decisionDate": "1979",
    "jurisdiction": "Nevada Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300527",
    "title": "SmithKline Beecham Corp. v. Abbott Laboratories",
    "decisionDate": "2014",
    "jurisdiction": "9th Circuit",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300528",
    "title": "South Dakota v. Dole",
    "decisionDate": "1987",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300529",
    "title": "South Dakota v. Wayfair, Inc.",
    "decisionDate": "2018",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300530",
    "title": "Sprietsma v. Mercury Marine",
    "decisionDate": "2002",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300531",
    "title": "State v. Baeza",
    "decisionDate": "1985",
    "jurisdiction": "New Mexico Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300532",
    "title": "State v. Dumlao",
    "decisionDate": "1988",
    "jurisdiction": "Hawaii Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300533",
    "title": "State v. McVay",
    "decisionDate": "1926",
    "jurisdiction": "Rhode Island Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300534",
    "title": "Stenberg v. Carhart",
    "decisionDate": "2000",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300535",
    "title": "Stone v. Powell",
    "decisionDate": "1976",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300536",
    "title": "Strauder v. West Virginia",
    "decisionDate": "1880",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300537",
    "title": "Sullivan v. O'Connor",
    "decisionDate": "1973",
    "jurisdiction": "Supreme Judicial Court of Massachusetts",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300538",
    "title": "Tashjian v. Republican Party of Connecticut",
    "decisionDate": "1986",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300539",
    "title": "Terry v. Adams",
    "decisionDate": "1953",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300540",
    "title": "Thompson v. Waco Oil Co.",
    "decisionDate": "1912",
    "jurisdiction": "West Virginia Supreme Court of Appeals",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300541",
    "title": "Tison v. Arizona",
    "decisionDate": "1987",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300542",
    "title": "Town of Castle Rock v. Gonzales",
    "decisionDate": "2005",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300543",
    "title": "Trammel v. United States",
    "decisionDate": "1980",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300544",
    "title": "Trident Center v. Connecticut General Life Insurance Co.",
    "decisionDate": "1988",
    "jurisdiction": "9th Circuit",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300545",
    "title": "Troy Ltd. v. Renna",
    "decisionDate": "1977",
    "jurisdiction": "New Jersey Superior Court, Appellate Division",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300546",
    "title": "Twentieth Century-Fox Film Corp. v. Lardner",
    "decisionDate": "1956",
    "jurisdiction": "California Court of Appeal",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300547",
    "title": "UAW v. Johnson Controls, Inc.",
    "decisionDate": "1991",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300548",
    "title": "United States v. Booker",
    "decisionDate": "2005",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300549",
    "title": "United States v. Calandra",
    "decisionDate": "1974",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "300550",
    "title": "United States v. James Daniel Good Real Property",
    "decisionDate": "1993",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  }
]



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
