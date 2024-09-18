import { contextBridge, ipcRenderer } from 'electron'
import * as remote from '@electron/remote'

import Native from './native';

// @ts-ignore
window.Native = Native;

// @ts-ignore
window.remote = remote;

ipcRenderer.on('log', (event, {level, message, context}) => {
    if (level === 'error') {
      console.error(`[${level}] ${message}`, context)
    } else if (level === 'warn') {
      console.warn(`[${level}] ${message}`, context)
    } else {
      console.log(`[${level}] ${message}`, context)
    }
});

// Add Livewire event listeners
ipcRenderer.on('native-event', (event, data) => {
  
  // add support for livewire 3
  // @ts-ignore
  if (window.Livewire) {
    // @ts-ignore
    window.Livewire.dispatch('native:' + data.event, data.payload);
  }

  // add support for livewire 2
  // @ts-ignore
  if (window.livewire) {
    // @ts-ignore
    window.livewire.components.components().forEach(component => {
      if (Array.isArray(component.listeners)) {
        component.listeners.forEach(event => {
          if (event.startsWith('native')) {
            let event_parts = event.split(/(native:|native-)|:|,/)

            if (event_parts[1] == 'native:') {
              event_parts.splice(2, 0, 'private', undefined, 'nativephp', undefined)
            }

            let [
              s1,
              signature,
              channel_type,
              s2,
              channel,
              s3,
              event_name,
            ] = event_parts

            if (data.event === event_name) {
              // @ts-ignore
              window.livewire.emit(event, data.payload)
            }
          }
        })
      }
    })
  }
})
