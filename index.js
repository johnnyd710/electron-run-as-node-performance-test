const { utilityProcess } = require("electron");

async function main() {
 // spawn a utility process
  const childProcess = utilityProcess.fork("./backend.js");
  process.on("exit", () => childProcess.kill());
}

main();