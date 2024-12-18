import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "flowbite-react";

type Skill = {
  id: number | null;
  name: string;
};

type Interest = {
  id: number | null;
  name: string;
};

const Profile = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [name, setName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<"MENTOR" | "MENTEE">("MENTEE");

  const [skills, setSkills] = useState<Skill[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);

  const [skillInput, setSkillInput] = useState<string>("");
  const [interestInput, setInterestInput] = useState<string>("");

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  // Fetching profile data
  const fetchProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();

      if (data) {
        setProfile(data);
        setName(data.name || "");
        setBio(data.bio || "");
        setRole(data.user.role);

        const fetchedSkills =
          data.skills?.map((s: any) => ({
            id: s.skill?.id || null,
            name: s.skill?.name || "",
          })) || [];

        const fetchedInterests =
          data.interests?.map((i: any) => ({
            id: i.interest?.id || null,
            name: i.interest?.name || "",
          })) || [];

        setSkills(fetchedSkills);
        setInterests(fetchedInterests);
      }
    } catch (error) {
      toast.error("Error fetching profile");
    }finally {
      setLoading(false);
    }
  };

  // updating profile
  const handleProfileUpdate = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          bio,
          password,
          skills: skills.map((skill) => skill.name),
          interests: interests.map((interest) => interest.name),
          role,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.msg || "Something occured, try again!");
      }
    } catch (error) {
      toast.error("Error updating profile");
    }finally {
      setLoading(false);
    }
  };

  const handleSkillAdd = () => {
    const skill = skillInput.trim().toLowerCase();
    if (skill && !skills.some((s) => s.name === skill)) {
      setSkills((prevSkills) => [...prevSkills, { id: null, name: skill }]);
      setSkillInput(""); // Clear input after adding
    }
  };

  const handleInterestAdd = () => {
    const interest = interestInput.trim().toLowerCase();
    if (interest && !interests.some((i) => i.name === interest)) {
      setInterests((prevInterests) => [
        ...prevInterests,
        { id: null, name: interest },
      ]);
      setInterestInput(""); // Clear input after adding
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
        <p className="ml-2 text-2xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="lg:px-36 lg:py-20 px-4 py-2 sm:px-12 sm:py-6 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex justify-center items-center">
            <img
              src={profile?.avatarUrl}
              alt="User Avatar"
              className="w-32 h-32 rounded-full object-cover"
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold">{name || "No name set"}</h2>
            <p className="text-sm text-gray-500">
              {currentUser?.email || "No email available"}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="text-teal-500 border-teal-500"
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      {isEditing ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mt-4 w-full">
              <label className="block text-sm font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="mt-4 w-full">
              <label className="block text-sm font-medium">Bio</label>
              <Input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Enter your bio"
              />
            </div>

            <div className="mt-4 w-full">
              <label className="block text-sm font-medium">Role</label>
              <Select
                value={role}
                onValueChange={(value: "MENTOR" | "MENTEE") => setRole(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MENTOR">Mentor</SelectItem>
                  <SelectItem value="MENTEE">Mentee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 w-full">
              <label className="block text-sm font-medium">New Password</label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new Password"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="mt-4">
            <label className="block text-sm font-medium">Skills</label>
            <div className="flex">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSkillAdd();
                  }
                }}
              />
              <Button onClick={handleSkillAdd} className="ml-2">
                Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((skill, index) => (
                  <Badge
                    key={index}
                    className="text-teal-500 bg-teal-100 text-base gap-2 cursor-pointer"
                    onClick={() => {
                      // Optional: Remove skill on click
                      setSkills((prevSkills) =>
                        prevSkills.filter((s) => s.name !== skill.name)
                      );
                    }}
                  >
                    {skill.name}
                    <span className="text-gray-500">x</span>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500">No skills added</p>
              )}
            </div>
          </div>

          {/* Interest */}
          <div className="mt-4">
            <label className="block text-sm font-medium">Interests</label>
            <div className="flex">
              <Input
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                placeholder="Add an interest"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleInterestAdd();
                  }
                }}
              />
              <Button onClick={handleInterestAdd} className="ml-2">
                Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {interests.length > 0 ? (
                interests.map((interest, index) => (
                  <Badge
                    key={index}
                    className="text-teal-500 bg-teal-100 text-base gap-2 cursor-pointer"
                    onClick={() => {
                      // Optional: Remove interest on click
                      setInterests((prevInterests) =>
                        prevInterests.filter((i) => i.name !== interest.name)
                      );
                    }}
                  >
                    {interest.name}
                    <span className="text-gray-500">x</span>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500">No interests added</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={handleProfileUpdate}
              className="text-white bg-teal-500"
            >
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 px-4">
          <p className="mt-2">
            <strong>Role:</strong> {role === "MENTOR" ? "Mentor" : "Mentee"}
          </p>
          <p>{bio || "No bio available."}</p>
          <div className="mt-4">
            <h3 className="font-semibold">Skills:</h3>
            {skills.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge key={index} className="text-teal-500 bg-teal-100 text-base gap-2 cursor-pointer">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No skills added</p>
            )}
          </div>
          <div className="mt-4">
            <h3 className="font-semibold">Interests:</h3>
            {interests.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <Badge key={index} className="text-teal-500 bg-teal-100 text-base gap-2 cursor-pointer">
                    {interest.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No interests added</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
