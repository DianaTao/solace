"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "./ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/Card"
import { Input } from "./ui/Input"
import { Label } from "./ui/Label"
import { Separator } from "./ui/Separator"
import { ClipboardList, Eye, EyeOff, Heart, Shield, Users } from "lucide-react"
import styles from "./ArtisticAuth.module.css"

export default function LoginPage({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  isLoading, 
  onLogin, 
  onSwitchToSignup 
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={styles.container}>
      {/* Artistic Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.backgroundBlob1}></div>
        <div className={styles.backgroundBlob2}></div>
        <div className={styles.backgroundBlob3}></div>

        {/* Floating Icons */}
        <div className={`${styles.floatingIcon1} ${styles.login}`}>
          <Heart className="h-8 w-8" />
        </div>
        <div className={`${styles.floatingIcon2} ${styles.login}`}>
          <Shield className="h-6 w-6" />
        </div>
        <div className={`${styles.floatingIcon3} ${styles.login}`}>
          <Users className="h-10 w-10" />
        </div>
      </div>

      <div className={styles.mainLayout}>
        {/* Left Side - Artistic Hero Section */}
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.heroLogoContainer}>
              <div className={`${styles.heroLogoGlow} ${styles.login}`}></div>
              <div className={styles.heroLogoBg}>
                <ClipboardList className={`${styles.heroLogoIcon} ${styles.login}`} />
              </div>
            </div>

            <div className={styles.heroTextContent}>
              <h1 className={`${styles.heroTitle} ${styles.login}`}>
                Welcome to Solace
              </h1>
              <p className={styles.heroDescription}>
                Empowering social workers with intuitive tools to make a meaningful difference in people's lives.
              </p>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroStatCard}>
                <div className={`${styles.heroStatValue} ${styles.login}`}>10K+</div>
                <div className={styles.heroStatLabel}>Social Workers</div>
              </div>
              <div className={styles.heroStatCard}>
                <div className={`${styles.heroStatValue} ${styles.purple}`}>50K+</div>
                <div className={styles.heroStatLabel}>Cases Managed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className={styles.formSection}>
          <div className={styles.formContainer}>
            {/* Mobile Logo */}
            <div className={styles.mobileLogoContainer}>
              <div className={styles.mobileLogoIconContainer}>
                <div className={`${styles.mobileLogoGlow} ${styles.login}`}></div>
                <div className={styles.mobileLogoBg}>
                  <ClipboardList className={`${styles.mobileLogoIcon} ${styles.login}`} />
                </div>
              </div>
              <h1 className={`${styles.mobileLogoText} ${styles.login}`}>
                Solace
              </h1>
            </div>

            <Card className={styles.formCard}>
              <div className={`${styles.formCardTopBorder} ${styles.login}`}></div>

              <CardHeader className={styles.formHeader}>
                <CardTitle className={styles.formTitle}>Welcome back</CardTitle>
                <CardDescription className={styles.formDescription}>
                  Continue your journey of making a difference
                </CardDescription>
              </CardHeader>

              <form onSubmit={onLogin}>
                <CardContent className={styles.formContent}>
                  <div className={styles.formGroup}>
                    <Label htmlFor="email" className={styles.formLabel}>
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className={`${styles.formInput} ${styles.login}`}
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
                        placeholder="Enter your password"
                        className={`${styles.formInput} ${styles.login}`}
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

                  
                </CardContent>

                <CardFooter className={styles.formFooter}>
                  <Button
                    type="submit"
                    className={`${styles.primaryButton} ${styles.login}`}
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>

                
                </CardFooter>
              </form>
            </Card>

            <div className={styles.switchText}>
              <span className={styles.switchTextLabel}>Don't have an account? </span>
              <button 
                type="button"
                onClick={onSwitchToSignup}
                className={styles.switchLink}
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