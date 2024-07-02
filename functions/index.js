const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.incrementPostView = functions.https.onCall(async (data, context) => {
  const postId = data.postId;
  if (!postId) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid postId.",
    );
  }

  const postRef = admin.firestore().collection("posts").doc(postId);

  try {
    await postRef.update({
      views: admin.firestore.FieldValue.increment(1),
    });
    return {success: true};
  } catch (error) {
    throw new functions.https.HttpsError(
        "unknown",
        "Error incrementing post view count",
        error,
    );
  }
});
