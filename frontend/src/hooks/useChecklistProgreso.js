import { useEffect, useState } from 'react';
import axios from 'axios';

// src/hooks/useChecklistProgreso.js

const useChecklistProgreso = (tareas = []) => {
  const total = tareas.length;
  const completadas = tareas.filter(t => t.completado).length;
  const progreso = total === 0 ? 0 : Math.round((completadas / total) * 100);

  return {
    progreso,
    checklist: tareas
  };
};

export default useChecklistProgreso;
