import React from 'react';

const LoadingSpinner = ({ size = 200 }) => {
    // Calculate proportional sizes based on the main size
    const outerSize = size * 0.72;
    const innerSize = size * 0.54;
    const borderWidth = size * 0.08;
    const dotSize = size * 0.08;

    return (
        <div
            className="relative inline-block overflow-hidden bg-white "
            style={{ width: `${size}px`, height: `${size}px` }}
        >
            <div className="w-full h-full relative">
                {/* Outer red ring */}
                <div
                    className="absolute rounded-full border-solid border-x-transparent border-t-[#db000f] border-b-[#db000f] animate-spin"
                    style={{
                        width: `${outerSize}px`,
                        height: `${outerSize}px`,
                        top: `${size * 0.14}px`,
                        left: `${size * 0.14}px`,
                        borderWidth: `${borderWidth}px`
                    }}
                ></div>

                {/* Inner black ring */}
                <div
                    className="absolute rounded-full border-solid border-y-transparent border-l-black border-r-black animate-spinReverse"
                    style={{
                        width: `${innerSize}px`,
                        height: `${innerSize}px`,
                        top: `${size * 0.23}px`,
                        left: `${size * 0.23}px`,
                        borderWidth: `${borderWidth}px`
                    }}
                ></div>

                {/* Red dots */}
                <div
                    className="absolute rounded-full border-transparent"
                    style={{
                        width: `${outerSize}px`,
                        height: `${outerSize}px`,
                        top: `${size * 0.14}px`,
                        left: `${size * 0.14}px`
                    }}
                >
                    <div className="w-full h-full relative rotate-45">
                        <span
                            className="absolute block bg-[#db000f] rounded-full"
                            style={{
                                width: `${dotSize}px`,
                                height: `${dotSize}px`,
                                top: `-${dotSize}px`,
                                left: `${outerSize * 0.33}px`,
                                boxShadow: `0 ${outerSize}px 0 0 #db000f`
                            }}
                        ></span>
                        <span
                            className="absolute bg-[#db000f] rounded-full"
                            style={{
                                width: `${dotSize}px`,
                                height: `${dotSize}px`,
                                left: `-${dotSize}px`,
                                top: `${outerSize * 0.33}px`,
                                boxShadow: `${outerSize}px 0 0 0 #db000f`
                            }}
                        ></span>
                    </div>
                </div>

                {/* Black dots */}
                <div
                    className="absolute rounded-full border-transparent"
                    style={{
                        width: `${innerSize}px`,
                        height: `${innerSize}px`,
                        top: `${size * 0.23}px`,
                        left: `${size * 0.23}px`
                    }}
                >
                    <div className="w-full h-full relative rotate-45">
                        <span
                            className="absolute block bg-black rounded-full"
                            style={{
                                width: `${dotSize}px`,
                                height: `${dotSize}px`,
                                top: `-${dotSize}px`,
                                left: `${innerSize * 0.28}px`,
                                boxShadow: `0 ${innerSize}px 0 0 #000000`
                            }}
                        ></span>
                        <span
                            className="absolute bg-black rounded-full"
                            style={{
                                width: `${dotSize}px`,
                                height: `${dotSize}px`,
                                left: `-${dotSize}px`,
                                top: `${innerSize * 0.28}px`,
                                boxShadow: `${innerSize}px 0 0 0 #000000`
                            }}
                        ></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;