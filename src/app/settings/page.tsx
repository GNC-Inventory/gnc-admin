'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Sidebar from '../../components/Sidebar';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  employeeId?: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    } else {
      router.push('/');
    }
  }, [router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        alert('Password changed successfully');
      } else {
        alert(data.error?.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      alert('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: '#F9FAFB'
      }}>
        <Sidebar />
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#F9FAFB'
    }}>
      <Sidebar />
      
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #E5E7EB',
          padding: '24px 32px'
        }}>
          <h1 style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '24px',
            fontWeight: 600,
            color: '#111827',
            margin: '0 0 4px 0'
          }}>
            Settings
          </h1>
          <p style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            color: '#6B7280',
            margin: 0
          }}>
            Manage your account settings and preferences.
          </p>
        </div>
        
        <div style={{ 
          flex: 1, 
          padding: '32px',
          overflow: 'auto'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {/* Tabs */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{
                borderBottom: '1px solid #E5E7EB',
                display: 'flex'
              }}>
                <button
                  onClick={() => setActiveTab('profile')}
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    borderBottom: activeTab === 'profile' ? '2px solid #3B82F6' : '2px solid transparent',
                    fontWeight: '500',
                    fontSize: '14px',
                    color: activeTab === 'profile' ? '#3B82F6' : '#6B7280',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                >
                  <UserIcon style={{ width: '16px', height: '16px' }} />
                  My Profile
                </button>
                
                <button
                  onClick={() => setActiveTab('password')}
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    borderBottom: activeTab === 'password' ? '2px solid #3B82F6' : '2px solid transparent',
                    fontWeight: '500',
                    fontSize: '14px',
                    color: activeTab === 'password' ? '#3B82F6' : '#6B7280',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                >
                  <LockClosedIcon style={{ width: '16px', height: '16px' }} />
                  Change Password
                </button>
              </div>

              {/* Tab Content */}
              <div style={{ padding: '32px' }}>
                {activeTab === 'profile' && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                  }}>
                    <div>
                      <h2 style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#111827',
                        marginBottom: '8px'
                      }}>
                        Profile Information
                      </h2>
                      <p style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontSize: '14px',
                        color: '#6B7280',
                        margin: 0
                      }}>
                        Your account information is managed by your administrator.
                      </p>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '24px'
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '8px',
                          fontFamily: 'system-ui, -apple-system, sans-serif'
                        }}>
                          First Name
                        </label>
                        <input
                          type="text"
                          value={user.firstName}
                          readOnly
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            backgroundColor: '#F9FAFB',
                            color: '#6B7280',
                            boxSizing: 'border-box',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '8px',
                          fontFamily: 'system-ui, -apple-system, sans-serif'
                        }}>
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={user.lastName}
                          readOnly
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            backgroundColor: '#F9FAFB',
                            color: '#6B7280',
                            boxSizing: 'border-box',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '8px',
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        readOnly
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #D1D5DB',
                          borderRadius: '8px',
                          backgroundColor: '#F9FAFB',
                          color: '#6B7280',
                          boxSizing: 'border-box',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '8px',
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}>
                        Role
                      </label>
                      <input
                        type="text"
                        value={user.role}
                        readOnly
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #D1D5DB',
                          borderRadius: '8px',
                          backgroundColor: '#F9FAFB',
                          color: '#6B7280',
                          boxSizing: 'border-box',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    {user.employeeId && (
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '8px',
                          fontFamily: 'system-ui, -apple-system, sans-serif'
                        }}>
                          Employee ID
                        </label>
                        <input
                          type="text"
                          value={user.employeeId}
                          readOnly
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            backgroundColor: '#F9FAFB',
                            color: '#6B7280',
                            boxSizing: 'border-box',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    )}

                    <div style={{
                      padding: '16px',
                      backgroundColor: '#EFF6FF',
                      borderRadius: '8px',
                      border: '1px solid #BFDBFE'
                    }}>
                      <p style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontSize: '14px',
                        color: '#1E40AF',
                        margin: 0
                      }}>
                        ℹ️ Contact your administrator to update your profile information.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'password' && (
                  <form onSubmit={handlePasswordChange} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    maxWidth: '500px'
                  }}>
                    <div>
                      <h2 style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#111827',
                        marginBottom: '8px'
                      }}>
                        Change Password
                      </h2>
                      <p style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontSize: '14px',
                        color: '#6B7280',
                        margin: 0
                      }}>
                        Update your password to keep your account secure.
                      </p>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '8px',
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}>
                        Current Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '12px 48px 12px 16px',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            boxSizing: 'border-box',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            fontSize: '14px'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#9CA3AF',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          {showPasswords.current ? (
                            <EyeSlashIcon style={{ width: '20px', height: '20px' }} />
                          ) : (
                            <EyeIcon style={{ width: '20px', height: '20px' }} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '8px',
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}>
                        New Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          required
                          minLength={6}
                          style={{
                            width: '100%',
                            padding: '12px 48px 12px 16px',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            boxSizing: 'border-box',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            fontSize: '14px'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#9CA3AF',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          {showPasswords.new ? (
                            <EyeSlashIcon style={{ width: '20px', height: '20px' }} />
                          ) : (
                            <EyeIcon style={{ width: '20px', height: '20px' }} />
                          )}
                        </button>
                      </div>
                      <p style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontSize: '12px',
                        color: '#6B7280',
                        margin: '4px 0 0 0'
                      }}>
                        Password must be at least 6 characters long
                      </p>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '8px',
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}>
                        Confirm New Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '12px 48px 12px 16px',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            boxSizing: 'border-box',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            fontSize: '14px'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#9CA3AF',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          {showPasswords.confirm ? (
                            <EyeSlashIcon style={{ width: '20px', height: '20px' }} />
                          ) : (
                            <EyeIcon style={{ width: '20px', height: '20px' }} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      paddingTop: '8px'
                    }}>
                      <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                          backgroundColor: isLoading ? '#93C5FD' : '#3B82F6',
                          color: 'white',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          border: 'none',
                          fontWeight: '500',
                          fontSize: '14px',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontFamily: 'system-ui, -apple-system, sans-serif'
                        }}
                      >
                        <LockClosedIcon style={{ width: '16px', height: '16px' }} />
                        {isLoading ? 'Changing Password...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}