import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllActiveProducts } from "../spin";
import type { Product } from "../types";

export function Game() {
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

    // STEP 1: Select winner index directly from activeProducts (single source of truth)
    const availableProducts = activeProducts.filter((p) => p.remaining > 0);
    if (availableProducts.length === 0) return;

    // Random selection from available products
    const randomProduct =
      availableProducts[Math.floor(Math.random() * availableProducts.length)];

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

  return (
    <div
      className="min-h-screen p-4 md:p-6 lg:p-8 xl:p-12 bg-cover bg-center bg-no-repeat bg-fixed h-screen overflow-hidden"
      style={{ backgroundImage: "url('/MAGNET_JADIDA.png')" }}
    >
      {/* Header */}
      <div className="max-w-[1800px] mx-auto">
        <div className="flex justify-between items-center mb-6 md:mb-8 lg:mb-12">
          <div></div>
          <Link
            to="/admin"
            className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-4 py-2 md:px-8 md:py-3 lg:px-8 lg:py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border border-white/30 text-sm md:text-base lg:text-lg"
            style={{ transform: "translateY(120px)" }}
          >
            ⚙️
          </Link>
        </div>

        {activeProducts.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center max-w-2xl mx-auto">
            <div className="text-4xl md:text-6xl mb-4">📦</div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
              No Products Available
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              Please add products in the admin panel to start playing!
            </p>
            <Link
              to="/admin"
              className="inline-block bg-linear-to-r from-purple-600 to-pink-600 text-white px-6 py-2 md:px-8 md:py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-sm md:text-base"
            >
              Go to Admin Panel
            </Link>
          </div>
        ) : activeProducts.filter((p) => p.remaining > 0).length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center max-w-2xl mx-auto">
            <div className="text-4xl md:text-6xl mb-4">🔒</div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
              All Products Finished!
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              All prizes have been claimed. Please check back later or contact
              admin to reset quantities.
            </p>
            <Link
              to="/admin"
              className="inline-block bg-linear-to-r from-purple-600 to-pink-600 text-white px-6 py-2 md:px-8 md:py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-sm md:text-base"
            >
              Go to Admin Panel
            </Link>
          </div>
        ) : (
          <div
            className="flex flex-col items-center portrait:min-h-screen portrait:justify-center"
          >
            {/* Wheel Container */}
            <div className="relative mb-8 md:mb-12 lg:mb-16 ">
              {/* Pointer */}
              <div className="absolute -top-8 md:-top-12 lg:-top-16 xl:-top-18 left-1/2 -translate-x-1/2 z-20">
                <div className="w-0 h-0 border-l-20 border-r-20 border-t-35 md:border-l-30 md:border-r-30 md:border-t-50 lg:border-l-40 lg:border-r-40 lg:border-t-60 xl:border-l-45 xl:border-r-45 xl:border-t-65 border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-xl animate-bounce"></div>
              </div>

              {/* Wheel - Fully Responsive */}
              <div className="relative
    w-80 h-80
    sm:w-96 sm:h-96
    md:w-[650px] md:h-[650px]

    lg:w-[590px] lg:h-[590px]
    lg:portrait:w-[520px] lg:portrait:h-[520px]

    xl:w-[800px] xl:h-[800px]
    2xl:w-[900px] 2xl:h-[900px]">
                {/* Yellow outer border */}
                <div className="absolute inset-0 rounded-full bg-yellow-400 shadow-2xl p-2 md:p-3 lg:p-4">
                  {/* Red border */}
                  <div className="w-full h-full rounded-full bg-[#FF3B3B] p-2 md:p-3 lg:p-4">
                    {/* White thin inner border */}
                    <div className="w-full h-full rounded-full bg-white p-0.5">
                      <div
                        className={`w-full h-full rounded-full shadow-inner relative ${isTransitioning ? "transition-transform duration-3000 ease-out" : ""}`}
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          background:
                            activeProducts.length > 0
                              ? `conic-gradient(from -112.5deg, ${activeProducts
                                  .map((_, i) => {
                                    const color =
                                      i % 2 === 0 ? "#FFD700" : "#FF3B3B";
                                    const segmentAngle =
                                      360 / activeProducts.length;
                                    const startAngle = i * segmentAngle;
                                    const endAngle = (i + 1) * segmentAngle;
                                    return `${color} ${startAngle}deg, ${color} ${endAngle}deg`;
                                  })
                                  .join(", ")})`
                              : "#FFD700",
                        }}
                      >
                        {/* White divider lines between segments */}
                        {activeProducts.map((_, index) => {
                          const angle =
                            (360 / activeProducts.length) * index - 112.5;
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
                          const angle = segmentAngle * index - 112.5;
                          const isFinished = product.remaining === 0;
                          const isEmptySlot = product.name.startsWith("❌");

                          // Determine segment color for text contrast
                          const isYellowSegment = index % 2 === 0;
                          const textColor = isYellowSegment
                            ? "#DC2626"
                            : "#FFD700";

                          // Calculate responsive distance and size based on wheel size
                          const getWheelRadius = () => {
                            if (window.innerWidth >= 1536) return 450; // 2xl
                            if (window.innerWidth >= 1280) return 400; // xl
                            if (window.innerWidth >= 1024) return 272; // lg
                            if (window.innerWidth >= 768) return 270; // md
                            if (window.innerWidth >= 640) return 192; // sm
                            return 160; // mobile
                          };
                          const wheelRadius = getWheelRadius();
                          const distanceFromCenter = wheelRadius * 0.32;

                          // Scale based on product count and screen size
                          const productCount = activeProducts.length;
                          const getImageSize = () => {
                            if (window.innerWidth >= 1536) {
                              return productCount > 6
                                ? "w28 h-28"
                                : productCount > 4
                                  ? "w-22 h-22"
                                  : "w-24 h-24";
                            }
                            if (window.innerWidth >= 1280) {
                              return productCount > 6
                                ? "w-26 h-26"
                                : productCount > 4
                                  ? "w-20 h-20"
                                  : "w-22 h-22";
                            }
                            if (window.innerWidth >= 1024) {
                              return productCount > 6
                                ? "w-18 h-18"
                                : productCount > 4
                                  ? "w-18 h-18"
                                  : "w-20 h-20";
                            }
                            if (window.innerWidth >= 768) {
                              return productCount > 6
                                ? "w-15 h-15"
                                : productCount > 4
                                  ? "w-14 h-14"
                                  : "w-16 h-16";
                            }
                            return productCount > 6
                              ? "w-10 h-10"
                              : productCount > 4
                                ? "w-12 h-12"
                                : "w-14 h-14";
                          };
                          const imageSize = getImageSize();

                          const getFontSize = () => {
                            if (window.innerWidth >= 1536) {
                              return productCount > 6
                                ? "text-[32px]"
                                : productCount > 4
                                  ? "text-[24px]"
                                  : "text-[26px]";
                            }
                            if (window.innerWidth >= 1280) {
                              return productCount > 6
                                ? "text-[26px]"
                                : productCount > 4
                                  ? "text-[22px]"
                                  : "text-[24px]";
                            }
                            if (window.innerWidth >= 1024) {
                              return productCount > 6
                                ? "text-[20px]"
                                : productCount > 4
                                  ? "text-[20px]"
                                  : "text-[22px]";
                            }
                            if (window.innerWidth >= 768) {
                              return productCount > 6
                                ? "text-[20px]"
                                : productCount > 4
                                  ? "text-[17px]"
                                  : "text-[19px]";
                            }
                            return productCount > 6
                              ? "text-[17px]"
                              : productCount > 4
                                ? "text-[15px]"
                                : "text-[16px]";
                          };
                          const fontSize = getFontSize();

                          return (
                            <div
                              key={product.id}
                              className="absolute top-1/2 left-1/2"
                              style={{
                                transform: `rotate(${angle + segmentAngle / 2}deg)`,
                                transformOrigin: "0 0",
                              }}
                            >
                              <div
                                className="flex flex-row items-center gap-2"
                                style={{
                                  transform: `translateX(${distanceFromCenter}px) translateY(-50%)`,
                                  width:
                                    window.innerWidth >= 1536
                                      ? "240px"
                                      : window.innerWidth >= 1280
                                        ? "220px"
                                        : window.innerWidth >= 1024
                                          ? "190px"
                                          : window.innerWidth >= 768
                                            ? "150px"
                                            : "115px",
                                }}
                              >
                                {/* Only show image if not 'A la Prochaine' */}
                                {!product.name.includes("Prochaine") && (
                                  <div
                                    className={`relative ${imageSize} shrink-0 overflow-hidden rounded bg-transparent`}
                                  >
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className={`w-full h-full object-contain ${
                                        isFinished ? "opacity-40 grayscale" : ""
                                      }`}
                                    />
                                    {isFinished && !isEmptySlot && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                                        <span className="text-sm">🔒</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                <div
                                  className={`${fontSize} font-extrabold text-left flex-1 leading-tight ${
                                    isFinished && !isEmptySlot
                                      ? "line-through opacity-50"
                                      : ""
                                  }`}
                                  style={{
                                    color: textColor,
                                    textShadow: "0 2px 4px rgba(0,0,0,0.4)",
                                    wordBreak: "break-word",
                                    overflowWrap: "break-word",
                                  }}
                                >
                                  {isEmptySlot ? product.name : product.name}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Circle - Spin Button - FIXED POSITION OUTSIDE WHEEL */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                <button
                  onClick={handleSpin}
                  disabled={
                    spinning ||
                    activeProducts.filter((p) => p.remaining > 0).length === 0
                  }
                  className="pointer-events-auto"
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor:
                      spinning ||
                      activeProducts.filter((p) => p.remaining > 0).length === 0
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      spinning ||
                      activeProducts.filter((p) => p.remaining > 0).length === 0
                        ? 0.6
                        : 1,
                    outline: "none",
                    boxShadow: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width:
                        window.innerWidth >= 1536
                          ? 170
                          : window.innerWidth >= 1280
                            ? 150
                            : window.innerWidth >= 1024
                              ? 138
                              : window.innerWidth >= 768
                                ? 127
                                : 100,
                      height:
                        window.innerWidth >= 1536
                          ? 170
                          : window.innerWidth >= 1280
                            ? 150
                            : window.innerWidth >= 1024
                              ? 138
                              : window.innerWidth >= 768
                                ? 127
                                : 100,
                      position: "relative",
                    }}
                  >
                    {/* Small background design */}
                    <img
                      src="/2.png"
                      alt="Spin background"
                      style={{
                        width:
                          window.innerWidth >= 1536
                            ? 170
                            : window.innerWidth >= 1280
                              ? 150
                              : window.innerWidth >= 1024
                                ? 138
                                : window.innerWidth >= 768
                                  ? 127
                                  : 100,
                        height:
                          window.innerWidth >= 1536
                            ? 170
                            : window.innerWidth >= 1280
                              ? 150
                              : window.innerWidth >= 1024
                                ? 138
                                : window.innerWidth >= 768
                                  ? 127
                                  : 100,
                        objectFit: "contain",
                        position: "absolute",
                        left: 0,
                        top: 0,
                        zIndex: 1,
                        pointerEvents: "none",
                      }}
                    />
                    {/* Jadida logo perfectly centered */}
                    <img
                      src="/jadida.png"
                      alt="Spin"
                      style={{
                        width:
                          window.innerWidth >= 1536
                            ? 85
                            : window.innerWidth >= 1280
                              ? 75
                              : window.innerWidth >= 1024
                                ? 69
                                : window.innerWidth >= 768
                                  ? 63
                                  : 50,
                        height:
                          window.innerWidth >= 1536
                            ? 46
                            : window.innerWidth >= 1280
                              ? 40
                              : window.innerWidth >= 1024
                                ? 37
                                : window.innerWidth >= 768
                                  ? 34
                                  : 28,
                        objectFit: "contain",
                        zIndex: 2,
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                        opacity: spinning ? 0.5 : 1,
                      }}
                    />
                  </span>
                </button>
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
              {/* <div className="text-5xl md:text-7xl mb-4">😅</div> */}
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
                A la Prochaine
              </h2>
              <p className="text-lg md:text-2xl text-white/90 mb-6">
                Maybe next spin will bring you a prize!
              </p>
              <button
                onClick={() => setShowTryAgain(false)}
                className="bg-white text-red-600 px-8 py-3 md:px-12 md:py-4 rounded-full font-bold text-lg md:text-xl hover:bg-red-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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
              <div className="text-4xl md:text-5xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 drop-shadow-lg">
                CONGRATULATIONS!
              </h2>
              <div className="bg-white rounded-2xl p-4 md:p-6 my-4 md:my-6 shadow-xl">
                <img
                  src={winner.image}
                  alt={winner.name}
                  className="w-32 h-32 md:w-48 md:h-48 object-contain mx-auto"
                />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 drop-shadow-md">
                You won: {winner.name}!
              </h3>
              <button
                onClick={() => setWinner(null)}
                className="bg-white text-orange-600 px-8 py-3 md:px-12 md:py-4 rounded-full font-bold text-lg md:text-xl hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Claim Prize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
