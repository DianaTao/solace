'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '../lib/auth';
import logger from '../lib/logger';
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Sheet, SheetContent, SheetTrigger } from './ui/Sheet';
import { Progress } from './ui/Progress';
import {
  Bell,
  CheckSquare,
  ClipboardList,
  FileText,
  Heart,
  Home,
  Menu,
  PieChart,
  Search,
  Shield,
  Sparkles,
  Target,
  Users,
  Plus,
  TrendingUp,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import ClientManagement from './ClientManagement';
import ReportsScreen from './ReportsScreen';
import TasksScreen from './TasksScreen';

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate);
    }, 500); // Delay start

    return () => {
      clearTimeout(timer);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export default function HomeScreen({ user, onLogout }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    logger.info(`Enhanced Dashboard HomeScreen initialized for user: ${user?.email}`, 'UI');
    setIsLoaded(true);
  }, [user?.email]);

  const handleLogout = async () => {
    if (confirm('🚪 Are you sure you want to sign out?')) {
      setIsLoading(true);
      try {
        await AuthService.signOut();
        logger.success('User signed out from Enhanced Dashboard', 'UI');
        onLogout();
      } catch (error) {
        logger.error('Logout error', error, 'UI');
        alert('Error: Failed to sign out. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleComingSoon = (feature) => {
    alert(`🚧 Coming Soon!\n\nThe ${feature} feature is being developed. Stay tuned for updates!`);
  };

  const handleNavigateTo = (page) => {
    setCurrentPage(page);
  };

  const handleCreateCustomReport = () => {
    if (confirm('Create Custom Report\n\nChoose the type of report you want to generate:\n\nClick OK for Monthly Report or Cancel to choose Quarterly Report')) {
      // Navigate to reports page and trigger monthly report generation
      setCurrentPage('reports');
      // We'll pass a parameter to indicate we want to auto-generate a monthly report
      // This will be handled by the ReportsScreen component
    } else {
      // Ask about quarterly report
      if (confirm('Would you like to generate a Quarterly Report instead?')) {
        // Navigate to reports page and trigger quarterly report generation
        setCurrentPage('reports');
        // We'll pass a parameter to indicate we want to auto-generate a quarterly report
        // This will be handled by the ReportsScreen component
      }
    }
  };

  const userName = user?.name || 'Sarah';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase() || 'SW';

  // If we're on the client management page, render that component
  if (currentPage === 'clients') {
    return <ClientManagement user={user} onBack={() => setCurrentPage('dashboard')} />;
  }

  // If we're on the tasks page, render that component
  if (currentPage === 'tasks') {
    return <TasksScreen user={user} onBack={() => setCurrentPage('dashboard')} showCreateTask={false} />;
  }
  
  // If we're on the tasks page with create flag, show the create modal
  if (currentPage === 'tasks?create=true') {
    return <TasksScreen user={user} onBack={() => setCurrentPage('dashboard')} showCreateTask={true} />;
  }

  // If we're on the reports page, render that component
  if (currentPage === 'reports') {
    return <ReportsScreen user={user} onBack={() => setCurrentPage('dashboard')} />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Enhanced Artistic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-40 h-40 md:w-80 md:h-80 md:-top-40 md:-left-40 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-20 -right-20 w-48 h-48 md:w-96 md:h-96 md:-bottom-40 md:-right-40 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 md:w-32 md:h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-bounce-slow animation-delay-500"></div>

        {/* Enhanced Floating Icons */}
        <div className="hidden md:block absolute top-20 left-20 text-emerald-300/30 animate-float-gentle">
          <Heart className="h-8 w-8 animate-pulse-gentle" />
        </div>
        <div className="absolute top-32 right-8 md:top-40 md:right-32 text-teal-300/30 animate-float-gentle animation-delay-1000">
          <Shield className="h-4 w-4 md:h-6 md:w-6 animate-pulse-gentle" />
        </div>
        <div className="hidden md:block absolute bottom-32 left-32 text-cyan-300/30 animate-float-gentle animation-delay-2000">
          <Sparkles className="h-10 w-10 animate-spin-slow" />
        </div>
        <div className="absolute top-1/2 right-4 md:right-20 text-emerald-300/30 animate-float-gentle animation-delay-500">
          <Target className="h-5 w-5 md:h-7 md:w-7 animate-pulse-gentle" />
        </div>
        <div className="hidden md:block absolute top-1/4 left-1/3 text-purple-300/20 animate-float-gentle animation-delay-1500">
          <TrendingUp className="h-6 w-6 animate-pulse-gentle" />
        </div>
      </div>

      {/* Animated Header */}
      <header
        className={`sticky top-0 z-20 flex h-14 md:h-16 items-center gap-3 md:gap-4 border-b border-white/20 bg-white/80 backdrop-blur-sm px-3 md:px-6 shadow-lg transition-all duration-700 ${isLoaded ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
      >
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 h-8 w-8 md:h-10 md:w-10 bg-white/70 border-white/30 hover:bg-white/90 hover:scale-110 transition-all duration-200 hover:shadow-lg"
            >
              <Menu className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-200 hover:rotate-180" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col bg-white/90 backdrop-blur-sm border-white/20 w-72">
            <div className="flex items-center gap-2 mb-6 pt-4 animate-slide-in-left">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full blur-sm opacity-30 animate-pulse-gentle"></div>
                <ClipboardList className="relative h-6 w-6 text-emerald-600 animate-bounce-gentle" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Solace
              </span>
            </div>
            <nav className="grid gap-2 text-base font-medium">
              {[
                { icon: Home, label: "Dashboard", page: "dashboard" },
                { icon: Users, label: "Clients", page: "clients" },
                { icon: FileText, label: "Case Notes", page: "case-notes" },
                { icon: CheckSquare, label: "Tasks", page: "tasks" },
                { icon: PieChart, label: "Reports", page: "reports" },
              ].map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.page === 'clients') {
                      handleNavigateTo('clients');
                    } else if (item.page === 'dashboard') {
                      handleNavigateTo('dashboard');
                    } else if (item.page === 'reports') {
                      handleNavigateTo('reports');
                    } else if (item.page === 'tasks') {
                      handleNavigateTo('tasks');
                    } else {
                      handleComingSoon(item.label);
                    }
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-300 hover:scale-105 animate-slide-in-left text-left ${
                    currentPage === item.page
                      ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 border border-emerald-200/50 shadow-sm"
                      : "text-gray-600 hover:bg-white/50 hover:text-emerald-700 hover:shadow-md"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <item.icon className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                  {item.label}
                </button>
              ))}
            </nav>
            
            {/* Logout Button in Menu */}
            <div className="mt-auto pt-4 border-t border-white/20">
              <Button
                onClick={handleLogout}
                disabled={isLoading}
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-all duration-300"
              >
                {isLoading ? 'Signing Out...' : '🚪 Sign Out'}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Animated Logo */}
        <div className="flex items-center gap-2 animate-slide-in-left animation-delay-200">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full blur-sm opacity-30 animate-pulse-gentle group-hover:opacity-50 transition-opacity duration-300"></div>
            <ClipboardList className="relative h-5 w-5 md:h-6 md:w-6 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent hover:from-emerald-500 hover:to-teal-500 transition-all duration-300">
            Solace
          </span>
        </div>

        {/* Animated Header Actions */}
        <div className="ml-auto flex items-center gap-2 animate-slide-in-right animation-delay-300">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 md:h-10 md:w-10 bg-white/70 border-white/30 hover:bg-white/90 hover:scale-110 transition-all duration-200 hover:shadow-lg"
          >
            <Search className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-200 hover:scale-110" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 md:h-10 md:w-10 bg-white/70 border-white/30 hover:bg-white/90 hover:scale-110 transition-all duration-200 hover:shadow-lg relative"
          >
            <Bell className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-200 hover:rotate-12" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </Button>
          <Avatar 
            className="h-8 w-8 md:h-10 md:w-10 ring-2 ring-emerald-200/50 hover:ring-emerald-300/70 transition-all duration-300 hover:scale-110 cursor-pointer"
            onClick={handleLogout}
          >
            <AvatarImage src="/placeholder-user.jpg" alt="User" />
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Animated Main Content */}
      <main
        className={`flex-1 p-3 md:p-6 relative z-10 transition-all duration-1000 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
      >
        <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
          {/* Animated Welcome Section */}
          <div
            className={`space-y-1 md:space-y-2 transition-all duration-800 animation-delay-400 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent animate-gradient-x">
              Welcome back, {userName}
            </h1>
            <p className="text-gray-600 text-sm md:text-lg flex items-center gap-2">
              <Clock className="h-4 w-4 animate-pulse-gentle" />
              Here's an overview of your work today.
            </p>
          </div>

          {/* Animated Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {[
              { title: "Active Clients", value: 42, suffix: "", gradient: "from-emerald-600 to-teal-600", delay: 0 },
              { title: "Pending Tasks", value: 12, suffix: "", gradient: "from-cyan-600 to-blue-600", delay: 100 },
              { title: "Case Notes", value: 128, suffix: "", gradient: "from-teal-600 to-emerald-600", delay: 200 },
              { title: "Reports Due", value: 5, suffix: "", gradient: "from-purple-600 to-pink-600", delay: 300 },
            ].map((stat, index) => (
              <Card
                key={stat.title}
                className={`bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 group animate-slide-in-up`}
                style={{ animationDelay: `${600 + stat.delay}ms` }}
              >
                <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
                  <div
                    className={`text-xl md:text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}
                  >
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 animate-bounce-gentle" />+
                    {Math.floor(stat.value * 0.1)} this week
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Animated Feature Cards */}
          <div className="space-y-4 md:space-y-6">
            {/* Clients Card */}
            <Card
              className={`bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group animate-slide-in-up animation-delay-1000`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-gradient-x"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg md:text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent group-hover:from-emerald-500 group-hover:to-teal-500 transition-all duration-300">
                    👥 Clients
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">
                    Manage client records
                  </CardDescription>
                </div>
                <Button 
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs md:text-sm px-3 py-1 md:px-4 md:py-2 hover:scale-105"
                  onClick={() => handleNavigateTo('clients')}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    name: "John Doe",
                    case: "4209",
                    time: "2d ago",
                    avatar: "JD",
                    gradient: "from-emerald-500 to-teal-500",
                  },
                  {
                    name: "Alice Smith",
                    case: "4183",
                    time: "3d ago",
                    avatar: "AS",
                    gradient: "from-teal-500 to-cyan-500",
                  },
                ].map((client, index) => (
                  <div
                    key={client.case}
                    className={`flex items-center gap-3 p-2 md:p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/30 hover:bg-white/70 transition-all duration-300 hover:scale-105 hover:shadow-md animate-slide-in-left`}
                    style={{ animationDelay: `${1200 + index * 100}ms` }}
                  >
                    <Avatar className="h-8 w-8 md:h-10 md:w-10 ring-2 ring-emerald-200/50 hover:ring-emerald-300/70 transition-all duration-300 hover:scale-110">
                      <AvatarFallback
                        className={`bg-gradient-to-br ${client.gradient} text-white text-xs animate-pulse-gentle`}
                      >
                        {client.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate hover:text-emerald-700 transition-colors duration-300">
                        {client.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Case #{client.case} • {client.time}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-300 text-xs px-2 py-1 hover:scale-105"
                      onClick={() => handleComingSoon('Client Details')}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="pt-4">
                <Button
                  variant="outline"
                  className="w-full border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all duration-300 text-sm hover:scale-105 hover:shadow-md"
                  onClick={() => handleNavigateTo('clients')}
                >
                  <Plus className="mr-2 h-4 w-4 transition-transform duration-300 hover:rotate-90" />
                  Add New Client
                </Button>
              </CardFooter>
            </Card>

            {/* Tasks Card with Progress */}
            <Card
              className={`bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group animate-slide-in-up animation-delay-1200`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-gradient-x"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg md:text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent group-hover:from-cyan-500 group-hover:to-blue-500 transition-all duration-300">
                    ✅ Tasks
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">
                    Track your to-dos
                  </CardDescription>
                </div>
                <Button 
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs md:text-sm px-3 py-1 md:px-4 md:py-2 hover:scale-105"
                  onClick={() => handleNavigateTo('tasks')}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    task: "Call John Doe about job placement",
                    due: "Due today at 2:00 PM",
                    priority: "high",
                    progress: 75,
                  },
                  {
                    task: "Submit housing application",
                    due: "Due tomorrow at 9:00 AM",
                    priority: "medium",
                    progress: 30,
                  },
                ].map((task, index) => (
                  <div
                    key={index}
                    className={`p-2 md:p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/30 hover:bg-white/70 transition-all duration-300 hover:scale-105 hover:shadow-md animate-slide-in-right`}
                    style={{ animationDelay: `${1400 + index * 100}ms` }}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className={`rounded-full p-1.5 md:p-2 mt-0.5 ${
                          task.priority === "high" ? "bg-red-500/20" : "bg-yellow-500/20"
                        }`}
                      >
                        <CheckSquare
                          className={`h-3 w-3 md:h-4 md:w-4 ${
                            task.priority === "high" ? "text-red-600" : "text-yellow-600"
                          } animate-pulse-gentle`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 hover:text-cyan-700 transition-colors duration-300">
                          {task.task}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">{task.due}</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Progress</span>
                            <span className="text-gray-700 font-medium">{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-1.5 animate-pulse-gentle" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="pt-4">
                <Button
                  variant="outline"
                  className="w-full border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300 transition-all duration-300 text-sm hover:scale-105 hover:shadow-md"
                  onClick={() => handleNavigateTo('tasks?create=true')}
                >
                  <Plus className="mr-2 h-4 w-4 transition-transform duration-300 hover:rotate-90" />
                  Add New Task
                </Button>
              </CardFooter>
            </Card>

            {/* Case Notes Card */}
            <Card
              className={`bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group animate-slide-in-up animation-delay-1400`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 animate-gradient-x"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg md:text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent group-hover:from-teal-500 group-hover:to-cyan-500 transition-all duration-300">
                    📋 Case Notes
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">
                    Document case progress
                  </CardDescription>
                </div>
                <Button 
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs md:text-sm px-3 py-1 md:px-4 md:py-2 hover:scale-105"
                  onClick={() => handleComingSoon('Case Notes')}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    client: "Alice Smith - Housing",
                    time: "Today",
                    note: "Completed housing application. Waiting for approval from county office.",
                  },
                  {
                    client: "John Doe - Employment",
                    time: "Yesterday",
                    note: "Attended job interview. Follow-up scheduled for next week.",
                  },
                ].map((note, index) => (
                  <div
                    key={index}
                    className={`p-2 md:p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/30 hover:bg-white/70 transition-all duration-300 hover:scale-105 hover:shadow-md animate-slide-in-left`}
                    style={{ animationDelay: `${1600 + index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-gray-800 text-sm truncate hover:text-teal-700 transition-colors duration-300">
                        {note.client}
                      </div>
                      <div className="text-xs text-gray-500 ml-2 flex items-center gap-1">
                        <Clock className="h-3 w-3 animate-pulse-gentle" />
                        {note.time}
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 line-clamp-2 hover:text-gray-700 transition-colors duration-300">
                      {note.note}
                    </p>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="pt-4">
                <Button
                  variant="outline"
                  className="w-full border-teal-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition-all duration-300 text-sm hover:scale-105 hover:shadow-md"
                  onClick={() => handleComingSoon('Add Case Note')}
                >
                  <Plus className="mr-2 h-4 w-4 transition-transform duration-300 hover:rotate-90" />
                  Add New Note
                </Button>
              </CardFooter>
            </Card>

            {/* Reports Card */}
            <Card
              className={`bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group animate-slide-in-up animation-delay-1600`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 animate-gradient-x"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300">
                    📊 Reports
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">
                    Generate reports
                  </CardDescription>
                </div>
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs md:text-sm px-3 py-1 md:px-4 md:py-2 hover:scale-105"
                  onClick={() => handleNavigateTo('reports')}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    title: "Monthly Case Summary",
                    due: "Due in 5 days",
                    gradient: "from-purple-500/20 to-pink-500/20",
                    color: "text-purple-600",
                  },
                  {
                    title: "Quarterly Outcomes",
                    due: "Due in 2 weeks",
                    gradient: "from-pink-500/20 to-rose-500/20",
                    color: "text-pink-600",
                  },
                ].map((report, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-2 md:p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/30 hover:bg-white/70 transition-all duration-300 hover:scale-105 hover:shadow-md animate-slide-in-right`}
                    style={{ animationDelay: `${1800 + index * 100}ms` }}
                  >
                    <div className={`rounded-full bg-gradient-to-br ${report.gradient} p-2 animate-pulse-gentle`}>
                      <PieChart className={`h-4 w-4 md:h-5 md:w-5 ${report.color} animate-spin-slow`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 hover:text-purple-700 transition-colors duration-300">
                        {report.title}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3 animate-pulse-gentle" />
                        {report.due}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-purple-50 hover:text-purple-700 transition-all duration-300 text-xs px-2 py-1 hover:scale-105"
                      onClick={() => handleNavigateTo('reports')}
                    >
                      Generate
                    </Button>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="pt-4">
                <Button
                  variant="outline"
                  className="w-full border-purple-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-all duration-300 text-sm hover:scale-105 hover:shadow-md"
                  onClick={handleCreateCustomReport}
                >
                  <Plus className="mr-2 h-4 w-4 transition-transform duration-300 hover:rotate-90" />
                  Create Custom Report
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 