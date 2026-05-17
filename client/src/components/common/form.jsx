import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

function CommonForm({
  formControls,
  formData,
  setFormData,
  onSubmit,
  buttonText,
  isBtnDisabled,
  errors = {},
}) {
  function renderInputsByComponentType(getControlItem) {
    let element = null;
    const value = formData[getControlItem.name] || "";

    switch (getControlItem.componentType) {
      case "input":
        element = (
          <Input
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.name}
            type={getControlItem.type}
            value={value}
            min={getControlItem.min}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        );

        break;
      case "select":
        element = (
          <Select
            onValueChange={(value) =>
              setFormData({
                ...formData,
                [getControlItem.name]: value,
              })
            }
            value={value}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={getControlItem.label} />
            </SelectTrigger>
            <SelectContent>
              {getControlItem.options && getControlItem.options.length > 0
                ? getControlItem.options.map((optionItem) => (
                    <SelectItem key={optionItem.id} value={optionItem.id}>
                      {optionItem.label}
                    </SelectItem>
                  ))
                : null}
            </SelectContent>
          </Select>
        );

        break;
      case "textarea":
        element = (
          <Textarea
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.id}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        );
        break;

      case "checkbox":
        element = (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={getControlItem.name}
              checked={value}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  [getControlItem.name]: checked,
                })
              }
            />
            <Label
              htmlFor={getControlItem.name}
              className="text-sm font-medium leading-none cursor-pointer"
            >
              {getControlItem.placeholder}
            </Label>
          </div>
        );
        break;

      case "checkbox-group":
        const currentCheckboxValues = Array.isArray(value) ? value : [];
        element = (
          <div className="flex flex-wrap gap-3 mt-1">
            {getControlItem.options && getControlItem.options.length > 0
              ? getControlItem.options.map((optionItem) => (
                  <div
                    key={optionItem.id}
                    className="flex items-center space-x-2 bg-secondary/20 p-2 rounded-md border border-muted hover:bg-secondary/40 transition-colors cursor-pointer"
                    onClick={() => {
                      const newValue = currentCheckboxValues.includes(
                        optionItem.id
                      )
                        ? currentCheckboxValues.filter(
                            (v) => v !== optionItem.id
                          )
                        : [...currentCheckboxValues, optionItem.id];
                      setFormData({
                        ...formData,
                        [getControlItem.name]: newValue,
                      });
                    }}
                  >
                    <Checkbox
                      id={`${getControlItem.name}-${optionItem.id}`}
                      checked={currentCheckboxValues.includes(optionItem.id)}
                      onCheckedChange={() => {}} // Controlled by div onClick for better hit area
                    />
                    <Label
                      htmlFor={`${getControlItem.name}-${optionItem.id}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {optionItem.label}
                    </Label>
                  </div>
                ))
              : null}
          </div>
        );
        break;

      case "tag-input":
        const tags = Array.isArray(value) ? value : [];
        element = (
          <div className="flex flex-col gap-2">
            <Input
              name={getControlItem.name}
              placeholder={getControlItem.placeholder}
              id={getControlItem.name}
              value={formData[`${getControlItem.name}_input`] || ""}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  [`${getControlItem.name}_input`]: event.target.value,
                })
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === ",") {
                  event.preventDefault();
                  const val = formData[`${getControlItem.name}_input`] || "";
                  const newTags = val
                    .split(",")
                    .map((v) => v.trim())
                    .filter((v) => v !== "" && !tags.includes(v));
                  
                  if (newTags.length > 0) {
                    setFormData({
                      ...formData,
                      [getControlItem.name]: [...tags, ...newTags],
                      [`${getControlItem.name}_input`]: "",
                    });
                  } else if (event.key === "Enter" && val.trim() !== "") {
                    // Clear if empty or duplicate on Enter
                    setFormData({
                      ...formData,
                      [`${getControlItem.name}_input`]: "",
                    });
                  }
                }
              }}
            />
            <div className="flex flex-wrap gap-2 mt-1">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm animate-in fade-in zoom-in duration-200"
                >
                  {tag}
                  <X
                    size={14}
                    className="cursor-pointer hover:text-destructive transition-colors"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        [getControlItem.name]: tags.filter((_, i) => i !== index),
                      });
                    }}
                  />
                </div>
              ))}
            </div>
            {tags.length === 0 && (
              <p className="text-[12px] text-muted-foreground italic">
                Type and press Enter to add items
              </p>
            )}
          </div>
        );
        break;

      default:
        element = (
          <Input
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.name}
            type={getControlItem.type}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        );
        break;
    }

    return element;
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-3">
        {formControls.map((controlItem) => (
          <div className="grid w-full gap-1.5" key={controlItem.name}>
            <Label className="mb-1">{controlItem.label}</Label>
            {renderInputsByComponentType(controlItem)}
            {errors[controlItem.name] && (
              <p className="text-red-500 text-[12px] font-medium animate-in fade-in slide-in-from-top-1">
                {errors[controlItem.name]}
              </p>
            )}
          </div>
        ))}
      </div>
      <Button disabled={isBtnDisabled} type="submit" className="mt-2 w-full">
        {buttonText || "Submit"}
      </Button>
    </form>
  );
}

export default CommonForm;
