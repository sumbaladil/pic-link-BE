const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

exports.createUser = functions.auth.user().onCreate(user => {
  return db
    .collection("users")
    .doc(user.uid)
    .set({
      displayName: user.displayName,
      email: user.email
    });
});

// exports.updateUserMatchedImages = functions.storage.object().onFinalize(image => {
//   const { uid } = image.data.metadata.uid;
// });
