const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();
admin.initializeApp();

// exports.createUserInDB = functions.auth.user().onCreate(user => {
//   if (user.data().photoURL) {
//     db.ref('enrolledFaces').doc(user.data().uid).then
//   }
// });

// exports.updateUserMatchedImages = functions.storage.object().onFinalize(image => {
//   const { uid } = image.data.metadata.uid;

// });

const userCreate = functions.auth.user().onCreate((user, context) => {
  const db = admin.firestore();
  return db.runTransaction(async transaction => {
    const userId = db.doc(`user/${user.uid}`);
    transaction.set(userId, {
      displayName: user.displayName,
      email: user.email,
      phone: user.phoneNumber || ""
    });

    const uacId = db.doc(`user_access_control/${user.uid}`);
    transaction.set(uacId, {
      permissions: {}
    });

    return {
      userId,
      uacId
    };
  });
});

export default userCreate;
