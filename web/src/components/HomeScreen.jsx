'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '../lib/auth';
import logger from '../lib/logger';
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Sheet, SheetContent, SheetTrigger } from './ui/Sheet';
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
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import styles from './ArtisticDashboard.module.css';

export default function HomeScreen({ user, onLogout }) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    logger.info(`Dashboard HomeScreen initialized for user: ${user?.email}`, 'UI');
  }, [user?.email]);

  const handleLogout = async () => {
    if (confirm('🚪 Are you sure you want to sign out?')) {
      setIsLoading(true);
      try {
        await AuthService.signOut();
        logger.success('User signed out from Dashboard', 'UI');
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

  // Mock data for demonstration
  const stats = [
    { title: 'Active Clients', value: '42', change: '+2 this week' },
    { title: 'Pending Tasks', value: '12', change: '3 due today' },
    { title: 'Case Notes', value: '128', change: '+8 this week' },
    { title: 'Reports Due', value: '5', change: '2 due this week' }
  ];

  const clients = [
    { name: 'John Doe', case: '4209', updated: '2d ago', initials: 'JD' },
    { name: 'Alice Smith', case: '4183', updated: '3d ago', initials: 'AS' },
    { name: 'Robert Johnson', case: '4172', updated: '5d ago', initials: 'RJ' }
  ];

  const caseNotes = [
    {
      title: 'Alice Smith - Housing Assistance',
      date: 'Today',
      content: 'Completed housing application. Waiting for approval from county office.'
    },
    {
      title: 'John Doe - Employment Support',
      date: 'Yesterday',
      content: 'Attended job interview. Follow-up scheduled for next week.'
    },
    {
      title: 'Robert Johnson - Mental Health',
      date: '3 days ago',
      content: 'Therapy session completed. Showing improvement in coping strategies.'
    }
  ];

  const tasks = [
    {
      title: 'Call John Doe about job placement',
      due: 'Due today at 2:00 PM',
      priority: 'medium'
    },
    {
      title: 'Submit housing application for Alice Smith',
      due: 'Due tomorrow at 9:00 AM',
      priority: 'high'
    },
    {
      title: 'Schedule therapy appointment for Robert',
      due: 'Due in 3 days',
      priority: 'low'
    }
  ];

  const reports = [
    { title: 'Monthly Case Summary', due: 'Due in 5 days' },
    { title: 'Quarterly Outcomes Report', due: 'Due in 2 weeks' },
    { title: 'Client Progress Report', due: 'Custom report' }
  ];

  const userName = user?.name || 'Social Worker';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase() || 'SW';

  return (
    <div className={styles.container}>
      {/* Artistic Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.backgroundBlob1}></div>
        <div className={styles.backgroundBlob2}></div>
        <div className={styles.backgroundBlob3}></div>
        <div className={styles.backgroundBlob4}></div>

        {/* Floating Icons */}
        <div className={styles.floatingIcon1}>
          <Heart className="h-8 w-8" />
        </div>
        <div className={styles.floatingIcon2}>
          <Shield className="h-6 w-6" />
        </div>
        <div className={styles.floatingIcon3}>
          <Sparkles className="h-10 w-10" />
        </div>
        <div className={styles.floatingIcon4}>
          <Target className="h-7 w-7" />
        </div>
        <div className={styles.floatingIcon5}>
          <Zap className="h-9 w-9" />
        </div>
      </div>

      {/* Header */}
      <header className={styles.header}>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className={styles.mobileMenuButton}>
              <Menu className="h-5 w-5" />
              <span className={styles.srOnly}>Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className={styles.mobileNavContainer}>
            <nav className={styles.mobileNav}>
              <Link href="#" className={`${styles.mobileNavLink} ${styles.active}`}>
                <Home className="h-5 w-5" />
                Dashboard
              </Link>
              <Link href="#" className={`${styles.mobileNavLink} ${styles.inactive}`} onClick={() => handleComingSoon('Clients')}>
                <Users className="h-5 w-5" />
                Clients
              </Link>
              <Link href="#" className={`${styles.mobileNavLink} ${styles.inactive}`} onClick={() => handleComingSoon('Case Notes')}>
                <FileText className="h-5 w-5" />
                Case Notes
              </Link>
              <Link href="#" className={`${styles.mobileNavLink} ${styles.inactive}`} onClick={() => handleComingSoon('Tasks')}>
                <CheckSquare className="h-5 w-5" />
                Tasks
              </Link>
              <Link href="#" className={`${styles.mobileNavLink} ${styles.inactive}`} onClick={() => handleComingSoon('Reports')}>
                <PieChart className="h-5 w-5" />
                Reports
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        
        <div className={styles.logo}>
          <div className={styles.logoIconContainer}>
            <div className={styles.logoIconGlow}></div>
            <ClipboardList className={styles.logoIcon} />
          </div>
          <span className={styles.logoText}>Solace</span>
        </div>
        
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <Input
            type="search"
            placeholder="Search clients, cases, tasks..."
            className={styles.searchInput}
          />
        </div>
        
        <Button variant="outline" size="icon" className={styles.notificationButton}>
          <Bell className="h-5 w-5" />
          <span className={styles.srOnly}>Notifications</span>
        </Button>
        <Avatar className={styles.userAvatar} onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <AvatarImage src="/placeholder-user.jpg" alt="User" />
          <AvatarFallback className={`${styles.clientAvatarFallback} ${styles.emerald}`}>{userInitials}</AvatarFallback>
        </Avatar>
      </header>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            <Link href="#" className={`${styles.navLink} ${styles.active}`}>
              <Home className={styles.navIcon} />
              Dashboard
            </Link>
            <Link href="#" className={`${styles.navLink} ${styles.inactive}`} onClick={() => handleComingSoon('Clients')}>
              <Users className={styles.navIcon} />
              Clients
            </Link>
            <Link href="#" className={`${styles.navLink} ${styles.inactive}`} onClick={() => handleComingSoon('Case Notes')}>
              <FileText className={styles.navIcon} />
              Case Notes
            </Link>
            <Link href="#" className={`${styles.navLink} ${styles.inactive}`} onClick={() => handleComingSoon('Tasks')}>
              <CheckSquare className={styles.navIcon} />
              Tasks
            </Link>
            <Link href="#" className={`${styles.navLink} ${styles.inactive}`} onClick={() => handleComingSoon('Reports')}>
              <PieChart className={styles.navIcon} />
              Reports
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>
          <div className={styles.mainContent}>
            {/* Welcome Section */}
            <div className={styles.welcomeSection}>
              <h1 className={styles.welcomeTitle}>Welcome back, {userName}</h1>
              <p className={styles.welcomeSubtitle}>Here's an overview of your work today.</p>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              {stats.map((stat, index) => {
                const colorClasses = ['emerald', 'cyan', 'teal', 'purple'];
                const colorClass = colorClasses[index % colorClasses.length];
                return (
                  <Card key={index} className={styles.statCard}>
                    <CardHeader className={styles.statCardHeader}>
                      <CardTitle className={styles.statCardTitle}>{stat.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`${styles.statValue} ${styles[colorClass]}`}>{stat.value}</div>
                      <p className={styles.statChange}>{stat.change}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Feature Cards Grid */}
            <div className={styles.featureGrid}>
              {/* Clients Card */}
              <Card className={`${styles.featureCard} ${styles.wide}`}>
                <div className={`${styles.featureCardTopBorder} ${styles.emerald}`}></div>
                <CardHeader className={styles.featureHeader}>
                  <div className={styles.featureHeaderContent}>
                    <CardTitle className={`${styles.featureTitle} ${styles.emerald}`}>👥 Clients</CardTitle>
                    <CardDescription className={styles.featureDescription}>Manage client records</CardDescription>
                  </div>
                  <Button className={`${styles.featureButton} ${styles.emerald}`} size="sm" onClick={() => handleComingSoon('Clients')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className={styles.clientList}>
                    {clients.map((client, index) => {
                      const avatarClasses = ['emerald', 'teal', 'cyan'];
                      const avatarClass = avatarClasses[index % avatarClasses.length];
                      return (
                        <div key={index} className={styles.clientItem}>
                          <Avatar className={`${styles.clientAvatar} ${styles[avatarClass]}`}>
                            <AvatarFallback className={`${styles.clientAvatarFallback} ${styles[avatarClass]}`}>
                              {client.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className={styles.clientInfo}>
                            <p className={styles.clientName}>{client.name}</p>
                            <p className={styles.clientDetails}>Case #{client.case} • Updated {client.updated}</p>
                          </div>
                          <Button variant="ghost" size="sm" className={styles.clientViewButton} onClick={() => handleComingSoon('Client Details')}>
                            View
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className={`${styles.footerButton} ${styles.emerald}`} onClick={() => handleComingSoon('Add Client')}>
                    <Users className="mr-2 h-4 w-4" />
                    Add New Client
                  </Button>
                </CardFooter>
              </Card>

              {/* Case Notes Card */}
              <Card className={`${styles.featureCard} ${styles.wide}`}>
                <div className={`${styles.featureCardTopBorder} ${styles.teal}`}></div>
                <CardHeader className={styles.featureHeader}>
                  <div className={styles.featureHeaderContent}>
                    <CardTitle className={`${styles.featureTitle} ${styles.teal}`}>📋 Case Notes</CardTitle>
                    <CardDescription className={styles.featureDescription}>Document case progress</CardDescription>
                  </div>
                  <Button className={`${styles.featureButton} ${styles.teal}`} size="sm" onClick={() => handleComingSoon('Case Notes')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className={styles.notesList}>
                    {caseNotes.map((note, index) => (
                      <div key={index} className={styles.noteItem}>
                        <div className={styles.noteHeader}>
                          <div className={styles.noteTitle}>{note.title}</div>
                          <div className={styles.noteDate}>{note.date}</div>
                        </div>
                        <p className={styles.noteContent}>{note.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className={`${styles.footerButton} ${styles.teal}`} onClick={() => handleComingSoon('Add Note')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Add New Note
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Two Column Grid */}
            <div className={styles.twoColumnGrid}>
              {/* Tasks Card */}
              <Card className={styles.featureCard}>
                <div className={`${styles.featureCardTopBorder} ${styles.cyan}`}></div>
                <CardHeader className={styles.featureHeader}>
                  <div className={styles.featureHeaderContent}>
                    <CardTitle className={`${styles.featureTitle} ${styles.cyan}`}>✅ Tasks</CardTitle>
                    <CardDescription className={styles.featureDescription}>Track your to-dos</CardDescription>
                  </div>
                  <Button className={`${styles.featureButton} ${styles.cyan}`} size="sm" onClick={() => handleComingSoon('Tasks')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className={styles.tasksList}>
                    {tasks.map((task, index) => (
                      <div key={index} className={styles.taskItem}>
                        <div className={`${styles.taskIcon} ${styles[task.priority]}`}>
                          <CheckSquare className="h-4 w-4" />
                        </div>
                        <div className={styles.taskInfo}>
                          <p className={styles.taskTitle}>{task.title}</p>
                          <p className={styles.taskDue}>{task.due}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className={`${styles.footerButton} ${styles.cyan}`} onClick={() => handleComingSoon('Add Task')}>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Add New Task
                  </Button>
                </CardFooter>
              </Card>

              {/* Reports Card */}
              <Card className={styles.featureCard}>
                <div className={`${styles.featureCardTopBorder} ${styles.purple}`}></div>
                <CardHeader className={styles.featureHeader}>
                  <div className={styles.featureHeaderContent}>
                    <CardTitle className={`${styles.featureTitle} ${styles.purple}`}>📊 Reports</CardTitle>
                    <CardDescription className={styles.featureDescription}>Generate reports</CardDescription>
                  </div>
                  <Button className={`${styles.featureButton} ${styles.purple}`} size="sm" onClick={() => handleComingSoon('Reports')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className={styles.reportsList}>
                    {reports.map((report, index) => {
                      const iconClasses = ['purple', 'pink', 'rose'];
                      const iconClass = iconClasses[index % iconClasses.length];
                      return (
                        <div key={index} className={styles.reportItem}>
                          <div className={`${styles.reportIcon} ${styles[iconClass]}`}>
                            <PieChart className={`${styles.reportIconSvg} ${styles[iconClass]}`} />
                          </div>
                          <div className={styles.reportInfo}>
                            <p className={styles.reportTitle}>{report.title}</p>
                            <p className={styles.reportDue}>{report.due}</p>
                          </div>
                          <Button variant="ghost" size="sm" className={`${styles.reportGenerateButton} ${styles[iconClass]}`} onClick={() => handleComingSoon('Generate Report')}>
                            Generate
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className={`${styles.footerButton} ${styles.purple}`} onClick={() => handleComingSoon('Custom Report')}>
                    <PieChart className="mr-2 h-4 w-4" />
                    Create Custom Report
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 