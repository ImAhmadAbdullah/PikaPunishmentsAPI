// Main script file (restart.js)

const { fork } = require('child_process');

function startChildProcess() {
  console.log('Starting child process...');
  
  const child = fork('./api.js'); // Replace with the path to your actual script

  child.on('exit', (code, signal) => {
    if (code !== 0) {
      console.error(`Child process exited with code ${code}, restarting...`);
      startChildProcess(); // Restart the script
    } else {
      console.log('Child process exited successfully.');
    }
  });
}

startChildProcess();
