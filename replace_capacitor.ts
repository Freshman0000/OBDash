import * as fs from 'fs';

let content = fs.readFileSync('App.tsx', 'utf8');

// Ensure we import Geolocation at the top
if (!content.includes("@capacitor/geolocation")) {
  content = content.replace("import React,", "import { Geolocation } from '@capacitor/geolocation';\nimport React,");
}

const oldPermLogic = `if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(() => {}, () => {});
            }`;

const newPermLogic = `try {
              // First attempt logic via Capacitor if available
              if (window.Capacitor) {
                await Geolocation.requestPermissions();
              } else if (navigator.geolocation) {
                // Standard web
                navigator.geolocation.getCurrentPosition(() => {}, () => {});
              }
            } catch (e) {
              console.warn("Permission request failed", e);
            }`;

content = content.replace(oldPermLogic, newPermLogic);

// Add window.Capacitor to global declaration to fix TS issue
if (!content.includes('Capacitor?: any;')) {
  content = content.replace('interface Window {', 'interface Window {\n    Capacitor?: any;');
}

fs.writeFileSync('App.tsx', content, 'utf8');
