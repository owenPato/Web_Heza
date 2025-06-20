import { useEffect, useState } from 'react';
import axios from 'axios';

const useCliente = () => {
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/clientes', { withCredentials: true })
      .then(res => {
        if (res.data.length > 0) {
          setCliente(res.data[0]);
        }
      })
      .catch(err => console.error('Error al cargar cliente:', err));
  }, []);

  return cliente;
};

export default useCliente;
