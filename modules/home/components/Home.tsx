import { FormEvent, useEffect, useState } from "react";

import { useRouter } from "next/router";

import { socket } from "@/common/lib/socket";
import { useModal } from "@/common/recoil/modal";
import { useSetRoomId } from "@/common/recoil/room";

import NotFoundModal from "../modals/NotFound";

const Home = () => {
  const { openModal } = useModal();
  const setAtomRoomId = useSetRoomId();

  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const router = useRouter();

  useEffect(() => {
    document.body.style.backgroundColor = "white";
  }, []);

  useEffect(() => {
    socket.on("created", (roomIdFromServer) => {
      setAtomRoomId(roomIdFromServer);
      router.push(roomIdFromServer);
    });

    const handleJoinedRoom = (roomIdFromServer: string, failed?: boolean) => {
      if (!failed) {
        setAtomRoomId(roomIdFromServer);
        router.push(roomIdFromServer);
      } else {
        openModal(<NotFoundModal id={roomId} />);
      }
    };

    socket.on("joined", handleJoinedRoom);

    return () => {
      socket.off("created");
      socket.off("joined", handleJoinedRoom);
    };
  }, [openModal, roomId, router, setAtomRoomId]);

  useEffect(() => {
    socket.emit("leave_room");
    setAtomRoomId("");
  }, [setAtomRoomId]);

  const handleCreateRoom = () => {
    socket.emit("create_room", username);
  };

  const handleJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (roomId) socket.emit("join_room", roomId, username);
  };

  return (
    <div className="flex flex-col items-center py-16 px-4 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        {/* Upper part styling for title and subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500 mb-2">
            Fuse
          </h1>
          <h3 className="text-lg font-semibold text-gray-500">
            Connect & Collaborate Instantly
          </h3>
          <p className="text-md text-gray-400">A real-time whiteboard for seamless teamwork</p>
        </div>
  
        {/* Username input */}
        <div className="mb-6">
          <label className="block font-bold mb-2">Enter your name</label>
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="username"
            placeholder="Username..."
            value={username}
            onChange={(e) => setUsername(e.target.value.slice(0, 15))}
          />
        </div>
  
        <div className="border-t border-gray-200 my-6"></div>
  
        {/* Room ID form */}
        <form onSubmit={handleJoinRoom}>
          <div className="mb-6">
            <label htmlFor="room-id" className="block font-bold mb-2">Enter room ID</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="room-id"
              placeholder="Room ID..."
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
          <button
            className="w-full p-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="submit"
          >
            Join Room
          </button>
        </form>
  
        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="h-px flex-grow bg-gray-300"></div>
          <span className="px-3 text-gray-500">or</span>
          <div className="h-px flex-grow bg-gray-300"></div>
        </div>
  
        {/* Create Room button */}
        <div className="text-center">
          <button
            className="w-full p-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={handleCreateRoom}
          >
            Create New Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;  