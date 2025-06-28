"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "./ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/Card"
import { Input } from "./ui/Input"
import { Label } from "./ui/Label"
import { Separator } from "./ui/Separator"
import { ClipboardList, Eye, EyeOff, Heart, Shield, Users, Sparkles, UserPlus } from "lucide-react"
import { AuthService } from "../lib/auth"
import logger from "../lib/logger"

export default function SignupPage({ onSignup, onSwitchToLogin }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    // Validation
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      logger.info('Attempting signup', 'SignupPage')
      const result = await AuthService.signUp(formData.email, formData.password, {
        name: formData.name,
        role: 'social_worker'
      })

      if (result.user) {
        logger.success(`Signup successful: ${result.user.email}`, 'SignupPage')
        setErrors({ 
          success: 'Account created successfully! Please check your email for a confirmation link before signing in.' 
        })
        
        // Clear form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        })
        
        // Switch to login after a delay
        setTimeout(() => {
          onSwitchToLogin()
        }, 3000)
      }
    } catch (error) {
      logger.error('Signup failed', error, 'SignupPage')
      
      // Set user-friendly error messages
      if (error.message.includes('User already registered')) {
        setErrors({ submit: 'An account with this email already exists. Please try signing in instead.' })
      } else if (error.message.includes('Invalid email')) {
        setErrors({ email: 'Please enter a valid email address.' })
      } else {
        setErrors({ submit: 'Failed to create account. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
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
                <UserPlus className="h-16 w-16 text-emerald-600 mx-auto" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Join Solace Today
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Start your journey as a social worker with powerful tools designed to help you make a difference.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                <div className="text-2xl font-bold text-emerald-600">Free</div>
                <div className="text-sm text-gray-600">To Get Started</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                <div className="text-2xl font-bold text-teal-600">24/7</div>
                <div className="text-sm text-gray-600">Support Available</div>
              </div>
            </div>

            {/* Benefits */}
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

        {/* Right Side - Signup Form */}
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
                <CardTitle className="text-2xl text-center font-bold text-gray-800">Create your account</CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Join thousands of social workers making a difference
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

                  {/* Success Message */}
                  {errors.success && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-700 text-sm">{errors.success}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className={`bg-white/70 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200 ${
                        errors.name ? 'border-red-300' : ''
                      }`}
                      required
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`bg-white/70 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200 ${
                        errors.email ? 'border-red-300' : ''
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
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        className={`bg-white/70 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200 pr-10 ${
                          errors.password ? 'border-red-300' : ''
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        className={`bg-white/70 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200 pr-10 ${
                          errors.confirmPassword ? 'border-red-300' : ''
                        }`}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 mt-1"
                      required
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                      I agree to the <button type="button" className="text-emerald-600 hover:text-emerald-700">Terms of Service</button> and <button type="button" className="text-emerald-600 hover:text-emerald-700">Privacy Policy</button>
                    </Label>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 pt-6">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or sign up with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-200 hover:bg-gray-50 transition-all duration-200"
                    size="lg"
                    onClick={() => console.log('Google signup not yet implemented')}
                disabled
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign up with Google
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <button 
                onClick={onSwitchToLogin}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 