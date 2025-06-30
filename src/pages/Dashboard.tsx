import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  UserPlus, 
  Building2, 
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';

interface DashboardStats {
  totalEmployees: number;
  recentHires: number;
  departments: number;
  averageSalary: number;
}

const API_BASE_URL = 'http://localhost:3001';

const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    recentHires: 0,
    departments: 0,
    averageSalary: 0
  });
  const [recentEmployees, setRecentEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const employees = await response.json();
          
          // Calculate stats
          const totalEmployees = employees.length;
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const recentHires = employees.filter((emp: any) => 
            new Date(emp.hire_date) >= thirtyDaysAgo
          ).length;

          const departments = new Set(employees.map((emp: any) => emp.department)).size;
          
          // Fix average salary calculation
          let averageSalary = 0;
          if (employees.length > 0) {
            const totalSalary = employees.reduce((sum: number, emp: any) => {
              // Ensure salary is treated as a number
              const salary = typeof emp.salary === 'string' ? parseFloat(emp.salary) : emp.salary;
              return sum + (isNaN(salary) ? 0 : salary);
            }, 0);
            averageSalary = totalSalary / employees.length;
          }

          setStats({
            totalEmployees,
            recentHires,
            departments,
            averageSalary: Math.round(averageSalary) // Round to nearest dollar
          });

          // Get recent employees (last 5)
          const recent = employees
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);
          
          setRecentEmployees(recent);
        } else {
          console.error('Invalid response format from server');
        }
      } else {
        console.error('Failed to fetch employees:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    gradient: string;
    change?: string;
  }> = ({ title, value, icon: Icon, gradient, change }) => (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600 font-medium flex items-center mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${gradient} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your employee management overview.</p>
          </div>
          <Link
            to="/employees/new"
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add Employee
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={Users}
            gradient="bg-gradient-to-r from-blue-500 to-blue-600"
            change={stats.recentHires > 0 ? `+${stats.recentHires} this month` : undefined}
          />
          <StatCard
            title="Recent Hires"
            value={stats.recentHires}
            icon={Calendar}
            gradient="bg-gradient-to-r from-green-500 to-green-600"
          />
          <StatCard
            title="Departments"
            value={stats.departments}
            icon={Building2}
            gradient="bg-gradient-to-r from-purple-500 to-purple-600"
          />
          <StatCard
            title="Avg. Salary"
            value={stats.averageSalary > 0 ? `$${stats.averageSalary.toLocaleString()}` : '$0'}
            icon={DollarSign}
            gradient="bg-gradient-to-r from-orange-500 to-orange-600"
          />
        </div>

        {/* Recent Employees */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Employees</h2>
              <Link
                to="/employees"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                View all →
              </Link>
            </div>
          </div>
          
          {recentEmployees.length > 0 ? (
            <div className="p-6">
              <div className="space-y-4">
                {recentEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-100 hover:bg-white/70 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{employee.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{employee.department}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(employee.hire_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No employees added yet</p>
              <Link
                to="/employees/new"
                className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Add your first employee
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <h3 className="text-lg font-semibold mb-2">Manage Employees</h3>
            <p className="text-blue-100 mb-4">View, edit, or remove employee records</p>
            <Link
              to="/employees"
              className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
            >
              <Users className="h-4 w-4 mr-2" />
              View All Employees
            </Link>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <h3 className="text-lg font-semibold mb-2">Add New Employee</h3>
            <p className="text-green-100 mb-4">Register a new team member</p>
            <Link
              to="/employees/new"
              className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Employee
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;