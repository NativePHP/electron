import express from 'express';
import { utilityProcess } from 'electron';
import state from '../state';
import { notifyLaravel } from "../utils";
const router = express.Router();
router.post('/start', (req, res) => {
    const { alias, cmd, args, cwd, env } = req.body;
    console.log(req.body);
    if (state.processes[alias] !== null) {
        res.sendStatus(409);
        return;
    }
    const proc = utilityProcess.fork(cmd, args || null, {
        env: env || null,
        cwd: cwd || null,
        serviceName: alias,
    });
    console.log(proc);
    proc.stdout.on('data', (data) => {
        console.log('Message received from process [' + alias + ']:', data);
        notifyLaravel('events', {
            event: 'Native\\Laravel\\Events\\ChildProcess\\MessageReceived',
            payload: {
                alias,
                data,
            }
        });
    });
    proc.stderr.on('data', (data) => {
        console.log('Error received from process [' + alias + ']:', data);
        notifyLaravel('events', {
            event: 'Native\\Laravel\\Events\\ChildProcess\\ErrorReceived',
            payload: {
                alias,
                data,
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
        console.log('Process [' + alias + '] exited!');
        notifyLaravel('events', {
            event: 'Native\\Laravel\\Events\\ChildProcess\\ProcessExited',
            payload: {
                alias,
                code,
            }
        });
    });
    state.processes[alias] = proc;
    res.json(proc);
});
router.post('/stop', (req, res) => {
    const { alias } = req.body;
    const proc = state.processes[alias];
    if (proc === null) {
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
