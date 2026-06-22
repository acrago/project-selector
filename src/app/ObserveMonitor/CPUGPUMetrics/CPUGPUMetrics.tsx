import * as React from 'react';
import { useState } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Content,
  ContentVariants,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  Title,
} from '@patternfly/react-core';
import ReactECharts from 'echarts-for-react';

// Mock data for CPU metrics
const cpuUtilizationData = [
  { name: 'CPU', x: new Date('2025-01-01T00:00:00'), y: 45 },
  { name: 'CPU', x: new Date('2025-01-01T01:00:00'), y: 52 },
  { name: 'CPU', x: new Date('2025-01-01T02:00:00'), y: 48 },
  { name: 'CPU', x: new Date('2025-01-01T03:00:00'), y: 55 },
  { name: 'CPU', x: new Date('2025-01-01T04:00:00'), y: 60 },
  { name: 'CPU', x: new Date('2025-01-01T05:00:00'), y: 58 },
  { name: 'CPU', x: new Date('2025-01-01T06:00:00'), y: 62 },
  { name: 'CPU', x: new Date('2025-01-01T07:00:00'), y: 65 },
  { name: 'CPU', x: new Date('2025-01-01T08:00:00'), y: 70 },
  { name: 'CPU', x: new Date('2025-01-01T09:00:00'), y: 68 },
  { name: 'CPU', x: new Date('2025-01-01T10:00:00'), y: 72 },
  { name: 'CPU', x: new Date('2025-01-01T11:00:00'), y: 75 },
  { name: 'CPU', x: new Date('2025-01-01T12:00:00'), y: 73 },
  { name: 'CPU', x: new Date('2025-01-01T13:00:00'), y: 78 },
  { name: 'CPU', x: new Date('2025-01-01T14:00:00'), y: 80 },
  { name: 'CPU', x: new Date('2025-01-01T15:00:00'), y: 77 },
  { name: 'CPU', x: new Date('2025-01-01T16:00:00'), y: 75 },
  { name: 'CPU', x: new Date('2025-01-01T17:00:00'), y: 72 },
  { name: 'CPU', x: new Date('2025-01-01T18:00:00'), y: 68 },
  { name: 'CPU', x: new Date('2025-01-01T19:00:00'), y: 65 },
  { name: 'CPU', x: new Date('2025-01-01T20:00:00'), y: 62 },
  { name: 'CPU', x: new Date('2025-01-01T21:00:00'), y: 58 },
  { name: 'CPU', x: new Date('2025-01-01T22:00:00'), y: 55 },
  { name: 'CPU', x: new Date('2025-01-01T23:00:00'), y: 52 },
];

// Mock data for GPU metrics
const gpuUtilizationData = [
  { name: 'GPU', x: new Date('2025-01-01T00:00:00'), y: 30 },
  { name: 'GPU', x: new Date('2025-01-01T01:00:00'), y: 35 },
  { name: 'GPU', x: new Date('2025-01-01T02:00:00'), y: 32 },
  { name: 'GPU', x: new Date('2025-01-01T03:00:00'), y: 38 },
  { name: 'GPU', x: new Date('2025-01-01T04:00:00'), y: 42 },
  { name: 'GPU', x: new Date('2025-01-01T05:00:00'), y: 40 },
  { name: 'GPU', x: new Date('2025-01-01T06:00:00'), y: 45 },
  { name: 'GPU', x: new Date('2025-01-01T07:00:00'), y: 48 },
  { name: 'GPU', x: new Date('2025-01-01T08:00:00'), y: 52 },
  { name: 'GPU', x: new Date('2025-01-01T09:00:00'), y: 50 },
  { name: 'GPU', x: new Date('2025-01-01T10:00:00'), y: 55 },
  { name: 'GPU', x: new Date('2025-01-01T11:00:00'), y: 58 },
  { name: 'GPU', x: new Date('2025-01-01T12:00:00'), y: 56 },
  { name: 'GPU', x: new Date('2025-01-01T13:00:00'), y: 60 },
  { name: 'GPU', x: new Date('2025-01-01T14:00:00'), y: 62 },
  { name: 'GPU', x: new Date('2025-01-01T15:00:00'), y: 59 },
  { name: 'GPU', x: new Date('2025-01-01T16:00:00'), y: 57 },
  { name: 'GPU', x: new Date('2025-01-01T17:00:00'), y: 54 },
  { name: 'GPU', x: new Date('2025-01-01T18:00:00'), y: 51 },
  { name: 'GPU', x: new Date('2025-01-01T19:00:00'), y: 48 },
  { name: 'GPU', x: new Date('2025-01-01T20:00:00'), y: 45 },
  { name: 'GPU', x: new Date('2025-01-01T21:00:00'), y: 42 },
  { name: 'GPU', x: new Date('2025-01-01T22:00:00'), y: 38 },
  { name: 'GPU', x: new Date('2025-01-01T23:00:00'), y: 35 },
];

const CPUGPUMetrics: React.FunctionComponent = () => {
  const [timeRangeOpen, setTimeRangeOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('Last 24 hours');

  const onTimeRangeToggle = () => {
    setTimeRangeOpen(!timeRangeOpen);
  };

  const onTimeRangeSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    setTimeRange(value as string);
    setTimeRangeOpen(false);
  };

  return (
    <PageSection hasBodyWrapper={false}>
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
        {/* Header */}
        <FlexItem>
          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }}>
            <FlexItem>
              <Title headingLevel="h1" size="2xl">CPU & GPU Metrics</Title>
            </FlexItem>
          </Flex>
          <Content component={ContentVariants.p}>
            Monitor CPU and GPU utilization and performance metrics across your infrastructure
          </Content>
        </FlexItem>

        {/* Time Range Filter */}
        <FlexItem>
          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
            <FlexItem>
              <Content component={ContentVariants.small} style={{ color: '#000000' }}>Time range:</Content>
            </FlexItem>
            <FlexItem>
              <Dropdown
                isOpen={timeRangeOpen}
                onSelect={onTimeRangeSelect}
                onOpenChange={(isOpen: boolean) => setTimeRangeOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={onTimeRangeToggle}
                    isExpanded={timeRangeOpen}
                    id="cpu-gpu-time-range-toggle"
                  >
                    {timeRange}
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem value="Last hour" key="last-hour">Last hour</DropdownItem>
                  <DropdownItem value="Last 6 hours" key="last-6-hours">Last 6 hours</DropdownItem>
                  <DropdownItem value="Last 24 hours" key="last-24-hours">Last 24 hours</DropdownItem>
                  <DropdownItem value="Last 7 days" key="last-7-days">Last 7 days</DropdownItem>
                  <DropdownItem value="Last 30 days" key="last-30-days">Last 30 days</DropdownItem>
                </DropdownList>
              </Dropdown>
            </FlexItem>
          </Flex>
        </FlexItem>

        {/* CPU Utilization Chart */}
        <FlexItem>
          <Card>
            <CardTitle>
              <Title headingLevel="h3" size="lg">CPU Utilization</Title>
            </CardTitle>
            <CardBody>
              <div style={{ height: '300px', width: '100%' }}>
                <ReactECharts
                  option={{
                    tooltip: {
                      trigger: 'axis',
                      formatter: (params: any) => {
                        if (params[0]) {
                          return `${new Date(params[0].value[0]).toLocaleString()}: ${params[0].value[1]}%`;
                        }
                        return '';
                      }
                    },
                    xAxis: {
                      type: 'time',
                      axisLabel: {
                        formatter: (value: number) => new Date(value).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          hour12: true 
                        })
                      }
                    },
                    yAxis: {
                      type: 'value',
                      min: 0,
                      max: 100,
                      axisLabel: {
                        formatter: '{value}%'
                      }
                    },
                    series: [{
                      name: 'CPU',
                      data: cpuUtilizationData.map((item: any) => [item.x, item.y]),
                      type: 'line',
                      smooth: true,
                      itemStyle: {
                        color: '#0066cc'
                      },
                      lineStyle: {
                        width: 2
                      }
                    }],
                    grid: {
                      left: '10%',
                      right: '10%',
                      bottom: '15%',
                      top: '5%',
                      containLabel: true
                    }
                  }}
                  style={{ height: '100%', width: '100%' }}
              />
              </div>
            </CardBody>
          </Card>
        </FlexItem>

        {/* GPU Utilization Chart */}
        <FlexItem>
          <Card>
            <CardTitle>
              <Title headingLevel="h3" size="lg">GPU Utilization</Title>
            </CardTitle>
            <CardBody>
              <div style={{ height: '300px', width: '100%' }}>
                <ReactECharts
                  option={{
                    tooltip: {
                      trigger: 'axis',
                      formatter: (params: any) => {
                        if (params[0]) {
                          return `${new Date(params[0].value[0]).toLocaleString()}: ${params[0].value[1]}%`;
                        }
                        return '';
                      }
                    },
                    xAxis: {
                      type: 'time',
                      axisLabel: {
                        formatter: (value: number) => new Date(value).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          hour12: true 
                        })
                      }
                    },
                    yAxis: {
                      type: 'value',
                      min: 0,
                      max: 100,
                      axisLabel: {
                        formatter: '{value}%'
                      }
                    },
                    series: [{
                      name: 'GPU',
                      data: gpuUtilizationData.map((item: any) => [item.x, item.y]),
                      type: 'line',
                      smooth: true,
                      itemStyle: {
                        color: '#3e8635'
                      },
                      lineStyle: {
                        width: 2
                      }
                    }],
                    grid: {
                      left: '10%',
                      right: '10%',
                      bottom: '15%',
                      top: '5%',
                      containLabel: true
                    }
                  }}
                  style={{ height: '100%', width: '100%' }}
              />
              </div>
            </CardBody>
          </Card>
        </FlexItem>

        {/* Summary Cards */}
        <FlexItem>
          <Grid hasGutter>
            <GridItem span={6}>
              <Card>
                <CardTitle>
                  <Title headingLevel="h4" size="md">CPU Summary</Title>
                </CardTitle>
                <CardBody>
                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                    <FlexItem>
                      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                        <Content component={ContentVariants.small}>Average Utilization</Content>
                        <Content component={ContentVariants.small} style={{ fontWeight: 600 }}>65%</Content>
                      </Flex>
                    </FlexItem>
                    <FlexItem>
                      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                        <Content component={ContentVariants.small}>Peak Utilization</Content>
                        <Content component={ContentVariants.small} style={{ fontWeight: 600 }}>80%</Content>
                      </Flex>
                    </FlexItem>
                    <FlexItem>
                      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                        <Content component={ContentVariants.small}>Total Cores</Content>
                        <Content component={ContentVariants.small} style={{ fontWeight: 600 }}>128</Content>
                      </Flex>
                    </FlexItem>
                  </Flex>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem span={6}>
              <Card>
                <CardTitle>
                  <Title headingLevel="h4" size="md">GPU Summary</Title>
                </CardTitle>
                <CardBody>
                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                    <FlexItem>
                      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                        <Content component={ContentVariants.small}>Average Utilization</Content>
                        <Content component={ContentVariants.small} style={{ fontWeight: 600 }}>48%</Content>
                      </Flex>
                    </FlexItem>
                    <FlexItem>
                      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                        <Content component={ContentVariants.small}>Peak Utilization</Content>
                        <Content component={ContentVariants.small} style={{ fontWeight: 600 }}>62%</Content>
                      </Flex>
                    </FlexItem>
                    <FlexItem>
                      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                        <Content component={ContentVariants.small}>Total GPUs</Content>
                        <Content component={ContentVariants.small} style={{ fontWeight: 600 }}>16</Content>
                      </Flex>
                    </FlexItem>
                  </Flex>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </FlexItem>
      </Flex>
    </PageSection>
  );
};

export { CPUGPUMetrics };

