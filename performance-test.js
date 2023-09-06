/**
 * Performance test
 * Measure the time difference between:
 *  - running electron index.js (which spawns a utility process)
 *  - running the utility process code in a node process directly using ELECTRON_RUN_AS_NODE
 * 
 * You'll know the operation is complete when you see the "hello world" message in the console.
 */

const { measure } = require("kelonio");
const { spawn } = require("child_process");

const electronUtilityProcess = new Promise((resolve, reject) => {
  const childProcess = spawn("./node_modules/electron/dist/electron.exe", ["index.js"], {
    env: {
      PATH: process.env.PATH,
    }
  });
  childProcess.stdout.on("data", (data) => {
    if (data.toString().includes("hello world")) {
      childProcess.kill();
      resolve();
    }
  });
  setTimeout(() => reject("timeout"), 5_000);
});

const electronAsNodeProcess = new Promise((resolve, reject) => {
  const childProcess = spawn("./node_modules/electron/dist/electron.exe", ["backend.js"], {
    env: {
      ELECTRON_RUN_AS_NODE: 1,
    }
  });

  childProcess.stdout.on("data", (data) => {
    if (data.toString().includes("hello world")) {
      childProcess.kill();
      resolve();
    }
  });

  setTimeout(() => reject("timeout"), 5_000);
});

async function main() {
  const electronUtilityProcessMeasurement = await measure(async () => {
    await electronUtilityProcess;
  });

  const electronAsNodeProcessMeasurement = await measure(async () => {
    await electronAsNodeProcess;
  });

  console.log(`Done!`);
  console.log(`electronUtilityProcessMeasurement: ${electronUtilityProcessMeasurement.mean}`);
  console.log(`electronAsNodeProcessMeasurement: ${electronAsNodeProcessMeasurement.mean}`);
}


try {
  main();
} catch (e) {
  console.log(e);
}