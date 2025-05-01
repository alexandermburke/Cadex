
const fs = require('fs');
const admin = require('firebase-admin');
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const LANDMARK_CASES = 
[
  {
    "caseNumber": "301249",
    "title": "Exxon Shipping Co. v. Baker",
    "decisionDate": "2008",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301250",
    "title": "Morrison v. National Australia Bank",
    "decisionDate": "2010",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301251",
    "title": "American Electric Power Co. v. Connecticut",
    "decisionDate": "2011",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301252",
    "title": "Chamber of Commerce of the United States v. Whiting",
    "decisionDate": "2011",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301253",
    "title": "Bond v. United States",
    "decisionDate": "2011",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301254",
    "title": "Carcieri v. Salazar",
    "decisionDate": "2009",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301255",
    "title": "OBB Personenverkehr AG v. Sachs",
    "decisionDate": "2013",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301256",
    "title": "Microsoft Corp. v. i4i Ltd. Partnership",
    "decisionDate": "2011",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301257",
    "title": "Lexmark International, Inc. v. Static Control Components, Inc.",
    "decisionDate": "2014",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301258",
    "title": "Commil USA, LLC v. Cisco Systems, Inc.",
    "decisionDate": "2015",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301259",
    "title": "WesternGeco LLC v. ION Geophysical Corp.",
    "decisionDate": "2018",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301260",
    "title": "Lucia v. Securities and Exchange Commission",
    "decisionDate": "2018",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301261",
    "title": "Henson v. Santander Consumer USA Inc.",
    "decisionDate": "2017",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301262",
    "title": "Mohawk Industries, Inc. v. Carpenter",
    "decisionDate": "2009",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301263",
    "title": "Gonzales v. Thaler",
    "decisionDate": "2013",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301264",
    "title": "Department of Transportation v. Association of American Railroads",
    "decisionDate": "2015",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301265",
    "title": "Minneci v. Pollard",
    "decisionDate": "2012",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301266",
    "title": "Lozman v. City of Riviera Beach",
    "decisionDate": "2018",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301267",
    "title": "Welch v. United States",
    "decisionDate": "2016",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301268",
    "title": "Thryv, Inc. v. Click-to-Call Technologies, LP",
    "decisionDate": "2020",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301269",
    "title": "Allen v. Cooper",
    "decisionDate": "2020",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301270",
    "title": "Murphy v. NCAA",
    "decisionDate": "2018",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301271",
    "title": "McCoy v. Louisiana",
    "decisionDate": "2018",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301272",
    "title": "Maples v. Thomas",
    "decisionDate": "2012",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301273",
    "title": "Sorrell v. IMS Health Inc.",
    "decisionDate": "2011",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301274",
    "title": "Morse v. Frederick",
    "decisionDate": "2007",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301275",
    "title": "Ledbetter v. Goodyear Tire & Rubber Co.",
    "decisionDate": "2007",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301276",
    "title": "Winter v. Natural Resources Defense Council",
    "decisionDate": "2008",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301277",
    "title": "Monsanto Co. v. Geertson Seed Farms",
    "decisionDate": "2010",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301278",
    "title": "City of Ontario v. Quon",
    "decisionDate": "2010",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301279",
    "title": "Padilla v. Kentucky",
    "decisionDate": "2010",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301280",
    "title": "NLRB v. Noel Canning",
    "decisionDate": "2014",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301281",
    "title": "Kiobel v. Royal Dutch Petroleum Co.",
    "decisionDate": "2013",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301282",
    "title": "Bullcoming v. New Mexico",
    "decisionDate": "2011",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301283",
    "title": "Georgia v. Public.Resource.Org, Inc.",
    "decisionDate": "2020",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301284",
    "title": "McGirt v. Oklahoma",
    "decisionDate": "2020",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301285",
    "title": "Masterpiece Cakeshop v. Colorado Civil Rights Commission",
    "decisionDate": "2018",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301286",
    "title": "City of Los Angeles v. Patel",
    "decisionDate": "2015",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301287",
    "title": "McCutcheon v. Federal Election Commission",
    "decisionDate": "2014",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301288",
    "title": "Brown v. Plata",
    "decisionDate": "2011",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301289",
    "title": "Fisher v. University of Texas at Austin",
    "decisionDate": "2013",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301290",
    "title": "Skilling v. United States",
    "decisionDate": "2010",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301291",
    "title": "Navarette v. California",
    "decisionDate": "2014",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301292",
    "title": "Bell Atlantic Corp. v. Twombly",
    "decisionDate": "2007",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301293",
    "title": "City of Arlington v. FCC",
    "decisionDate": "2013",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301294",
    "title": "Gundy v. United States",
    "decisionDate": "2019",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301295",
    "title": "Pavan v. Smith",
    "decisionDate": "2017",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301296",
    "title": "Henderson v. United States",
    "decisionDate": "2013",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301297",
    "title": "Utah v. Evans",
    "decisionDate": "2002",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  {
    "caseNumber": "301298",
    "title": "Trustees of Dartmouth College v. Woodward",
    "decisionDate": "2002",
    "jurisdiction": "U.S. Supreme Court",
    "volume": "",
    "content": "",
    "citation": "N/A"
  },
  { "caseNumber": "301299", "title": "Brendlin v. California", "decisionDate": "2007", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301300", "title": "Melendez-Diaz v. Massachusetts", "decisionDate": "2009", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301301", "title": "Michigan v. Bryant", "decisionDate": "2011", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301302", "title": "McQuiggin v. Perkins", "decisionDate": "2013", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301303", "title": "Trevino v. Thaler", "decisionDate": "2013", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301304", "title": "Peña-Rodriguez v. Colorado", "decisionDate": "2017", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301305", "title": "Bucklew v. Precythe", "decisionDate": "2019", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301306", "title": "Shinn v. Ramirez", "decisionDate": "2022", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301307", "title": "Packingham v. North Carolina", "decisionDate": "2017", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301308", "title": "Jennings v. Rodriguez", "decisionDate": "2018", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301309", "title": "Pereira v. Sessions", "decisionDate": "2018", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301310", "title": "NLRB v. SW General, Inc.", "decisionDate": "2017", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301311", "title": "United States v. Alvarez", "decisionDate": "2012", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301312", "title": "FCC v. Fox Television Stations", "decisionDate": "2009", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301313", "title": "Ayotte v. Planned Parenthood of Northern New England", "decisionDate": "2006", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301314", "title": "Washington State Dept. of Social & Health Services v. Guardianship Estate of Keffeler", "decisionDate": "2002", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301315", "title": "United States v. Carr", "decisionDate": "2009", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301316", "title": "Ayala v. Davis", "decisionDate": "2011", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301317", "title": "District of Columbia v. Wesby", "decisionDate": "2018", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301318", "title": "Heien v. North Carolina", "decisionDate": "2014", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301319", "title": "Zadvydas v. Davis", "decisionDate": "2001", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301320", "title": "Demore v. Kim", "decisionDate": "2003", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301321", "title": "I.N.S. v. St. Cyr", "decisionDate": "2001", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301322", "title": "Davis v. Ayala", "decisionDate": "2015", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301323", "title": "Dan’s City Used Cars, Inc. v. Pelkey", "decisionDate": "2013", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301324", "title": "Comcast Corp. v. Behrend", "decisionDate": "2013", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301325", "title": "Genesis Healthcare Corp. v. Symczyk", "decisionDate": "2013", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301326", "title": "Kiobel v. Royal Dutch Petroleum Co.", "decisionDate": "2013", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301327", "title": "Moncrieffe v. Holder", "decisionDate": "2013", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301328", "title": "Hillman v. Maretta", "decisionDate": "2013", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301329", "title": "Nevada v. Jackson", "decisionDate": "2013", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301330", "title": "Peugh v. United States", "decisionDate": "2013", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301331", "title": "Oxford Health Plans LLC v. Sutter", "decisionDate": "2013", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301332", "title": "Walden v. Fiore", "decisionDate": "2004", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301333", "title": "Munaf v. Geren", "decisionDate": "2008", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301334", "title": "Ashcroft v. Iqbal", "decisionDate": "2009", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301335", "title": "Safford Unified School District v. Redding", "decisionDate": "2009", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301336", "title": "Virginia v. Black", "decisionDate": "2003", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301337", "title": "Hollingsworth v. Perry", "decisionDate": "2013", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301338", "title": "Michigan v. EPA", "decisionDate": "2015", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301339", "title": "Utah v. Strieff", "decisionDate": "2016", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301340", "title": "Atkins v. Virginia", "decisionDate": "2002", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301341", "title": "Roper v. Simmons", "decisionDate": "2005", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301342", "title": "Buckhannon Board & Care Home, Inc. v. West Virginia Department of Health & Human Resources", "decisionDate": "2001", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301343", "title": "Zivotofsky v. Kerry", "decisionDate": "2015", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301344", "title": "Trinity Lutheran Church of Columbia, Inc. v. Comer", "decisionDate": "2017", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301345", "title": "Perez v. Mortgage Bankers Association", "decisionDate": "2015", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301346", "title": "Arizona v. Inter Tribal Council of Arizona, Inc.", "decisionDate": "2013", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301347", "title": "DB Jackson v. People", "decisionDate": "2016", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" },
  { "caseNumber": "301348", "title": "Monsanto Co. v. Geertson Seed Farms", "decisionDate": "2010", "jurisdiction": "U.S. Supreme Court", "volume": "", "content": "", "citation": "N/A" }
]




async function main() {
  try {
    console.log(`Starting upload of ${LANDMARK_CASES.length} landmark cases to Firestore...`);

    for (const landmarkCase of LANDMARK_CASES) {
      const docRef = db.collection('capCases').doc(landmarkCase.caseNumber);
      await docRef.set(landmarkCase);

      console.log(`Uploaded: ${landmarkCase.title} [ID: ${landmarkCase.caseNumber}]`);
    }

    console.log('All landmark cases have been uploaded successfully!');
  } catch (error) {
    console.error('Error uploading landmark cases:', error);
  }
}

main();
