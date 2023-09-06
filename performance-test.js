/**
 * Performance test
 * Measure the time difference between:
 *  - running electron index.js (which spawns a utility process)
 *  - running the utility process code in a node process directly using ELECTRON_RUN_AS_NODE
 * 
 * You'll know the operation is complete the backend sends an ipc message so start a socket that listens for "done"
 */

const { measure } = require("kelonio");
const { spawn } = require("child_process");
// ipc server
const net = require("net");

const server = net.createServer();
const socketPath = "\\\\.\\pipe\\electron-ipc-server";
server.listen(socketPath);

/**
 * @type { ChildProcessWithoutNullStreams }
 */
let child_process;

const resolveOnDone = (server) => new Promise((resolve) => {
  server.on("connection", (socket) => {
    socket.on("data", (data) => {
      if (data.toString() === "done") {
        socket.destroy();
        resolve();
      }
    });
  });
  setTimeout(() => reject("timeout"), 5_000);
});

const afterEach = () => {
  server.removeAllListeners("connection");
  child_process?.kill();
  child_process = undefined;
}

const electronUtilityProcess = new Promise((resolve, reject) => {
  resolveOnDone(server).then(resolve);
  childProcess = spawn("./node_modules/electron/dist/electron.exe", ["index.js"]);
});

const electronAsNodeProcess = new Promise((resolve, reject) => {
  resolveOnDone(server).then(resolve);
  childProcess = spawn("./node_modules/electron/dist/electron.exe", ["backend.js"], {
    env: {
      ELECTRON_RUN_AS_NODE: 1,
    }
  });
});

async function main() {
  const electronUtilityProcessMeasurement = await measure(async () => {
    await electronUtilityProcess;
  }, { afterEach }
);

  const electronAsNodeProcessMeasurement = await measure(async () => {
    await electronAsNodeProcess;
  }, { afterEach }
);

  console.log(`Done!`);
  console.log(`electronUtilityProcessMeasurement: ${electronUtilityProcessMeasurement.mean}`);
  console.log(`electronAsNodeProcessMeasurement: ${electronAsNodeProcessMeasurement.mean}`);
  process.exit(0);
}


try {
  main();
} catch (e) {
  console.log(e);
}

process.on("exit", () => {
  server.close();
});