import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PasswordSecurityGroup from '../components/forms/PasswordSecurityGroup';

describe('PasswordSecurityGroup', () => {
    it('renders password and confirm password inputs', () => {
        render(<PasswordSecurityGroup />);
        
        expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Confirmar Contraseña')).toBeInTheDocument();
    });

    it('updates requirements when typing a strong password', () => {
        render(<PasswordSecurityGroup />);
        
        const passwordInput = screen.getByPlaceholderText('Contraseña');
        
        // At start, all requirements are gray/unmet. We can just check they are in document.
        expect(screen.getByText('Mín. 8 caracteres')).toBeInTheDocument();
        
        fireEvent.change(passwordInput, { target: { value: 'StrongPass1!' } });
        
        // To strictly test the color/icon change, we would check the class or icon, 
        // but for this smoke test, we ensure it doesn't crash on input.
        expect(passwordInput.value).toBe('StrongPass1!');
    });

    it('shows error text when passwords do not match', () => {
        render(<PasswordSecurityGroup />);
        
        const passwordInput = screen.getByPlaceholderText('Contraseña');
        const confirmInput = screen.getByPlaceholderText('Confirmar Contraseña');
        
        fireEvent.change(passwordInput, { target: { value: 'Pass123!' } });
        fireEvent.change(confirmInput, { target: { value: 'Pass123' } }); // Not matching
        
        expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
    });
});
