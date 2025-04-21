import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { server } from "../main";
import toast from "react-hot-toast";

const MeetingContext = createContext();

export const MeetingProvider = ({ children }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${server}/api/meetings`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setMeetings(data.meetings);
      setError(null);
    } catch (error) {
      setError("Failed to fetch meetings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createMeeting = async (meetingData) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${server}/api/meetings`, meetingData, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setMeetings([data.meeting, ...meetings]);
      toast.success("Meeting created successfully");
      return { success: true, meeting: data.meeting };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create meeting";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteMeeting = async (meetingId) => {
    try {
      await axios.delete(`${server}/api/meetings/${meetingId}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setMeetings(meetings.filter((meeting) => meeting._id !== meetingId));
      toast.success("Meeting deleted successfully");
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete meeting";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const joinMeeting = async (meetingId) => {
    try {
      const { data } = await axios.post(
        `${server}/api/meetings/${meetingId}/join`,
        {},
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      
      console.log("Meeting join response:", data);
      
      if (data.meetLink) {
        console.log("Meeting link received:", data.meetLink);
        toast.success("Joining meeting...");
        return { success: true, meetLink: data.meetLink };
      } else {
        console.error("No meeting link in response data:", data);
        toast.error("No meeting link received");
        return { success: false, error: "No meeting link available" };
      }
    } catch (error) {
      console.error("Meeting join error:", error);
      const errorMessage = error.response?.data?.message || "Failed to join meeting";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return (
    <MeetingContext.Provider
      value={{
        meetings,
        loading,
        error,
        fetchMeetings,
        createMeeting,
        deleteMeeting,
        joinMeeting,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeetingContext = () => useContext(MeetingContext); 