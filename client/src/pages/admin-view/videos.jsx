import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowDown, ArrowUp, Loader2, Trash2, Upload } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  fetchAdminVideoSettings,
  updateAdminAboutVideo,
  updateAdminHomeVideos,
} from "@/store/admin/video-slice";
import { getApiUrl } from "@/config/api";

function AdminVideos() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { homeVideos, aboutVideo, isLoading, isSaving } = useSelector(
    (state) => state.adminVideo
  );

  const [homeVideoItems, setHomeVideoItems] = useState([]);
  const [isUploadingHomeVideos, setIsUploadingHomeVideos] = useState(false);
  const [isUploadingAboutVideo, setIsUploadingAboutVideo] = useState(false);
  const [aboutSourceType, setAboutSourceType] = useState("youtube");
  const [aboutYoutubeUrl, setAboutYoutubeUrl] = useState("");
  const [aboutUploadUrl, setAboutUploadUrl] = useState("");

  useEffect(() => {
    dispatch(fetchAdminVideoSettings());
  }, [dispatch]);

  useEffect(() => {
    setHomeVideoItems(
      (homeVideos || []).map((item) => ({
        url: item.url,
        title: item.title || "",
      }))
    );
  }, [homeVideos]);

  useEffect(() => {
    const sourceType = aboutVideo?.sourceType || "youtube";
    const url = aboutVideo?.url || "";

    setAboutSourceType(sourceType);
    if (sourceType === "youtube") {
      setAboutYoutubeUrl(url);
      setAboutUploadUrl("");
    } else {
      setAboutUploadUrl(url);
      setAboutYoutubeUrl("");
    }
  }, [aboutVideo]);

  const canSaveHome = useMemo(
    () => homeVideoItems.length > 0 && !isUploadingHomeVideos && !isSaving,
    [homeVideoItems.length, isUploadingHomeVideos, isSaving]
  );

  const canSaveAbout = useMemo(() => {
    if (isUploadingAboutVideo || isSaving) return false;
    if (aboutSourceType === "youtube") return Boolean(aboutYoutubeUrl.trim());
    return Boolean(aboutUploadUrl.trim());
  }, [
    aboutSourceType,
    aboutUploadUrl,
    aboutYoutubeUrl,
    isSaving,
    isUploadingAboutVideo,
  ]);

  const uploadVideoFile = async (file) => {
    const formData = new FormData();
    formData.append("my_file", file);
    const response = await axios.post(
      getApiUrl("/api/admin/products/upload-image"),
      formData,
      { withCredentials: true }
    );
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Upload failed");
    }
    return response.data.result.url;
  };

  const handleAddHomeVideos = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setIsUploadingHomeVideos(true);
    try {
      const uploadedItems = [];
      for (const file of files) {
        if (!String(file.type || "").startsWith("video/")) continue;
        const url = await uploadVideoFile(file);
        uploadedItems.push({
          url,
          title: String(file.name || "")
            .replace(/\.[^/.]+$/, "")
            .trim(),
        });
      }

      if (uploadedItems.length === 0) {
        toast({
          title: "No valid video files detected",
          variant: "destructive",
        });
      } else {
        setHomeVideoItems((prev) => [...prev, ...uploadedItems]);
      }
    } catch (error) {
      toast({
        title: error?.message || "Failed to upload home videos",
        variant: "destructive",
      });
    } finally {
      setIsUploadingHomeVideos(false);
      event.target.value = "";
    }
  };

  const moveHomeVideo = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= homeVideoItems.length) return;

    const nextList = [...homeVideoItems];
    const [target] = nextList.splice(index, 1);
    nextList.splice(nextIndex, 0, target);
    setHomeVideoItems(nextList);
  };

  const removeHomeVideo = (index) => {
    setHomeVideoItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const saveHomeVideos = () => {
    dispatch(updateAdminHomeVideos(homeVideoItems)).then((result) => {
      if (result?.payload?.success) {
        toast({ title: "Home videos updated successfully" });
        dispatch(fetchAdminVideoSettings());
      } else {
        toast({
          title: result?.payload?.message || "Failed to update home videos",
          variant: "destructive",
        });
      }
    });
  };

  const handleAboutVideoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingAboutVideo(true);
    try {
      if (!String(file.type || "").startsWith("video/")) {
        throw new Error("Please select a valid video file");
      }
      const url = await uploadVideoFile(file);
      setAboutSourceType("upload");
      setAboutUploadUrl(url);
    } catch (error) {
      toast({
        title: error?.message || "Failed to upload about video",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAboutVideo(false);
      event.target.value = "";
    }
  };

  const saveAboutVideo = () => {
    const payload =
      aboutSourceType === "youtube"
        ? { sourceType: "youtube", url: aboutYoutubeUrl.trim() }
        : { sourceType: "upload", url: aboutUploadUrl.trim() };

    dispatch(updateAdminAboutVideo(payload)).then((result) => {
      if (result?.payload?.success) {
        toast({ title: "About video updated successfully" });
        dispatch(fetchAdminVideoSettings());
      } else {
        toast({
          title: result?.payload?.message || "Failed to update about video",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-background p-6">
        <h2 className="text-lg font-semibold">Video Management</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Only admin can control videos displayed on Home and About pages.
        </p>
      </div>

      <div className="rounded-lg border bg-background p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">Home Page Videos</h3>
            <p className="text-sm text-muted-foreground">
              Upload local files and set playback order.
            </p>
          </div>
          <Label
            htmlFor="home-video-upload"
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
          >
            <Upload className="h-4 w-4" />
            Upload Videos
          </Label>
          <Input
            id="home-video-upload"
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={handleAddHomeVideos}
          />
        </div>

        {isUploadingHomeVideos && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading videos...
          </div>
        )}

        <div className="mt-4 space-y-3">
          {homeVideoItems.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No videos yet. Upload at least one file.
            </p>
          )}

          {homeVideoItems.map((item, index) => (
            <div
              key={`${item.url}-${index}`}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              <span className="w-6 text-sm font-medium">{index + 1}.</span>
              <video
                src={item.url}
                className="h-16 w-28 rounded object-cover"
                muted
                playsInline
              />
              <Input
                value={item.title}
                onChange={(event) => {
                  const value = event.target.value;
                  setHomeVideoItems((prev) =>
                    prev.map((entry, idx) =>
                      idx === index ? { ...entry, title: value } : entry
                    )
                  );
                }}
                placeholder="Video title (optional)"
                className="max-w-xs"
              />
              <div className="ml-auto flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={index === 0}
                  onClick={() => moveHomeVideo(index, -1)}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={index === homeVideoItems.length - 1}
                  onClick={() => moveHomeVideo(index, 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeHomeVideo(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button className="mt-5" onClick={saveHomeVideos} disabled={!canSaveHome}>
          Save Home Video Order
        </Button>
      </div>

      <div className="rounded-lg border bg-background p-6">
        <h3 className="text-base font-semibold">About Page Video</h3>
        <p className="text-sm text-muted-foreground">
          Choose YouTube embed link or upload a local video file.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            variant={aboutSourceType === "youtube" ? "default" : "outline"}
            onClick={() => setAboutSourceType("youtube")}
          >
            YouTube Embed URL
          </Button>
          <Button
            variant={aboutSourceType === "upload" ? "default" : "outline"}
            onClick={() => setAboutSourceType("upload")}
          >
            Uploaded Video
          </Button>
        </div>

        {aboutSourceType === "youtube" ? (
          <div className="mt-4 max-w-2xl space-y-2">
            <Label>YouTube URL (watch / youtu.be / embed)</Label>
            <Input
              value={aboutYoutubeUrl}
              onChange={(event) => setAboutYoutubeUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
            />
            <p className="text-xs text-muted-foreground">
              The system will automatically convert to a valid embed URL.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <Label
              htmlFor="about-video-upload"
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              <Upload className="h-4 w-4" />
              Upload About Video
            </Label>
            <Input
              id="about-video-upload"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleAboutVideoUpload}
            />
            {isUploadingAboutVideo && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading about video...
              </div>
            )}
            {aboutUploadUrl && (
              <video
                src={aboutUploadUrl}
                className="h-44 w-full max-w-md rounded object-cover"
                controls
              />
            )}
          </div>
        )}

        <Button className="mt-5" onClick={saveAboutVideo} disabled={!canSaveAbout}>
          Save About Video
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading video settings...</p>
      )}
    </div>
  );
}

export default AdminVideos;
