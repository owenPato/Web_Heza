// src/utils/networkDrive.js
import { exec } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

export const mountNetworkDrive = () => {
  const command = process.env.NETWORK_MOUNT_SCRIPT;
  if (!command) return;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      if (stderr.includes('Error de sistema 85')) {
        console.log('⚠️  Unidad de red ya estaba montada previamente.');
      } else {
        console.error('❌ Error al montar la unidad de red:', stderr);
      }
    } else {
      console.log('✅ Unidad de red montada correctamente.');
    }
  });
};
