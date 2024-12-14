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
      OR: [
        { mentorId, menteeId, status: "PENDING" },
        { mentorId, menteeId, status: "ACCEPTED" },
        { mentorId, menteeId, status: "DECLINED" },
      ],
    },
  });

  if (existingConnection) {
    throw new BadRequestError("A connection request already exists.");
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
      mentor: true,
      mentee: true,
    },
  });

  res.status(StatusCodes.OK).json(connections);
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
