import React from 'react';
import BlogCallout from './BlogCallout';
import BlogComparisonTable from './BlogComparisonTable';
import BlogStepList from './BlogStepList';
import BlogCardGrid from './BlogCardGrid';
import BlogBenefitGrid from './BlogBenefitGrid';
import BlogSourcesList from './BlogSourcesList';
import BlogTemplateSelector from './BlogTemplateSelector';
import BlogSectionCTA from './BlogSectionCTA';

const BlogPostSectionRenderer = ({ 
  section, 
  index, 
  selectedTemplateTab, 
  onSelectTab, 
  copiedTemplateId, 
  onCopyTemplate 
}) => {
  return (
    <section id={section.id || `seccion-${index}`} className="space-y-7">
      {section.badge && (
        <span className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-widest block">
          {section.badge}
        </span>
      )}

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
        {section.title}
      </h2>

      {section.description && (
        <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
          {section.description}
        </p>
      )}

      {section.paragraphs && section.paragraphs.map((p, pIdx) => (
        <p key={pIdx} className="text-base sm:text-[18px] md:text-[19px] text-zinc-200 leading-[1.8] font-normal">
          {p}
        </p>
      ))}

      {section.callout && <BlogCallout callout={section.callout} />}

      {section.table && <BlogComparisonTable table={section.table} />}

      {section.steps && <BlogStepList steps={section.steps} />}

      {section.cards && <BlogCardGrid cards={section.cards} />}

      {section.grid && <BlogBenefitGrid grid={section.grid} />}

      {section.sources && <BlogSourcesList sources={section.sources} />}

      {section.templates && (
        <BlogTemplateSelector 
          templates={section.templates}
          selectedTemplateTab={selectedTemplateTab}
          onSelectTab={onSelectTab}
          copiedTemplateId={copiedTemplateId}
          onCopyTemplate={onCopyTemplate}
        />
      )}

      {section.cta && <BlogSectionCTA cta={section.cta} />}
    </section>
  );
};

export default BlogPostSectionRenderer;
