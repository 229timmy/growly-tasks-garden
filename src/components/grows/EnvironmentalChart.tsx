import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EnvironmentalData {
  timestamp: string;
  temperature: number;
  humidity: number;
}

interface EnvironmentalChartProps {
  data: EnvironmentalData[];
  targetTemp: {
    low: number;
    high: number;
  };
  targetHumidity: {
    low: number;
    high: number;
  };
  className?: string;
}

export function EnvironmentalChart({
  data,
  targetTemp,
  targetHumidity,
  className,
}: EnvironmentalChartProps) {
  const formattedData = useMemo(() => {
    return data.map(d => ({
      ...d,
      timestamp: new Date(d.timestamp).toLocaleTimeString(),
      targetTempLow: targetTemp.low,
      targetTempHigh: targetTemp.high,
      targetHumidityLow: targetHumidity.low,
      targetHumidityHigh: targetHumidity.high,
    }));
  }, [data, targetTemp, targetHumidity]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover/95 border rounded-lg shadow-lg p-3 backdrop-blur-sm">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any) => (
            <p
              key={entry.dataKey}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
              {entry.dataKey.includes('temp') ? '°C' : '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Environmental Data</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="temperature" className="space-y-4">
          <TabsList>
            <TabsTrigger value="temperature">Temperature</TabsTrigger>
            <TabsTrigger value="humidity">Humidity</TabsTrigger>
          </TabsList>

          <TabsContent value="temperature" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={formattedData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="targetTempGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#4dabf7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4dabf7" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="timestamp"
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  unit="°C"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ff6b6b"
                  fill="url(#tempGradient)"
                  name="Temperature"
                />
                <Area
                  type="monotone"
                  dataKey="targetTempLow"
                  stroke="#4dabf7"
                  strokeDasharray="5 5"
                  fill="none"
                  name="Target Min"
                />
                <Area
                  type="monotone"
                  dataKey="targetTempHigh"
                  stroke="#4dabf7"
                  strokeDasharray="5 5"
                  fill="none"
                  name="Target Max"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="humidity" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={formattedData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4dabf7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4dabf7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="timestamp"
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="humidity"
                  stroke="#4dabf7"
                  fill="url(#humidityGradient)"
                  name="Humidity"
                />
                <Area
                  type="monotone"
                  dataKey="targetHumidityLow"
                  stroke="#82ca9d"
                  strokeDasharray="5 5"
                  fill="none"
                  name="Target Min"
                />
                <Area
                  type="monotone"
                  dataKey="targetHumidityHigh"
                  stroke="#82ca9d"
                  strokeDasharray="5 5"
                  fill="none"
                  name="Target Max"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 