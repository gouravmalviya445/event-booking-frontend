import { CalendarDays, MapPin, Users, Ticket } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader, 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface EventCardProps {
  eventId: string;
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
  organizer: string;
}

export function EventCard({
  eventId,
  title, 
  description, 
  location, 
  date, 
  price, 
  totalSeats, 
  availableSeats, 
  status, 
  category, 
  image, 
  organizer
}: EventCardProps) {

  const formattedDate = new Date(date)

  const isSoldOut = availableSeats === 0;

  return (
    <Card className="w-full max-w-[320px] pt-0 pb-1 overflow-hidden group hover:shadow-md transition-all border-black/20">
      {/* Compact Image Section */}
      <div className="relative h-32 w-full overflow-hidden rounded-lg">
        <Image 
          src={image} 
          alt={title} 
          width={320}
          height={128}
          className="h-full w-full object-cover duration-500 group-hover:scale-110 group-hover:rotate-[1.5deg] group-hover:brightness-90 transition-all"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs px-2 py-0 h-5 backdrop-blur-md bg-white/90">
            {category}
          </Badge>
        </div>

        {/* overlay if sold out or cancelled */}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-sm text-white">Sold Out</p>
          </div>
        )}
        {status === 'cancelled' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-sm text-white">Cancelled</p>
          </div>
        )}
      </div>

      {/* Tighter Content Area */}
      <CardContent className="p-3">
        {/* Title & Status */}
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-base leading-tight line-clamp-1">{title}</h3>
          {status === 'cancelled' && <Badge variant="destructive" className="h-5 text-[10px] px-1">Cancelled</Badge>}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
          {description}
        </p>
        
        {/* Metadata */}
        <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-primary/70" />
            <span className="truncate">{formattedDate.toDateString()}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary/70" />
            <span className="truncate">{location}</span>
          </div>

          <div className="flex items-center gap-1.5 col-span-2">
            <Users className="h-3.5 w-3.5 text-primary/70" />
            <span>
              {availableSeats}/{totalSeats} seats • <span className="text-muted-foreground/70">by {organizer}</span>
            </span>
          </div>
        </div>
      </CardContent>

      {/* Compact Footer */}
      <CardFooter className="p-3 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
           <span className="text-sm font-bold">
            {price === 0 ? "Free" : `₹ ${price}`}
           </span>
        </div>
        <div className="flex items-center gap-2">
          <Button className="h-8 text-xs px-4 text-black bg-transparent border border-black/20 hover:bg-black/10" size="sm">
            <Link href={
              `/explore/events/${eventId}`
            }>
              View Details
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )  
}

export function SkeletonCard() {
  return (
    <Card className="w-full max-w-xs border border-black/20">
      <CardHeader>
        <div className="aspect-video w-full bg-gray-400 rounded-md animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-4 w-2/3 rounded-full bg-gray-400 animate-pulse" />
        <div className="h-4 w-1/2 rounded-full bg-gray-400 animate-pulse" />
      </CardContent>
    </Card>
  )
}
