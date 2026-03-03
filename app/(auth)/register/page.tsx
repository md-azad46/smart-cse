"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/public/cse.avif";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  BriefcaseBusiness,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    studentId: "",
    batch: "",
    semester: "", 
    cgpa: "",
    bloodGroup: "",
    guardianPhone: "",
    teacherId: "",
    designation: "",
    specialization: "",
    experience: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Identity অনুযায়ী ডাইনামিক পেলোড তৈরি
    const payload = {
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      gender: formData.gender,
      role: role,
      ...(role === "student"
        ? {
            studentId: formData.studentId,
            batch: formData.batch,
            semester: formData.semester,
            cgpa: formData.cgpa,
            bloodGroup: formData.bloodGroup,
            guardianPhone: formData.guardianPhone,
            status: "approved", 
          }
        : {
            teacherId: formData.teacherId,
            designation: formData.designation,
            specialization: formData.specialization,
            experience: formData.experience,
            status: "pending", 
          }),
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Registration failed ");
        setIsLoading(false);
        return;
      }
      if (role === "teacher") {
        toast.success(
          "Submitted successfully ✅ Your account is pending approval",
        );
      } else {
        toast.success("Account created successfully 🎉");
      }
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      toast.error("Network error! Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/images/hero-students.jpg"
          alt="BUCSE"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-primary/75" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-12 text-white">
          <Image
            src={logo}
            alt="BUCSE Logo"
            width={60}
            height={34}
            className="object-contain"
          />
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
            BUCSE
          </h1>
          <p className="text-xl max-w-md opacity-90 font-light">
            Empowering the next generation of Computer Science excellence.
          </p>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto bg-slate-50/30">
        <Card className="w-full max-w-2xl border-none shadow-none lg:border lg:shadow-xl lg:bg-card">
          <CardHeader className="text-center pb-2">
            <Link
              href="/"
              className="mx-auto mb-6 flex justify-center items-center gap-2"
            >
              <div className=" p-2.5 rounded-xl shadow-lg shadow-primary/20">
                <Image
                  src={logo}
                  alt="BUCSE Logo"
                  width={34}
                  height={34}
                  className="object-contain"
                />
              </div>
              <span className="text-3xl font-black tracking-tighter text-primary italic">
                BUCSE
              </span>
            </Link>
            <CardTitle className="text-2xl font-bold">
              {step === 1
                ? "Choose Your Identity"
                : `${role.charAt(0).toUpperCase() + role.slice(1)} Profile`}
            </CardTitle>
            <CardDescription className="text-base">
              {step === 1
                ? "Select how you'll be using the platform"
                : "Fill in your academic/professional details"}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {/* STEP 1: ROLE SELECTION */}
            {step === 1 && (
              <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                <RadioGroup
                  defaultValue="student"
                  onValueChange={(v) => setRole(v as any)}
                  className="grid grid-cols-2 gap-6"
                >
                  <Label htmlFor="s-role" className="cursor-pointer group">
                    <RadioGroupItem
                      value="student"
                      id="s-role"
                      className="sr-only"
                    />
                    <div
                      className={`h-full p-8 border-2 rounded-2xl flex flex-col items-center text-center gap-4 transition-all duration-300 shadow-sm hover:shadow-md ${role === "student" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-muted bg-white opacity-80"}`}
                    >
                      <div
                        className={`p-4 rounded-full transition-colors ${role === "student" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                      >
                        <GraduationCap className="h-10 w-10" />
                      </div>
                      <div>
                        <span className="text-xl font-bold block mb-1">
                          Student
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Access resources & track results
                        </p>
                      </div>
                    </div>
                  </Label>

                  <Label htmlFor="t-role" className="cursor-pointer group">
                    <RadioGroupItem
                      value="teacher"
                      id="t-role"
                      className="sr-only"
                    />
                    <div
                      className={`h-full p-8 border-2 rounded-2xl flex flex-col items-center text-center gap-4 transition-all duration-300 shadow-sm hover:shadow-md ${role === "teacher" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-muted bg-white opacity-80"}`}
                    >
                      <div
                        className={`p-4 rounded-full transition-colors ${role === "teacher" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                      >
                        <BriefcaseBusiness className="h-10 w-10" />
                      </div>
                      <div>
                        <span className="text-xl font-bold block mb-1">
                          Teacher
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Manage courses & guide students
                        </p>
                      </div>
                    </div>
                  </Label>
                </RadioGroup>

                <div className="space-y-6">
                  <Button
                    onClick={() => setStep(2)}
                    className="w-full py-7 text-xl font-semibold group rounded-xl shadow-lg"
                  >
                    Continue{" "}
                    <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-primary font-bold hover:underline underline-offset-4"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
            )}
