const { spawn } = require('child_process');
const proc = spawn(process.argv[2], process.argv.slice(3), {});
proc.stdout.on('data', (data) => {
    console.log(data.toString());
});
proc.stderr.on('data', (data) => {
    console.error(data.toString());
});
proc.on('close', (code) => {
    process.exit(code);
});
