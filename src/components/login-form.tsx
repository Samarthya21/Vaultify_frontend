"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react"

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLoading(false)
    console.log("Login attempt:", formData)
  }

  const getInputIcon = (field: string, hasError: boolean) => {
    if (hasError) {
      return <AlertCircle className="h-4 w-4 text-destructive" />
    }
    if (formData[field as keyof typeof formData] && !hasError) {
      return <CheckCircle className="h-4 w-4 text-primary" />
    }
    return field === "email" ? (
      <Mail className="h-4 w-4 text-muted-foreground" />
    ) : (
      <Lock className="h-4 w-4 text-muted-foreground" />
    )
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl font-bold text-balance">Welcome Back</CardTitle>
        <CardDescription className="text-base">Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`pl-10 ${errors.email ? "border-destructive focus-visible:ring-destructive" : formData.email && !errors.email ? "border-primary focus-visible:ring-primary" : ""}`}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">{getInputIcon("email", !!errors.email)}</div>
            </div>
            {errors.email && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`pl-10 pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : formData.password && !errors.password ? "border-primary focus-visible:ring-primary" : ""}`}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {getInputIcon("password", !!errors.password)}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 font-medium">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full font-semibold" size="lg" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/signup" className="text-primary hover:text-primary/80 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
