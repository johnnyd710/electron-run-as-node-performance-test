const { spawn } = require("child_process");
  const childProcess = spawn("./node_modules/electron/dist/electron.exe", ["index.js"], {
    env: {
      PATH: process.env.PATH,
    }
  });