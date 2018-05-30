const path = require("path");

const test = require("firebase-functions-test")(
  {
    databaseURL: "https://pic-link-1.firebaseio.com",
    storageBucket: "pic-link-1.appspot.com",
    projectId: "pic-link-1"
  },
  `${path.join(__dirname, "..", "..", "config")}/serviceAccountKey.json`
);

const { expect } = require("chai");

const sinon = require("sinon");
const admin = require("firebase-admin");

describe("Cloud Functions", () => {
  let myFunctions;

  before(() => {
    myFunctions = require("../lib/index");
  });

  after(() => {
    test.cleanup();
    admin
      .firestore()
      .collection("users")
      .remove();
  });

  describe("createUser", () => {
    it("should write a new user to the database", () => {
      const userInfo = test.auth.exampleUserRecord();
      userInfo.uid = "123";
      userInfo.displayName = "Mike";
      userInfo.email = "mike@mike.com";

      return test.wrap(myFunctions.createUser(userInfo)).then(() => {
        return admin
          .firestore()
          .collection("users")
          .doc(userInfo.uid)
          .then(createdSnap => {
            expect(createdSnap.data()).to.not.be("undefined");
          });
      });
    });
  });
});
