import { shell } from 'electron';
import { notifyLaravel, goToUrl } from '../../utils';
import state from '../../state';

function triggerMenuItemEvent(menuItem) {
    notifyLaravel('events', {
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

export function compileMenu (item) {
    if (item.submenu) {
        if (Array.isArray(item.submenu)) {
            item.submenu = item.submenu?.map(compileMenu);
        } else {
            item.submenu = item.submenu.submenu?.map(compileMenu);
        }
    }

    if (item.type === 'link') {
        return {
            click() {
                triggerMenuItemEvent(item);
                shell.openExternal(item.url);
            }
        };
    }

    if (item.type === 'checkbox') {
        item.click = () => {
            item.checked = !item.checked;
            triggerMenuItemEvent(item);
        };
    }

    if (item.type === 'event') {
        return {
            label: item.label,
            accelerator: item.accelerator,
            click() {
                notifyLaravel('events', {
                    event: item.event
                });
            },
        };
    }

    if (item.type === 'role') {
        let menuItem = {
            role: item.role
        };

        if (item.label) {
            menuItem['label'] = item.label;
        }

        return menuItem;
    }

    // Default click event
    if (! item.click) {
        item.click = () => {
            triggerMenuItemEvent(item);
        }
    }

    return item;
}
