import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { getAllActiveProducts } from "../spin";
import type { Product } from "../types";

export function Game() {
  const navigate = useNavigate();
  const clickCount = useRef(0);
  const clickTimer = useRef<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Product | null>(null);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [rotation, setRotation] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

    // STEP 1: Select winner index using probability logic
    const availableProducts = activeProducts.filter((p) => p.remaining > 0);
    if (availableProducts.length === 0) return;

    // Probability-based selection
    // Build weighted array based on probability
    const weighted: Product[] = [];
    availableProducts.forEach((product) => {
      const prob = product.probability ?? 0;
      // Use Math.round to avoid floating point issues, scale by 100 for 2 decimals
      for (let i = 0; i < Math.round(prob * 100); i++) {
        weighted.push(product);
      }
    });
    // Fallback: if no probabilities set, use uniform random
    let randomProduct: Product;
    if (weighted.length > 0) {
      randomProduct = weighted[Math.floor(Math.random() * weighted.length)];
    } else {
      randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)];
    }

    // STEP 2: Find the winner's position in the wheel (activeProducts array)
    const winnerIndex = activeProducts.findIndex(
      (p) => p.uniqueKey === randomProduct.uniqueKey,
    );

    // STEP 3: Calculate the exact rotation to land on the winner
    const segmentAngle = 360 / activeProducts.length;
    // Product position in the wheel (with -112.5° offset)
    const productAngle = winnerIndex * segmentAngle + segmentAngle / 2 - 112.5;
    // Normalize to 0-360
    const normalizedProductAngle = ((productAngle % 360) + 360) % 360;

    // Get current wheel position (normalized to 0-360)
    const normalizedCurrentRotation = ((rotation % 360) + 360) % 360;

    // Calculate where product currently is after current rotation
    const currentProductPosition =
      (normalizedProductAngle + normalizedCurrentRotation) % 360;

    // Pointer is at 270° - calculate how much to rotate from current position
    const minSpins = 8;
    const spinDegrees = minSpins * 360;

    // Calculate needed rotation to get from current product position to 270°
    let neededRotation = (270 - currentProductPosition + 360) % 360;
    // If neededRotation is 0, add a full spin so it never looks like a crawl
    if (neededRotation === 0) neededRotation = 360;

    // Always add minimum spins
    const totalRotation = spinDegrees + neededRotation;

    // Disable transition, reset position to normalized current
    setIsTransitioning(false);
    setRotation(normalizedCurrentRotation);

    // Animate to target rotation after a short delay (forces full spin every time)
    setTimeout(() => {
      setIsTransitioning(true);
      setRotation(normalizedCurrentRotation + totalRotation);
    }, 50);

    const finalProductPosition = (currentProductPosition + totalRotation) % 360;
    console.log(
      "🎯 WIN INDEX:",
      winnerIndex,
      "|",
      randomProduct.name,
      "| Product start angle:",
      normalizedProductAngle.toFixed(1) + "°",
      "| Current wheel:",
      normalizedCurrentRotation.toFixed(1) + "°",
      "| Current product pos:",
      currentProductPosition.toFixed(1) + "°",
      "| Rotating by:",
      totalRotation.toFixed(1) + "°",
      "| Final product pos:",
      finalProductPosition.toFixed(1) + "° (should be 270°)",
    );

    // STEP 4: Update database and show result after animation completes
    setTimeout(async () => {
      const isTryAgain = randomProduct.name.includes("Prochaine");

      if (!isTryAgain) {
        // Decrement product quantity in database
        const { db } = await import("../db");
        if (randomProduct.id) {
          await db.products.update(randomProduct.id, {
            remaining: Math.max(0, randomProduct.remaining - 1),
          });

          // Log the win to history
          await db.logs.add({
            productId: randomProduct.id,
            productName: randomProduct.name,
            date: new Date(),
            remaining: Math.max(0, randomProduct.remaining - 1),
          });
        }
        setWinner(randomProduct);
      } else {
        setShowTryAgain(true);
      }

      setSpinning(false);
      await loadProducts();
    }, 3000);
  }

  // Five-click handler
  function handleScreenClick() {
    clickCount.current += 1;
    if (clickTimer.current) window.clearTimeout(clickTimer.current);
    if (clickCount.current === 5) {
      clickCount.current = 0;
      navigate('/admin');
      return;
    }
    clickTimer.current = window.setTimeout(() => {
      clickCount.current = 0;
    }, 700); // 700ms window for 5 clicks
  }

  return (
    <div
      className="w-screen h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed overflow-hidden"
      style={{ backgroundImage: "url('/MAGNET_JADIDA.png')" }}
      onClick={handleScreenClick}
    >
      {/* Header */}
      <div className="w-full flex flex-col items-center justify-center">
        <div className="flex justify-between items-center mb-8">
          <div>

          </div>
          {/* <Link 
            to="/admin" 
            className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border border-white/30"
          >
            ⚙️
          </Link> */}
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
          <div className="flex flex-col items-center justify-center w-full h-full">
            {/* Wheel Container */}
            <div className="relative mb-15">
              {/* Pointer */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20">
                <div className="w-0 h-0 border-l-30 border-r-30 border-t-50 border-l-transparent border-r-transparent border-black drop-shadow-xl animate-bounce"></div>
              </div>
              {/* Center Circle - Spin Button and Logo (fixed, above wheel) */}
              <div className="absolute left-1/2 top-1/2 z-30" style={{transform: 'translate(-50%, -50%)'}}>
                <button
                  onClick={handleSpin}
                  disabled={spinning || activeProducts.filter(p => p.remaining > 0).length === 0}
                  className="pointer-events-auto"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: spinning || activeProducts.filter(p => p.remaining > 0).length === 0 ? 'not-allowed' : 'pointer',
                    opacity: spinning || activeProducts.filter(p => p.remaining > 0).length === 0 ? 0.6 : 1,
                    outline: 'none',
                    boxShadow: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 130,
                      height: 130,
                      position: 'relative',
                    }}
                  >
                    {/* Small background design */}
                    <img
                      src="/2.png"
                      alt="Spin background"
                      style={{
                        width: 130,
                        height: 130,
                        objectFit: 'contain',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        zIndex: 1,
                        pointerEvents: 'none',
                      }}
                    />
                    {/* Jadida logo perfectly centered */}
                    <img
                      src="/jadida.png"
                      alt="Spin"
                      style={{
                        width: 100,
                        height: 60,
                        objectFit: 'contain',
                        zIndex: 2,
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        opacity: spinning ? 0.5 : 1,
                      }}
                    />
                  </span>
                </button>
              </div>
              {/* Wheel */}
              <div className="relative w-170 h-170 md:w-160 md:h-160">
                {/* Yellow outer border */}
                <div className="absolute inset-0 rounded-full bg-yellow-400 shadow-2xl p-3">
                  {/* Red border */}
                  <div className="w-full h-full rounded-full bg-[#FF3B3B] p-3">
                    {/* White thin inner border */}
                    <div className="w-full h-full rounded-full bg-white p-0.5">
                      <div 
                        className={`w-full h-full rounded-full shadow-inner relative pointer-events-none ${isTransitioning ? 'transition-transform duration-3000 ease-out' : ''}`}
                        style={{ 
                          transform: `rotate(${rotation}deg)`,
                          background: activeProducts.length > 0 ? `conic-gradient(from -112.5deg, ${activeProducts.map((_, i) => {
                            const color = i % 2 === 0 ? '#FFD700' : '#FF3B3B';
                            const segmentAngle = 360 / activeProducts.length;
                            const startAngle = i * segmentAngle;
                            const endAngle = (i + 1) * segmentAngle;
                            return `${color} ${startAngle}deg, ${color} ${endAngle}deg`;
                          }).join(', ')})` : '#FFD700'
                        }}
                      >
                        {/* White divider lines between segments */}
                        {activeProducts.map((_, index) => {
                          const angle = (360 / activeProducts.length) * index - 112.5;
                          return (
                            <div
                              key={`divider-${index}`}
                              className="absolute top-1/2 left-1/2 w-0.75 h-1/2 bg-white origin-top"
                              style={{
                                transform: `translateX(-50%) rotate(${angle}deg)`,
                              }}
                            />
                          );
                        })}
                  
                  {/* Product Labels */}
                  {activeProducts.map((product, index) => {
                    const segmentAngle = 360 / activeProducts.length;
                    const angle = (segmentAngle * index) - 112.5;
                    const isFinished = product.remaining === 0;
                    const isEmptySlot = product.name.startsWith('❌');
                    const isYellowSegment = index % 2 === 0;
                    const textColor = isYellowSegment ? '#DC2626' : '#FFD700';
                    // Responsive distance and size
                    const wheelRadius = window.innerWidth >= 768 ? 300 : 200;
                    const distanceFromCenter = wheelRadius * 0.3 ;
                    const productCount = activeProducts.length;
                    const imageSize = productCount > 6 ? 'w-24 h-24' : productCount > 4 ? 'w-12 h-12' : 'w-14 h-14';
                    const fontSize = productCount > 6 ? 'text-[19px]' : productCount > 4 ? 'text-[14px]' : 'text-[16px]';
                    const isALaProchaine = product.name.toLowerCase().includes('prochaine');
                    return (
                      <div
                        key={product.id}
                        className="absolute top-1/2 left-1/2"
                        style={{
                          transform: `rotate(${angle + segmentAngle / 2}deg)`,
                          transformOrigin: '0 0',
                        }}
                      >
                        <div
                          className="flex flex-row items-center gap-2"
                          style={{
                            transform: `translateX(${distanceFromCenter}px) translateY(-50%)`,
                            width: '180px', // Make the label use more of the segment width
                            maxWidth: '220px',
                          }}
                        >
                          <div
                            className={`${fontSize} font-extrabold text-left wrap-break-word flex-1 leading-tight ${
                              isFinished && !isEmptySlot ? 'line-through opacity-50' : ''
                            }`}
                            style={{
                              color: textColor,
                              textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                            }}
                          >
                            {isEmptySlot ? product.name : product.name}
                          </div>
                          {/* Only show image if not 'A la Prochaine' */}
                          {!isALaProchaine && (
                            <div className={`relative ${imageSize} shrink-0 overflow-hidden rounded bg-transparent`}>
                              <img
                                src={product.image}
                                alt={product.name}
                                className={`w-full h-full object-contain ${
                                  isFinished ? 'opacity-40 grayscale' : ''
                                }`}
                              />
                              {isFinished && !isEmptySlot && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                                  <span className="text-sm">🔒</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                A la Prochaine
              </h2>
              <p className="text-2xl text-white/90 mb-6">
                Maybe next spin will bring you a prize!
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
