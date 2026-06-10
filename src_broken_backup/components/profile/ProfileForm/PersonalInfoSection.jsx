
const PersonalInfoSection = ({ formData, handleInputChange, isEditing }) => {
    return (
        <SectionCard title="Información Personal" icon={<User size={14} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputField
                    label="Nombre Completo"
                    value={formData.name || ''}
                    onChange={v => handleInputChange('name', v)}
                    disabled={!isEditing}
                    icon={<User size={12} />}
                />
                <InputField
                    label="Correo Electrónico"
                    value={formData.email || ''}
                    onChange={v => handleInputChange('email', v)}
                    disabled={!isEditing}
                    icon={<Mail size={12} />}
                />
                <InputField
                    label="Teléfono"
                    value={formData.phone || ''}
                    onChange={v => handleInputChange('phone', v)}
                    disabled={!isEditing}
                    icon={<Phone size={12} />}
                />
                <TextAreaField
                    label="Sobre Mí / Biografía"
                    value={formData.bio || ''}
                    onChange={v => handleInputChange('bio', v)}
                    disabled={!isEditing}
                    placeholder="Escriba una breve biografía sobre usted o su trayectoria profesional..."
                    fullWidth
                />
            </div>
        </SectionCard>
    );
};

export default PersonalInfoSection;
