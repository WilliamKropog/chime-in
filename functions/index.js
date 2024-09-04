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

exports.incrementCommentCount = functions.https.onCall(
    async (data, context) => {
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
          commentCount: admin.firestore.FieldValue.increment(1),
        });
        return {success: true};
      } catch (error) {
        throw new functions.https.HttpsError(
            "unknown",
            "Error incrementing comment count",
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

exports.removeLike = functions.https.onCall(async (data, context) => {
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
    if (!doc.exists) {
      throw new functions.https.HttpsError(
          "not-found",
          "User has not liked this post.",
      );
    }

    await userLikeRef.delete();

    await postRef.update({
      likeCount: admin.firestore.FieldValue.increment(-1),
    });

    return {success: true};
  } catch (error) {
    console.error("Error removing like from post:", error);
    throw new functions.https.HttpsError(
        "unknown",
        "Error removing like from post",
        error,
    );
  }
});

exports.addDislike = functions.https.onCall(async (data, context) => {
  const {postId, userId} = data;
  if (!postId || !userId) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with valid postId and userId.",
    );
  }

  const postRef = admin.firestore().collection("posts").doc(postId);
  const userDislikeRef = postRef.collection("dislikes").doc(userId);

  try {
    const doc = await userDislikeRef.get();
    if (doc.exists) {
      throw new functions.https.HttpsError(
          "already-exists",
          "User has already disliked this post.",
      );
    }
    await userDislikeRef.set({
      dislikedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await postRef.update({
      dislikeCount: admin.firestore.FieldValue.increment(1),
    });

    return {success: true};
  } catch (error) {
    console.error("Error adding dislike to post:", error);
    throw new functions.https.HttpsError(
        "unknown",
        "Error adding dislike to post",
        error,
    );
  }
});

exports.removeDislike = functions.https.onCall(async (data, context) => {
  const {postId, userId} = data;
  if (!postId, !userId) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with valid postId and userId.",
    );
  }

  const postRef = admin.firestore().collection("posts").doc(postId);
  const userDislikeRef = postRef.collection("dislikes").doc(userId);

  try {
    const doc = await userDislikeRef.get();
    if (!doc.exists) {
      throw new functions.https.HttpsError(
          "not-found",
          "User has not disliked this post.",
      );
    }

    await userDislikeRef.delete();

    await postRef.update({
      dislikeCount: admin.firestore.FieldValue.increment(-1),
    });

    return {success: true};
  } catch (error) {
    console.error("Error removing dislike from post:", error);
    throw new functions.https.HttpsError(
        "unknown",
        "Error removing dislike from post.",
        error,
    );
  }
});

exports.addLikeToComment = functions.https.onCall(async (data, context) => {
  const {postId, commentId, userId} = data;
  if (!postId || !commentId || !userId) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with valid commentId and userId.",
    );
  }

  const commentRef = admin.firestore()
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .doc(commentId);

  const userLikeRef = commentRef.collection("likes").doc(userId);

  try {
    const doc = await userLikeRef.get();
    if (doc.exists) {
      throw new functions.https.HttpsError(
          "already-exists",
          "User has already liked this comment.",
      );
    }

    await userLikeRef.set({
      likedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await commentRef.update({
      likeCount: admin.firestore.FieldValue.increment(1),
    });

    return {success: true};
  } catch (error) {
    console.error("Error adding like to comment:", error);
    throw new functions.https.HttpsError(
        "unknown",
        "Error adding like to comment",
        error,
    );
  }
});

exports.removeLikeFromComment = functions.https
    .onCall(async (data, context) => {
      const {postId, commentId, userId} = data;
      if (!postId || !commentId || !userId) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "The function must be called with valid commentId and userId.",
        );
      }

      const commentRef = admin.firestore()
          .collection("posts")
          .doc(postId)
          .collection("comments")
          .doc(commentId);

      const userLikeRef = commentRef.collection("likes").doc(userId);

      try {
        const doc = await userLikeRef.get();
        if (!doc.exists) {
          throw new functions.https.HttpsError(
              "not-found",
              "User has not liked this comment.",
          );
        }

        await userLikeRef.delete();

        await commentRef.update({
          likeCount: admin.firestore.FieldValue.increment(-1),
        });

        return {success: true};
      } catch (error) {
        console.error("Error removing like from comment:", error);
        throw new functions.https.HttpsError(
            "unknown",
            "Error removing like from comment",
            error,
        );
      }
    });

exports.addDislikeToComment = functions.https.onCall(async (data, context) => {
  const {postId, commentId, userId} = data;
  if (!postId || !commentId || !userId) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with valid commentId and userId.",
    );
  }

  const commentRef = admin.firestore()
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .doc(commentId);

  const userLikeRef = commentRef.collection("dislikes").doc(userId);

  try {
    const doc = await userLikeRef.get();
    if (doc.exists) {
      throw new functions.https.HttpsError(
          "already-exists",
          "User has already disliked this comment.",
      );
    }

    await userLikeRef.set({
      likedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await commentRef.update({
      dislikeCount: admin.firestore.FieldValue.increment(1),
    });

    return {success: true};
  } catch (error) {
    console.error("Error adding dislike to comment:", error);
    throw new functions.https.HttpsError(
        "unknown",
        "Error adding dislike to comment",
        error,
    );
  }
});

exports.removeDislikeFromComment = functions.https
    .onCall(async (data, context) => {
      const {postId, commentId, userId} = data;
      if (!postId || !commentId || !userId) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "The function must be called with valid commentId and userId.",
        );
      }

      const commentRef = admin.firestore()
          .collection("posts")
          .doc(postId)
          .collection("comments")
          .doc(commentId);

      const userLikeRef = commentRef.collection("dislikes").doc(userId);

      try {
        const doc = await userLikeRef.get();
        if (!doc.exists) {
          throw new functions.https.HttpsError(
              "not-found",
              "User has not disliked this comment.",
          );
        }

        await userLikeRef.delete();

        await commentRef.update({
          dislikeCount: admin.firestore.FieldValue.increment(-1),
        });

        return {success: true};
      } catch (error) {
        console.error("Error removing dislike from comment:", error);
        throw new functions.https.HttpsError(
            "unknown",
            "Error removing dislike from comment",
            error,
        );
      }
    });
