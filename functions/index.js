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

exports.addLike = functions.https.onCall(async (data, context) => {
  const {postId, userId} = data;
  if (!postId || !userId) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with valid postId and userId.",
    );
  }

  const postRef = admin.firestore().collection("posts").doc(postId);
  const userLikeRef = postRef.collection("likes").doc(userId);

  try {
    const doc = await userLikeRef.get();
    if (doc.exists) {
      throw new functions.https.HttpsError(
          "already-exists",
          "User has already liked this post.",
      );
    }

    await userLikeRef.set({
      likedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await postRef.update({
      likeCount: admin.firestore.FieldValue.increment(1),
    });

    return {success: true};
  } catch (error) {
    console.error("Error adding like to post:", error);
    throw new functions.https.HttpsError(
        "unknown",
        "Error adding like to post",
        error,
    );
  }
});

