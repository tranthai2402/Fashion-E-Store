import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchAllPages, 
  savePage, 
  deletePage 
} from "@/store/admin/pages-slice";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Edit, Trash2, Plus, PlusCircle, Trash } from "lucide-react";
import axios from "axios";

const initialFormData = {
  title: "",
  slug: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
  isActive: true,
  isSectionBased: false,
  sections: {}
};

function AdminPages() {
  const [openPageSheet, setOpenPageSheet] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [searchParams] = useSearchParams();

  const { pageList, isLoading } = useSelector((state) => state.adminPages);
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchAllPages());
  }, [dispatch]);

  useEffect(() => {
    const editSlug = searchParams.get("edit");
    if (editSlug && pageList.length > 0) {
      const pageToEdit = pageList.find((p) => p.slug === editSlug);
      if (pageToEdit) {
        handleEdit(pageToEdit);
      }
    }
  }, [searchParams, pageList]);

  const handleEdit = async (pageItem) => {
    if (pageItem.slug === "about" || pageItem.slug === "services") {
        try {
            const response = await axios.get(`http://localhost:5000/api/admin/page-settings/get/${pageItem.slug}`);
            if (response.data.success) {
                setFormData({
                    ...pageItem,
                    isSectionBased: true,
                    sections: response.data.data.data
                });
            } else {
                setFormData({ ...pageItem, isSectionBased: true, sections: {} });
            }
        } catch (e) {
            setFormData({ ...pageItem, isSectionBased: true, sections: {} });
        }
    } else {
        setFormData({ ...pageItem, isSectionBased: false, sections: {} });
    }
    setCurrentEditedId(pageItem._id);
    setOpenPageSheet(true);
  };

  async function onSubmit(event) {
    event.preventDefault();
    
    // Save main page data
    const savePageResult = await dispatch(savePage(formData));
    
    if (savePageResult?.payload?.success) {
        // If section based, save section data
        if (formData.isSectionBased) {
            try {
                await axios.post("http://localhost:5000/api/admin/page-settings/save", {
                    pageName: formData.slug,
                    data: formData.sections
                });
            } catch (e) {
                console.log("Error saving section data", e);
            }
        }
        
        dispatch(fetchAllPages());
        setOpenPageSheet(false);
        setFormData(initialFormData);
        setCurrentEditedId(null);
        toast({
          title: "Page saved successfully",
        });
    }
  }

  function handleDelete(id) {
    dispatch(deletePage(id)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllPages());
        toast({
          title: "Page deleted successfully",
        });
      }
    });
  }

  const addTimelineItem = () => {
    const newTimeline = [...(formData.sections.timeline || []), { year: "", text: "" }];
    setFormData({ ...formData, sections: { ...formData.sections, timeline: newTimeline } });
  };

  const removeTimelineItem = (index) => {
    const newTimeline = formData.sections.timeline.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: { ...formData.sections, timeline: newTimeline } });
  };

  const addValueItem = () => {
    const newValues = [...(formData.sections.values || []), { title: "", desc: "" }];
    setFormData({ ...formData, sections: { ...formData.sections, values: newValues } });
  };

  const removeValueItem = (index) => {
    const newValues = formData.sections.values.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: { ...formData.sections, values: newValues } });
  };

  const addServiceItem = () => {
    const newServices = [...(formData.sections.serviceItems || []), { title: "", description: "", action: "", link: "" }];
    setFormData({ ...formData, sections: { ...formData.sections, serviceItems: newServices } });
  };

  const removeServiceItem = (index) => {
    const newServices = formData.sections.serviceItems.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: { ...formData.sections, serviceItems: newServices } });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Content Management</h1>
        <Button onClick={() => {
          setFormData(initialFormData);
          setCurrentEditedId(null);
          setOpenPageSheet(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add New Page
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageList && pageList.length > 0 ? (
                pageList.map((pageItem) => (
                  <TableRow key={pageItem._id}>
                    <TableCell className="font-medium">{pageItem.title}</TableCell>
                    <TableCell>{pageItem.slug}</TableCell>
                    <TableCell>
                        <span className="text-xs text-muted-foreground">
                            {pageItem.slug === "about" || pageItem.slug === "services" ? "Section-based" : "Standard"}
                        </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${pageItem.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {pageItem.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(pageItem)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(pageItem._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No pages found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet
        open={openPageSheet}
        onOpenChange={(isOpen) => {
          setOpenPageSheet(isOpen);
          if (!isOpen) {
            setFormData(initialFormData);
            setCurrentEditedId(null);
          }
        }}
      >
        <SheetContent side="right" className="w-[600px] sm:w-[900px] overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? `Edit Page: ${formData.title}` : "Add New Page"}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={onSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="title">Page Title</Label>
                <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    disabled={currentEditedId !== null}
                    required
                />
                </div>
            </div>

            {formData.isSectionBased ? (
              <div className="space-y-6 border-t pt-4">
                <h3 className="font-bold text-lg">Page Sections</h3>
                
                {formData.slug === "about" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Founder Title</Label>
                                <Input value={formData.sections.founderTitle || ""} onChange={(e) => setFormData({...formData, sections: {...formData.sections, founderTitle: e.target.value}})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Founder Subtitle</Label>
                                <Input value={formData.sections.founderSubtitle || ""} onChange={(e) => setFormData({...formData, sections: {...formData.sections, founderSubtitle: e.target.value}})} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Timeline Items</Label>
                            {formData.sections.timeline?.map((item, idx) => (
                                <div key={idx} className="flex gap-2 mb-2 items-start">
                                    <Input placeholder="Year" className="w-24" value={item.year} onChange={(e) => {
                                        const updated = [...formData.sections.timeline];
                                        updated[idx].year = e.target.value;
                                        setFormData({...formData, sections: {...formData.sections, timeline: updated}});
                                    }} />
                                    <Input placeholder="Text" value={item.text} onChange={(e) => {
                                        const updated = [...formData.sections.timeline];
                                        updated[idx].text = e.target.value;
                                        setFormData({...formData, sections: {...formData.sections, timeline: updated}});
                                    }} />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeTimelineItem(idx)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={addTimelineItem}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Event
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Label>Brand Values</Label>
                            {formData.sections.values?.map((item, idx) => (
                                <div key={idx} className="flex gap-2 mb-2 items-start border p-2 rounded">
                                    <div className="flex-1 space-y-2">
                                        <Input placeholder="Title" value={item.title} onChange={(e) => {
                                            const updated = [...formData.sections.values];
                                            updated[idx].title = e.target.value;
                                            setFormData({...formData, sections: {...formData.sections, values: updated}});
                                        }} />
                                        <Input placeholder="Description" value={item.desc} onChange={(e) => {
                                            const updated = [...formData.sections.values];
                                            updated[idx].desc = e.target.value;
                                            setFormData({...formData, sections: {...formData.sections, values: updated}});
                                        }} />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeValueItem(idx)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={addValueItem}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Value
                            </Button>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Bottom Quote</Label>
                            <Input value={formData.sections.quote || ""} onChange={(e) => setFormData({...formData, sections: {...formData.sections, quote: e.target.value}})} />
                        </div>
                    </div>
                )}

                {formData.slug === "services" && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Header Title</Label>
                            <Input value={formData.sections.headerTitle || ""} onChange={(e) => setFormData({...formData, sections: {...formData.sections, headerTitle: e.target.value}})} />
                        </div>
                        
                        <div className="space-y-4">
                            <Label>Service Cards</Label>
                            {formData.sections.serviceItems?.map((item, idx) => (
                                <div key={idx} className="border p-4 rounded-lg space-y-3 relative group">
                                    <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeServiceItem(idx)}>
                                        <Trash className="h-3 w-3" />
                                    </Button>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Title</Label>
                                            <Input value={item.title} onChange={(e) => {
                                                const updated = [...formData.sections.serviceItems];
                                                updated[idx].title = e.target.value;
                                                setFormData({...formData, sections: {...formData.sections, serviceItems: updated}});
                                            }} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Button Label</Label>
                                            <Input value={item.action} onChange={(e) => {
                                                const updated = [...formData.sections.serviceItems];
                                                updated[idx].action = e.target.value;
                                                setFormData({...formData, sections: {...formData.sections, serviceItems: updated}});
                                            }} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Description</Label>
                                        <Input value={item.description} onChange={(e) => {
                                            const updated = [...formData.sections.serviceItems];
                                            updated[idx].description = e.target.value;
                                            setFormData({...formData, sections: {...formData.sections, serviceItems: updated}});
                                        }} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Link URL</Label>
                                        <Input value={item.link} onChange={(e) => {
                                            const updated = [...formData.sections.serviceItems];
                                            updated[idx].link = e.target.value;
                                            setFormData({...formData, sections: {...formData.sections, serviceItems: updated}});
                                        }} />
                                    </div>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={addServiceItem}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Service Card
                            </Button>
                        </div>
                    </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Content</Label>
                <div className="h-[400px] mb-12">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    className="h-full"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">SEO Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">SEO Meta Description</Label>
                <Input
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {currentEditedId !== null ? "Update Page" : "Create Page"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default AdminPages;
