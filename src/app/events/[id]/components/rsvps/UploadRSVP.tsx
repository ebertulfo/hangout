import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getIdTokenPromise } from "@/lib/firebase/auth";
import React, { useRef } from "react"; // Import useRef

export const UploadRSVP = ({ eventId }: { eventId: string }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null); // Create a ref
  const uploadCsv = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    const file = fileInputRef.current?.files?.[0]; // Use the ref to access the file
    if (file) {
      formData.append("files", file);
    }
    const idToken = (await getIdTokenPromise()) as string;
    formData.append("eventId", eventId);
    try {
      const res = await fetch("/api/rsvp/process-csv", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: formData,
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        throw new Error(data.data);
      }
      console.log(data);
      // Add toast message
      toast({
        title: "CSV Uploaded",
      });
    } catch (error: any) {
      console.error("Error uploading CSV:", error.message);
      // Add toast message
      toast({
        title: "Error uploading CSV",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <form onSubmit={uploadCsv}>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">Upload RSVP CSV</Label>
          <Input ref={fileInputRef} id="picture" type="file" />{" "}
          {/* Attach the ref */}
          <Button>Upload</Button>
        </div>
      </form>
    </div>
  );
};
