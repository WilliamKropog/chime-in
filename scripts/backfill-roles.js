const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

const db = admin.firestore();

async function main() {
  const writer = db.bulkWriter();
  let usersUpdated = 0;
  let postsUpdated = 0;

  const usersSnap = await db.collection('users').get();
  usersSnap.forEach((doc) => {
    writer.set(doc.ref, { isAdmin: false, isMod: false, isBanned: false }, { merge: true });
    usersUpdated++;
  });

  const postsSnap = await db.collection('posts').get();
  postsSnap.forEach((doc) => {
    writer.set(doc.ref, { isHidden: false }, { merge: true });
    postsUpdated++;
  });

  await writer.close();
  console.log(`Updated ${usersUpdated} users (isAdmin:false, isMod:false, isBanned:false).`);
  console.log(`Updated ${postsUpdated} posts (isHidden:false).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
