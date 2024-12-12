export default function CustomBookCover ({ genre }: { genre: string })  {
    const genreStyles = {
        fiction: {
            backgroundColor: '#FFE5D9',
            icon: '📖',
            pattern: 'repeating-linear-gradient(45deg, #fff2, transparent 2px, transparent 8px)',
        },
        romance: {
            backgroundColor: '#FFD6E0',
            icon: '💝',
            pattern: 'radial-gradient(circle at 50% 50%, #fff2 1px, transparent 1px)',
        },
        mystery: {
            backgroundColor: '#2B4162',
            icon: '🔍',
            pattern: 'repeating-radial-gradient(circle at 50% 50%, transparent 10px, #ffffff0d 12px)',
        },
        scifi: {
            backgroundColor: '#1B2845',
            icon: '🚀',
            pattern: 'linear-gradient(30deg, #ffffff0d 12%, transparent 12.5%, transparent 87%, #ffffff0d 87.5%, #ffffff0d)',
        },
        fantasy: {
            backgroundColor: '#4B0082',
            icon: '⚔️',
            pattern: 'radial-gradient(circle at 50% 50%, #ffffff0d 1px, transparent 1px)',
        },
        horror: {
            backgroundColor: '#1A1A1A',
            icon: '👻',
            pattern: 'repeating-linear-gradient(-45deg, #ffffff05 0px, #ffffff05 1px, transparent 1px, transparent 6px)',
        },
        history: {
            backgroundColor: '#8B4513',
            icon: '📜',
            pattern: 'repeating-linear-gradient(90deg, #ffffff0d 0px, #ffffff0d 1px, transparent 1px, transparent 10px)',
        },
        biography: {
            backgroundColor: '#2F4F4F',
            icon: '👤',
            pattern: 'linear-gradient(45deg, #ffffff0a 25%, transparent 25%, transparent 75%, #ffffff0a 75%, #ffffff0a)',
        },
        default: {
            backgroundColor: '#6B7280',
            icon: '📚',
            pattern: 'linear-gradient(90deg, #fff1 1px, transparent 1px)',
        }
    };

    const getGenreStyle = (genreType: string) => {
        const normalizedGenre = genreType.toLowerCase();
        return genreStyles[normalizedGenre as keyof typeof genreStyles] || genreStyles.default;
    };

    const style = getGenreStyle(genre);

    return (
        <div className="relative w-full h-full bg-white">
            <div 
                className="absolute inset-0 shadow-lg transition-all duration-300"
                style={{ 
                    backgroundColor: style.backgroundColor,
                    backgroundImage: style.pattern,
                }}
            >
                {/* Декоративные элементы */}
                <div className="absolute inset-x-0 top-0 h-1 bg-white/20" />
                <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10" />
                <div className="absolute inset-y-0 left-0 w-1 bg-black/5" />
                <div className="absolute inset-y-0 right-0 w-1 bg-black/10" />
                
                {/* Содержимое обложки */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <div className="text-5xl mb-4">
                        {style.icon}
                    </div>
                    <div className="w-16 h-0.5 bg-white/30 mb-4" />
                    <div className="text-sm font-serif text-white/90 text-center uppercase tracking-wider">
                        {'Book'}
                    </div>
                </div>

                {/* Эффекты */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity duration-300" />
            </div>
        </div>
    );
};
