import React from 'react';

import { typography } from '../../styles/typography';

const PageHeader = ({ icon: Icon, title, highlight, subtitle, extraContent }) => {
    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-10 px-4 md:px-8 max-w-4xl mx-auto w-full pt-10">
            <div className="flex flex-row items-center gap-4 md:gap-6">
                {Icon && (
                    <div className="p-3 bg-brand-primary/10 rounded-2xl border border-brand-primary/20 shrink-0">
                        <Icon size={24} className="text-brand-primary" strokeWidth={1.5} />
                    </div>
                )}
                
                <div className="flex-1 min-w-0 space-y-0.5 text-left">
                    <h1 className={typography.pageTitle}>
                        {title} {highlight && <span className={typography.gradient}>{highlight}</span>}
                    </h1>
                    {subtitle && (
                        <p className={typography.sectionTitle}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {extraContent && (
                <div className="flex shrink-0">
                    {extraContent}
                </div>
            )}
        </header>
    );
};

export default PageHeader;
