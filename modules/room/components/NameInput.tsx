import { FormEvent, useEffect, useState } from "react";

import { useRouter } from "next/router";

import { socket } from "@/common/lib/socket";
import { useModal } from "@/common/recoil/modal";
import { useSetRoomId } from "@/common/recoil/room";
import NotFoundModal from "@/modules/home/modals/NotFound";

const NameInput = () => {
  const setRoomId = useSetRoomId();
  const { openModal } = useModal();

  const [name, setName] = useState("");

  const router = useRouter();
  const roomId = (router.query.roomId || "").toString();

  useEffect(() => {
    if (!roomId) return;

    socket.emit("check_room", roomId);

    socket.on("room_exists", (exists) => {
      if (!exists) {
        router.push("/");
      }
    });

    // eslint-disable-next-line consistent-return
    return () => {
      socket.off("room_exists");
    };
  }, [roomId, router]);

  useEffect(() => {
    const handleJoined = (roomIdFromServer: string, failed?: boolean) => {
      if (failed) {
        router.push("/");
        openModal(<NotFoundModal id={roomIdFromServer} />);
      } else setRoomId(roomIdFromServer);
    };

    socket.on("joined", handleJoined);

    return () => {
      socket.off("joined", handleJoined);
    };
  }, [openModal, router, setRoomId]);

  const handleJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    socket.emit("join_room", roomId, name);
  };

  return (
    <form
      className="flex flex-col items-center py-16 px-4 bg-gray-50 min-h-screen"
      onSubmit={handleJoinRoom}
    >
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        {/* Header styling */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500 mb-2">
            Fuse
          </h1>
          <h3 className="text-lg font-semibold text-gray-500">
            Connect & Collaborate Instantly
          </h3>
          <p className="text-md text-gray-400">A real-time whiteboard for teamwork</p>
        </div>

        {/* Name input */}
        <div className="mb-6">
          <label className="block font-bold mb-2">Enter your name</label>
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="username"
            placeholder="Username..."
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 15))}
          />
        </div>

        {/* Join button */}
        <button
          className="w-full p-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="submit"
        >
          Enter Room
        </button>
      </div>
    </form>
  );
};

export default NameInput;