import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../components/Toaster';
import {
  Save,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  Loader2
} from 'lucide-react';

// Reusable FormField component — defined outside main component
const FormField: React.FC<{
  label: string;
  icon: React.ComponentType<any>;
  type?: string;
  field: keyof Employee;
  value: string | number;
  error?: string;
  placeholder?: string;
  required?: boolean;
  onChange: (field: keyof Employee, value: string) => void;
}> = ({ label, icon: Icon, type = 'text', field, value, error, placeholder, required = false, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      {field === 'address' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`block w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${
            error
              ? 'border-red-300 bg-red-50 focus:ring-red-500'
              : 'border-gray-200 bg-white/50 hover:bg-white/70 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          }`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          className={`block w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${
            error
              ? 'border-red-300 bg-red-50 focus:ring-red-500'
              : 'border-gray-200 bg-white/50 hover:bg-white/70 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          }`}
        />
      )}
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

// Employee interface
interface Employee {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  department: string;
  salary: number | string;
  hire_date: string;
  phone?: string;
  address?: string;
}

interface FormErrors {
  [key: string]: string;
}

const API_BASE_URL = 'http://localhost:3001';

// Helper function to format date for HTML date input
const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Main form component
const EmployeeForm: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [employee, setEmployee] = useState<Employee>({
    first_name: '',
    last_name: '',
    email: '',
    position: '',
    department: '',
    salary: '',
    hire_date: '',
    phone: '',
    address: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      fetchEmployee(id);
    }
  }, [id, isEditing]);

  const fetchEmployee = async (employeeId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setEmployee({
          ...data,
          salary: data.salary.toString(),
          hire_date: formatDateForInput(data.hire_date) // Format date for HTML input
        });
      } else if (response.status === 404) {
        showToast('error', 'Employee not found');
        navigate('/employees');
      } else {
        showToast('error', 'Failed to fetch employee data');
      }
    } catch (error) {
      console.error('Fetch employee error:', error);
      showToast('error', 'Failed to fetch employee data');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!employee.first_name.trim()) newErrors.first_name = 'First name is required';
    else if (employee.first_name.length > 50) newErrors.first_name = 'Max 50 characters';

    if (!employee.last_name.trim()) newErrors.last_name = 'Last name is required';
    else if (employee.last_name.length > 50) newErrors.last_name = 'Max 50 characters';

    if (!employee.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) newErrors.email = 'Invalid email';

    if (!employee.position.trim()) newErrors.position = 'Position is required';
    else if (employee.position.length > 100) newErrors.position = 'Max 100 characters';

    if (!employee.department.trim()) newErrors.department = 'Department is required';
    else if (employee.department.length > 100) newErrors.department = 'Max 100 characters';

    if (!employee.salary) newErrors.salary = 'Salary is required';
    else if (isNaN(Number(employee.salary)) || Number(employee.salary) < 0) newErrors.salary = 'Invalid salary';

    if (!employee.hire_date) newErrors.hire_date = 'Hire date is required';

    if (employee.phone && !/^[\d\s\-\+\(\)]+$/.test(employee.phone)) newErrors.phone = 'Invalid phone number';
    if (employee.address && employee.address.length > 200) newErrors.address = 'Max 200 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('error', 'Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEditing ? `${API_BASE_URL}/api/employees/${id}` : `${API_BASE_URL}/api/employees`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...employee,
          salary: Number(employee.salary)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', `Employee ${isEditing ? 'updated' : 'created'} successfully`);
        navigate('/employees');
      } else {
        if (response.status === 400 && data.details) {
          const serverErrors: FormErrors = {};
          data.details.forEach((error: any) => {
            serverErrors[error.path] = error.msg;
          });
          setErrors(serverErrors);
        } else if (response.status === 409) {
          setErrors({ email: 'An employee with this email already exists' });
        }
        showToast('error', data.error || `Failed to ${isEditing ? 'update' : 'create'} employee`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      showToast('error', `Failed to ${isEditing ? 'update' : 'create'} employee`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Employee, value: string) => {
    setEmployee(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="bg-white/70 rounded-2xl p-8 space-y-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/employees')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/60 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Employee' : 'Add Employee'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update employee information' : 'Add a new team member'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label="First Name" 
              icon={User} 
              field="first_name" 
              value={employee.first_name} 
              onChange={handleInputChange} 
              required 
              error={errors.first_name}
              placeholder="Enter first name"
            />
            <FormField 
              label="Last Name" 
              icon={User} 
              field="last_name" 
              value={employee.last_name} 
              onChange={handleInputChange} 
              required 
              error={errors.last_name}
              placeholder="Enter last name"
            />
            <FormField 
              label="Email" 
              icon={Mail} 
              type="email" 
              field="email" 
              value={employee.email} 
              onChange={handleInputChange} 
              required 
              error={errors.email}
              placeholder="Enter email address"
            />
            <FormField 
              label="Phone" 
              icon={Phone} 
              type="tel" 
              field="phone" 
              value={employee.phone || ''} 
              onChange={handleInputChange} 
              error={errors.phone}
              placeholder="Enter phone number (optional)"
            />
            <FormField 
              label="Position" 
              icon={Briefcase} 
              field="position" 
              value={employee.position} 
              onChange={handleInputChange} 
              required 
              error={errors.position}
              placeholder="Enter job position"
            />
            <FormField 
              label="Department" 
              icon={Building2} 
              field="department" 
              value={employee.department} 
              onChange={handleInputChange} 
              required 
              error={errors.department}
              placeholder="Enter department"
            />
            <FormField 
              label="Salary" 
              icon={DollarSign} 
              type="number" 
              field="salary" 
              value={employee.salary} 
              onChange={handleInputChange} 
              required 
              error={errors.salary}
              placeholder="Enter annual salary"
            />
            <FormField 
              label="Hire Date" 
              icon={Calendar} 
              type="date" 
              field="hire_date" 
              value={employee.hire_date} 
              onChange={handleInputChange} 
              required 
              error={errors.hire_date}
            />
            <div className="md:col-span-2">
              <FormField 
                label="Address" 
                icon={MapPin} 
                field="address" 
                value={employee.address || ''} 
                onChange={handleInputChange} 
                placeholder="Enter full address (optional)" 
                error={errors.address} 
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  {isEditing ? 'Update Employee' : 'Create Employee'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EmployeeForm;