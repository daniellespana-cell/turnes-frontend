import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';


const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="text-center text-white px-4">
        <h1 className="text-9xl font-bold mb-4">404</h1>
        <h2 className="text-4xl font-bold mb-4">Página No Encontrada</h2>
        <p className="text-xl mb-8">
          Lo sentimos, la página que buscas no existe.
        </p>
        <Link to="/">
          <Button variant="light" size="lg">
            <i className="fas fa-home mr-2"></i>
            Volver al Inicio
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
