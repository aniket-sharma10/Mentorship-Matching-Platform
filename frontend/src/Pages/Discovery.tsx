import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { Spinner } from "flowbite-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import debounce from "lodash/debounce";  // Import debounce function

type User = {
  id: number;
  email: string;
  role: "MENTOR" | "MENTEE";
  profile: {
    name: string;
    bio: string;
    avatarUrl?: string;
    skills: string[];
    interests: string[];
  };
};

type Pagination = {
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
};

function Discovery() {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    totalUsers: 0,
    totalPages: 0,
    currentPage: 1,
    perPage: 10,
  });

  // Filter states
  const [roleFilter, setRoleFilter] = useState<"MENTOR" | "MENTEE" | "">("");
  const [skillsFilter, setSkillsFilter] = useState<string>("");
  const [interestsFilter, setInterestsFilter] = useState<string>("");

  // Existing connections to disable request button
  const [existingConnections, setExistingConnections] = useState<number[]>([]);

  // Debounced fetch function
  const debouncedFetchUsers = useCallback(
    debounce((role, skills, interests, page) => {
      fetchDiscoveryUsers(role, skills, interests, page);
    }, 500),  // Reduced delay to 500ms for better responsiveness
    []
  );

  // Watchers for filter changes
  useEffect(() => {
    if (currentUser) {
      // Use debounced fetch for skills and interests
      if (skillsFilter || interestsFilter) {
        debouncedFetchUsers(roleFilter, skillsFilter, interestsFilter, pagination.currentPage);
      } else {
        // Immediate fetch for role filter or when filters are cleared
        fetchDiscoveryUsers(roleFilter, skillsFilter, interestsFilter, pagination.currentPage);
      }
      fetchExistingConnections();
    }
  }, [currentUser, roleFilter, skillsFilter, interestsFilter, pagination.currentPage]);

  // Fetch users with filters
  const fetchDiscoveryUsers = async (
    role: string, 
    skills: string, 
    interests: string, 
    page: number
  ) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.perPage.toString(),
        ...(role && role !== " " && { role }),
        ...(skills && { skills }),
        ...(interests && { interests }),
      });

      const response = await fetch(`/api/discovery?${queryParams}`);
      const data = await response.json();

      if (data.users) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      toast.error("Error fetching discovery users");
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingConnections = async () => {
    try {
      const response = await fetch("/api/connection/connections");
      const connections = await response.json();
      
      // Extract all user IDs from connections
      const connectionUserIds = connections.flatMap((conn: any) => 
        conn.mentorId === currentUser?.id ? [conn.menteeId] : 
        conn.menteeId === currentUser?.id ? [conn.mentorId] : []
      );

      setExistingConnections(connectionUserIds);
    } catch (error) {
      toast.error("Error fetching existing connections");
    }
  };

  // Handle filter change
  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === "skills") {
      setSkillsFilter(value);
    } else if (filterType === "interests") {
      setInterestsFilter(value);
    }
  };

  const sendConnectionRequest = async (requestedUserId: number) => {
    try {
      const response = await fetch("/api/connection/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestedUserId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Connection request sent successfully");
        fetchExistingConnections(); // Update connections after sending request
      } else {
        toast.error(data.msg || "Failed to send connection request");
      }
    } catch (error) {
      toast.error("Error sending connection request");
    }
  };

  const resetFilters = () => {
    setRoleFilter("");
    setSkillsFilter("");
    setInterestsFilter("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
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
      <h1 className="text-2xl font-bold mb-6">Discover Mentors and Mentees</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Role</label>
          <Select
            value={roleFilter || ""}
            onValueChange={(value: "MENTOR" | "MENTEE" | "") => {
              setRoleFilter(value === "" ? "" : value as "MENTOR" | "MENTEE")
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All Roles</SelectItem>
              <SelectItem value="MENTOR">Mentors</SelectItem>
              <SelectItem value="MENTEE">Mentees</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Skills</label>
          <Input
            placeholder="Filter by skills"
            value={skillsFilter}
            onChange={(e) => handleFilterChange("skills", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Interests</label>
          <Input
            placeholder="Filter by interests"
            value={interestsFilter}
            onChange={(e) => handleFilterChange("interests", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>
      
      {/* User Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="relative group">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage
                    src={user.profile.avatarUrl}
                    alt={user.profile.name || "User Avatar"}
                  />
                  <AvatarFallback>{user.profile.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{user.profile.name || "Unnamed User"}</h3>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
                {/* Connection Request Button */}
                {String(user.id) !== currentUser?.id && !existingConnections.includes(user.id) && (
                  <Button
                    size="sm"
                    className="absolute top-8 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 hover:bg-blue-500"
                    onClick={() => sendConnectionRequest(user.id)}
                  >
                    Connect
                  </Button>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4">{user.profile.bio || "No bio available"}</p>

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Skills</h4>
                <div className="space-x-2">
                  {user.profile.skills.map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Interests</h4>
                <div className="space-x-2">
                  {user.profile.interests.map((interest) => (
                    <Badge key={interest}>{interest}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center space-x-4 mt-6">
        <Button
          variant="outline"
          disabled={pagination.currentPage === 1}
          onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={pagination.currentPage === pagination.totalPages}
          onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))}
        >
          Next
        </Button>
      </div>

    </div>
  );
}

export default Discovery;