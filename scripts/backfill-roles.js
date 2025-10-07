//Update every pre-existing user with the new isAdmin and isMod properties.
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

const db = admin.firestore();

async function main() {
  const writer = db.bulkWriter(); 
  let n = 0;

  const snap = await db.collection('users').get();
  snap.forEach(doc => {
    writer.set(doc.ref, { isAdmin: false, isMod: false }, { merge: true });
    n++;
  });

  await writer.close();
  console.log(`Updated ${n} user documents with isAdmin:false, isMod:false`);
}

main().catch(err => { console.error(err); process.exit(1); });
