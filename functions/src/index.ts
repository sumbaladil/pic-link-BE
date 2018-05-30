const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const { appId, appKey } = require("../config");
const { matchImages } = require("../utils/api");

const Kairos = require("kairos-api");
const client = new Kairos(appId, appKey);

exports.createUser = functions.auth.user().onCreate(user => {
  if (user.metadata.photographer) {
    return db
      .collection("photographers")
      .doc(user.uid)
      .set({
        displayName: user.displayName,
        email: user.email,
        uploadedImages: []
      });
  }
  return db
    .collection("users")
    .doc(user.uid)
    .set({
      displayName: user.displayName,
      email: user.email,
      profilePics: [],
      matchedImages: []
    });
});

exports.enrollFace = functions.firestore
  .document("users/{userId}")
  .onUpdate((change, context) => {
    const prevImg = change.before.data().profilePic;
    const currImg = change.after.data().profilePic;

    if (currImg !== prevImg) {
      const params = {
        image: currImg,
        subject_id: context.params.userId,
        gallery_name: "profilePics"
      };
      return client.enroll(params).then(data => {
        return db
          .collection("photographers")
          .get()
          .then(query => {
            const allImageUrls = query.docs.reduce((acc, doc) => {
              acc.push(...doc.data().uploadedImages);
              return acc;
            }, []);
            console.log("allImageUrls: ", allImageUrls);
            return matchImages(allImageUrls, "profilePics").then(matchObj => {
              console.log(matchObj);
            });
          });
      });
    }
    return;
  });
// exports.updateUserMatchedImages = functions.storage.object().onFinalize(image => {
//   const { uid } = image.data.metadata.uid;
// });
