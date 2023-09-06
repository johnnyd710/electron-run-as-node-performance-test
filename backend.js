async function main() {
  // connect to socket
  const socketPath = "\\\\.\\pipe\\electron-ipc-server";
  const client = require("net").connect(socketPath);
  client.write("done");
  client.end();
  client.on("close", () => {
    process.exit(0);
  });
}

main();