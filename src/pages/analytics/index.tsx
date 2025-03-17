import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserTier } from '@/hooks/use-user-tier';
import { HarvestRecordsService } from '@/lib/api/harvest-records';
import { HarvestAnalyticsService } from '@/lib/api/harvest-analytics';
import { GrowthAnalyticsService } from '@/lib/api/growth-analytics';
import { EnvironmentalAnalyticsService } from '@/lib/api/environmental-analytics';
import { PlantCareService } from '@/lib/api/plant-care';
import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingDown, TrendingUp, Thermometer, Droplets, Leaf, Download } from 'lucide-react';
import { HarvestAnalyticsChart } from '@/components/analytics/HarvestAnalyticsChart';
import { GrowthPerformanceChart } from '@/components/analytics/GrowthPerformanceChart';
import { EnvironmentalImpactChart } from '@/components/analytics/EnvironmentalImpactChart';
import { CareActivityAnalyticsChart } from '@/components/analytics/CareActivityAnalyticsChart';
import { Button } from '@/components/ui/button';
import { cn, exportToCSV, getExportFilename } from '@/lib/utils';
import { toast } from 'sonner';

const harvestRecordsService = new HarvestRecordsService();
const harvestAnalyticsService = new HarvestAnalyticsService();
const growthAnalyticsService = new GrowthAnalyticsService();
const environmentalAnalyticsService = new EnvironmentalAnalyticsService();
const plantCareService = new PlantCareService();

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const { hasRequiredTier } = useUserTier();

  // Fetch harvest statistics
  const { data: harvestStats, isLoading: isLoadingHarvestStats } = useQuery({
    queryKey: ['harvest-stats'],
    queryFn: () => harvestRecordsService.getHarvestStats(),
  });

  // Fetch harvest analytics data
  const { data: harvestAnalytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['harvest-analytics'],
    queryFn: () => harvestAnalyticsService.getHarvestAnalytics(),
  });

  // Fetch harvest trends
  const { data: harvestTrends, isLoading: isLoadingTrends } = useQuery({
    queryKey: ['harvest-trends'],
    queryFn: () => harvestAnalyticsService.getHarvestTrends(),
  });

  // Fetch growth analytics data
  const { data: growthData, isLoading: isLoadingGrowth } = useQuery({
    queryKey: ['growth-analytics'],
    queryFn: () => growthAnalyticsService.getGrowthAnalytics(),
  });

  // Fetch growth statistics
  const { data: growthStats, isLoading: isLoadingGrowthStats } = useQuery({
    queryKey: ['growth-stats'],
    queryFn: () => growthAnalyticsService.getGrowthStats(),
  });

  // Fetch environmental data
  const { data: environmentalData, isLoading: isLoadingEnvironmental } = useQuery({
    queryKey: ['environmental-data'],
    queryFn: () => environmentalAnalyticsService.getEnvironmentalData(),
  });

  // Fetch environmental stats
  const { data: environmentalStats, isLoading: isLoadingEnvironmentalStats } = useQuery({
    queryKey: ['environmental-stats'],
    queryFn: () => environmentalAnalyticsService.getEnvironmentalStats(),
  });

  // Fetch environmental impact analysis
  const { data: environmentalImpact, isLoading: isLoadingEnvironmentalImpact } = useQuery({
    queryKey: ['environmental-impact'],
    queryFn: () => environmentalAnalyticsService.getEnvironmentalImpact(),
  });

  // Add care activity stats query
  const { data: careStats, isLoading: isLoadingCareStats } = useQuery({
    queryKey: ['care-activity-stats'],
    queryFn: () => plantCareService.getActivityStats(),
  });

  const isLoading = 
    isLoadingHarvestStats || 
    isLoadingAnalytics || 
    isLoadingTrends || 
    isLoadingGrowth || 
    isLoadingGrowthStats ||
    isLoadingEnvironmental ||
    isLoadingEnvironmentalStats ||
    isLoadingEnvironmentalImpact ||
    isLoadingCareStats;

  const handleExport = (type: 'growth' | 'environmental' | 'care' | 'harvest') => {
    try {
      switch (type) {
        case 'growth':
          if (growthData) {
            const exportData = growthData.map(d => ({
              date: new Date(d.date).toLocaleDateString(),
              height_cm: d.height,
              growth_rate_cm_per_day: d.growthRate,
              health_score: d.healthScore,
              leaf_count: d.leafCount
            }));
            exportToCSV(exportData, getExportFilename('growth_analytics'));
          }
          break;

        case 'environmental':
          if (environmentalData) {
            const exportData = environmentalData.map(d => ({
              date: new Date(d.date).toLocaleDateString(),
              temperature_celsius: d.temperature,
              humidity_percent: d.humidity,
              light_intensity: d.lightIntensity || '',
              co2_level: d.co2Level || '',
              vpd: d.vpd || ''
            }));
            exportToCSV(exportData, getExportFilename('environmental_analytics'));
          }
          break;

        case 'care':
          if (careStats) {
            const wateringData = careStats.wateringSchedule.map(d => ({
              date: new Date(d.date).toLocaleDateString(),
              activity_type: 'watering',
              count: d.count,
              effectiveness: d.effectiveness
            }));
            const feedingData = careStats.feedingSchedule.map(d => ({
              date: new Date(d.date).toLocaleDateString(),
              activity_type: 'feeding',
              count: d.count,
              effectiveness: d.effectiveness
            }));
            exportToCSV([...wateringData, ...feedingData], getExportFilename('care_analytics'));
          }
          break;

        case 'harvest':
          if (harvestAnalytics) {
            const exportData = harvestAnalytics.map(d => ({
              date: new Date(d.date).toLocaleDateString(),
              total_yield_grams: d.totalYield,
              quality_rating: d.quality,
              thc_percentage: d.thcPercentage || '',
              bud_density_rating: d.budDensity || ''
            }));
            exportToCSV(exportData, getExportFilename('harvest_analytics'));
          }
          break;
      }
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  if (!hasRequiredTier('premium')) {
    return (
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Analytics features are available on the Premium and Enterprise tiers.
              Upgrade your subscription to access detailed insights about your grows.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="care">Care Activity</TabsTrigger>
          <TabsTrigger value="harvest">Harvest</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin" />
              </CardContent>
            </Card>
          ) : (
            <>
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {/* Growth Overview Card */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Growth Performance
                      </CardTitle>
                      <TrendingUp className={cn(
                        "h-4 w-4",
                        (growthStats?.averageGrowthRate || 0) > 0 ? "text-green-500" : "text-red-500"
                      )} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {growthStats?.averageGrowthRate ? 
                          `${growthStats.averageGrowthRate.toFixed(1)}%` : 
                          'No data'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Average growth rate
                      </p>
                      {growthStats?.totalMeasurements && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Based on {growthStats.totalMeasurements} measurements
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Environmental Overview Card */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Environmental Health
                      </CardTitle>
                      <div className="flex gap-1">
                        <Thermometer className={cn(
                          "h-4 w-4",
                          (environmentalStats?.optimalConditionsPercentage || 0) > 70 ? "text-green-500" : "text-yellow-500"
                        )} />
                        <Droplets className={cn(
                          "h-4 w-4",
                          (environmentalStats?.averageHumidity || 0) > 40 ? "text-green-500" : "text-yellow-500"
                        )} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {environmentalStats?.optimalConditionsPercentage ? 
                          `${environmentalStats.optimalConditionsPercentage.toFixed(1)}%` : 
                          'No data'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Time in optimal conditions
                      </p>
                      {environmentalStats?.totalReadings && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Based on {environmentalStats.totalReadings} readings
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Care Activity Overview Card */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Care Effectiveness
                      </CardTitle>
                      <Leaf className={cn(
                        "h-4 w-4",
                        careStats && (careStats.wateringEffectiveness + careStats.feedingEffectiveness) / 2 > 0.7 
                          ? "text-green-500" 
                          : "text-yellow-500"
                      )} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {careStats ? (
                          `${(((careStats.wateringEffectiveness + careStats.feedingEffectiveness) / 2) * 100).toFixed(1)}%`
                        ) : 'No data'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Overall care effectiveness
                      </p>
                      {careStats?.totalActivities && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {careStats.totalActivities} activities recorded
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Harvest Overview Card */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Harvest Performance
                      </CardTitle>
                      <TrendingUp className={cn(
                        "h-4 w-4",
                        (harvestStats?.averageYield || 0) > 0 ? "text-green-500" : "text-red-500"
                      )} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {harvestStats?.averageYield ? 
                          `${harvestStats.averageYield.toFixed(1)}g` : 
                          'No data'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Average yield per harvest
                      </p>
                      {harvestStats?.totalHarvests && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Based on {harvestStats.totalHarvests} harvests
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Summary Charts */}
                <div className="grid gap-6 md:grid-cols-2">
                  {growthData && growthStats && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Growth Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <GrowthPerformanceChart
                          data={growthData}
                          className="h-[200px]"
                          minimal
                        />
                      </CardContent>
                    </Card>
                  )}

                  {environmentalData && environmentalStats && environmentalImpact && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Environmental Impact</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <EnvironmentalImpactChart
                          data={environmentalData}
                          stats={environmentalStats}
                          impact={environmentalImpact}
                          className="h-[200px]"
                          minimal
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="growth" className="space-y-6">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('growth')}
                    disabled={!growthData?.length}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
                {growthData && growthStats && (
                  <GrowthPerformanceChart
                    data={growthData}
                  />
                )}
              </TabsContent>

              <TabsContent value="environment" className="space-y-6">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('environmental')}
                    disabled={!environmentalData?.length}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
                {environmentalData && environmentalStats && environmentalImpact && (
                  <EnvironmentalImpactChart
                    data={environmentalData}
                    stats={environmentalStats}
                    impact={environmentalImpact}
                  />
                )}
              </TabsContent>

              <TabsContent value="care" className="space-y-6">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('care')}
                    disabled={!careStats}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
                <CareActivityAnalyticsChart
                  data={careStats}
                />
              </TabsContent>

              <TabsContent value="harvest" className="space-y-6">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('harvest')}
                    disabled={!harvestAnalytics?.length}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
                {harvestAnalytics && (
                  <HarvestAnalyticsChart
                    data={harvestAnalytics}
                  />
                )}
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
} 