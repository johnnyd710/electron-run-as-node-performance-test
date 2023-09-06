const { utilityProcess } = require("electron");

async function main() {
 // spawn a utility process
  const childProcess = utilityProcess.fork("./backend.js", [], {
    stdio: "pipe"
  });
  childProcess.stdout.on("data", (data) => {
    console.log(data.toString());
  });
}

main();