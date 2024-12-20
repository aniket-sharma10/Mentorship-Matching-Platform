import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../errors/index.js";

const prisma = new PrismaClient();

// Send Connection Request
export const sendRequest = async (req, res) => {
  const currentUserId = req.user.id;
  const { requestedUserId } = req.body;

  if (currentUserId === requestedUserId) {
    throw new BadRequestError("You cannot connect with yourself.");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
  });
  const requestedUser = await prisma.user.findUnique({
    where: { id: requestedUserId },
  });

  if (!currentUser || !requestedUser) {
    throw new NotFoundError("User not found.");
  }

  // Validating roles
  if (currentUser.role === requestedUser.role) {
    throw new BadRequestError("Mentors can only connect with mentees and vice versa.");
  }

  // Assigning mentorId and menteeId dynamically based on roles
  let mentorId, menteeId;
  if (currentUser.role === "MENTOR" && requestedUser.role === "MENTEE") {
    mentorId = currentUserId;
    menteeId = requestedUserId;
  } else if (currentUser.role === "MENTEE" && requestedUser.role === "MENTOR") {
    mentorId = requestedUserId;
    menteeId = currentUserId;
  } else {
    throw new BadRequestError("Invalid connection roles.");
  }

  // Checking if a connection already exists
  const existingConnection = await prisma.connection.findFirst({
    where: {
      mentorId,
      menteeId,
    },
  });

  if (existingConnection) {
    // Handle previously declined request
    if (existingConnection.status === "DECLINED") {
      await prisma.connection.update({
        where: { id: existingConnection.id },
        data: { status: "PENDING" },
      });

      await prisma.notification.create({
        data: {
          userId: requestedUserId,
          type: "CONNECTION_REQUEST",
        },
      });

      return res.status(StatusCodes.OK).json({
        msg: "Connection request re-sent.",
      });
    }


    // Prevent duplicate requests if status is PENDING or ACCEPTED
    if (existingConnection.status === "PENDING" || existingConnection.status === "ACCEPTED") {
      throw new BadRequestError("A connection request already exists.");
    }
  }


  const connection = await prisma.connection.create({
    data: {
      mentorId,
      menteeId,
      status: "PENDING",
    },
  });

  await prisma.notification.create({
    data: {
      userId: requestedUserId,
      type: "CONNECTION_REQUEST",
    },
  });

  res.status(StatusCodes.CREATED).json(connection);
};

// Accept Connection Request
export const acceptRequest = async (req, res) => {
  const userId = req.user.id;
  const { connectionId } = req.body;

  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    throw new NotFoundError("Connection request not found.");
  }

  if (![connection.mentorId, connection.menteeId].includes(userId)) {
    throw new BadRequestError("You are not authorized to accept this connection request.");
  }

  if (connection.status !== "PENDING") {
    throw new BadRequestError("This connection request cannot be accepted.");
  }

  const updatedConnection = await prisma.connection.update({
    where: { id: connection.id },
    data: { status: "ACCEPTED" },
  });

  const otherUserId = connection.mentorId === userId ? connection.menteeId : connection.mentorId;
  await prisma.notification.create({
    data: {
      userId: otherUserId,
      type: "CONNECTION_ACCEPTED",
    },
  });

  res.status(StatusCodes.OK).json(updatedConnection);
};

// Decline Connection Request
export const declineRequest = async (req, res) => {
  const userId = req.user.id;
  const { connectionId } = req.body;

  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    throw new NotFoundError("Connection request not found.");
  }

  if (![connection.mentorId, connection.menteeId].includes(userId)) {
    throw new BadRequestError("You are not authorized to decline this connection request.");
  }

  if (connection.status !== "PENDING") {
    throw new BadRequestError("This connection request cannot be declined.");
  }

  const updatedConnection = await prisma.connection.update({
    where: { id: connection.id },
    data: { status: "DECLINED" },
  });

  const otherUserId = connection.mentorId === userId ? connection.menteeId : connection.mentorId;
  await prisma.notification.create({
    data: {
      userId: otherUserId,
      type: "CONNECTION_DECLINED",
    },
  });

  res.status(StatusCodes.OK).json(updatedConnection);
};

// Get User Connections
export const getConnections = async (req, res) => {
  const userId = req.user.id;

  const connections = await prisma.connection.findMany({
    where: {
      OR: [
        { mentorId: userId },
        { menteeId: userId },
      ],
    },
    include: {
      mentor: {
        include: {
          profile: {
            include: {
              skills: {
                include: {
                  skill: true,
                },
              },
              interests: {
                include: {
                  interest: true,
                },
              },
            },
          },
        },
      },
      mentee: {
        include: {
          profile: {
            include: {
              skills: {
                include: {
                  skill: true,
                },
              },
              interests: {
                include: {
                  interest: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const transformedConnections = connections.map(connection => ({
    id: connection.id,
    status: connection.status,
    mentor: {
      id: connection.mentor.id,
      email: connection.mentor.email,
      role: connection.mentor.role,
      name: connection.mentor.profile?.name || "Unnamed User",
      bio: connection.mentor.profile?.bio || "",
      avatarUrl: connection.mentor.profile?.avatarUrl,
      userSkills: connection.mentor.profile?.skills.map(s => ({
        skill: { name: s.skill.name }
      })) || [],
      userInterests: connection.mentor.profile?.interests.map(i => ({
        interest: { name: i.interest.name }
      })) || [],
    },
    mentee: {
      id: connection.mentee.id,
      email: connection.mentee.email,
      role: connection.mentee.role,
      name: connection.mentee.profile?.name || "Unnamed User",
      bio: connection.mentee.profile?.bio || "",
      avatarUrl: connection.mentee.profile?.avatarUrl,
      userSkills: connection.mentee.profile?.skills.map(s => ({
        skill: { name: s.skill.name }
      })) || [],
      userInterests: connection.mentee.profile?.interests.map(i => ({
        interest: { name: i.interest.name }
      })) || [],
    }
  }));

  res.status(StatusCodes.OK).json(transformedConnections);
};

// Get Connection Status
export const getConnectionStatus = async (req, res) => {
  const { currentUserId, otherUserId } = req.query;

  const parsedCurrentUserId = parseInt(currentUserId);
  const parsedOtherUserId = parseInt(otherUserId);

  const connection = await prisma.connection.findFirst({
    where: {
      OR: [
        { mentorId: parsedCurrentUserId, menteeId: parsedOtherUserId },
        { mentorId: parsedOtherUserId, menteeId: parsedCurrentUserId },
      ],
    },
  });

  if (!connection) {
    return res.status(StatusCodes.OK).json({ status: "NONE" }); // No connection exists
  }

  // Add who initiated the request
  const isRequestReceiver = connection.status === "PENDING" && 
    (connection.menteeId === parsedCurrentUserId || connection.mentorId === parsedCurrentUserId);

  if (connection.status === "PENDING") {
    return res.status(StatusCodes.OK).json({ 
      status: "PENDING",
      isReceiver: isRequestReceiver,
      connectionId: connection.id 
    });
  } else if (connection.status === "ACCEPTED") {
    return res.status(StatusCodes.OK).json({ status: "CONNECTED" });
  } else if (connection.status === "DECLINED") {
    return res.status(StatusCodes.OK).json({ status: "DECLINED" });
  }
};

// Get Pending Connection Requests
export const getPending = async (req, res) => {
  const userId = req.user.id;

  const pendingRequests = await prisma.connection.findMany({
    where: {
      OR: [
        { mentorId: userId, status: "PENDING" },
        { menteeId: userId, status: "PENDING" },
      ],
    },
    include: {
      mentor: true,
      mentee: true,
    },
  });

  res.status(StatusCodes.OK).json(pendingRequests);
};

// Delete Connection
export const deleteConnection = async (req, res) => {
  const userId = req.user.id;
  const { connectionId } = req.params;

  const connection = await prisma.connection.findUnique({
    where: { id: parseInt(connectionId) },
  });

  if (!connection) {
    throw new NotFoundError("Connection not found.");
  }

  if (![connection.mentorId, connection.menteeId].includes(userId)) {
    throw new BadRequestError("You are not authorized to delete this connection.");
  }

  await prisma.connection.delete({
    where: { id: parseInt(connectionId) },
  });

  res.status(StatusCodes.OK).json({ msg: "Connection deleted successfully." });
};
