import { useEffect, useState } from 'react';
import axios from 'axios';

const useCliente = () => {
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id;

        if (!userId) return;

        const { data } = await axios.get(`http://localhost:5000/api/clientes/por-user/${userId}`);
        setCliente(data);
      } catch (error) {
        console.error('Error al cargar cliente por userId:', error);
      }
    };

    fetchCliente();
  }, []);

  return cliente;
};

export default useCliente;

