import "mocha";
import expect from "chai";
import * as Test from "firebase-functions-test";
import * as faker from "faker";
import userCreate from "../src/index";

describe("onCreate", () => {
  let test;
  beforeEach(() => {
    test = Test(
      {
        databaseURL: "https://pic-link-1.firebaseio.com",
        storageBucket: "pic-link-1.appspot.com",
        projectId: "pic-link-1"
      },
      "../../config/serviceAccountKey.json"
    );
  });
  it("should create firestore user documents", async () => {
    const fakeUser = faker.helpers.userCard();
    const userInfo = test.auth.exampleCreateUser();
    userInfo.metadata.lastSignInTime = null;
    userInfo.displayName = fakeUser.name;
    userInfo.email = fakeUser.email;
    userInfo.disabled = false;
    userInfo.emailVerified = false;

    const wrapped = test.wrap(userCreate);
    const result = await wrapped(userInfo);

    const { userId, uacId } = result;

    const user = await userId.get();
    expect(user.data()).to.be.an("object");
    // should(user.data()).have.properties({
    //   // id: userId.id,
    //   email: userInfo.email,
    //   phone: userInfo.phoneNumber || "",
    //   displayName: userInfo.displayName
    // });

    // const uac = await uacId.get();
    // should(uac.data()).have.properties({
    //   permissions: {}
    // });
  });
});
