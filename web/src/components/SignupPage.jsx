"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "./ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/Card"
import { Input } from "./ui/Input"
import { Label } from "./ui/Label"
import { Separator } from "./ui/Separator"
import { ClipboardList, Eye, EyeOff, UserPlus, Shield, Sparkles } from "lucide-react"
import styles from "./ArtisticAuth.module.css"

export default function SignupPage({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  confirmPassword, 
  setConfirmPassword, 
  name, 
  setName, 
  isLoading, 
  onSignup, 
  onSwitchToLogin 
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className={`${styles.container} ${styles.containerSignup}`}>
      {/* Artistic Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.backgroundBlob1Signup}></div>
        <div className={styles.backgroundBlob2Signup}></div>
        <div className={styles.backgroundBlob3Signup}></div>

        {/* Floating Icons */}
        <div className={`${styles.floatingIcon1} ${styles.signup}`}>
          <UserPlus className="h-8 w-8" />
        </div>
        <div className={`${styles.floatingIcon2} ${styles.signup}`}>
          <Shield className="h-6 w-6" />
        </div>
        <div className={`${styles.floatingIcon3} ${styles.signup}`}>
          <Sparkles className="h-10 w-10" />
        </div>
      </div>

      <div className={styles.mainLayout}>
        {/* Left Side - Artistic Hero Section */}
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.heroLogoContainer}>
              <div className={`${styles.heroLogoGlow} ${styles.signup}`}></div>
              <div className={styles.heroLogoBg}>
                <ClipboardList className={`${styles.heroLogoIcon} ${styles.signup}`} />
              </div>
            </div>

            <div className={styles.heroTextContent}>
              <h1 className={`${styles.heroTitle} ${styles.signup}`}>
                Join Solace Today
              </h1>
              <p className={styles.heroDescription}>
                Start your journey as a social worker with our comprehensive platform designed to streamline your workflow and amplify your impact.
              </p>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroFeatureCard}>
                <div className={styles.heroFeatureHeader}>
                  <div className={`${styles.heroFeatureDot} ${styles.emerald}`}></div>
                  <div className={styles.heroFeatureTitle}>Secure & Private</div>
                </div>
                <p className={styles.heroFeatureDescription}>
                  HIPAA-compliant platform with end-to-end encryption
                </p>
              </div>
              <div className={styles.heroFeatureCard}>
                <div className={styles.heroFeatureHeader}>
                  <div className={`${styles.heroFeatureDot} ${styles.teal}`}></div>
                  <div className={styles.heroFeatureTitle}>Easy Setup</div>
                </div>
                <p className={styles.heroFeatureDescription}>
                  Get started in minutes with our intuitive onboarding
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className={styles.formSection}>
          <div className={styles.formContainer}>
            {/* Mobile Logo */}
            <div className={styles.mobileLogoContainer}>
              <div className={styles.mobileLogoIconContainer}>
                <div className={`${styles.mobileLogoGlow} ${styles.signup}`}></div>
                <div className={styles.mobileLogoBg}>
                  <ClipboardList className={`${styles.mobileLogoIcon} ${styles.signup}`} />
                </div>
              </div>
              <h1 className={`${styles.mobileLogoText} ${styles.signup}`}>
                Solace
              </h1>
            </div>

            <Card className={styles.formCard}>
              <div className={`${styles.formCardTopBorder} ${styles.signup}`}></div>

              <CardHeader className={`${styles.formHeader} ${styles.formHeaderSignup}`}>
                <CardTitle className={styles.formTitle}>Create your account</CardTitle>
                <CardDescription className={styles.formDescription}>
                  Join thousands of social workers making a difference
                </CardDescription>
              </CardHeader>

              <form onSubmit={onSignup}>
                <CardContent className={`${styles.formContent} ${styles.formContentSignup}`}>
                  <div className={styles.formGroup}>
                    <Label htmlFor="name" className={styles.formLabel}>
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className={`${styles.formInput} ${styles.signup}`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <Label htmlFor="email" className={styles.formLabel}>
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className={`${styles.formInput} ${styles.signup}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <Label htmlFor="password" className={styles.formLabel}>
                      Password
                    </Label>
                    <div className={styles.passwordContainer}>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className={`${styles.formInput} ${styles.signup}`}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={styles.passwordToggle}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className={styles.passwordIcon} />
                        ) : (
                          <Eye className={styles.passwordIcon} />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <Label htmlFor="confirmPassword" className={styles.formLabel}>
                      Confirm Password
                    </Label>
                    <div className={styles.passwordContainer}>
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className={`${styles.formInput} ${styles.signup}`}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={styles.passwordToggle}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className={styles.passwordIcon} />
                        ) : (
                          <Eye className={styles.passwordIcon} />
                        )}
                      </Button>
                    </div>
                  </div>


                </CardContent>

                <CardFooter className={styles.formFooter}>
                  <Button
                    type="submit"
                    className={`${styles.primaryButton} ${styles.signup}`}
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>

                
                </CardFooter>
              </form>
            </Card>

            <div className={styles.switchText}>
              <span className={styles.switchTextLabel}>Already have an account? </span>
              <button 
                type="button"
                onClick={onSwitchToLogin}
                className={`${styles.switchLink} ${styles.signup}`}
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