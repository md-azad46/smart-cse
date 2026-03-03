
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Clock,
  MapPin,
  Plus, 
  Loader2,
  User,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

// টাইপ ডিফাইন করা
interface ScheduleItem {
  _id: string;
  courseName: string;
  courseCode: string;
  roomNumber: string;
  day: string;
  startTime: string;
  duration: string;
  teacherId: string;
}

export default function ClassAssign() {
  const { data: session } = useSession();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTeacherInfo, setCurrentTeacherInfo] = useState<any>(null);

  const [formData, setFormData] = useState({
    courseName: "",
    courseCode: "",
    roomName: "",
    date: "",
    startTime: "",
    duration: "",
  });

  // ১. সময়কে ১২ ঘণ্টার ফরম্যাটে (AM/PM) রূপান্তর করার ফাংশন
  const formatTime12h = (time24: string) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    let h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  // ২. শিডিউল ফেচ করা (শুধুমাত্র আজ এবং ভবিষ্যতের ক্লাস)
  const fetchSchedules = useCallback(
    async (teacherId: string) => {
      if (!session || !teacherId) return;
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/class-assign?teacherId=${teacherId}`,
          {
            headers: {
              Authorization: `Bearer ${(session?.user as any)?.accessToken}`,
            },
          },
        );
        const data = await res.json();

        if (Array.isArray(data)) {
          // বর্তমান তারিখ বের করা (YYYY-MM-DD format)
          const today = new Date().toISOString().split("T")[0];
          // ফিল্টার: যে ক্লাসগুলোর তারিখ আজকের সমান বা বড়
          const upcomingSchedules = data.filter((item) => item.day >= today);

          // তারিখ অনুযায়ী সর্ট করা (কাছের ক্লাস আগে দেখাবে)
          upcomingSchedules.sort(
            (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime(),
          );

          setSchedules(upcomingSchedules);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    },
    [API_URL, session],
  );

  // ৩. ইনিশিয়াল ডাটা লোড করা
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userEmail = session?.user?.email;
        if (!userEmail) return;
        const token = (session?.user as any)?.accessToken;

        const userRes = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allUsers = await userRes.json();
        const teacher = allUsers.find((u: any) => u.email === userEmail);

        if (teacher) {
          setCurrentTeacherInfo(teacher);
          const courseRes = await fetch(`${API_URL}/courses`);
          const allCourses = await courseRes.json();
          setCourses(
            allCourses.filter((c: any) => c.teacherId === teacher.teacherId),
          );
          fetchSchedules(teacher.teacherId);
        }

        const roomRes = await fetch(`${API_URL}/classrooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const roomData = await roomRes.json();
        setClassrooms(roomData);
      } catch (error) {
        console.error("Initial load error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (session?.user) fetchInitialData();
  }, [session, API_URL, fetchSchedules]);

  // ৪. এডিট হ্যান্ডলার
  const handleEditClick = (item: ScheduleItem) => {
    setEditingId(item._id);
    setFormData({
      courseName: item.courseName,
      courseCode: item.courseCode,
      roomName: item.roomNumber,
      date: item.day,
      startTime: item.startTime,
      duration: item.duration,
    });
    setIsFormOpen(true);
  };

  // ৫. ডিলিট হ্যান্ডলার (SweetAlert2)
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this class schedule!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0F172A", // slate-900
      cancelButtonColor: "#ef4444", // red-500
      confirmButtonText: "Yes, delete it!",
      background: "#ffffff",
      customClass: {
        popup: "rounded-[2rem]",
        confirmButton: "rounded-xl px-6 py-3 font-bold",
        cancelButton: "rounded-xl px-6 py-3 font-bold",
      },
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/class-assign/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${(session?.user as any).accessToken}`,
          },
        });
        if (res.ok) {
          Swal.fire({
            title: "Deleted!",
            text: "Your schedule has been removed.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
          fetchSchedules(currentTeacherInfo.teacherId);
        }
      } catch (error) {
        toast.error("Delete failed! Please try again.");
      }
    }
  };
