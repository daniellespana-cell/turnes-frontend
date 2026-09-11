import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';

const BlogFeaturedCard = ({ post }) => {
  if (!post) return null;

  return (
    <div className="mb-16">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-widest">
          Guía Destacada del Mes
        </span>
      </div>

      <div className="bg-[#090b0e] border border-zinc-800/90 rounded-3xl p-6 sm:p-10 hover:border-zinc-700/80 transition-all duration-300 shadow-2xl group">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-zinc-400 mb-3.5">
              <span className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-md font-bold uppercase tracking-wider">
                {post.categoryName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock size={14} /> {post.readTime}
              </span>
              <span>•</span>
              <span className="font-medium">{post.publishDate}</span>
            </div>

            <Link to={`/blog/${post.slug}`}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight group-hover:text-emerald-300 transition-colors leading-snug mb-4">
                {post.title}
              </h2>
            </Link>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-6 font-normal">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-7">
              {(post.tags || []).map(tag => (
                <span key={tag} className="text-xs text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800 font-medium">
                  #{tag}
                </span>
              ))}
            </div>

            <Link
              to={`/blog/${post.slug}`}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all border border-emerald-600/30 shadow-md"
            >
              <span>Leer Guía Completa</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="lg:col-span-4 bg-[#121720] border border-zinc-800 rounded-2xl p-6 text-sm sm:text-base space-y-3.5 shadow-lg">
            <span className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider block">
              Lo que aprenderás en esta guía:
            </span>
            <ul className="space-y-3 text-zinc-200">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Comparativa exhaustiva: Turnes vs CompuTrabajo vs LinkedIn vs Workana vs Magneto.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>5 pasos para cubrir turnos en menos de 30 minutos.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>6 plantillas copiables para meseros, bartenders y cocina.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Cómo ganar más dinero como talento con 0% comisión.</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BlogFeaturedCard;
