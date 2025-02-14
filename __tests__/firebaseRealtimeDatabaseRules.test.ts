// jest.unmock("fs");
// jest.unmock("@firebase/database");
// jest.unmock("@firebase/rules-unit-testing");
// jest.unmock("react-native");

// const {
//   assertFails,
//   assertSucceeds,
//   initializeTestEnvironment,
//   RulesTestContext,
//   RulesTestEnvironment,
// } = jest.requireActual("@firebase/rules-unit-testing");

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestContext,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import * as fs from "fs";

const FIREBASE_DATABASE_ID = "database-default-rtdb";
const HOST = "127.0.0.1";
const PORT = 9000;
const USER_ID = "mockedUser";

describe("Can read write", () => {
  let testEnv: RulesTestEnvironment;
  let authedUser: RulesTestContext;
  let unauthedUser: RulesTestContext;
  let database: firebase.default.database.Database;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: FIREBASE_DATABASE_ID,
      database: {
        rules: '{"rules": {".read": true, ".write": "auth.uid!==null"}}', // fs.readFileSync("database.rules.json", "utf8"), //
        host: HOST,
        port: PORT,
      },
    });
    authedUser = testEnv.authenticatedContext(USER_ID);
    unauthedUser = testEnv.unauthenticatedContext();
    database = authedUser.database();
    jest.useFakeTimers({ now: Date.now() });
  });

  afterEach(() => {
    testEnv?.clearDatabase();
  });

  afterAll(async () => {
    await testEnv?.cleanup();
  });

  it(` should succeed`, async () => {
    const dbRef = database.ref(`authed`);
    // const unauthedRef = unauthedUser.database().ref(`unauthed`);
    const valueChange = dbRef.on("value", (snapshot) => {
      expect(snapshot.val()).toEqual(5);
      dbRef.off("value", valueChange);
    });
    await assertSucceeds(dbRef.set(5));
    const snapshot = await dbRef.once("value");
    expect(snapshot.val()).toEqual(5);
    // await assertSucceeds(dbRef.update({ QQQQQQQQQ: 4444444444 }));
    // await assertFails(unauthedRef.set({ YYYYYYYYY: 1111111111 }));
  }, 5000); // , 1000000); // Extra time for debugging
});
