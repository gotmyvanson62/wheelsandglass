import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { 
  Users, 
  UserPlus, 
  Key, 
  Edit, 
  Trash2,
  Shield,
  Mail,
  Calendar,
  Lock,
  Bell
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export default function UserManagement() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin'
  });
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Edit user state
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    role: 'admin',
    isActive: true
  });

  // Delete confirmation state
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const createUserMutation = useMutation({
    mutationFn: (userData: typeof newUser) => 
      apiRequest('/api/admin/users', 'POST', userData),
    onSuccess: () => {
      toast({
        title: "User created",
        description: "New admin user has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsCreateDialogOpen(false);
      setNewUser({ username: '', email: '', password: '', role: 'admin' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (passwordData: { currentPassword: string; newPassword: string }) => 
      apiRequest('/api/admin/password', 'PUT', passwordData),
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully",
      });
      setIsPasswordDialogOpen(false);
      setPasswordChange({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof editFormData }) =>
      apiRequest(`/api/admin/users/${id}`, 'PUT', data),
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "User has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/users/${id}`, 'DELETE'),
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "User has been removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setDeletingUserId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate(newUser);
  };

  const handleChangePassword = () => {
    if (!passwordChange.currentPassword || !passwordChange.newPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation do not match",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordChange.currentPassword,
      newPassword: passwordChange.newPassword
    });
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setEditFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    if (!editFormData.username || !editFormData.email) {
      toast({
        title: "Missing information",
        description: "Username and email are required",
        variant: "destructive",
      });
      return;
    }

    updateUserMutation.mutate({
      id: editingUser.id,
      data: editFormData
    });
  };

  const handleDeleteUser = () => {
    if (!deletingUserId) return;
    deleteUserMutation.mutate(deletingUserId);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'admin': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4 lg:space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage admin users and account settings
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordChange.currentPassword}
                    onChange={(e) => setPasswordChange(prev => ({ 
                      ...prev, 
                      currentPassword: e.target.value 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordChange.newPassword}
                    onChange={(e) => setPasswordChange(prev => ({ 
                      ...prev, 
                      newPassword: e.target.value 
                    }))}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Password must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordChange.confirmPassword}
                    onChange={(e) => setPasswordChange(prev => ({ 
                      ...prev, 
                      confirmPassword: e.target.value 
                    }))}
                  />
                </div>
                <Button 
                  onClick={handleChangePassword} 
                  className="w-full"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Admin User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Password must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>
                <Button 
                  onClick={handleCreateUser} 
                  className="w-full"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Admin Users</TabsTrigger>
          <TabsTrigger value="settings">Account Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Admin Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading users...</div>
              ) : !users || (users as AdminUser[]).length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No admin users found
                </div>
              ) : (
                <div className="space-y-4">
                  {(users as AdminUser[]).map((user: AdminUser) => (
                    <div key={user.id} className="border dark:border-gray-700 rounded-lg p-4 dark:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold dark:text-gray-100">{user.username}</h3>
                              <Badge className={getRoleColor(user.role)}>
                                {user.role.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Badge className={getStatusColor(user.isActive)}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Last login: {formatDate(user.lastLogin)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {user.id !== 1 && ( // Don't allow deleting main admin
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeletingUserId(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive alerts for failed transactions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get instant mobile alerts</p>
                  </div>
                  <Switch />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Alert Email</Label>
                  <Input 
                    type="email" 
                    placeholder="admin@expressautoglass.com"
                    data-testid="input-alert-email"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-medium mb-2 dark:text-gray-100">Password Requirements</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Minimum 8 characters long</li>
                    <li>• At least one uppercase letter</li>
                    <li>• At least one lowercase letter</li>
                    <li>• At least one number</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-medium mb-2 dark:text-gray-100">Session Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Admin sessions automatically expire after 24 hours of inactivity for security.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editFormData.username}
                onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editFormData.role}
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Active Status</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  User can access the system
                </p>
              </div>
              <Switch
                checked={editFormData.isActive}
                onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUser}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingUserId} onOpenChange={(open) => !open && setDeletingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The user will lose access immediately and all their data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}