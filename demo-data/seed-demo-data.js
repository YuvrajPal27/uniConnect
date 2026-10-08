const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.join(__dirname, ".env.local"));

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

const keyPath = process.argv[2] || process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, "serviceAccountKey.json");
const dataPath = path.join(__dirname, "demo-data.json");
const DEMO_PASSWORD = process.env.DEMO_PASSWORD;

if (!DEMO_PASSWORD) {
  console.error("\nDEMO_PASSWORD is not configured.");
  console.error("Add DEMO_PASSWORD to demo-data/.env.local.\n");
  process.exit(1);
}

if (!fs.existsSync(keyPath)) {
  console.error("\nService account key not found.");
  console.error(`Expected: ${keyPath}`);
  console.error("\nPut your Firebase service-account JSON in this folder as serviceAccountKey.json, or run:");
  console.error("node seed-demo-data.js C:\\path\\to\\serviceAccountKey.json\n");
  process.exit(1);
}
if (!fs.existsSync(dataPath)) { console.error(`Demo data file not found: ${dataPath}`); process.exit(1); }

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
const seedData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
if (!serviceAccount.project_id) { console.error("The supplied JSON does not look like a Firebase service-account key."); process.exit(1); }

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
const auth = getAuth();
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
const demoEmail = (name) => `${slug(name)}@uniconnect.demo`;

async function ensureDemoUser(university) {
  const email = demoEmail(university.name);
  let user;
  try {
    user = await auth.getUserByEmail(email);
    user = await auth.updateUser(user.uid, { password: DEMO_PASSWORD, displayName: university.name, disabled: false });
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;
    user = await auth.createUser({ email, password: DEMO_PASSWORD, displayName: university.name });
  }

  if (university.demoUserId && university.demoUserId !== user.uid) {
    try { await db.collection("users").doc(university.demoUserId).delete(); } catch (_) { /* already absent */ }
  }

  await db.collection("users").doc(user.uid).set({
    email,
    university: university.name,
    role: "university",
    demo: true,
    lastSeededAt: new Date().toISOString(),
  }, { merge: true });

  return { email, uid: user.uid };
}

async function commitOperations(operations) {
  const CHUNK = 400;
  for (let i = 0; i < operations.length; i += CHUNK) {
    const batch = db.batch();
    operations.slice(i, i + CHUNK).forEach(({ ref, data }) => batch.set(ref, data, { merge: true }));
    await batch.commit();
    console.log(`  Wrote ${Math.min(i + CHUNK, operations.length)}/${operations.length} records`);
  }
}

function addCollectionRecords(operations, collectionName, university, rows) {
  rows.forEach((row, index) => {
    const id = `demo_${slug(university)}_${index + 1}`;
    operations.push({ ref: db.collection(collectionName).doc(id), data: row });
  });
}

async function seed() {
  console.log(`\nUniConnect demo seeder`);
  console.log(`Firebase project: ${serviceAccount.project_id}`);
  console.log(`Universities: ${seedData.universities.length}`);
  console.log(`Demo password: ${DEMO_PASSWORD}`);
  console.log("WARNING: all inserted values are synthetic demo data.\n");

  const operations = [];
  const credentials = [];

  for (const university of seedData.universities) {
    const account = await ensureDemoUser(university);
    credentials.push({ name: university.name, email: account.email, password: DEMO_PASSWORD });

    addCollectionRecords(operations, "facultyDetails", university.name, university.facultyDetails);
    addCollectionRecords(operations, "TnP", university.name, university.TnP);
    addCollectionRecords(operations, "capacity", university.name, university.capacity);
    addCollectionRecords(operations, "enrollment", university.name, university.enrollment);
    addCollectionRecords(operations, "achievements", university.name, university.achievements);
    addCollectionRecords(operations, "training", university.name, university.training);
    addCollectionRecords(operations, "budget", university.name, university.budget);
    addCollectionRecords(operations, "mou", university.name, university.mou);
    addCollectionRecords(operations, "rankingSystemDetails", university.name, university.rankingSystemDetails);
    addCollectionRecords(operations, "studentFeedback", university.name, university.studentFeedback);
    addCollectionRecords(operations, "parentFeedback", university.name, university.parentFeedback);
    operations.push({ ref: db.collection("infrastructureDetails").doc(`demo_${slug(university.name)}`), data: { UniversityName: university.name, ...university.infrastructureDetails, demo: true } });

    for (const [session, rows] of university.admission) {
      operations.push({
        ref: db.collection("Universities").doc(university.name).collection("Sections").doc("Admission").collection("Sessions").doc(session),
        data: { sessionName: session, admissionData: rows, lastUpdated: new Date().toISOString(), demo: true },
      });
    }
  }

  await commitOperations(operations);
  const credentialText = [
    "UniConnect Demo University Login Credentials",
    "=============================================",
    "All accounts use Firebase Authentication.",
    `Password for all demo accounts: ${DEMO_PASSWORD}`,
    "",
    ...credentials.map((item) => `${item.name}\n  Email: ${item.email}\n  Password: ${item.password}\n`),
  ].join("\n");
  fs.writeFileSync(path.join(__dirname, "demo-credentials.txt"), credentialText, "utf8");

  console.log(`\nDone. ${seedData.universities.length} universities have demo data and Firebase Auth accounts.`);
  console.log("Credentials saved to demo-data/demo-credentials.txt");
}

seed().catch((error) => { console.error("\nSeeding failed:"); console.error(error); process.exit(1); });
