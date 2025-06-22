"use client"

import { useState } from "react"
import { Button } from "./ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/Card"
import { Input } from "./ui/Input"
import { Label } from "./ui/Label"
import { Separator } from "./ui/Separator"
import { ClipboardList, Eye, EyeOff, Heart, Shield, Users, Sparkles } from "lucide-react"
import { AuthService } from "../lib/auth"
import logger from "../lib/logger"

export default function LoginPage({ onLogin, onSwitchToSignup }) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    
    // Validation
    const newErrors = {}
    if (!email) newErrors.email = "Email is required"
    if (!password) newErrors.password = "Password is required"
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      logger.info("Attempting login", "LoginPage")
      const result = await AuthService.signIn({ email, password })
      
      if (result.user) {
        logger.success(`Login successful: ${result.user.email}`, "LoginPage")
        onLogin(result.user)
      }
    } catch (error) {
      logger.error("Login failed", error, "LoginPage")
      
      // Set user-friendly error messages
      if (error.message.includes("Invalid login credentials")) {
        setErrors({ submit: "Invalid email or password. Please check your credentials." })
      } else if (error.message.includes("Email not confirmed")) {
        setErrors({ submit: "Please check your email and click the confirmation link before signing in." })
      } else {
        setErrors({ submit: "Login failed. Please try again." })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setEmail("demo@solace.app")
    setPassword("demo123")
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Artistic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-bounce delay-500"></div>

        {/* Floating Icons */}
        <div className="absolute top-20 left-20 text-emerald-300/30 animate-float">
          <Heart className="h-8 w-8" />
        </div>
        <div className="absolute top-40 right-32 text-teal-300/30 animate-float delay-1000">
          <Shield className="h-6 w-6" />
        </div>
        <div className="absolute bottom-32 left-32 text-cyan-300/30 animate-float delay-2000">
          <Users className="h-10 w-10" />
        </div>
        <div className="absolute top-1/3 right-20 text-purple-300/20 animate-float delay-1500">
          <Sparkles className="h-8 w-8" />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Artistic Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-center">
          <div className="max-w-md space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-full p-8 shadow-2xl">
                <ClipboardList className="h-16 w-16 text-emerald-600 mx-auto" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Welcome to Solace
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Empowering social workers with intuitive tools to make a meaningful difference in people's lives.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                <div className="text-2xl font-bold text-emerald-600">10K+</div>
                <div className="text-sm text-gray-600">Social Workers</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                <div className="text-2xl font-bold text-teal-600">50K+</div>
                <div className="text-sm text-gray-600">Cases Managed</div>
              </div>
            </div>

            {/* Additional Features */}
            <div className="space-y-3 pt-8">
              <div className="flex items-center space-x-3 text-left">
                <div className="bg-emerald-100 rounded-full p-2">
                  <ClipboardList className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-gray-600">Comprehensive case management</span>
              </div>
              <div className="flex items-center space-x-3 text-left">
                <div className="bg-teal-100 rounded-full p-2">
                  <Users className="h-4 w-4 text-teal-600" />
                </div>
                <span className="text-gray-600">Client relationship tracking</span>
              </div>
              <div className="flex items-center space-x-3 text-left">
                <div className="bg-cyan-100 rounded-full p-2">
                  <Shield className="h-4 w-4 text-cyan-600" />
                </div>
                <span className="text-gray-600">Secure and HIPAA compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full blur-xl opacity-30"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl">
                  <ClipboardList className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Solace
              </h1>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

              <CardHeader className="space-y-1 pb-8">
                <CardTitle className="text-2xl text-center font-bold text-gray-800">Welcome back</CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Continue your journey of making a difference
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{errors.submit}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`bg-white/70 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200 ${
                        errors.email ? "border-red-300" : ""
                      }`}
                      required
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`bg-white/70 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200 pr-10 ${
                          errors.password ? "border-red-300" : ""
                        }`}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-red-600 text-sm">{errors.password}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember"
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <Label htmlFor="remember" className="text-sm text-gray-600">
                        Remember me
                      </Label>
                    </div>
                    <button 
                      type="button"
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      onClick={() => alert("Password reset functionality coming soon!")}
                    >
                      Forgot password?
                    </button>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 pt-6">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or try demo</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-200 hover:bg-gray-50 transition-all duration-200"
                    size="lg"
                    onClick={handleDemoLogin}
                  >
                    <ClipboardList className="mr-2 h-4 w-4 text-emerald-600" />
                    Try Demo Account
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <button 
                onClick={onSwitchToSignup}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 