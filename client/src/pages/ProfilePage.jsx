import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext.jsx";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);

  const [selectedImage, setSelectedImage] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const navigate = useNavigate();

  // ✅ Keep local state in sync with authUser
  useEffect(() => {
    if (authUser) {
      setName(authUser.fullName || "");
      setBio(authUser.bio || "");
      setSelectedImage(null); // reset file input
    }
  }, [authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedImage) {
      await updateProfile({ fullName: name, bio });
      navigate("/");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedImage);
    reader.onloadend = async () => {
      const base64Image = reader.result;
      await updateProfile({ profilePic: base64Image, fullName: name, bio });
      navigate("/");
    };
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex flex-col sm:flex-row rounded-lg overflow-hidden">
        {/* Left Section: Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-lg font-semibold">Profile Details</h3>

          {/* Upload Image */}
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              onChange={(e) => setSelectedImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpeg, .jpg"
              hidden
            />
            <img
              src={
                selectedImage
                  ? URL.createObjectURL(selectedImage)
                  : authUser?.profilePic || assets.avatar_icon
              }
              alt="profile"
              className="w-12 h-12 rounded-full"
            />
            <span className="text-sm text-gray-400">Upload profile image</span>
          </label>

          {/* Name Input */}
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder="Your Name"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          {/* Bio Input */}
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            required
            placeholder="Write profile bio"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows={4}
          ></textarea>

          {/* Save Button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer"
          >
            Save
          </button>
        </form>

        {/* Right Section: Live Preview */}
        <img
          src={
            selectedImage
              ? URL.createObjectURL(selectedImage)
              : authUser?.profilePic || assets.logo_icon
          }
          className="max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10"
          alt="preview"
        />
      </div>
    </div>
  );
};

export default ProfilePage;
