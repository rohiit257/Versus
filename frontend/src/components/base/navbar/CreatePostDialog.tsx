"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";


const formSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(500),
  category: z.string().min(1),
  expireAt: z.date({
    required_error: "Please select an expiration date",
  }),
  image: z.any().optional(),
});

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostDialog({ isOpen, onClose }: CreatePostDialogProps) {
  const { data: session } = useSession();
  const user = session?.user as { token?: string } | undefined;

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Add state for post creation step and post ID
  const [postId, setPostId] = useState<number | null>(null);
  const [isPostCreated, setIsPostCreated] = useState(false);
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [isOptionSubmitting, setIsOptionSubmitting] = useState(false);


  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      expireAt: undefined,
      image: null,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      form.setValue("image", file);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !user.token) {
      toast.error("Please log in to create a post");
      return;
    }

    if (!selectedImage) {
      toast.error("Image is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", String(values.title));
      formData.append("description", String(values.description));
      formData.append("category", String(values.category));
      formData.append("expire_at", values.expireAt.toISOString());
      formData.append("image", selectedImage);

      const response = await axios.post("http://localhost:8000/api/post/v1", formData, {
        headers: {
          Authorization: user.token,
          "Content-Type": "multipart/form-data",
        },
      });

      // Expecting backend to return post ID (add this if not present)
      const newPostId = response.data?.postId || response.data?.id || response.data?.data?.id;
      if (newPostId) {
        setPostId(newPostId);
        setIsPostCreated(true);
        toast.success("Post created! Now add options.");
      } else {
        toast.success("Post created, but could not get post ID.");
      }
      // Do not close dialog, do not reset form yet
      // form.reset();
      // setSelectedImage(null);
      // onClose();
    } catch (error: any) {
      console.error("Error creating post:", error);
      if (error.response?.status === 422 && error.response.data.errors?.image) {
        toast.error(`Image Error: ${error.response.data.errors.image}`);
      } else if (error.response) {
        toast.error(`Error: ${error.response.data.message || "Failed to create post"}`);
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for submitting options
  const handleOptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!option1.trim() || !option2.trim()) {
      toast.error("Both options are required");
      return;
    }
    if (!user || !user.token) {
      toast.error("Please log in to add options");
      return;
    }
    if (!postId) {
      toast.error("No post ID found");
      return;
    }
    setIsOptionSubmitting(true);
    try {
      await axios.post(
        "http://localhost:8000/api/post/add-options",
        {
          post_id: postId,
          option1,
          option2,
        },
        {
          headers: {
            Authorization: user.token,
          },
        }
      );
      toast.success("Options added successfully!");
      // Reset all state and close dialog
      setOption1("");
      setOption2("");
      setIsPostCreated(false);
      setPostId(null);
      form.reset();
      setSelectedImage(null);
      onClose();
    } catch (error: any) {
      toast.error("Failed to add options");
    } finally {
      setIsOptionSubmitting(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-popover border-border text-popover-foreground">
        <DialogHeader>
          <DialogTitle className="text-emerald-400">
            {isPostCreated ? "Add Options" : "Create New Post"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isPostCreated
              ? "Add two options for your dilemma."
              : "Are you confused? Just post it and let the community help you decide!"}
          </DialogDescription>
        </DialogHeader>
        {!isPostCreated ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="What's your dilemma?"
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-muted-foreground">
                      A clear, concise title for your dilemma.
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your situation in detail..."
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-muted-foreground">
                      Provide context and details about your dilemma.
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        <SelectItem value="career">Career</SelectItem>
                        <SelectItem value="relationship">Relationship</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-muted-foreground">
                      Choose the category that best fits your dilemma.
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {/* Expire At */}
              <FormField
                control={form.control}
                name="expireAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-foreground">Expire At</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-input border-border text-foreground",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover border-border text-popover-foreground">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="text-muted-foreground">
                      When should this post expire?
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />


              {/* Image Upload */}
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-foreground">Image (Optional)</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                          </div>
                          <input
                            id="image-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        {selectedImage && (
                          <div className="text-sm text-emerald-400">
                            Selected: {selectedImage.name}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription className="text-muted-foreground">
                      Add an image to help illustrate your dilemma.
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-border text-foreground hover:bg-muted"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Post"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <form onSubmit={handleOptionSubmit} className="space-y-6">
            <div>
              <label className="block text-foreground mb-2">Option 1</label>
              <Input
                value={option1}
                onChange={e => setOption1(e.target.value)}
                placeholder="First option"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-foreground mb-2">Option 2</label>
              <Input
                value={option2}
                onChange={e => setOption2(e.target.value)}
                placeholder="Second option"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPostCreated(false);
                  setPostId(null);
                  setOption1("");
                  setOption2("");
                  form.reset();
                  setSelectedImage(null);
                  onClose();
                }}
                className="border-border text-foreground hover:bg-muted"
                disabled={isOptionSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium"
                disabled={isOptionSubmitting}
              >
                {isOptionSubmitting ? "Adding..." : "Add Options"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}