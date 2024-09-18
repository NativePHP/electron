"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapMenu = void 0;
const electron_1 = require("electron");
const utils_1 = require("../../utils");
function triggerMenuItemEvent(menuItem) {
    (0, utils_1.notifyLaravel)('events', {
        event: '\\Native\\Laravel\\Events\\Menu\\MenuItemClicked',
        payload: [
            {
                id: menuItem.id,
                label: menuItem.label,
                checked: menuItem.checked
            }
        ]
    });
}
const mapMenu = (menu) => {
    if (menu.submenu) {
        menu.submenu = menu.submenu.map(mapMenu);
    }
    if (menu.type === 'link') {
        menu.type = 'normal';
        menu.click = () => {
            triggerMenuItemEvent(menu);
            electron_1.shell.openExternal(menu.url);
        };
        return menu;
    }
    if (menu.type === 'checkbox') {
        menu.click = () => {
            menu.checked = !menu.checked;
            triggerMenuItemEvent(menu);
        };
    }
    if (menu.type === 'event') {
        return {
            label: menu.label,
            accelerator: menu.accelerator,
            click() {
                (0, utils_1.notifyLaravel)('events', {
                    event: menu.event
                });
            }
        };
    }
    if (menu.type === 'role') {
        let menuItem = {
            role: menu.role
        };
        if (menu.label) {
            menuItem['label'] = menu.label;
        }
        return menuItem;
    }
    if (!menu.click) {
        menu.click = () => {
            triggerMenuItemEvent(menu);
        };
    }
    return menu;
};
exports.mapMenu = mapMenu;
