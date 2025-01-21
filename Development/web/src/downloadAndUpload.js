/**
 * downloadCapVolume.js
 *
 * Demonstrates how to:
 * 1. Download a ZIP file from Caselaw Access Project's static.site
 * 2. Extract JSON case files from a "json/" folder
 * 3. Parse the first 1,000 (or fewer) cases
 * 4. Upload them to a Firestore collection
 *
 * Example uses "mass/417.zip" from https://static.case.law/mass/417.zip.
 * Adjust the URL to use a different volume if desired.
 */

import fetch from 'node-fetch';
import AdmZip from 'adm-zip';
import fs from 'fs';
import admin from 'firebase-admin';

/** 
 * ---------------------------
 *   USER CONFIGURATIONS
 * ---------------------------
 */

// The URL of the ZIP file you want to download from CAP's static site:
const CAP_ZIP_URL = 'https://static.case.law/mass/417.zip';

// Path to store the downloaded ZIP temporarily
// (Rename or place anywhere you prefer)
const ZIP_FILE_PATH = './capVolume.zip';

// Maximum number of cases to parse & upload
const MAX_CASES = 1000;

// Path to your Firebase service account key
// Download this from your Firebase console -> Project Settings -> Service accounts
const SERVICE_ACCOUNT_PATH = './serviceAccountKey.json';

// Firestore collection name
// This is where the case docs will be uploaded
const FIRESTORE_COLLECTION = 'capCases';

/** 
 * ---------------------------
 *   FIREBASE INITIALIZATION
 * ---------------------------
 */

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`Service account file not found: ${SERVICE_ACCOUNT_PATH}`);
  process.exit(1);
}
const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Access Firestore
const db = admin.firestore();

/** 
 * ---------------------------
 *    DOWNLOAD THE ZIP
 * ---------------------------
 */
async function downloadZip(url, destPath) {
  console.log(`Downloading ${url} ...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ZIP: ${response.status} ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
  console.log(`Saved ZIP to ${destPath}`);
}

/** 
 * ---------------------------
 *   EXTRACT & PARSE FILES
 * ---------------------------
 * Some CAP volumes store individual case files in "json/<something>.json"
 * Instead of the older "cases/" pattern.
 */
function extractAndParseCases(zipFilePath, maxCount) {
  const zip = new AdmZip(zipFilePath);
  const entries = zip.getEntries();

  let caseObjects = [];

  // We'll look for JSON files in the "json/" folder
  // E.g., "json/1-0.json", "json/1-1.json", etc.
  const caseEntries = entries.filter((entry) => {
    return entry.entryName.startsWith('json/') && entry.entryName.endsWith('.json');
  });

  console.log(`Found ${caseEntries.length} case JSON files in the ZIP.`);

  // Limit the number of files to parse to `maxCount` for demonstration
  const limitedEntries = caseEntries.slice(0, maxCount);

  for (const entry of limitedEntries) {
    const fileContent = zip.readAsText(entry);
    const data = JSON.parse(fileContent);

    // Transform the raw data into a shape suitable for Firestore
    const caseObject = transformCapCase(data);
    caseObjects.push(caseObject);
  }

  return caseObjects;
}

/**
 * Transform the CAP case JSON structure into a simpler Firestore doc.
 * Customize as needed, depending on the actual fields you see in the JSON.
 *
 * A typical CAP JSON might include:
 * {
 *   "id": 1234567,
 *   "name": "Smith v. Jones",
 *   "name_abbreviation": "Smith v. Jones",
 *   "jurisdiction": { "name_long": "Massachusetts" },
 *   "volume": { "volume_number": "417" },
 *   "reporter": { "full_name": "Mass." },
 *   "decision_date": "2000-01-01",
 *   "casebody": {
 *     "data": {
 *       "opinions": [
 *         { "text": "Full text of the opinion here..." },
 *         ...
 *       ]
 *     }
 *   },
 *   ...
 * }
 */
function transformCapCase(rawCase) {
  const caseName = rawCase.name || 'Untitled';
  const shortName = rawCase.name_abbreviation || caseName;
  const jurisdiction = rawCase.jurisdiction ? rawCase.jurisdiction.name_long : 'Unknown';
  const reporterVolume = rawCase.volume ? rawCase.volume.volume_number : 'N/A';
  const reporterName = rawCase.reporter ? rawCase.reporter.full_name : 'Unknown Reporter';

  // "casebody" often holds the full text in "opinions"
  let fullText = '';
  if (rawCase.casebody && rawCase.casebody.data && rawCase.casebody.data.opinions) {
    const opinions = rawCase.casebody.data.opinions;
    // Join all "opinions" text into one string
    fullText = opinions.map((op) => op.text).join('\n\n');
  }

  return {
    // We'll use the ID from CAP if it exists, otherwise fallback
    caseId: String(rawCase.id || rawCase.slug || Date.now()),
    title: shortName,
    jurisdiction,
    reporter: reporterName,
    volume: reporterVolume,
    decisionDate: rawCase.decision_date || null,

    // The entire text from the opinions
    content: fullText,
  };
}

/** 
 * ---------------------------
 *  UPLOAD TO FIRESTORE
 * ---------------------------
 */
async function uploadCasesToFirestore(caseObjects) {
  console.log(`Uploading ${caseObjects.length} cases to Firestore (${FIRESTORE_COLLECTION})...`);

  // Firestore has a batch limit of 500 docs/write
  const BATCH_SIZE = 500;
  let currentIndex = 0;

  while (currentIndex < caseObjects.length) {
    const batch = db.batch();
    const slice = caseObjects.slice(currentIndex, currentIndex + BATCH_SIZE);

    for (const c of slice) {
      // We'll store the doc under "capCases/{caseId}"
      const docRef = db.collection(FIRESTORE_COLLECTION).doc(String(c.caseId));
      batch.set(docRef, c);
    }

    await batch.commit();
    console.log(`Uploaded batch of ${slice.length} docs.`);
    currentIndex += BATCH_SIZE;
  }
}

/**
 * ---------------------------
 *   MAIN SCRIPT
 * ---------------------------
 */
async function main() {
  try {
    console.log('Starting download from CAP...');
    await downloadZip(CAP_ZIP_URL, ZIP_FILE_PATH);

    console.log('Extracting and parsing case files...');
    const cases = extractAndParseCases(ZIP_FILE_PATH, MAX_CASES);

    console.log(`Parsed ${cases.length} cases. Now uploading...`);
    await uploadCasesToFirestore(cases);

    console.log(`All done! Uploaded up to ${cases.length} documents to Firestore.`);
  } catch (error) {
    console.error('Error in main:', error);
  } finally {
    // Optional: clean up the zip file after successful import
    // fs.unlinkSync(ZIP_FILE_PATH);
  }
}

main();
