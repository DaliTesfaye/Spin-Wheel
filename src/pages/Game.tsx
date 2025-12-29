import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { spinWheel, getAllActiveProducts } from '../spin';
import type { Product } from '../types';

export function Game() {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Product | null>(null);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const products = await getAllActiveProducts();
    setActiveProducts(products);
  }

  async function handleSpin() {
    if (spinning) return;
    
    setSpinning(true);
    setWinner(null);
    setShowTryAgain(false);

    // Random rotation between 1440 and 2160 degrees (4-6 full spins)
    const randomRotation = 1440 + Math.random() * 720;
    setRotation(rotation + randomRotation);

    // Simulate spin animation delay
    setTimeout(async () => {
      const result = await spinWheel();
      if (result === null) {
        // Landed on finished product
        setShowTryAgain(true);
      } else {
        setWinner(result);
      }
      setSpinning(false);
      await loadProducts();
    }, 3000);
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 via-pink-500 to-red-500 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-2xl">
              🎡 Spin & Win!
            </h1>
            <p className="text-white/90 text-lg mt-2">Try your luck and win amazing prizes!</p>
          </div>
          <Link 
            to="/admin" 
            className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border border-white/30"
          >
            ⚙️
          </Link>
        </div>

        {activeProducts.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Products Available</h2>
            <p className="text-gray-600 mb-6">Please add products in the admin panel to start playing!</p>
            <Link 
              to="/admin"
              className="inline-block bg-linear-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Go to Admin Panel
            </Link>
          </div>
        ) : activeProducts.filter(p => p.remaining > 0).length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">All Products Finished!</h2>
            <p className="text-gray-600 mb-6">All prizes have been claimed. Please check back later or contact admin to reset quantities.</p>
            <Link 
              to="/admin"
              className="inline-block bg-linear-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Go to Admin Panel
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Wheel Container */}
            <div className="relative mb-12">
              {/* Pointer */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20">
                <div className="w-0 h-0 border-l-[30px] border-r-[30px] border-t-[50px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-xl animate-bounce"></div>
              </div>
              
              {/* Wheel */}
              <div className="relative w-[400px] h-[400px] md:w-[500px] md:h-[500px]">
                <div 
                  className="w-full h-full rounded-full border-8 border-white shadow-2xl transition-transform duration-[3000ms] ease-out relative overflow-hidden"
                  style={{ 
                    transform: `rotate(${rotation}deg)`,
                    background: `conic-gradient(${activeProducts.map((_, i) => {
                      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F9CA24', '#6C5CE7', '#FD79A8', '#FDCB6E', '#00B894'];
                      const color = colors[i % colors.length];
                      const start = (i / activeProducts.length) * 100;
                      const end = ((i + 1) / activeProducts.length) * 100;
                      return `${color} ${start}%, ${color} ${end}%`;
                    }).join(', ')})`
                  }}
                >
                  {/* Center Circle */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-yellow-400">
                      <span className="text-3xl">🎁</span>
                    </div>
                  </div>
                  
                  {/* Product Labels */}
                  {activeProducts.map((product, index) => {
                    const angle = (360 / activeProducts.length) * index;
                    const isFinished = product.remaining === 0;
                    return (
                      <div
                        key={product.id}
                        className="absolute top-1/2 left-1/2 origin-left"
                        style={{
                          transform: `rotate(${angle + 90}deg) translateY(-50%)`,
                          width: '50%',
                        }}
                      >
                        <div className="flex flex-col items-center ml-4 relative">
                          <div className="relative">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className={`w-12 h-12 object-contain bg-white/90 rounded-lg p-1 shadow-md ${
                                isFinished ? 'opacity-40 grayscale' : ''
                              }`}
                            />
                            {isFinished && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl">🔒</span>
                              </div>
                            )}
                          </div>
                          <span className={`text-xs font-bold text-white mt-1 drop-shadow-lg px-2 py-1 rounded ${
                            isFinished ? 'bg-red-600/80 line-through' : 'bg-black/30'
                          }`}>
                            {product.name} ({product.remaining})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Spin Button */}
            <button 
              onClick={handleSpin}
              disabled={spinning || activeProducts.filter(p => p.remaining > 0).length === 0}
              className={`
                relative px-10 py-4 text-xl font-bold rounded-full shadow-2xl
                transition-all duration-300 transform
                ${spinning || activeProducts.filter(p => p.remaining > 0).length === 0
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-linear-to-r from-yellow-400 via-orange-500 to-red-500 hover:scale-110 hover:shadow-3xl cursor-pointer animate-pulse'
                }
                text-white uppercase tracking-wider
              `}
            >
              {spinning ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Spinning...
                </span>
              ) : activeProducts.filter(p => p.remaining > 0).length === 0 ? (
                'No Prizes Left'
              ) : (
                '🎲 SPIN NOW!'
              )}
            </button>

            {/* Available Products Count */}
            <div className="mt-8 bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl text-white font-semibold">
              🎁 {activeProducts.filter(p => p.remaining > 0).length} prizes available
            </div>
          </div>
        )}
      </div>

      {/* Try Again Modal */}
      {showTryAgain && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-linear-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 md:p-12 max-w-lg w-full shadow-2xl transform animate-in zoom-in duration-500">
            <div className="text-center">
              <div className="text-7xl mb-4">😅</div>
              <h2 className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
                TRY AGAIN!
              </h2>
              <p className="text-2xl text-white/90 mb-6">
                This prize is no longer available.
              </p>
              <button 
                onClick={() => setShowTryAgain(false)}
                className="bg-white text-red-600 px-12 py-4 rounded-full font-bold text-xl hover:bg-red-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Better luck Next Time !!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winner Modal */}
      {winner && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-linear-to-br from-yellow-400 via-orange-400 to-red-400 rounded-3xl p-8 md:p-12 max-w-lg w-full shadow-2xl transform animate-in zoom-in duration-500 relative overflow-hidden">
            {/* Confetti Effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/4 w-2 h-2 bg-white rounded-full animate-ping"></div>
              <div className="absolute top-0 right-1/4 w-2 h-2 bg-white rounded-full animate-ping delay-100"></div>
              <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white rounded-full animate-ping delay-200"></div>
            </div>
            
            <div className="relative text-center">
              <div className="text-5xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-4xl font-extrabold text-white mb-4 drop-shadow-lg">
                CONGRATULATIONS!
              </h2>
              <div className="bg-white rounded-2xl p-6 my-6 shadow-xl">
                <img 
                  src={winner.image} 
                  alt={winner.name}
                  className="w-48 h-48 object-contain mx-auto"
                />
              </div>
              <h3 className="text-3xl font-bold text-white mb-6 drop-shadow-md">
                You won: {winner.name}!
              </h3>
              <button 
                onClick={() => setWinner(null)}
                className="bg-white text-orange-600 px-12 py-4 rounded-full font-bold text-xl hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Claim Prize 🎁
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
