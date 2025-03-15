
import React, { useState } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface DataPoint {
  date: string;
  temperature?: number;
  humidity?: number;
  light?: number;
  ph?: number;
  growth?: number;
}

interface AnalyticsChartProps {
  data: DataPoint[];
  title: string;
  className?: string;
}

export function AnalyticsChart({ data, title, className }: AnalyticsChartProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("7d");
  
  // Filter data based on time range
  const getFilteredData = () => {
    const now = new Date();
    let filterDate = new Date();
    
    switch (timeRange) {
      case "7d":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        filterDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        filterDate.setDate(now.getDate() - 90);
        break;
      default:
        return data;
    }
    
    return data.filter(item => new Date(item.date) >= filterDate);
  };
  
  const filteredData = getFilteredData();
  
  // Format date for tooltip
  const formatTooltipDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-3 rounded-lg shadow-md text-sm">
          <p className="font-medium mb-1">{formatTooltipDate(label)}</p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.stroke }} 
              />
              <span>{entry.name}: {entry.value.toFixed(1)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex">
            <select 
              className="bg-transparent text-sm text-muted-foreground focus:outline-none"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="environment">
          <TabsList className="mb-4">
            <TabsTrigger value="environment">Environment</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
          </TabsList>
          
          <TabsContent value="environment" className="pt-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={filteredData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(tick) => {
                      const date = new Date(tick);
                      return date.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
                    }}
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickMargin={10} />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    domain={[0, 100]} 
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperature"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    name="Temperature (°C)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="humidity"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    name="Humidity (%)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="light"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    name="Light (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="growth" className="pt-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={filteredData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(tick) => {
                      const date = new Date(tick);
                      return date.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
                    }}
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickMargin={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="growth"
                    stroke="#56a152"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    name="Growth (cm)"
                  />
                  <Line
                    type="monotone"
                    dataKey="ph"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    name="pH"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default AnalyticsChart;
