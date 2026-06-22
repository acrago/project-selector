import * as React from 'react';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartLegend,
  ChartTooltip,
  ChartVoronoiContainer
} from '@patternfly/react-charts/victory';

interface DataPoint {
  x: Date | string | number;
  y: number;
  name?: string;
}

interface PatternFlyAreaChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  width?: number | string;
  domain?: {
    x?: [number, number];
    y?: [number, number];
  };
  padding?: {
    bottom?: number;
    left?: number;
    right?: number;
    top?: number;
  };
  showLegend?: boolean;
  legendPosition?: 'bottom' | 'right';
  themeColor?: 'blue' | 'green' | 'multi' | 'orange' | 'purple';
  ariaDesc?: string;
  ariaTitle?: string;
  // Optional axis tick label font size override (in px)
  axisTickFontSize?: number;
  // Optional label for tooltip (e.g., "GPU", "Memory", "CPU", "Network")
  chartLabel?: string;
}

const PatternFlyAreaChart: React.FunctionComponent<PatternFlyAreaChartProps> = ({
  data,
  title: _title,
  height = 200,
  width = 400,
  domain,
  padding = {
    bottom: 40,
    left: 50,
    right: 50,
    top: 20
  },
  showLegend = false,
  legendPosition = 'right',
  themeColor = 'blue',
  ariaDesc,
  ariaTitle,
  axisTickFontSize,
  chartLabel
}) => {
  // Convert data to the format expected by Victory
  const chartData = React.useMemo(() => {
    if (data.length === 0) return [];
    
    // If data has name property, group by name
    const hasName = data.some(point => point.name);
    if (hasName) {
      const groupedData: { [key: string]: DataPoint[] } = {};
      data.forEach(point => {
        const name = point.name || 'default';
        if (!groupedData[name]) {
          groupedData[name] = [];
        }
        groupedData[name].push(point);
      });
      
      return Object.entries(groupedData).map(([name, points]) => ({
        name,
        data: points.map(point => ({ x: point.x, y: point.y }))
      }));
    }
    
    // Single series
    return [{
      name: 'default',
      data: data.map(point => ({ x: point.x, y: point.y }))
    }];
  }, [data]);

  // Generate legend data
  const legendData = React.useMemo(() => {
    return chartData.map(series => ({
      name: series.name,
      symbol: {
        fill: `var(--pf-t--chart--color--${themeColor}--300)`
      }
    }));
  }, [chartData, themeColor]);

  const chartWidth = typeof width === 'string' ? 800 : width; // Default to 800px for percentage widths

  // Adjust padding to accommodate legend
  const adjustedPadding = {
    ...padding,
    ...(showLegend && legendPosition === 'right' 
      ? { right: Math.max(padding.right || 50, 100) } 
      : {})
  };

  return (
    <div style={{ height: height, width: '100%' }}>
      <Chart
        ariaDesc={ariaDesc}
        ariaTitle={ariaTitle}
        containerComponent={
          <ChartVoronoiContainer
            // Explicitly set container title/desc so the generated
            // victory-container-* node exposes <title> and <desc>
            title={ariaTitle}
            desc={ariaDesc}
            mouseFollowTooltips
            voronoiBlacklist={[]}
            labels={({ datum }: any) => {
              // Format x-axis label
              let xLabel = '';
              if (datum.x instanceof Date) {
                xLabel = datum.x.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              } else if (typeof datum.x === 'string' && datum.x.includes(':')) {
                xLabel = datum.x; // Already in time format like "00:00"
              } else if (typeof datum.x === 'number') {
                xLabel = new Date(datum.x).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              } else {
                xLabel = String(datum.x);
              }
              
              // Format y-axis label
              const yLabel = typeof datum.y === 'number' ? datum.y.toLocaleString() : String(datum.y);
              
              // Get series name (use chartLabel if provided, otherwise use childName if available)
              let seriesName = '';
              if (chartLabel) {
                seriesName = chartLabel;
              } else if (datum?.childName && datum.childName !== 'default') {
                seriesName = datum.childName;
              }
              
              // Return formatted tooltip
              if (seriesName) {
                return `${seriesName}: ${xLabel} — ${yLabel}`;
              }
              return `${xLabel} — ${yLabel}`;
            }}
            labelComponent={
              <ChartTooltip
                constrainToVisibleArea
                flyoutPadding={8}
                flyoutStyle={{
                  fill: 'var(--pf-t--chart--tooltip--Fill)',
                  stroke: 'var(--pf-t--chart--tooltip--BorderColor)',
                  strokeWidth: 1
                }}
                style={{
                  fill: '#ffffff',
                  color: '#ffffff',
                  fontSize: 'var(--pf-t--chart--tooltip--FontSize)',
                  pointerEvents: 'none'
                }}
              />
            }
          />
        }
        legendComponent={
          showLegend ? (
            <ChartLegend
              data={legendData}
              orientation={legendPosition === 'right' ? 'vertical' : 'horizontal'}
              themeColor={themeColor}
            />
          ) : undefined
        }
        height={height}
        width={chartWidth}
        domain={domain}
        padding={adjustedPadding}
        themeColor={themeColor}
      >
        <ChartAxis
          dependentAxis
          showGrid
          style={{
            tickLabels: { padding: 5, fontSize: axisTickFontSize }
          }}
        />
        <ChartAxis
          tickFormat={(x) => {
            // Handle time strings like "00:00", "02:00" etc.
            if (typeof x === 'string' && x.includes(':')) {
              return x;
            }
            // Handle date objects
            if (x instanceof Date) {
              return x.toLocaleDateString();
            }
            // Handle numeric timestamps
            if (typeof x === 'number') {
              return new Date(x).toLocaleDateString();
            }
            return x.toString();
          }}
          style={{
            tickLabels: { padding: 5, fontSize: axisTickFontSize }
          }}
        />
        <ChartGroup>
          {chartData.map((series, _index) => (
            <ChartArea
              key={series.name}
              data={series.data}
              name={series.name}
              style={{
                data: {
                  fill: '#0066cc', // Use explicit blue color to ensure visibility
                  fillOpacity: 0.3,
                  stroke: '#0066cc', // Use explicit blue color for stroke
                  strokeWidth: 2
                }
              }}
            />
          ))}
        </ChartGroup>
      </Chart>
    </div>
  );
};

export { PatternFlyAreaChart };
export type { PatternFlyAreaChartProps, DataPoint };
