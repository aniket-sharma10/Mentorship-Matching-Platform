import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Spinner } from "flowbite-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type User = {
  user: {
    id: number;
    email: string;
    role: "MENTOR" | "MENTEE";
  };
  name: string;
  bio: string;
  avatarUrl?: string;
  skills: Array<{ skill: { name: string } }>;
  interests: Array<{ interest: { name: string } }>;
  score: number;
};

type ConnectionStatusType = {
  status: "NONE" | "PENDING" | "CONNECTED" | "DECLINED";
  isReceiver?: boolean;
  connectionId?: number;
};

function Matchmaking() {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [matches, setMatches] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatuses, setConnectionStatuses] = useState<
    Record<number, ConnectionStatusType>
  >({});

  useEffect(() => {
    if (currentUser) {
      fetchMatches();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && matches.length > 0) {
      matches.forEach((match) => {
        fetchConnectionStatus(match.user.id);
      });
    }
  }, [currentUser, matches]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/matchmaking");
      const data = await response.json();

      if (Array.isArray(data)) {
        setMatches(data);
      } else if (data.message) {
        toast.info(data.message);
      }
    } catch (error) {
      toast.error("Error fetching matches");
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionStatus = async (userId: number) => {
    try {
      const response = await fetch(
        `/api/connection/getConnStatus?currentUserId=${currentUser?.id}&otherUserId=${userId}`
      );
      const data = await response.json();

      setConnectionStatuses((prev) => ({
        ...prev,
        [userId]: {
          status: data.status,
          isReceiver: data.isReceiver,
          connectionId: data.connectionId,
        },
      }));
    } catch (error) {
      console.error("Error fetching connection status:", error);
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
        setConnectionStatuses((prev) => ({
          ...prev,
          [requestedUserId]: {
            status: "PENDING",
            isReceiver: false,
            connectionId: data.id,
          },
        }));
      } else {
        toast.error(data.msg || "Failed to send connection request");
      }
    } catch (error) {
      toast.error("Error sending connection request");
    }
  };

  const handleAcceptRequest = async (connectionId: number, userId: number) => {
    try {
      const response = await fetch("/api/connection/accept", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ connectionId }),
      });

      if (response.ok) {
        toast.success("Connection accepted successfully");
        setConnectionStatuses((prev) => ({
          ...prev,
          [userId]: {
            status: "CONNECTED",
            connectionId,
          },
        }));
      } else {
        toast.error("Failed to accept connection");
      }
    } catch (error) {
      toast.error("Error accepting connection");
    }
  };

  const handleDeclineRequest = async (connectionId: number, userId: number) => {
    try {
      const response = await fetch("/api/connection/decline", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ connectionId }),
      });

      if (response.ok) {
        toast.success("Connection declined");
        setConnectionStatuses((prev) => ({
          ...prev,
          [userId]: {
            status: "DECLINED",
            connectionId,
          },
        }));
      } else {
        toast.error("Failed to decline connection");
      }
    } catch (error) {
      toast.error("Error declining connection");
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
      <h1 className="text-2xl font-bold mb-2">Smart Matches</h1>
      <p className="text-gray-600 mb-6">
        Recommended users based on your skills and interests
      </p>

      {/* User Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {matches.map((match) => (
          <Card key={match.user.id} className="relative group">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4 mb-4">
                <Avatar className="w-16 h-16 flex-shrink-0">
                  <AvatarImage
                    src={match.avatarUrl}
                    alt={match.name || "User Avatar"}
                  />
                  <AvatarFallback>{match.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-grow min-w-0">
                  <h3 className="text-lg font-semibold truncate pr-24">
                    {match.name || "Unnamed User"}
                  </h3>
                  <p className="text-sm text-gray-500">{match.user.role}</p>
                </div>
                {/* Connection Request Button */}
                <div className="absolute top-6 right-6">
                  {connectionStatuses[match.user.id]?.status === "NONE" && (
                    <Button
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 hover:bg-blue-500"
                      onClick={() => sendConnectionRequest(match.user.id)}
                    >
                      Connect
                    </Button>
                  )}
                  {connectionStatuses[match.user.id]?.status === "PENDING" &&
                    !connectionStatuses[match.user.id]?.isReceiver && (
                      <Button
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        variant="secondary"
                        disabled
                      >
                        Requested
                      </Button>
                    )}
                  {connectionStatuses[match.user.id]?.status === "PENDING" &&
                    connectionStatuses[match.user.id]?.isReceiver && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-500"
                          onClick={() =>
                            handleAcceptRequest(
                              connectionStatuses[match.user.id].connectionId!,
                              match.user.id
                            )
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleDeclineRequest(
                              connectionStatuses[match.user.id].connectionId!,
                              match.user.id
                            )
                          }
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  {connectionStatuses[match.user.id]?.status === "CONNECTED" && (
                    <Button
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      variant="secondary"
                      disabled
                    >
                      Connected
                    </Button>
                  )}
                  {connectionStatuses[match.user.id]?.status === "DECLINED" && (
                    <Button
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 hover:bg-blue-500"
                      onClick={() => sendConnectionRequest(match.user.id)}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {match.bio || "No bio available"}
              </p>

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Skills</h4>
                <div className="space-x-2">
                  {match.skills.map((skill) => (
                    <Badge key={skill.skill.name}>{skill.skill.name}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Interests</h4>
                <div className="space-x-2">
                  {match.interests.map((interest) => (
                    <Badge key={interest.interest.name}>
                      {interest.interest.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Matchmaking;