const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const { appId, appKey } = require("../config");
const { matchImages } = require("../utils/kairos");
const { removeDuplicates } = require("../utils/helpers");

const Kairos = require("kairos-api");
const client = new Kairos(appId, appKey);

const kairosGallery = "test";

// exports.createUser = functions.auth.user().onCreate(user => {
//   if (user.metadata.photographer) {
//     return db
//       .collection("photographers")
//       .doc(user.uid)
//       .set({
//         displayName: user.displayName,
//         email: user.email,
//         uploadedImages: []
//       });
//   }
//   return db
//     .collection("users")
//     .doc(user.uid)
//     .set({
//       displayName: user.displayName,
//       email: user.email,
//       profilePic: '',
//       matchedImages: []
//     });
// });

exports.enrollFace = functions.firestore
  .document("users/{userId}")
  .onWrite((change, context) => {
    if (!change.after.exists) return null;
    const { userId } = context.params;
    const currImg = change.after.data().profilePic;
    const prevImg = change.before.exists ? change.before.data().profilePic : "";

    if (currImg !== prevImg) {
      const params = {
        image: currImg,
        subject_id: userId,
        gallery_name: userId
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

            return matchImages(allImageUrls, userId).then(matchObj => {
              if (!Object.keys(matchObj).length) return null;
              const promises = [];
              for (let uid in matchObj) {
                const userDocRef = db.collection("users").doc(uid);
                promises.push(
                  userDocRef.get().then(userDoc => {
                    const matchedImages = removeDuplicates([
                      ...userDoc.data().matchedImages,
                      ...matchObj[uid]
                    ]);
                    userDocRef.update({
                      matchedImages
                    });
                  })
                );
              }
              return Promise.all(promises);
            });
          })
          .then(updatedDocs => {
            params.gallery_name = kairosGallery;
            return client.enroll(params);
          });
      });
    }
    return null;
  });

exports.handlePhotographerUploads = functions.firestore
  .document("photographers/{photographerId}")
  .onUpdate((change, context) => {
    const prevImgs = change.before.data().uploadedImages;
    const currImgs = change.after.data().uploadedImages;

    if (currImgs.length > prevImgs.length) {
      return matchImages(currImgs.slice(prevImgs.length), kairosGallery).then(matchObj => {
        const promises = [];
        for (let uid in matchObj) {
          const userDocRef = db.collection("users").doc(uid);
          promises.push(
            userDocRef.get().then(userDoc => {
              if (!userDoc.exists) return null;
              const matchedImages = removeDuplicates([
                ...userDoc.data().matchedImages,
                ...matchObj[uid]
              ]);
              return userDocRef.update({
                matchedImages
              });
            })
          );
        }
        return Promise.all(promises);
      });
    }
    return null;
  });

// exports.updateUserMatchedImages = functions.storage.object().onFinalize(image => {
//   const { uid } = image.data.metadata.uid;
// });
