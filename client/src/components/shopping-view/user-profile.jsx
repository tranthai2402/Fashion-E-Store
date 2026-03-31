import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import CommonForm from "../common/form";
import { userProfileFormControls } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import {
  changeUserPassword,
  updateUserProfile,
} from "@/store/auth-slice";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?\d{9,15}$/;

const initialUserFormData = {
  userName: "",
  email: "",
  phone: "",
};

const initialPasswordData = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function normalizePhone(value) {
  return String(value || "").trim().replace(/[\s-]/g, "");
}

function ShoppingUserProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState(initialUserFormData);
  const [errors, setErrors] = useState({});
  const [profileFeedback, setProfileFeedback] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [passwordData, setPasswordData] = useState(initialPasswordData);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    setFormData({
      userName: user?.userName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setErrors({});
    setProfileFeedback(null);
  }, [user]);

  const hasUserName = useMemo(
    () => String(formData.userName || "").trim() !== "",
    [formData.userName]
  );
  const hasEmail = useMemo(
    () => String(formData.email || "").trim() !== "",
    [formData.email]
  );

  const validationErrors = useMemo(() => {
    const nextErrors = {};
    const emailValue = String(formData.email || "").trim();
    const phoneValue = normalizePhone(formData.phone);

    if (!hasUserName && !hasEmail) {
      const message = "User name or email is required";
      nextErrors.userName = message;
      nextErrors.email = message;
    }

    if (emailValue && !EMAIL_REGEX.test(emailValue)) {
      nextErrors.email = "Invalid email format";
    }

    if (phoneValue && !PHONE_REGEX.test(phoneValue)) {
      nextErrors.phone = "Phone must be 9-15 digits and can start with +";
    }

    return nextErrors;
  }, [formData, hasUserName, hasEmail]);

  const hasProfileChanges = useMemo(() => {
    if (!user) return false;
    const normalizedPhone = normalizePhone(formData.phone);
    const normalizedUserPhone = normalizePhone(user?.phone || "");
    return (
      String(user.userName || "") !== String(formData.userName || "") ||
      String(user.email || "") !== String(formData.email || "") ||
      normalizedUserPhone !== normalizedPhone
    );
  }, [user, formData]);

  useEffect(() => {
    if (!hasProfileChanges) {
      setErrors({});
      return;
    }
    setErrors(validationErrors);
  }, [hasProfileChanges, validationErrors]);

  function mapProfileServerErrors(message) {
    const nextErrors = {};
    if (!message) return nextErrors;

    if (message === "User name or email is required") {
      nextErrors.userName = message;
      nextErrors.email = message;
      return nextErrors;
    }

    if (message.toLowerCase().includes("user name")) {
      nextErrors.userName = message;
    }

    if (message.toLowerCase().includes("email")) {
      nextErrors.email = message;
    }

    if (message.toLowerCase().includes("phone")) {
      nextErrors.phone = message;
    }

    return nextErrors;
  }

  function handleProfileSubmit(event) {
    event.preventDefault();
    setErrors(validationErrors);
    setProfileFeedback(null);

    if (Object.keys(validationErrors).length > 0) {
      setProfileFeedback({
        type: "error",
        text: "Please correct the highlighted fields",
      });
      return;
    }

    const payload = {
      userName: String(formData.userName || "").trim(),
      email: String(formData.email || "").trim(),
      phone: normalizePhone(formData.phone),
    };

    setIsSavingProfile(true);
    dispatch(updateUserProfile(payload)).then((data) => {
      setIsSavingProfile(false);
      if (data?.payload?.success) {
        setErrors({});
        setProfileFeedback({
          type: "success",
          text: data?.payload?.message || "Profile updated successfully",
        });
      } else {
        const message = data?.payload?.message || "Failed to update profile";
        const serverErrors = mapProfileServerErrors(message);
        if (Object.keys(serverErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...serverErrors }));
        }
        setProfileFeedback({
          type: "error",
          text: message,
        });
      }
    });
  }

  const passwordValidationErrors = useMemo(() => {
    const nextErrors = {};
    if (!passwordData.currentPassword) {
      nextErrors.currentPassword = "Current password is required";
    }
    if (!passwordData.newPassword) {
      nextErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      nextErrors.newPassword = "New password must be at least 6 characters";
    }
    if (!passwordData.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }
    return nextErrors;
  }, [passwordData]);

  const canSubmitPassword = Object.keys(passwordValidationErrors).length === 0;
  const hasPasswordInput = useMemo(
    () => Object.values(passwordData).some((value) => String(value).length > 0),
    [passwordData]
  );

  useEffect(() => {
    if (!hasPasswordInput) {
      setPasswordErrors({});
      return;
    }
    setPasswordErrors(passwordValidationErrors);
  }, [hasPasswordInput, passwordValidationErrors]);

  function handlePasswordChange(field, value) {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPasswordFeedback(null);
  }

  function mapPasswordServerErrors(message) {
    const nextErrors = {};
    if (!message) return nextErrors;
    const lower = message.toLowerCase();

    if (lower.includes("current password")) {
      nextErrors.currentPassword = message;
    }
    if (lower.includes("new password")) {
      nextErrors.newPassword = message;
    }
    return nextErrors;
  }

  function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordErrors(passwordValidationErrors);
    setPasswordFeedback(null);

    if (!canSubmitPassword) {
      setPasswordFeedback({
        type: "error",
        text: "Please fix the password fields",
      });
      return;
    }

    setIsUpdatingPassword(true);
    dispatch(
      changeUserPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
    ).then((data) => {
      setIsUpdatingPassword(false);
      if (data?.payload?.success) {
        setPasswordData(initialPasswordData);
        setPasswordErrors({});
        setPasswordFeedback({
          type: "success",
          text: data?.payload?.message || "Password updated successfully",
        });
      } else {
        const message = data?.payload?.message || "Failed to update password";
        const serverErrors = mapPasswordServerErrors(message);
        if (Object.keys(serverErrors).length > 0) {
          setPasswordErrors((prev) => ({ ...prev, ...serverErrors }));
        }
        setPasswordFeedback({
          type: "error",
          text: message,
        });
      }
    });
  }

  return (
    <Card className="border-gray-200 shadow-none">
      <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
        <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.26em] text-gray-900">
          User Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 px-5 pb-6 sm:px-6">
        <div className="space-y-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-700">
            Personal Information
          </div>
          <CommonForm
            formControls={userProfileFormControls}
            formData={formData}
            setFormData={setFormData}
            buttonText={isSavingProfile ? "Saving..." : "Save Changes"}
            onSubmit={handleProfileSubmit}
            isBtnDisabled={
              !hasProfileChanges ||
              Object.keys(validationErrors).length > 0 ||
              isSavingProfile
            }
            errors={errors}
          />
          {profileFeedback && (
            <p
              className={`text-[11px] tracking-[0.08em] ${profileFeedback.type === "success"
                  ? "text-green-600"
                  : "text-red-600"
                }`}
            >
              {profileFeedback.text}
            </p>
          )}
          <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400">
            You can update your user name, email, and phone number. At least one of
            user name or email is required.
          </p>
        </div>

        <Separator className="bg-gray-200" />

        <div className="space-y-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-700">
            Change Password
          </div>
          <form onSubmit={handlePasswordSubmit} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label className="text-[10px] uppercase tracking-[0.16em] text-gray-500">
                Current Password
              </Label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(event) =>
                  handlePasswordChange("currentPassword", event.target.value)
                }
                className="h-10 rounded-none border-x-0 border-t-0 border-b border-gray-300 bg-transparent px-0 text-[11px] tracking-[0.08em] focus-visible:ring-0 focus-visible:border-black"
              />
              {passwordErrors.currentPassword && (
                <p className="text-[12px] font-medium text-red-500">
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label className="text-[10px] uppercase tracking-[0.16em] text-gray-500">
                New Password
              </Label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(event) =>
                  handlePasswordChange("newPassword", event.target.value)
                }
                className="h-10 rounded-none border-x-0 border-t-0 border-b border-gray-300 bg-transparent px-0 text-[11px] tracking-[0.08em] focus-visible:ring-0 focus-visible:border-black"
              />
              {passwordErrors.newPassword && (
                <p className="text-[12px] font-medium text-red-500">
                  {passwordErrors.newPassword}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label className="text-[10px] uppercase tracking-[0.16em] text-gray-500">
                Confirm New Password
              </Label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(event) =>
                  handlePasswordChange("confirmPassword", event.target.value)
                }
                className="h-10 rounded-none border-x-0 border-t-0 border-b border-gray-300 bg-transparent px-0 text-[11px] tracking-[0.08em] focus-visible:ring-0 focus-visible:border-black"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-[12px] font-medium text-red-500">
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={!canSubmitPassword || isUpdatingPassword}
              className="mt-2 h-10 rounded-none bg-black text-[10px] font-medium uppercase tracking-[0.24em] text-white hover:bg-gray-800"
            >
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
            {passwordFeedback && (
              <p
                className={`text-[11px] tracking-[0.08em] ${passwordFeedback.type === "success"
                    ? "text-green-600"
                    : "text-red-600"
                  }`}
              >
                {passwordFeedback.text}
              </p>
            )}
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

export default ShoppingUserProfile;
