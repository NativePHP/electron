import express from 'express'
import {app, Menu} from 'electron'
import state from "../state";
import {mapMenu} from "./helper";
const router = express.Router();

router.post('/update', (req, res) => {
    const {percent} = req.body

    Object.values(state.windows).forEach((window) => {
        window.setProgressBar(percent)
    });

    res.sendStatus(200)
})

export default router;
