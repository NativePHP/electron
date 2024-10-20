import express from 'express';
import { utilityProcess } from 'electron';
import state from '../state';
import { notifyLaravel } from "../utils";
import { join } from 'path';
const router = express.Router();
router.post('/start', (req, res) => {
    const { alias, cmd, args, cwd, env } = req.body;
    if (state.processes[alias] !== undefined) {
        res.sendStatus(409);
        return;
    }
    const proc = utilityProcess.fork(join(__dirname, '../../electron-plugin/dist/server/childProcess.js'), cmd, {
        cwd,
        serviceName: alias,
        stdio: 'pipe',
        env: Object.assign(Object.assign({}, process.env), env)
    });
    proc.stdout.on('data', (data) => {
        console.log('Message received from process [' + alias + ']:', data.toString());
        notifyLaravel('events', {
            event: 'Native\\Laravel\\Events\\ChildProcess\\MessageReceived',
            payload: {
                alias,
                data: data.toString(),
            }
        });
    });
    proc.stderr.on('data', (data) => {
        console.log('Error received from process [' + alias + ']:', data.toString());
        notifyLaravel('events', {
            event: 'Native\\Laravel\\Events\\ChildProcess\\ErrorReceived',
            payload: {
                alias,
                data: data.toString(),
            }
        });
    });
    proc.on('spawn', () => {
        console.log('Process [' + alias + '] spawned!');
        notifyLaravel('events', {
            event: 'Native\\Laravel\\Events\\ChildProcess\\ProcessSpawned',
            payload: [alias]
        });
    });
    proc.on('exit', (code) => {
        console.log('Process [' + alias + '] exited with code [' + code + ']!');
        notifyLaravel('events', {
            event: 'Native\\Laravel\\Events\\ChildProcess\\ProcessExited',
            payload: {
                alias,
                code,
            }
        });
        delete state.processes[alias];
    });
    state.processes[alias] = proc;
    res.json(proc);
});
router.post('/stop', (req, res) => {
    const { alias } = req.body;
    const proc = state.processes[alias];
    if (proc === undefined) {
        res.sendStatus(200);
        return;
    }
    if (proc.kill()) {
        delete state.processes[alias];
    }
    res.sendStatus(200);
});
router.post('/message', (req, res) => {
    const { alias, message } = req.body;
    const proc = state.processes[alias];
    if (proc === null) {
        res.sendStatus(200);
        return;
    }
    proc.postMessage(message);
    res.sendStatus(200);
});
export default router;
