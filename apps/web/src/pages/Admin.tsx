import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { useToastStore } from '../stores/toastStore';
import {
  ClipboardCheck,
  Lock,
  ShieldCheck,
  Users2,
  LineChart as LineChartIcon,
  ScrollText,
  Check,
  X,
  UserCheck,
  AlertTriangle,
  Award,
  Globe,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Skeleton, SkeletonLines } from '../components/Skeleton';
import { Navigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import type { User } from '@pulse/shared/types';

type AdminTabId = 'moderation' | 'users' | 'analytics' | 'audit';

export default function Admin() {
  const { user } = useAuthStore();
  const {
    employees,
    moderation,
    kudos,
    auditLogs,
    approveModerationItem,
    rejectModerationItem,
    toggleUserActive,
    updateUserRole,
  } = useDataStore();
  const { showToast } = useToastStore();

  const [activeTab, setActiveTab] = useState<AdminTabId>('moderation');
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Simulated initial loading delay
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Lookup map for swift author/actor resolution
  const employeeMap = useMemo(() => {
    return employees.reduce<Record<string, (typeof employees)[0]>>((acc, emp) => {
      acc[emp.id] = emp;
      return acc;
    }, {});
  }, [employees]);

  // Regional employee breakdown for chart
  const regionChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach((emp) => {
      counts[emp.location] = (counts[emp.location] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name: name.split(' ')[0],
      count,
    }));
  }, [employees]);

  // Platform activity growth (static demo data)
  const monthlyActivityData = [
    { name: 'Jan', ActiveUsers: 85, KudosDelivered: 12 },
    { name: 'Feb', ActiveUsers: 95, KudosDelivered: 18 },
    { name: 'Mar', ActiveUsers: 110, KudosDelivered: 24 },
    { name: 'Apr', ActiveUsers: 118, KudosDelivered: 35 },
    { name: 'May', ActiveUsers: 122, KudosDelivered: 46 },
  ];

  if (!user) return <Navigate to="/login" replace />;

  const isHR = user.role === 'hr';
  const isAdmin = user.role === 'admin';

  // Employee-only protection gate
  if (user.role === 'employee') {
    return (
      <div className="glass-panel max-w-md mx-auto p-10 text-center flex flex-col items-center gap-5 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-apple-red/12 text-apple-red flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-[20px] font-semibold tracking-tight text-foreground">
            Access restricted
          </h2>
          <p className="text-[13.5px] text-muted-foreground leading-relaxed">
            The Admin Console is available to HR and Admin roles. Please contact your
            administrator if you believe you should have access.
          </p>
        </div>
        <div className="text-[11px] text-muted-foreground bg-secondary/70 rounded-full px-3 py-1">
          {user.id} · {user.departmentId}
        </div>
      </div>
    );
  }

  const tabs: Array<{
    id: AdminTabId;
    name: string;
    icon: typeof ClipboardCheck;
    allowed: Array<User['role']>;
    count?: number;
  }> = [
    { id: 'moderation', name: 'Moderation', icon: ClipboardCheck, allowed: ['hr', 'admin'], count: moderation.length },
    { id: 'users', name: 'Users', icon: Users2, allowed: ['hr', 'admin'] },
    { id: 'analytics', name: 'Analytics', icon: LineChartIcon, allowed: ['admin'] },
    { id: 'audit', name: 'Audit log', icon: ScrollText, allowed: ['admin'], count: auditLogs.length },
  ];

  const visibleTabs = tabs.filter((tab) => tab.allowed.includes(user.role));

  const getDeptName = (deptId: string): string => {
    switch (deptId) {
      case 'dept-eng':
        return 'Engineering';
      case 'dept-product':
        return 'Product';
      case 'dept-design':
        return 'Design';
      case 'dept-hr':
        return 'People';
      case 'dept-cs':
        return 'Customer Success';
      case 'dept-sales':
        return 'Sales';
      case 'dept-marketing':
        return 'Marketing';
      case 'dept-finance':
        return 'Finance';
      case 'dept-operations':
        return 'Operations';
      case 'dept-exec':
        return 'Executive';
      default:
        return 'Support';
    }
  };

  const handleApprove = async (id: string) => {
    setActioningId(id);
    await new Promise((resolve) => setTimeout(resolve, 600));
    approveModerationItem(id, user.id);
    setActioningId(null);
    showToast('Post approved and published.', 'success');
  };

  const handleReject = async (id: string) => {
    setActioningId(id);
    await new Promise((resolve) => setTimeout(resolve, 600));
    rejectModerationItem(id, user.id);
    setActioningId(null);
    showToast('Post rejected.', 'warning');
  };

  const handleToggleStatus = (empId: string, name: string) => {
    toggleUserActive(empId, user.id);
    showToast(`Updated status for ${name}.`, 'info');
  };

  const handleRoleChange = (empId: string, name: string, newRole: User['role']) => {
    updateUserRole(empId, newRole, user.id);
    showToast(`${name}'s role updated to ${newRole}.`, 'success');
  };

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in">
      {/* Page header */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 section-rise">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-apple-blue/12 text-apple-blue flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground leading-none">
              Admin
            </h1>
            <p className="text-[13.5px] text-muted-foreground">
              Signed in as <span className="text-foreground font-medium capitalize">{user.role}</span> · Review activity, manage users, and audit changes.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 text-[12px] text-muted-foreground bg-apple-green/10 text-apple-green rounded-full px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-apple-green" />
          Session secure
        </div>
      </header>

      {/* Segmented tabs */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="apple-segment min-w-fit">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`apple-segment-item ${isActive ? 'apple-segment-item-active' : ''}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.name}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`ml-1 px-1.5 rounded-full text-[10.5px] font-semibold ${
                      isActive
                        ? 'bg-apple-blue/12 text-apple-blue'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel */}
      <div className="glass-panel p-6 md:p-8">
        {loading ? (
          <div className="py-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-1/4" rounded="lg" />
              <Skeleton className="h-3.5 w-1/2" rounded="lg" />
            </div>
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border border-border/60 p-4 flex items-center gap-4">
                  <Skeleton className="w-10 h-10" rounded="xl" />
                  <div className="flex-1">
                    <SkeletonLines lines={2} />
                  </div>
                  <Skeleton className="h-7 w-20" rounded="full" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ====== Moderation ====== */}
            {activeTab === 'moderation' && (
              <section className="flex flex-col gap-6 animate-fade-in">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[16px] font-semibold tracking-tight text-foreground">
                    Moderation queue
                  </h2>
                  <p className="text-[13.5px] text-muted-foreground">
                    Review pending posts before they reach the public feed.
                  </p>
                </div>

                {moderation.length === 0 ? (
                  <div className="py-14 border border-dashed border-border rounded-2xl text-center text-[13.5px] text-muted-foreground">
                    The queue is empty. Nothing to review right now.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {moderation.map((item) => {
                      const author = employeeMap[item.authorId];
                      if (!author) return null;
                      const busy = actioningId === item.id;

                      return (
                        <div
                          key={item.id}
                          className="glass-card p-5 flex flex-col md:flex-row gap-5 justify-between items-start md:items-center"
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            <img
                              src={author.avatar}
                              alt={author.name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0"
                            />
                            <div className="min-w-0 flex flex-col gap-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[14px] font-semibold text-foreground">
                                  {author.name}
                                </span>
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-apple-blue/10 text-apple-blue">
                                  {getDeptName(author.departmentId)}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-[13.5px] text-foreground leading-relaxed">
                                {item.body}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                            <button
                              onClick={() => handleReject(item.id)}
                              disabled={busy}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold bg-apple-red/12 text-apple-red transition-all active:scale-[0.97] hover:bg-apple-red/15 disabled:opacity-50"
                            >
                              <X className="w-4 h-4" /> Reject
                            </button>
                            <button
                              onClick={() => handleApprove(item.id)}
                              disabled={busy}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold bg-apple-green/12 text-apple-green transition-all active:scale-[0.97] hover:bg-apple-green/15 disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" /> Approve
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* ====== Users ====== */}
            {activeTab === 'users' && (
              <section className="flex flex-col gap-6 animate-fade-in">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[16px] font-semibold tracking-tight text-foreground">
                    User management
                  </h2>
                  <p className="text-[13.5px] text-muted-foreground">
                    {isAdmin
                      ? 'Adjust roles and toggle account status.'
                      : 'View team members and their current status.'}
                  </p>
                </div>

                <div className="flex flex-col divide-y divide-border/70 rounded-2xl border border-border overflow-hidden">
                  {employees.map((emp) => {
                    const isSelf = emp.id === user.id;
                    return (
                      <div
                        key={emp.id}
                        className="flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-5 bg-card"
                      >
                        {/* Identity */}
                        <div className="flex items-center gap-3 min-w-0 md:flex-1">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-[14px] font-semibold text-foreground truncate">
                              {emp.name}
                            </div>
                            <div className="text-[12px] text-muted-foreground truncate">
                              {emp.email}
                            </div>
                          </div>
                        </div>

                        {/* Dept + location */}
                        <div className="md:flex-1 md:min-w-0">
                          <div className="text-[13px] text-foreground font-medium">
                            {getDeptName(emp.departmentId)}
                          </div>
                          <div className="text-[11.5px] text-muted-foreground">
                            {emp.location}
                          </div>
                        </div>

                        {/* Role */}
                        <div className="md:w-40">
                          {isAdmin && !isSelf ? (
                            <select
                              value={emp.role}
                              onChange={(e) =>
                                handleRoleChange(emp.id, emp.name, e.target.value as User['role'])
                              }
                              className="apple-input cursor-pointer text-[13px] py-2"
                            >
                              <option value="employee">Employee</option>
                              <option value="hr">HR</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-medium bg-secondary text-foreground capitalize">
                              {emp.role}
                            </span>
                          )}
                        </div>

                        {/* Status switch */}
                        <div className="md:w-40 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              !isSelf && isAdmin && handleToggleStatus(emp.id, emp.name)
                            }
                            disabled={isSelf || !isAdmin}
                            aria-pressed={emp.isActive}
                            aria-label={emp.isActive ? 'Deactivate user' : 'Activate user'}
                            className={`relative inline-flex h-6 w-10 shrink-0 rounded-full transition-colors duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${
                              emp.isActive ? 'bg-apple-green' : 'bg-muted'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                emp.isActive ? 'translate-x-[18px]' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[12px] font-medium ${
                              emp.isActive ? 'text-apple-green' : 'text-muted-foreground'
                            }`}
                          >
                            {isSelf ? 'You' : emp.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {isHR && !isAdmin && (
                  <p className="text-[12px] text-muted-foreground">
                    Role changes and account status toggles are restricted to Admin.
                  </p>
                )}
              </section>
            )}

            {/* ====== Analytics ====== */}
            {activeTab === 'analytics' && isAdmin && (
              <section className="flex flex-col gap-8 animate-fade-in">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[16px] font-semibold tracking-tight text-foreground">
                    Engagement analytics
                  </h2>
                  <p className="text-[13.5px] text-muted-foreground">
                    Headcount distribution, moderation activity, and platform growth.
                  </p>
                </div>

                {/* Stat tiles */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      title: 'Active users',
                      val: employees.length,
                      hint: 'All employees',
                      icon: UserCheck,
                      tint: 'apple-blue',
                    },
                    {
                      title: 'In moderation',
                      val: moderation.length,
                      hint: 'Awaiting review',
                      icon: AlertTriangle,
                      tint: 'apple-orange',
                    },
                    {
                      title: 'Kudos sent',
                      val: kudos.length,
                      hint: 'Lifetime total',
                      icon: Award,
                      tint: 'apple-green',
                    },
                    {
                      title: 'Audit events',
                      val: auditLogs.length,
                      hint: 'Logged actions',
                      icon: ScrollText,
                      tint: 'apple-gray',
                    },
                  ].map((card, idx) => {
                    const Icon = card.icon;
                    return (
                      <div key={idx} className="glass-card p-5 flex flex-col justify-between gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] text-muted-foreground font-medium">
                            {card.title}
                          </span>
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center bg-${card.tint}/12 text-${card.tint}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>
                        <div>
                          <div className="text-[26px] font-semibold tracking-tight text-foreground leading-none">
                            {card.val}
                          </div>
                          <div className="text-[12px] text-muted-foreground mt-1.5">
                            {card.hint}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-5">
                      <Globe className="w-4 h-4 text-apple-blue" />
                      <h3 className="text-[14px] font-semibold tracking-tight text-foreground">
                        Regional headcount
                      </h3>
                    </div>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={regionChartData}
                          margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))' }}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: 12,
                              fontSize: 12,
                              color: 'hsl(var(--foreground))',
                            }}
                          />
                          <Bar
                            dataKey="count"
                            fill="hsl(var(--apple-blue))"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-5">
                      <TrendingUp className="w-4 h-4 text-apple-green" />
                      <h3 className="text-[14px] font-semibold tracking-tight text-foreground">
                        Platform growth
                      </h3>
                    </div>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={monthlyActivityData}
                          margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: 12,
                              fontSize: 12,
                              color: 'hsl(var(--foreground))',
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="ActiveUsers"
                            stroke="hsl(var(--apple-blue))"
                            strokeWidth={2.5}
                            dot={{ r: 3, strokeWidth: 0, fill: 'hsl(var(--apple-blue))' }}
                            activeDot={{ r: 5 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="KudosDelivered"
                            stroke="hsl(var(--apple-green))"
                            strokeWidth={2.5}
                            dot={{ r: 3, strokeWidth: 0, fill: 'hsl(var(--apple-green))' }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ====== Audit log ====== */}
            {activeTab === 'audit' && isAdmin && (
              <section className="flex flex-col gap-6 animate-fade-in">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[16px] font-semibold tracking-tight text-foreground">
                    Audit log
                  </h2>
                  <p className="text-[13.5px] text-muted-foreground">
                    Every privileged action is recorded here.
                  </p>
                </div>

                {auditLogs.length === 0 ? (
                  <div className="py-14 border border-dashed border-border rounded-2xl text-center text-[13.5px] text-muted-foreground">
                    No audit events yet.
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-border/70 rounded-2xl border border-border overflow-hidden">
                    {auditLogs.map((log, idx) => {
                      const actor = employeeMap[log.actorId];

                      let actionTint = 'bg-secondary text-foreground';
                      if (log.action.includes('APPROVE'))
                        actionTint = 'bg-apple-green/12 text-apple-green';
                      else if (log.action.includes('REJECT'))
                        actionTint = 'bg-apple-red/12 text-apple-red';
                      else if (log.action.includes('STATUS'))
                        actionTint = 'bg-apple-orange/12 text-apple-orange';
                      else if (log.action.includes('ROLE'))
                        actionTint = 'bg-apple-blue/12 text-apple-blue';

                      return (
                        <div
                          key={log.id || idx}
                          className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-3 md:gap-4 items-start md:items-center p-4 md:p-5 bg-card"
                        >
                          <div className="flex items-center gap-2 text-[12px] text-muted-foreground font-mono">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {new Date(log.timestamp).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}{' '}
                              {new Date(log.timestamp).toLocaleTimeString(undefined, {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 min-w-0">
                            {actor && (
                              <img
                                src={actor.avatar}
                                alt={actor.name}
                                className="w-7 h-7 rounded-lg object-cover shrink-0"
                              />
                            )}
                            <div className="flex flex-wrap items-center gap-2 min-w-0">
                              <span className="text-[13.5px] font-medium text-foreground truncate">
                                {actor ? actor.name : log.actorId}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${actionTint}`}
                              >
                                {log.action}
                              </span>
                              <span className="text-[12px] text-muted-foreground font-mono">
                                {log.target}
                              </span>
                            </div>
                          </div>

                          <div className="text-[11.5px] text-muted-foreground font-mono md:text-right md:max-w-[260px] truncate">
                            {log.meta ? JSON.stringify(log.meta) : '{}'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
