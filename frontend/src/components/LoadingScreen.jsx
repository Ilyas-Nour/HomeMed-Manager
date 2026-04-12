import React from 'react';

/**
 * LoadingScreen — Product Precision (Sleek & White)
 * Un design épuré avec un spinner à double anneau pour une expérience premium.
 */
const LoadingScreen = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white selection:bg-brand-blue/10">
            <div className="relative flex flex-col items-center gap-10">
                
                {/* Spinner Premium Double Anneau */}
                <div className="relative h-16 w-16">
                    {/* Anneau extérieur - Rotation lente */}
                    <div className="absolute inset-0 rounded-full border-[3px] border-slate-100 border-t-brand-blue animate-[spin_1.5s_linear_infinite]"></div>
                    {/* Anneau intérieur - Rotation inverse plus rapide */}
                    <div className="absolute inset-2 rounded-full border-[3px] border-slate-50 border-t-brand-blue/30 animate-[spin_0.8s_linear_infinite_reverse]"></div>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 animate-pulse">
                        Chargement
                    </p>
                    <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                            <div 
                                key={i} 
                                className="h-1 w-1 rounded-full bg-brand-blue/20 animate-bounce" 
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}} />
        </div>
    );
};

export default LoadingScreen;
