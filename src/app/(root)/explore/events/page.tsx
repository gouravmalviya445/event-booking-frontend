"use client"
import { EventCard, SkeletonCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { apiClient } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { Select } from "@radix-ui/react-select";
import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface Event {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: Date;
  price: number;
  totalSeats: number;
  availableSeats: number;
  status: "active" | "cancelled";
  category: string;
  image: string;
  organizer: {
    _id: string;
    name: string;
  };
}

type SortOrder = "date-asc" | "date-desc" | "price-asc" | "price-desc";

type Category = "all" | "sport" | "business" | "tech" | "music" | "art" | "health" | "other";

const categories: Category[] = ["all", "sport", "business", "tech", "music", "art", "health", "other"];

export default function Events() {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("date-asc");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const searchQuery = useDebounce(search, 500);
  
  const listEvents = async (url: string) => {
    try {
      const { data: { data } } = await apiClient.get(url);
      console.log("api calling...")
      return data.events;
    } catch (error: any) {
      if (error.response.status === 429) {
        toast.error("You have made too many requests. Please wait for a while before making another request.");
      } else {
        toast.error(
          error?.response?.data?.message || 
          "Failed to fetch events"
        )
      }
    }
  }

  const { data, isLoading } = useSWR(
    `/api/events?search=${searchQuery}|${sortOrder}|${selectedCategory === "all" ? "" : selectedCategory}`,
    listEvents
  );
  
  return (
    <div className="h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Events</h1>
        <p className="text-muted-foreground">Discover amazing events happening near you</p>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category: Category) => (
            <Button
            key={category}
            className={cn(
              "bg-transparent border border-black/20 rounded-full px-4 py-2 hover:bg-blue-500/30 text-black",
              selectedCategory === category && "bg-blue-500/30 dark:bg-blue-500/30 dark:text-white"
            )}
            onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 mt-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or location"
            className="pl-10 border-black/20"
            value={search}
            onInput={(e) => setSearch(e.currentTarget.value)}
          />
        </div>
        <Select
          value={sortOrder}
          onValueChange={
            (value: SortOrder) => setSortOrder(value)
          }
        >
          <SelectTrigger className="w-full sm:w-48 border-black/20">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="border-black/20">
            <SelectItem value="date-asc">Date (Earliest)</SelectItem>
            <SelectItem value="date-desc">Date (Latest)</SelectItem>
            <SelectItem value="price-asc">Price (Low to High)</SelectItem>
            <SelectItem value="price-desc">Price (High to Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      {
        isLoading ? <p className="text-muted-foreground mb-4">...</p> :
          <p
            className="text-sm text-muted-foreground mb-4"
          >
            Showing {data?.length} event{data?.length !== 1 ? "s" : ""}
          </p>
      }

      {/* List events */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 justify-items-center gap-4">
        {
          isLoading ? [1, 2, 3].map((_, i) => (
            // skeleton
           <SkeletonCard key={i}/>
          )) : data?.map((event: Event) => (
            <EventCard
              eventId={event._id}
              key={event._id}
              title={event.title}
              description={event.description}
              location={event.location}
              date={event.date}
              price={event.price}
              totalSeats={event.totalSeats}
              availableSeats={event.availableSeats}
              status={event.status}
              category={event.category}
              image={event.image}
              organizer={event.organizer.name}
            />
          ))
        }
      </div>
    </div>
  )
}