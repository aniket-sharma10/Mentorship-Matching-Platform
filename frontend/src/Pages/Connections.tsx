import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Spinner } from "flowbite-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Connection = {
  id: number;
  mentor: {
    id: number;
    email: string;
    role: "MENTOR" | "MENTEE";
    name: string;
    bio: string;
    avatarUrl?: string;
    userSkills: Array<{ skill: { name: string } }>;
    userInterests: Array<{ interest: { name: string } }>;
  };
  mentee: {
    id: number;
    email: string;
    role: "MENTOR" | "MENTEE";
    name: string;
    bio: string;
    avatarUrl?: string;
    userSkills: Array<{ skill: { name: string } }>;
    userInterests: Array<{ interest: { name: string } }>;
  };
  status: "ACCEPTED" | "PENDING" | "DECLINED";
};

function Connections() {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchConnections();
    }
  }, [currentUser]);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/connection/connections");
      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }
      const data = await response.json();
      setConnections(data.filter((conn: Connection) => conn.status === "ACCEPTED"));
    } catch (error) {
      toast.error("Error fetching connections");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConnection = async (connectionId: number) => {
    try {
      const response = await fetch(`/api/connection/${connectionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Connection deleted successfully");
        setConnections(connections.filter(conn => conn.id !== connectionId));
      } else {
        toast.error("Failed to delete connection");
      }
    } catch (error) {
      toast.error("Error deleting connection");
    }
  };

  const getOtherUser = (connection: Connection) => {
    return Number(currentUser?.id) === connection.mentor.id ? connection.mentee : connection.mentor;
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
      <h1 className="text-2xl font-bold mb-2">My Connections</h1>
      <p className="text-gray-600 mb-6">
        Manage your active connections with mentors and mentees
      </p>

      {connections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">You don't have any active connections yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {connections.map((connection) => {
            const otherUser = getOtherUser(connection);
            return (
              <Card key={connection.id} className="relative group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <Avatar className="w-16 h-16 flex-shrink-0">
                      <AvatarImage
                        src={otherUser?.avatarUrl}
                        alt={otherUser?.name || "User Avatar"}
                      />
                      <AvatarFallback>{otherUser?.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-lg font-semibold truncate pr-24">
                        {otherUser?.name || "Unnamed User"}
                      </h3>
                      <p className="text-sm text-gray-500">{otherUser?.role}</p>
                    </div>
                    <div className="absolute top-6 right-6">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Connection</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove this connection? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteConnection(connection.id)}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {otherUser?.bio || "No bio available"}
                  </p>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Skills</h4>
                    <div className="space-x-2">
                      {otherUser?.userSkills?.map((skill) => (
                        <Badge key={skill.skill.name}>{skill.skill.name}</Badge>
                      )) || <span className="text-gray-500">No skills listed</span>}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Interests</h4>
                    <div className="space-x-2">
                      {otherUser?.userInterests?.map((interest) => (
                        <Badge key={interest.interest.name}>
                          {interest.interest.name}
                        </Badge>
                      )) || <span className="text-gray-500">No interests listed</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Connections;