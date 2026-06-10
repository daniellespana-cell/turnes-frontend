
const LegalComplianceCheckbox = ({ legalAccepted, setLegalAccepted }) => {
    return (
        <div className={`border rounded-2xl p-5 flex items-start gap-4 transition-colors duration-300 ${legalAccepted ? 'bg-blue-500/10 border-blue-500/30' : 'bg-zinc-900/50 border-zinc-800'}`}>
            <div className="pt-0.5">
                <input
                    type="checkbox"
                    id="habeasData"
                    checked={legalAccepted}
                    onChange={(e) => setLegalAccepted(e.target.checked)}
                    className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
                />
            </div>
            <div>
                <label htmlFor="habeasData" className="text-sm font-bold text-white cursor-pointer select-none">
                    Autorización de Tratamiento de Datos (Ley 1581)
                </label>
                <p className="text-[11px] text-zinc-400 leading-relaxed mt-1.5">
                    Autorizo expresa e irrevocablemente a Turnes S.A.S a recopilar, almacenar y procesar mis datos personales y biométricos contenidos en estos documentos, con el fin exclusivo de validar mi identidad y/o antecedentes, dando cumplimiento a la <a href="/legal/privacidad" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Ley de Protección de Datos Personales</a>.
                </p>
            </div>
        </div>
    );
};

export default LegalComplianceCheckbox;
