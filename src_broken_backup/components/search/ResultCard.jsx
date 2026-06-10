import { useNavigate } from 'react-router-dom';

const ResultCard = ({ data }) => {

    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/register");
    };

    return (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col sm:flex-row group">

            {/* Imagen */}
            <div className="sm:w-48 h-48 sm:h-auto relative overflow-hidden shrink-0">
                <img 
                    src={data.image} 
                    alt={data.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-zinc-900/90 px-2 py-1 rounded-md text-xs font-bold text-white flex items-center shadow-sm">
                    <Star size={12} className="text-yellow-500 mr-1 fill-yellow-500" />
                    {data.rating}
                </div>
            </div>

            {/* Contenido */}
            <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full mb-2 inline-block ${
                                data.type === 'job'
                                ? 'bg-indigo-900 text-indigo-300'
                                : 'bg-green-900 text-green-300'
                            }`}>
                                {data.type === 'job' ? 'Oferta de Empleo' : 'Talento Disponible'}
                            </span>

                            <h3 className="text-xl font-bold text-white group-hover:text-brand-primary transition-colors">
                                {data.title}
                            </h3>
                            <p className="text-zinc-400 font-medium">{data.name}</p>
                        </div>

                        <div className="text-right">
                            <p className="text-lg font-bold text-white flex items-center justify-end">
                                {data.price}
                            </p>
                            <p className="text-xs text-zinc-500">por servicio/turno</p>
                        </div>
                    </div>

                    <div className="flex items-center text-zinc-400 text-sm mb-4">
                        <MapPin size={16} className="mr-1 text-zinc-500" />
                        {data.location}, Colombia
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {data.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-md">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Botón */}
                <div className="mt-auto pt-4 border-t border-zinc-800 flex justify-end">
                    <button
                        onClick={handleClick}
                        className="bg-zinc-800 hover:bg-brand-primary text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-zinc-900/20"
                    >
                        {data.type === 'job' ? 'Aplicar Ahora' : 'Contactar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultCard;
