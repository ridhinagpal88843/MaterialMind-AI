import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

export const PlotlyChart = ({
  data,
  layout,
  config,
  onClick,
  onHover,
  className = '',
  style = {},
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !data) return;

    const mergedLayout = {
      autosize: true,
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        family: 'Space Grotesk, Inter, sans-serif',
        color: '#94A3B8',
        size: 11,
      },
      margin: { l: 0, r: 0, t: 0, b: 0 },
      ...layout,
    };

    const mergedConfig = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['resetCameraLastSave3d', 'lasso2d', 'select2d'],
      ...config,
    };

    Plotly.react(el, data, mergedLayout, mergedConfig);

    if (onClick) {
      el.on('plotly_click', (eventData) => {
        if (eventData && eventData.points && eventData.points[0]) {
          onClick(eventData);
        }
      });
    }

    if (onHover) {
      el.on('plotly_hover', (eventData) => {
        if (eventData && eventData.points && eventData.points[0]) {
          onHover(eventData);
        }
      });
    }

    const handleResize = () => {
      if (el) {
        Plotly.Plots.resize(el);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (el) {
        Plotly.purge(el);
      }
    };
  }, [data, layout, config]);

  return <div ref={containerRef} className={`w-full h-full ${className}`} style={style} />;
};

export default PlotlyChart;
