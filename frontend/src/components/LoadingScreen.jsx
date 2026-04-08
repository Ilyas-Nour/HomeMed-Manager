import React from 'react';
import { ShieldCheck, Plus } from 'lucide-react';

/**
 * LoadingScreen — Product Precision (White & Sharp)
 * Unifiée pour une expérience cohérente sur toute l'application.
 */
const LoadingScreen = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white selection:bg-brand-blue/10">
            <div className="flex flex-col items-center animate-fade-in">
                {/* Logo - Simple & Clear */}
                <div className="w-24 h-24 flex items-center justify-center mb-8 border border-slate-100 shadow-sm">
                    <img 
                        src="/HomeMed-Logo.png" 
                        alt="HomeMed" 
                        className="w-16 h-16 object-contain grayscale-[0.5] opacity-80" 
                    />
                </div>
                
                {/* Minimalist Hairline Progress */}
                <div className="w-40 h-[1px] bg-slate-100 overflow-hidden relative">
                    <div className="absolute inset-0 bg-brand-blue animate-[loading_2s_infinite_ease-in-out]"></div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
};

export default LoadingScreen;
