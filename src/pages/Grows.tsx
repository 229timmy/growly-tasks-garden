
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, SlidersHorizontal } from "lucide-react";
import GrowCard from "@/components/dashboard/GrowCard";

// Sample data
const grows = [
  {
    id: "grow-1",
    name: "Northern Lights",
    stage: "vegetation",
    startDate: "2023-05-10",
    daysActive: 35,
    plantCount: 4,
    temperature: 23.5,
    humidity: 65,
    lastUpdated: "2023-06-14",
    progress: 40,
  },
  {
    id: "grow-2",
    name: "Blue Dream",
    stage: "seedling",
    startDate: "2023-06-01",
    daysActive: 14,
    plantCount: 3,
    temperature: 22.8,
    humidity: 70,
    lastUpdated: "2023-06-14",
    progress: 15,
  },
  {
    id: "grow-3",
    name: "White Widow",
    stage: "flowering",
    startDate: "2023-03-15",
    daysActive: 92,
    plantCount: 2,
    temperature: 24.2,
    humidity: 55,
    lastUpdated: "2023-06-14",
    progress: 75,
  },
  {
    id: "grow-4",
    name: "Granddaddy Purple",
    stage: "harvested",
    startDate: "2023-01-05",
    daysActive: 160,
    plantCount: 5,
    temperature: 23.0,
    humidity: 60,
    lastUpdated: "2023-06-14",
    progress: 100,
  },
];

const Grows = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter grows based on search query
  const filteredGrows = grows.filter((grow) =>
    grow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get active grows
  const activeGrows = filteredGrows.filter((grow) => grow.stage !== "harvested");
  
  // Get harvested grows
  const harvestedGrows = filteredGrows.filter((grow) => grow.stage === "harvested");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grows</h1>
          <p className="text-muted-foreground">
            Manage and monitor all your growing cycles
          </p>
        </div>
        <Button asChild className="animate-grow-up">
          <Link to="/grows/new">
            <Plus className="mr-2 h-4 w-4" />
            New Grow
          </Link>
        </Button>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search grows..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" title="Filter">
          <Filter className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" title="Sort">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs defaultValue="active">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Grows</TabsTrigger>
          <TabsTrigger value="harvested">Harvested</TabsTrigger>
          <TabsTrigger value="all">All Grows</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="animate-fade-in">
          {activeGrows.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeGrows.map((grow, index) => (
                <GrowCard
                  key={grow.id}
                  id={grow.id}
                  name={grow.name}
                  stage={grow.stage as any}
                  startDate={grow.startDate}
                  daysActive={grow.daysActive}
                  plantCount={grow.plantCount}
                  temperature={grow.temperature}
                  humidity={grow.humidity}
                  lastUpdated={grow.lastUpdated}
                  progress={grow.progress}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <svg className="h-16 w-16 text-muted-foreground/50 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4 6V12C4 15.31 7.58 20 12 22C16.42 20 20 15.31 20 12V6L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3 className="text-xl font-medium mb-2">No active grows found</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                  {searchQuery 
                    ? `No active grows match your search "${searchQuery}"`
                    : "You don't have any active grows yet. Start tracking your plants by creating a new grow."}
                </p>
                {!searchQuery && (
                  <Button asChild>
                    <Link to="/grows/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Grow
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="harvested" className="animate-fade-in">
          {harvestedGrows.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {harvestedGrows.map((grow, index) => (
                <GrowCard
                  key={grow.id}
                  id={grow.id}
                  name={grow.name}
                  stage={grow.stage as any}
                  startDate={grow.startDate}
                  daysActive={grow.daysActive}
                  plantCount={grow.plantCount}
                  temperature={grow.temperature}
                  humidity={grow.humidity}
                  lastUpdated={grow.lastUpdated}
                  progress={grow.progress}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <svg className="h-16 w-16 text-muted-foreground/50 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4 6V12C4 15.31 7.58 20 12 22C16.42 20 20 15.31 20 12V6L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3 className="text-xl font-medium mb-2">No harvested grows found</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  {searchQuery 
                    ? `No harvested grows match your search "${searchQuery}"`
                    : "Complete your grows to see them here."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="animate-fade-in">
          {filteredGrows.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredGrows.map((grow, index) => (
                <GrowCard
                  key={grow.id}
                  id={grow.id}
                  name={grow.name}
                  stage={grow.stage as any}
                  startDate={grow.startDate}
                  daysActive={grow.daysActive}
                  plantCount={grow.plantCount}
                  temperature={grow.temperature}
                  humidity={grow.humidity}
                  lastUpdated={grow.lastUpdated}
                  progress={grow.progress}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <svg className="h-16 w-16 text-muted-foreground/50 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4 6V12C4 15.31 7.58 20 12 22C16.42 20 20 15.31 20 12V6L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3 className="text-xl font-medium mb-2">No grows found</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                  {searchQuery 
                    ? `No grows match your search "${searchQuery}"`
                    : "You don't have any grows yet. Start tracking your plants by creating a new grow."}
                </p>
                {!searchQuery && (
                  <Button asChild>
                    <Link to="/grows/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Grow
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <Card className="bg-grow-50 border-grow-100">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h3 className="text-lg font-semibold mb-2">Grow Limit Reached</h3>
                <p className="text-sm text-muted-foreground">
                  You've used 3 of 3 available grows on the Free plan.
                </p>
              </div>
              <div className="md:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Upgrade to Pro for more grows:</p>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    <li className="flex items-center gap-2">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                        <path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                      </svg>
                      <span>Up to 6 simultaneous grows</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                        <path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                      </svg>
                      <span>9 plants per grow</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                        <path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                      </svg>
                      <span>Advanced tracking features</span>
                    </li>
                  </ul>
                </div>
                <Button size="lg" className="md:self-center">
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Grows;
