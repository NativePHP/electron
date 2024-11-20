import express from 'express';
import { app, Menu } from 'electron';
import { compileMenu } from './helper';
const router = express.Router();

router.post('/', (req, res) => {
    const menuEntries = req.body.items.map(compileMenu)

    const menu = Menu.buildFromTemplate(menuEntries)
    app.dock.setMenu(menu)
    res.sendStatus(200)
});

export default router;
