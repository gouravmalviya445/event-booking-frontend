"use client"

import React, { Activity } from "react";
import { useForm, Controller } from "react-hook-form"
import { format, set } from "date-fns"
import { CalendarIcon, Loader2, Router, Trash2, UploadIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { CldUploadWidget } from 'next-cloudinary';
import { ENV } from "@/app/env";
import Image from "next/image";

type EventFormValues = {
  title: string
  description: string
  date: Date | undefined
  location: string
  price: number
  totalSeats: number
  category: string
}

export default function CreateEventForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [eventUrl, setEventUrl] = React.useState("")
  const router = useRouter();

  // Initialize React Hook Form without resolver
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<EventFormValues>({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      price: 0,
      totalSeats: 1,
    },
  })

  const onSubmit = async (data: EventFormValues) => {
    try {
      setIsSubmitting(true)
      if (!eventUrl.trim()) {
        return toast.error("Event image is required")
      }
      const { data: { data: { event } } } = await apiClient.post("/api/events/create", {
        ...data,
        image:eventUrl
      })
      console.log("data", event)

      toast.success("Event created successfully")
      router.push(`/explore/events/${event._id}`);
      reset();
    } catch (apiError: any) {
      toast.error(apiError?.response?.data?.message || "Failed to create event")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-background border rounded-lg border-black/50">
      <h2 className="text-3xl font-bold mb-6 text-center">Create New Event</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 ">
        
        {/* Event Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Event Title</Label>
          <Input 
            id="title" 
            placeholder="e.g. Next.js Conf 2026" 
            {...register("title", { 
              required: "Title is required", 
              minLength: { value: 2, message: "Title must be at least 2 characters" }
            })} 
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Category & Date Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Category - Manual Validation in Rules */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Controller
              name="category"
              control={control}
              rules={{ required: "Please select a category" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="border-black/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="border-black/20">
                    <SelectItem value="tech">Tech</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="sport">Sport</SelectItem>
                    <SelectItem value="art">Art</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* Date - Manual Validation in Rules */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Controller
              name="date"
              control={control}
              rules={{ required: "A date is required" }}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild className="border-black/20">
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      autoFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location" 
            placeholder="e.g. Convention Center, Hall A" 
            {...register("location", { required: "Location is required" })} 
          />
          {errors.location && (
            <p className="text-sm text-red-500">{errors.location.message}</p>
          )}
        </div>

        {/* Price & Seats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="price">Price (INR)</Label>
            <Input 
              id="price" 
              type="number" 
              placeholder="1000 (INR)" 
              min="0"
              step="1"
              {...register("price", { 
                required: "Price is required",
                min: { value: 0, message: "Price cannot be negative" },
                valueAsNumber: true 
              })} 
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalSeats">Total Seats</Label>
            <Input 
              id="totalSeats" 
              type="numbe r" 
              placeholder="100" 
              min="1"
              {...register("totalSeats", { 
                required: "Total seats is required",
                min: { value: 1, message: "Must have at least 1 seat" },
                valueAsNumber: true // Replaces z.coerce.number()
              })} 
            />
            {errors.totalSeats && (
              <p className="text-sm text-red-500">{errors.totalSeats.message}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            placeholder="Describe your event..." 
            className="h-32"
            {...register("description", { 
              required: "Description is required",
              minLength: { value: 10, message: "Description must be at least 10 characters" }
            })} 
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Event Image</Label>
          <Activity mode={ eventUrl ? "hidden" : "visible" }>
            <CldUploadWidget
              onSuccess={(result) => {
                if (typeof result.info === "string") {
                  toast.error(result.info || "Failed to upload image")
                } else {
                  setEventUrl(result?.info?.secure_url as string);
                }
              }}
              uploadPreset={ENV.cldUploadPreset}
              >
              {({ open }) => {
                return (
                  <Button
                    className="w-full justify-start text-left font-normal"
                    variant={"outline"}
                    type="button"
                    onClick={() => open()}
                    disabled={isSubmitting}
                  >
                    <UploadIcon className="mr-2 h-4 w-4"/> Upload Event Image
                  </Button>
                )
              }}
            </CldUploadWidget>
          </Activity>
          <Activity mode={eventUrl ? "visible" : "hidden"}>
            <div className="h-25 w-40 ring-1 ring-black/20 rounded-md relative p-2">
              <Image
                src={eventUrl} alt="Event Image" width={100} height={150}
                className="rounded-md h-full w-full" />
              <Button
                onClick={() => setEventUrl("")}
                type="button" variant={"destructive"}
                className="rounded-full absolute -top-5 -right-5"
              >
                <Trash2 />
              </Button>
            </div>
          </Activity>
        </div>
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Event...
            </>
          ) : (
            "Create Event"
          )}
        </Button>
      </form>
    </div>
  )
}