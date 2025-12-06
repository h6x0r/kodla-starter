import React from 'react';

export const DescriptionRenderer = ({ text }: { text: string }) => {
  const parts = text.split(/(\|\|\||\*\*\*)/); 

  return (
    <div className="space-y-6 text-sm leading-7 text-gray-700 dark:text-gray-300 font-sans">
      {parts.map((part, index) => {
        if (part === '|||' || part === '***') return null;
        const prev = parts[index - 1];
        
        // Example Block
        if (prev === '|||') {
            const lines = part.trim().split('\n');
            const title = lines[0];
            const content = lines.slice(1).join('\n');
            return (
                <div key={index} className="mt-4 bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 rounded-r-xl p-5 shadow-sm">
                    <div className="font-bold text-blue-700 dark:text-blue-300 mb-3 text-xs uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        {title}
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-xs bg-white dark:bg-[#0d1117] p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 text-gray-700 dark:text-gray-300 overflow-x-auto shadow-inner">
                        {content}
                    </pre>
                </div>
            );
        }

        // Constraints Block
        if (prev === '***') {
            return (
                <div key={index} className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-border">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Constraints
                    </h4>
                    <ul className="grid grid-cols-1 gap-2">
                        {part.trim().split('\n').map((line, i) => {
                            const cleanLine = line.replace(/^- /, '');
                            if(!cleanLine) return null;
                            const formatted = cleanLine.split(/(\d+\^?\d*|<=|>=)/).map((seg, j) => 
                                seg.match(/(\d+\^?\d*|<=|>=)/) ? <code key={j} className="bg-gray-100 dark:bg-dark-bg px-1.5 py-0.5 rounded text-xs font-mono text-brand-600 dark:text-brand-400 border border-gray-200 dark:border-dark-border">{seg}</code> : seg
                            );
                            return (
                                <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400"></span>
                                    <span>{formatted}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            );
        }

        // Standard Text
        return (
            <div key={index} className="whitespace-pre-wrap">
                {part.split(/(\`.*?\`|\*\*.*?\*\*)/).map((seg, i) => {
                    if (seg.startsWith('`') && seg.endsWith('`')) {
                        return <code key={i} className="bg-gray-100 dark:bg-dark-bg px-1.5 py-0.5 rounded text-xs font-mono text-brand-600 dark:text-brand-400 border border-gray-200 dark:border-dark-border">{seg.slice(1, -1)}</code>;
                    }
                    if (seg.startsWith('**') && seg.endsWith('**')) {
                        return <strong key={i} className="text-gray-900 dark:text-white font-semibold">{seg.slice(2, -2)}</strong>;
                    }
                    return seg;
                })}
            </div>
        );
      })}
    </div>
  );
};