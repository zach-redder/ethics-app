import React from 'react';
import Svg, { Path } from 'react-native-svg';

/**
 * Home Icon - Custom SVG for dashboard navigation
 */
export const HomeIcon = ({ size = 24, color = '#000000', filled = false }) => {
  if (filled) {
    // Filled home icon (active state)
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"
          fill={color}
        />
      </Svg>
    );
  }
  
  // Outline home icon (inactive state)
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
};

