import * as React from 'react';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLegend,
  ChartLine,
  ChartTooltip,
  ChartVoronoiContainer
} from '@patternfly/react-charts/victory';

interface DataPoint {
  x: Date | string | number;
  y: number;
  name?: string;
}

interface PatternFlyLineChartProps {
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
  // Optional custom colors per series (mapped by series name)
  seriesColors?: { [seriesName: string]: string };
  // Optional custom stroke widths per series (mapped by series name)
  seriesStrokeWidths?: { [seriesName: string]: number };
  // Optional axis labels
  xAxisLabel?: string;
  yAxisLabel?: string;
}

const PatternFlyLineChart: React.FunctionComponent<PatternFlyLineChartProps> = ({
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
  seriesColors,
  seriesStrokeWidths,
  xAxisLabel,
  yAxisLabel
}) => {
  // Group data by name if multiple series exist
  const groupedData = React.useMemo(() => {
    const groups: { [key: string]: DataPoint[] } = {};
    
    data.forEach(point => {
      const key = point.name || 'default';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(point);
    });
    
    return groups;
  }, [data]);

  // Create legend data
  const legendData = React.useMemo(() => {
    if (!showLegend) return [];
    
    return Object.keys(groupedData).map(name => ({
      name: name === 'default' ? 'Data' : name
    }));
  }, [groupedData, showLegend]);

  // Format data for Victory charts
  const chartData = React.useMemo(() => {
    return Object.entries(groupedData).map(([name, points]) => ({
      name,
      data: points.map(point => ({
        x: point.x,
        y: point.y
      }))
    }));
  }, [groupedData]);

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: height,
        width: width,
        border: '1px solid #d2d2d2',
        borderRadius: '4px',
        backgroundColor: '#f9f9f9'
      }}>
        <div style={{ textAlign: 'center', color: '#6a6e73' }}>
          <div>No data available</div>
        </div>
      </div>
    );
  }

  // Adjust padding to accommodate legend
  const adjustedPadding = {
    ...padding,
    ...(showLegend && legendPosition === 'right' 
      ? { right: Math.max(padding.right || 50, 100) } 
      : {})
  };

  const chartWidth = typeof width === 'string' ? 800 : width; // Default to 800px for percentage widths
  const containerStyle = typeof width === 'string' ? { height, width: '100%' } : { height, width };

  return (
    <div style={containerStyle}>
      <Chart
        height={height}
        width={chartWidth}
        domain={domain}
        domainPadding={domain?.x ? { x: [0, 0] } : undefined}
        padding={adjustedPadding}
        themeColor={themeColor}
        containerComponent={
          <ChartVoronoiContainer
            mouseFollowTooltips
            labels={({ datum }: any) => {
              const xLabel = datum.x instanceof Date ? datum.x.toLocaleString() : String(datum.x);
              const yLabel = typeof datum.y === 'number' ? datum.y.toLocaleString() : String(datum.y);
              const series = datum?.childName && datum.childName !== 'default' ? `${datum.childName} · ` : '';
              return `${series}${xLabel} — ${yLabel}`;
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
        ariaDesc={ariaDesc}
        ariaTitle={ariaTitle}
      >
        <ChartAxis
          dependentAxis
          label={yAxisLabel}
          showGrid
          tickFormat={(t) => t.toLocaleString()}
          style={{
            tickLabels: { padding: 5, fontSize: axisTickFontSize }
          }}
        />
        <ChartAxis
          label={xAxisLabel}
          tickFormat={(x) => {
            // Handle time strings like "00:00", "02:00" etc.
            if (typeof x === 'string' && x.includes(':')) {
              return x; // Display time strings as-is
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
          {chartData.map((series, _index) => {
            const customColor = seriesColors?.[series.name];
            const customStrokeWidth = seriesStrokeWidths?.[series.name];
            return (
              <ChartLine
                key={series.name}
                data={series.data}
                name={series.name}
                style={{
                  data: {
                    stroke: customColor || '#0066cc',
                    strokeWidth: customStrokeWidth || 3
                  }
                }}
              />
            );
          })}
        </ChartGroup>
      </Chart>
    </div>
  );
};

export { PatternFlyLineChart };
export type { PatternFlyLineChartProps, DataPoint };
